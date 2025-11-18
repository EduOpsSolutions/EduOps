import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import {
  PAYMONGO_CONFIG,
  createPayMongoAuthHeaders,
  PAYMONGO_METHOD_MAP,
  PAYMONGO_EVENTS,
} from "../constants/payment_constants.js";
import { sendPaymentReceiptEmail } from "./paymentEmailService.js";
import { logSecurityEvent } from "../utils/logger.js";
import { MODULE_TYPES } from "../constants/module_types.js";

const prisma = new PrismaClient();

// Webhook processing and API calls for PayMongo payments

/**
 * Extract and format payment method from PayMongo webhook data
 * @param {Object} eventData - Webhook event data
 * @returns {string} Formatted payment method
 */
export const getPaymentMethodFromPayMongo = (eventData) => {
  let paymentMethod = "Online Payment";

  try {
    if (
      eventData.attributes?.payments &&
      eventData.attributes.payments.length > 0
    ) {
      const payment = eventData.attributes.payments[0];

      if (payment.data?.attributes?.source?.type) {
        paymentMethod = formatPaymentMethod(
          payment.data.attributes.source.type
        );
        return paymentMethod;
      }
    }
    if (eventData.attributes?.source?.type) {
      paymentMethod = formatPaymentMethod(eventData.attributes.source.type);
    } else if (eventData.attributes?.payment_method?.type) {
      paymentMethod = formatPaymentMethod(
        eventData.attributes.payment_method.type
      );
    } else if (eventData.attributes?.payment_method_used) {
      paymentMethod = formatPaymentMethod(
        eventData.attributes.payment_method_used
      );
    } else if (eventData.attributes?.method) {
      paymentMethod = formatPaymentMethod(eventData.attributes.method);
    }
  } catch (error) {
    console.error("Error extracting payment method from PayMongo data:", error);
  }

  return paymentMethod;
};

/**
 * Format PayMongo payment method types to user-friendly names
 * @param {string} rawMethod - Raw PayMongo method type
 * @returns {string} Formatted payment method name
 */
export const formatPaymentMethod = (rawMethod) => {
  if (!rawMethod) return "Online Payment";

  const lowerMethod = rawMethod.toLowerCase();
  return (
    PAYMONGO_METHOD_MAP[lowerMethod] ||
    rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1)
  );
};

/**
 * Verify PayMongo webhook signature
 * @param {Object} req - Express request object
 * @returns {boolean} Verification result
 */
export const verifyWebhookSignature = (req) => {
  const webhookSecret = PAYMONGO_CONFIG.WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Webhook secret not configured");
  }

  const signature = req.get("Paymongo-Signature");
  if (!signature) {
    throw new Error("Missing Paymongo-Signature header");
  }

  // Parse signature
  const sigParts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = sigParts.t;
  const testSignature = sigParts.te;
  const liveSignature = sigParts.li;

  // Use test signature for test mode, live signature for live mode
  const expectedSignature =
    process.env.NODE_ENV === "production" ? liveSignature : testSignature;

  // Create signature string using raw body when available
  let rawBody = null;
  try {
    if (req.body && Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString("utf8");
    } else if (typeof req.body === "string") {
      rawBody = req.body;
    } else if (req.rawBody) {
      rawBody =
        typeof req.rawBody === "string"
          ? req.rawBody
          : Buffer.from(req.rawBody).toString("utf8");
    } else {
      rawBody = JSON.stringify(req.body);
    }
  } catch (_) {
    rawBody = JSON.stringify(req.body);
  }
  const signatureString = `${timestamp}.${rawBody}`;

  // Generate HMAC
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signatureString)
    .digest("hex");

  // Try both test and live signatures to handle environments without NODE_ENV
  const isTestValid = testSignature && computedSignature === testSignature;
  const isLiveValid = liveSignature && computedSignature === liveSignature;

  if (!isTestValid && !isLiveValid) {
    console.error("[WebhookVerify] Signature mismatch", {
      computed: computedSignature,
      testProvided: testSignature,
      liveProvided: liveSignature,
      hasTestSig: !!testSignature,
      hasLiveSig: !!liveSignature,
    });
    throw new Error("Invalid webhook signature");
  }

  console.log("[WebhookVerify] Signature verified successfully", {
    usedTestMode: isTestValid,
    usedLiveMode: isLiveValid,
  });

  return true;
};

/**
 * Process PayMongo webhook event and update payment record
 * @param {Object} event - Webhook event data
 * @returns {Promise<Object>} Processing result
 */
export const processWebhookEvent = async (event) => {
  const eventType = event.data.attributes.type;
  const eventData = event.data.attributes.data;

  console.log(`Processing webhook event: ${eventType}`);

  let paymentRecord = null;
  let updateData = {};

  switch (eventType) {
    case PAYMONGO_EVENTS.LINK_PAYMENT_PAID:
      const linkPaymentMethod = getPaymentMethodFromPayMongo(eventData);

      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: linkPaymentMethod,
        referenceNumber: eventData.attributes.reference_number || eventData.id,
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber:
            eventData.attributes.reference_number || eventData.id,
        },
      });
      if (!paymentRecord) {
        console.warn(
          `Payment record not found for link payment. Reference: ${
            eventData.attributes.reference_number || eventData.id
          }`
        );
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_PAID:
      const directPaymentMethod = getPaymentMethodFromPayMongo(eventData);

      const paymentId = eventData.id;
      const paymentIntentIdFromWebhook =
        eventData.attributes?.payment_intent_id;

      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: directPaymentMethod,
        referenceNumber: paymentId, // This is the pay_xxxxx reference number from PayMongo
      };

      if (paymentIntentIdFromWebhook) {
        updateData.paymentIntentId = paymentIntentIdFromWebhook;
      }

      console.log(`[PAYMENT_PAID] Processing webhook:`, {
        paymentId,
        paymentIntentId: paymentIntentIdFromWebhook,
        paymentMethod: directPaymentMethod,
      });

      // First try to find by payment intent ID 
      if (paymentIntentIdFromWebhook) {
        paymentRecord = await prisma.payments.findFirst({
          where: {
            paymentIntentId: paymentIntentIdFromWebhook,
          },
        });
        
        if (paymentRecord) {
          console.log(`[PAYMENT_PAID] Found payment by intent ID: ${paymentRecord.transactionId}`);
        }
      }

      if (!paymentRecord) {
        paymentRecord = await prisma.payments.findFirst({
          where: {
            referenceNumber: paymentId,
          },
        });
      }

      if (!paymentRecord) {
        console.warn(
          `Payment record not found for direct payment. Payment ID: ${paymentId}, Intent ID: ${paymentIntentIdFromWebhook}`
        );

        const recentPayments = await prisma.payments.findMany({
          where: {
            status: "pending",
            paymentMethod: "Online Payment",
            createdAt: {
              gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // Last 2 hours
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        if (recentPayments.length > 0) {
          const webhookPaymentId = eventData.id;
          const webhookIntentId = eventData.attributes?.payment_intent_id;

          let matchingPayment = recentPayments.find(
            (p) =>
              !p.paymentIntentId ||
              p.paymentIntentId === webhookIntentId ||
              p.referenceNumber === webhookPaymentId ||
              p.referenceNumber === webhookIntentId
          );

          if (matchingPayment) {
            paymentRecord = matchingPayment;
          } else {
            const unmatchedPayment = recentPayments.find(
              (p) => !p.paymentIntentId
            );
            if (unmatchedPayment) {
              paymentRecord = unmatchedPayment;
            } else {
              paymentRecord = recentPayments[0];
            }
          }
        }
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_FAILED:
    case PAYMONGO_EVENTS.LINK_PAYMENT_FAILED:
      const failedPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      const failedReferenceNumber = eventData.attributes.reference_number || eventData.id;
      const failedPaymentIntentId = eventData.attributes.payment_intent_id || eventData.attributes.payment_intent?.id;
      
      updateData = {
        status: 'failed',
        paymentMethod: failedPaymentMethod,
        referenceNumber: failedReferenceNumber,
      };

      console.log(`[PAYMENT_FAILED] Looking for payment with:`, {
        referenceNumber: failedReferenceNumber,
        paymentIntentId: failedPaymentIntentId,
        eventId: eventData.id,
      });

      if (failedPaymentIntentId) {
        paymentRecord = await prisma.payments.findFirst({
          where: { paymentIntentId: failedPaymentIntentId },
        });
        if (paymentRecord) {
          console.log(`[PAYMENT_FAILED] Found by paymentIntentId: ${paymentRecord.transactionId}`);
        }
      }
      if (!paymentRecord) {
        paymentRecord = await prisma.payments.findFirst({
          where: { referenceNumber: failedReferenceNumber },
        });
        if (paymentRecord) {
          console.log(`[PAYMENT_FAILED] Found by referenceNumber: ${paymentRecord.transactionId}`);
        }
      }

      if (!paymentRecord && eventData.id) {
        paymentRecord = await prisma.payments.findFirst({
          where: { referenceNumber: eventData.id },
        });
        if (paymentRecord) {
          console.log(`[PAYMENT_FAILED] Found by eventData.id: ${paymentRecord.transactionId}`);
        }
      }

      if (!paymentRecord) {
        console.error(
          `[PAYMENT_FAILED] No payment found - cannot safely mark as failed`
        );
        console.error(`[PAYMENT_FAILED] Webhook data:`, JSON.stringify({
          eventId: event.data.id,
          eventType: eventType,
          referenceNumber: failedReferenceNumber,
          paymentIntentId: failedPaymentIntentId,
          dataId: eventData.id,
          dataAttributes: Object.keys(eventData.attributes || {}),
        }, null, 2));
        console.error(
          `[PAYMENT_FAILED] Manual investigation required to identify the failed payment`
        );
        paymentRecord = null;
      }
      break;

    case PAYMONGO_EVENTS.LINK_PAYMENT_EXPIRED:
      updateData = {
        status: "failed",
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber:
            eventData.attributes.reference_number || eventData.id,
        },
      });
      break;

    case PAYMONGO_EVENTS.LINK_UPDATED:
    case PAYMONGO_EVENTS.LINK_STATUS_UPDATED:
      const linkStatus = eventData.attributes.status;

      if (
        linkStatus === "failed" ||
        linkStatus === "expired" ||
        linkStatus === "unpaid"
      ) {
        updateData = {
          status: "failed",
        };

        paymentRecord = await prisma.payments.findFirst({
          where: {
            referenceNumber:
              eventData.attributes.reference_number || eventData.id,
          },
        });
      }
      break;

    case PAYMONGO_EVENTS.LINK_ARCHIVED:
    case PAYMONGO_EVENTS.LINK_CANCELLED:
    case PAYMONGO_EVENTS.LINK_CANCELED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELLED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELED:
      updateData = {
        status: "cancelled",
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber:
            eventData.attributes.reference_number || eventData.id,
        },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_REFUNDED:
    case PAYMONGO_EVENTS.PAYMENT_REFUND_UPDATED:
      const refundedPaymentId = eventData.attributes.payment_id;
      const refundAmount = eventData.attributes.amount;

      console.log(`[REFUND] Processing refund webhook:`, {
        refundId: eventData.id,
        paymentId: refundedPaymentId,
        refundAmount: refundAmount ? refundAmount / 100 : 'unknown',
        eventType: eventType,
      });

      updateData = {
        status: "refunded",
      };

      // Build where clause - must match payment ID and be paid status
      const refundWhereClause = {
        referenceNumber: refundedPaymentId,
        status: 'paid',
      };

      // If refund amount is provided, also match the amount
      if (refundAmount) {
        refundWhereClause.amount = refundAmount / 100;
      }

      // Find the exact payment that was refunded
      paymentRecord = await prisma.payments.findFirst({
        where: refundWhereClause,
      });

      if (!paymentRecord) {
        console.error(
          `[REFUND] Paid payment not found for refund. Refund ID: ${eventData.id}, Payment ID: ${refundedPaymentId}, Amount: ${refundAmount ? refundAmount / 100 : 'N/A'}`
        );
        console.error(`[REFUND] This refund will be ignored to prevent updating wrong payment`);
        // Don't update any payment if we can't find the exact match
        paymentRecord = null;
      } else {
        console.log(`[REFUND] Found payment to refund:`, {
          transactionId: paymentRecord.transactionId,
          amount: paymentRecord.amount,
          referenceNumber: paymentRecord.referenceNumber,
          paymentId: paymentRecord.id,
        });
        
        // verify the amounts match if refund amount is provided
        if (refundAmount && parseFloat(paymentRecord.amount) !== refundAmount / 100) {
          console.error(`[REFUND] Amount mismatch! Payment amount: ${paymentRecord.amount}, Refund amount: ${refundAmount / 100}`);
          console.error(`[REFUND] Refund will be ignored due to amount mismatch`);
          paymentRecord = null;
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
      return {
        handled: false,
        message: "Event type not handled but acknowledged",
      };
  }

  if (paymentRecord && Object.keys(updateData).length > 0) {
    try {
      // Prevent duplicate webhook processing - only update if status allows
      const currentStatus = paymentRecord.status;
      const newStatus = updateData.status;
      
      // Skip update if payment is already in final state
      if (currentStatus === "paid" && newStatus === "paid") {
        console.log(`[Webhook] Payment ${paymentRecord.transactionId} already paid, skipping duplicate webhook`);
        return {
          handled: true,
          message: "Payment already processed (duplicate webhook)",
          paymentId: paymentRecord.id,
        };
      }
      
      // Don't overwrite existing reference number with null
      if (!updateData.referenceNumber && paymentRecord.referenceNumber) {
        delete updateData.referenceNumber;
      }
      
      console.log(`[Webhook] Updating payment ${paymentRecord.transactionId}:`, {
        currentStatus,
        newStatus,
        updateFields: Object.keys(updateData),
        hasReferenceNumber: !!updateData.referenceNumber,
      });
      
      // Use updateMany for atomic update with condition
      const updateResult = await prisma.payments.updateMany({
        where: { 
          id: paymentRecord.id,
          status: currentStatus, // Only update if status hasn't changed
        },
        data: updateData,
      });
      
      if (updateResult.count === 0) {
        console.log(`[Webhook] Payment ${paymentRecord.transactionId} status changed by another process, skipping`);
        return {
          handled: true,
          message: "Payment already updated by another process",
          paymentId: paymentRecord.id,
        };
      }
      
      // Fetch updated payment with user relation for email
      const updatedPayment = await prisma.payments.findUnique({
        where: { id: paymentRecord.id },
        include: {
          user: true,
        },
      });

      // Log payment status change
      if (updateData.status === "paid") {
        // Log successful payment
        const userName = updatedPayment.user
          ? `${updatedPayment.user.firstName} ${updatedPayment.user.lastName}`
          : "Guest";
        const userEmail =
          updatedPayment.paymentEmail || updatedPayment.user?.email || "N/A";

        await logSecurityEvent(
          "Payment successful",
          updatedPayment.user?.userId || null,
          MODULE_TYPES.PAYMENTS,
          `Payment completed: Transaction ID [${
            updatedPayment.transactionId
          }] for ${userName} (${userEmail}). Amount: ₱${parseFloat(
            updatedPayment.amount
          ).toFixed(2)}, Payment Method: ${
            updatedPayment.paymentMethod || "Online Payment"
          }, Fee Type: ${updatedPayment.feeType || "N/A"}, Reference: ${
            updatedPayment.referenceNumber || "N/A"
          }`
        );
      } else if (updateData.status === "failed") {
        // Log failed payment
        const userName = updatedPayment.user
          ? `${updatedPayment.user.firstName} ${updatedPayment.user.lastName}`
          : "Guest";
        const userEmail =
          updatedPayment.paymentEmail || updatedPayment.user?.email || "N/A";

        logSecurityEvent(
          "Payment failed",
          updatedPayment.user?.userId || null,
          MODULE_TYPES.PAYMENTS,
          `Payment failed: Transaction ID [${
            updatedPayment.transactionId
          }] for ${userName} (${userEmail}). Amount: ₱${parseFloat(
            updatedPayment.amount
          ).toFixed(2)}, Reference: ${updatedPayment.referenceNumber || "N/A"}`
        );
      }

      // Send receipt email if payment was successful
      console.log("[Webhook] Checking if should send receipt email...");
      console.log("[Webhook] updateData.status:", updateData.status);
      console.log("[Webhook] updatedPayment.paymentEmail:", updatedPayment.paymentEmail);
      console.log("[Webhook] updatedPayment.user?.email:", updatedPayment.user?.email);

      if (
        updateData.status === "paid" &&
        (updatedPayment.paymentEmail || updatedPayment.user)
      ) {
        const receiptEmail =
          updatedPayment.paymentEmail || updatedPayment.user?.email;
        // BCC to student's email if payer email is different
        const bccEmail = updatedPayment.paymentEmail && updatedPayment.user?.email !== updatedPayment.paymentEmail
          ? updatedPayment.user.email
          : undefined;
        console.log(`[Webhook] Sending payment receipt email to ${receiptEmail}${bccEmail ? ` (BCC: ${bccEmail})` : ''}`);

        try {
          const emailSent = await sendPaymentReceiptEmail(
            receiptEmail,
            {
              transactionId: updatedPayment.transactionId,
              referenceNumber: updatedPayment.referenceNumber,
              amount: parseFloat(updatedPayment.amount),
              paymentMethod: updatedPayment.paymentMethod || "Online Payment",
              feeType: updatedPayment.feeType,
              remarks: updatedPayment.remarks,
              paidAt: updatedPayment.paidAt,
              createdAt: updatedPayment.createdAt,
              currency: updatedPayment.currency,
            },
            {
              firstName: updatedPayment.user?.firstName || "Student",
              lastName: updatedPayment.user?.lastName || "",
              email:
                updatedPayment.paymentEmail ||
                updatedPayment.user?.email ||
                receiptEmail,
              student_id: updatedPayment.user?.userId,
              studentName: updatedPayment.user
                ? `${updatedPayment.user.firstName} ${updatedPayment.user.lastName}`
                : "N/A",
            },
            bccEmail
          );

          if (emailSent) {
            console.log(
              `Payment receipt email sent successfully to ${receiptEmail}`
            );
          } else {
            console.error(
              `Failed to send payment receipt email to ${receiptEmail}`
            );
          }
        } catch (emailError) {
          console.error("Error sending payment receipt email:", emailError);
        }
      }
    } catch (updateError) {
      console.error(
        `Failed to update payment ${paymentRecord.id}:`,
        updateError
      );
    }

    return {
      handled: true,
      message: "Payment updated successfully",
      paymentId: paymentRecord.id,
    };
  } else if (!paymentRecord) {
    console.warn(`No payment record found for PayMongo ID: ${eventData.id}`);
    console.warn(
      `Tried to find payment with reference: ${eventData.attributes.reference_number}`
    );
    console.warn(
      `Event type: ${eventType} - This payment might need manual investigation`
    );
    return {
      handled: false,
      message: "Payment record not found",
    };
  }

  return {
    handled: true,
    message: "Event processed successfully",
  };
};

// PayMongo API Functions

/**
 * Create Payment Intent via PayMongo API
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} PayMongo response
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const {
      amount,
      currency = "PHP",
      description,
      payment_method_allowed = ["card", "gcash", "paymaya"],
      payment_method_options,
    } = paymentData;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error("Amount is required and must be greater than 0");
    }

    const requestBody = {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          currency,
          description,
          payment_method_allowed,
        },
      },
    };

    // Add payment method options for cards (3D Secure)
    if (payment_method_options) {
      requestBody.data.attributes.payment_method_options =
        payment_method_options;
    }

    // Generate idempotency key to prevent duplicate payment creations
    const idempotencyKey = paymentData.idempotencyKey || uuidv4();
    
    console.log("[PayMongo] Creating payment intent:", {
      amount: requestBody.data.attributes.amount,
      description: requestBody.data.attributes.description,
      idempotencyKey: idempotencyKey,
      hasProvidedKey: !!paymentData.idempotencyKey,
    });
    
    const response = await axios.post(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_INTENTS}`,
      requestBody,
      {
        headers: {
          ...createPayMongoAuthHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    
    console.log("[PayMongo] Payment intent created:", {
      intentId: response.data?.data?.id,
      idempotencyKey: idempotencyKey,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error creating PayMongo Payment Intent:",
      error.response?.data || error.message
    );

    let errorMessage = "Failed to create payment intent";
    if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors
        .map((err) => err.detail || err.title)
        .join(", ");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Attach Payment Method to Payment Intent via PayMongo API
 * @param {Object} attachData - Attachment data
 * @returns {Promise<Object>} PayMongo response
 */
export const attachPaymentMethod = async (attachData) => {
  try {
    const { payment_intent_id, payment_method_id, return_url } = attachData;

    // Generate idempotency key to prevent duplicate payment method attachments
    const idempotencyKey = attachData.idempotencyKey || uuidv4();
    
    const response = await axios.post(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_INTENTS}/${payment_intent_id}/attach`,
      {
        data: {
          attributes: {
            payment_method: payment_method_id,
            return_url,
          },
        },
      },
      {
        headers: {
          ...createPayMongoAuthHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
      }
    );

    console.log("PayMongo Payment Method attached:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error attaching PayMongo Payment Method:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get Payment Intent status from PayMongo API
 * @param {string} paymentIntentId - Payment Intent ID
 * @returns {Promise<Object>} PayMongo response
 */
export const getPaymentIntent = async (paymentIntentId) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_INTENTS}/${paymentIntentId}`,
      {
        headers: createPayMongoAuthHeaders(),
      }
    );

    console.log("PayMongo Payment Intent retrieved:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error retrieving PayMongo Payment Intent:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get Payment details from PayMongo API to fetch billing information
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} PayMongo response with billing info
 */
export const getPaymentFromPayMongo = async (paymentId) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_CONFIG.BASE_URL}/v1/payments/${paymentId}`,
      {
        headers: createPayMongoAuthHeaders(),
      }
    );

    console.log("PayMongo Payment retrieved:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Error retrieving PayMongo Payment:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
