import {
  createManualPayment,
  getPaymentWithSync,
  getAllTransactions,
  sendPaymentLinkViaEmail,
  sendSuccess,
  sendError,
  generatePaymentId,
} from "../services/payment_service.js";
import { sendPaymentReceiptEmail } from "../services/paymentEmailService.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  createPaymentIntent as createPayMongoPaymentIntent,
  attachPaymentMethod as attachPayMongoPaymentMethod,
  getPaymentIntent as getPayMongoPaymentIntent,
  formatPaymentMethod,
} from "../services/paymongo_service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMENT_INCLUDES,
} from "../constants/payment_constants.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Payment Controller
 * Handles HTTP requests and delegates business logic to services
 */

// Create manual transaction (Physical Payment)
const createManualTransaction = async (req, res) => {
  try {
    const result = await createManualPayment(req.body);
    return sendSuccess(
      res,
      result,
      SUCCESS_MESSAGES.MANUAL_TRANSACTION_CREATED,
      201
    );
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Get payment details */
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentWithSync(paymentId);
    return sendSuccess(res, payment);
  } catch (error) {
    const statusCode =
      error.message === ERROR_MESSAGES.PAYMENT_NOT_FOUND ? 404 : 500;
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode,
      error.message
    );
  }
};

/* Refresh payment status from PayMongo */
const refreshPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentWithSync(paymentId);
    return sendSuccess(res, result, "Payment status refreshed successfully");
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Get all transactions for admin management */
const getAllPaymentTransactions = async (req, res) => {
  try {
    const { page, limit, status, searchTerm } = req.query;
    const result = await getAllTransactions({
      page,
      limit,
      status,
      searchTerm,
    });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Manual sync specific payment by intent ID */
const manualSyncPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return sendError(res, "Payment intent ID is required", 400);
    }

    // Get the latest status from PayMongo
    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);

    if (!paymongoResult?.success) {
      return sendError(res, "Failed to get payment status from PayMongo", 500);
    }

    // Find the payment record
    let payment = await prisma.payments.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: PAYMENT_INCLUDES.WITH_USER,
    });

    if (!payment) {
      return sendError(res, "Payment record not found", 404);
    }

    const paymongoStatus = paymongoResult.data?.data?.attributes?.status;

    if (paymongoStatus === "succeeded" && payment.status === "pending") {
      const updatedPayment = await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
        include: PAYMENT_INCLUDES.WITH_USER,
      });

      // Send receipt email when payment status changes to paid
      if (updatedPayment.user && (updatedPayment.paymentEmail || updatedPayment.user.email)) {
        const recipientEmail = updatedPayment.paymentEmail || updatedPayment.user.email;
        // BCC to student's email if payer email is different
        const bccEmail = updatedPayment.paymentEmail && updatedPayment.user.email !== updatedPayment.paymentEmail
          ? updatedPayment.user.email
          : undefined;
        console.log(
          `Sending payment receipt email to ${recipientEmail} after manual sync${bccEmail ? ` (BCC: ${bccEmail})` : ''}`
        );

        try {
          const emailSent = await sendPaymentReceiptEmail(
            recipientEmail,
            {
              transactionId: updatedPayment.transactionId,
              referenceNumber: updatedPayment.referenceNumber,
              amount: parseFloat(updatedPayment.amount),
              paymentMethod: updatedPayment.paymentMethod || "Online Payment",
              feeType: updatedPayment.feeType,
              remarks: updatedPayment.remarks,
              paidAt: updatedPayment.paidAt,
              createdAt: updatedPayment.createdAt,
              currency: updatedPayment.currency || "PHP",
            },
            {
              studentName: `${updatedPayment.user.firstName} ${updatedPayment.user.lastName}`,
              firstName: updatedPayment.user.firstName,
              lastName: updatedPayment.user.lastName,
              email: updatedPayment.user.email,
              student_id: updatedPayment.user.userId,
            },
            bccEmail
          );

          if (emailSent) {
            console.log(
              `Payment receipt email sent successfully to ${recipientEmail}`
            );
          } else {
            console.error(
              `Failed to send payment receipt email to ${recipientEmail}`
            );
          }
        } catch (emailError) {
          console.error(
            "Error sending payment receipt email after manual sync:",
            emailError
          );
        }
      }

      return sendSuccess(
        res,
        {
          paymentId: payment.id,
          oldStatus: "pending",
          newStatus: "paid",
          paymongoStatus: paymongoStatus,
        },
        "Payment status synced successfully"
      );
    }

    return sendSuccess(
      res,
      {
        paymentId: payment.id,
        status: payment.status,
        paymongoStatus: paymongoStatus,
        synced: false,
        reason: "Status already up to date",
      },
      "Payment status is already up to date"
    );
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

// Webhook Handling
const handleWebhook = async (req, res) => {
  const startTime = Date.now();
  let webhookEventRecord = null;

  console.log("[Webhook] ===== WEBHOOK RECEIVED =====");
  console.log("[Webhook] Timestamp:", new Date().toISOString());
  console.log("[Webhook] Headers:", JSON.stringify(req.headers, null, 2));

  try {
    // Read raw body if provided by raw parser; otherwise use JSON body
    let rawBodyString = null;
    if (req.body && Buffer.isBuffer(req.body)) {
      rawBodyString = req.body.toString("utf8");
    } else if (typeof req.body === "string") {
      rawBodyString = req.body;
    }

    const event = rawBodyString ? JSON.parse(rawBodyString) : req.body;
    const signature = req.get("Paymongo-Signature");
    const eventId = event?.data?.id;
    const eventType = event?.data?.attributes?.type;

    console.log("[Webhook] Event Type:", eventType);
    console.log("[Webhook] Event ID:", eventId);

    // Create initial webhook event log
    webhookEventRecord = await prisma.webhook_events.create({
      data: {
        eventId: eventId,
        eventType: eventType || "unknown",
        payload: event,
        signature: signature,
        signatureVerified: false,
        status: "pending",
      },
    });

    // Verify webhook signature (uses raw body if available)
    const isVerified = verifyWebhookSignature(req);

    // Update signature verification status
    await prisma.webhook_events.update({
      where: { id: webhookEventRecord.id },
      data: { signatureVerified: isVerified },
    });

    res.status(200).json({
      statusCode: 200,
      body: { message: "SUCCESS" },
    });

    try {
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: { status: "processing" },
      });

      const result = await processWebhookEvent(event);
      const processingTime = Date.now() - startTime;

      // Update webhook event log with success
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: {
          status: "success",
          processedAt: new Date(),
          processingTimeMs: processingTime,
          paymentId: result?.paymentId || null,
        },
      });

      console.log(`[Webhook] Successfully processed ${eventType} in ${processingTime}ms`);
    } catch (processingError) {
      console.error("Webhook processing error:", processingError);
      const processingTime = Date.now() - startTime;

      // Update webhook event log with failure
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: {
          status: "failed",
          error: processingError.message || "Unknown processing error",
          processedAt: new Date(),
          processingTimeMs: processingTime,
        },
      });
    }
    return; // response already sent
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error.message);
    console.error("[Webhook] Error stack:", error.stack);

    // Log error to webhook_events if record was created
    if (webhookEventRecord) {
      try {
        await prisma.webhook_events.update({
          where: { id: webhookEventRecord.id },
          data: {
            status: "failed",
            error: error.message,
            processedAt: new Date(),
            processingTimeMs: Date.now() - startTime,
          },
        });
      } catch (logError) {
        console.error("[Webhook] Failed to log error:", logError);
      }
    }

    // Handle specific webhook errors
    if (error.message.includes("Webhook secret not configured")) {
      console.error("[Webhook] Webhook secret not configured in environment");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    if (
      error.message.includes("Missing") ||
      error.message.includes("Invalid")
    ) {
      console.error("[Webhook] Signature verification failed:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.error("[Webhook] Acknowledging webhook with error state");
    return res.status(200).json({
      statusCode: 200,
      body: { message: "ERROR_ACKNOWLEDGED" },
    });
  }
};

/* Send payment link via email */
const sendPaymentLinkEmail = async (req, res) => {
  try {
    const result = await sendPaymentLinkViaEmail(req.body);

    if (result.success) {
      return sendSuccess(
        res,
        {
          paymentId: result.paymentId,
        },
        result.message,
        200
      );
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Create payment intent (PIPM flow) */
const createPaymentIntent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      purpose,
      remarks,
      description,
      userId,
      amount,
      feeType,
      paymentId,
    } = req.body;
    console.log("[CreateIntent] incoming body:", {
      userId,
      amount,
      feeType,
      paymentId,
      purpose,
      hasDesc: !!description,
      hasRemarks: !!remarks,
    });

    if (!amount || amount <= 0) {
      return sendError(
        res,
        "Amount is required and must be greater than 0",
        400
      );
    }

    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }

    let paymongoDescription = remarks || description;
    if (!paymongoDescription && purpose && (firstName || lastName)) {
      paymongoDescription = `${purpose} - Payment for ${firstName || ""} ${
        lastName || ""
      }`.trim();
    }
    if (!paymongoDescription) paymongoDescription = "Payment";

    console.log(
      "[CreateIntent] calling PayMongo createPaymentIntent with description:",
      paymongoDescription
    );
    const result = await createPayMongoPaymentIntent({
      ...req.body,
      description: paymongoDescription,
    });

    if (result.success) {
      const paymentIntentId = result.data?.data?.id;
      console.log(
        "[CreateIntent] paymongo response success, intentId:",
        paymentIntentId
      );

      if (paymentIntentId && userId && amount) {
        if (paymentId) {
          try {
            const existing = await prisma.payments.findUnique({
              where: { id: paymentId },
            });
            console.log("[CreateIntent] reuse check existing payment:", {
              paymentId,
              exists: !!existing,
              status: existing?.status,
              hasIntentId: !!existing?.paymentIntentId,
            });
            if (!existing) {
              return sendError(
                res,
                "Payment record not found for provided paymentId",
                404
              );
            }
            if (existing.status !== "pending") {
              console.warn(
                "[CreateIntent] payment not pending, lock enforced",
                { paymentId, status: existing.status }
              );
              return sendError(
                res,
                "Payment link is locked or already processed",
                409
              );
            }
            
            if (existing.paymentIntentId && existing.paymentIntentId !== paymentIntentId) {
              console.warn(
                "[CreateIntent] Payment already has a different intent ID, returning existing",
                { 
                  existingIntentId: existing.paymentIntentId, 
                  newIntentId: paymentIntentId 
                }
              );
              return sendSuccess(
                res,
                result.data,
                "Payment intent already exists for this payment"
              );
            }
            
            await prisma.payments.update({
              where: { id: paymentId },
              data: {
                paymentIntentId: paymentIntentId,
                remarks: existing.remarks || paymongoDescription,
                feeType:
                  existing.feeType || feeType || purpose || "tuition_fee",
              },
            });
            console.log("[CreateIntent] reused existing pending payment", {
              paymentId,
              paymentIntentId,
            });
          } catch (dbError) {
            console.error(
              "Failed to update existing payment record with intent:",
              dbError
            );
            return sendError(
              res,
              "Failed to update payment record",
              500
            );
          }
        } else {
          // Check if a payment already exists for this intent ID to prevent duplicates
          const existingPaymentWithIntent = await prisma.payments.findFirst({
            where: {
              paymentIntentId: paymentIntentId,
              status: "pending",
            },
          });

          if (existingPaymentWithIntent) {
            console.log("[CreateIntent] payment with this intent already exists, reusing", {
              paymentId: existingPaymentWithIntent.id,
              transactionId: existingPaymentWithIntent.transactionId,
            });
            return sendSuccess(
              res,
              result.data,
              "Payment intent created successfully"
            );
          }

          const customTransactionId = await generatePaymentId();
          console.log("[CreateIntent] creating new pending payment row", {
            customTransactionId,
          });

          let finalUserId = userId;
          if (typeof userId === "string" && userId.length <= 20) {
            try {
              const user = await prisma.users.findUnique({
                where: { userId: userId },
                select: { id: true },
              });

              if (user) {
                finalUserId = user.id;
              }
            } catch (userError) {
              console.error("Error finding user:", userError);
            }
          }
          try {
            await prisma.payments.create({
              data: {
                transactionId: customTransactionId,
                userId: finalUserId,
                amount: parseFloat(amount),
                status: "pending",
                paymentMethod: "Online Payment",
                paymentIntentId: paymentIntentId,
                feeType: feeType || purpose || "tuition_fee",
                remarks: paymongoDescription,
              },
            });
            console.log("[CreateIntent] new pending payment inserted OK");
          } catch (dbError) {
            console.error("Failed to create payment record:", dbError);
            return sendError(
              res,
              "Failed to create payment record",
              500
            );
          }
        }
      }

      return sendSuccess(
        res,
        result.data,
        "Payment intent created successfully"
      );
    } else {
      console.warn(
        "[CreateIntent] paymongo response failed:",
        result.message || result.error
      );
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Create payment intent error", error);
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Attach payment method to payment intent */
const attachPaymentMethod = async (req, res) => {
  try {
    console.log("[AttachMethod] incoming body:", {
      hasPi: !!req.body?.payment_intent_id,
      hasPm: !!req.body?.payment_method_id,
      hasClient: !!req.body?.client_key,
    });
    const result = await attachPayMongoPaymentMethod(req.body);
    if (result.success) {
      const status =
        result.data?.data?.data?.attributes?.status ||
        result.data?.data?.attributes?.status;
      console.log(
        "[AttachMethod] paymongo attach success. intent status:",
        status
      );
      return sendSuccess(
        res,
        result.data,
        "Payment method attached successfully"
      );
    } else {
      console.warn(
        "[AttachMethod] paymongo attach failed:",
        result.message || result.error
      );
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Attach payment method error:", error);
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Check payment status by payment intent ID */
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    console.log("[CheckStatus] start for intent:", paymentIntentId);

    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);
    console.log(
      "[CheckStatus] paymongo intent fetch ok:",
      !!paymongoResult?.success
    );

    let intentDerivedPaymentId = null;
    let intentDerivedReference = null;
    try {
      if (paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        intentDerivedPaymentId = intentData?.latest_payment || null;
        if (
          !intentDerivedPaymentId &&
          Array.isArray(intentData?.payments) &&
          intentData.payments.length > 0
        ) {
          const firstPayment = intentData.payments[0];
          intentDerivedPaymentId =
            firstPayment?.id || firstPayment?.data?.id || null;
          intentDerivedReference =
            firstPayment?.data?.attributes?.reference_number || null;
        }
        if (
          !intentDerivedPaymentId &&
          intentData?.payment_intent?.payments?.length
        ) {
          const p = intentData.payment_intent.payments[0];
          intentDerivedPaymentId = p?.id || p?.data?.id || null;
          intentDerivedReference =
            p?.data?.attributes?.reference_number || null;
        }
      }
      console.log("[CheckStatus] derived paymongo payment/ref:", {
        intentDerivedPaymentId,
        intentDerivedReference,
      });
    } catch (e) {
      console.warn("Unable to derive payment id from intent:", e);
    }

    let payment = await prisma.payments.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: PAYMENT_INCLUDES.WITH_USER,
    });
    console.log("[CheckStatus] db payment by intent:", {
      found: !!payment,
      status: payment?.status,
      hasPaymentEmail: !!payment?.paymentEmail,
      paymentEmail: payment?.paymentEmail,
      userEmail: payment?.user?.email,
    });

    if (!payment) {
      payment = await prisma.payments.findFirst({
        where: { referenceNumber: paymentIntentId },
        include: PAYMENT_INCLUDES.WITH_USER,
      });
      console.log("[CheckStatus] db payment by referenceNumber:", {
        found: !!payment,
        status: payment?.status,
      });
    }
    if (!payment) {
      const recentPayments = await prisma.payments.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          transactionId: true,
          paymentIntentId: true,
          referenceNumber: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      const unmatchedPayment = recentPayments.find(
        (p) => !p.paymentIntentId && p.status === "pending"
      );
      if (unmatchedPayment) {
        try {
          payment = await prisma.payments.update({
            where: { id: unmatchedPayment.id },
            data: {
              paymentIntentId: paymentIntentId,
              referenceNumber: intentDerivedPaymentId || intentDerivedReference,
              status:
                paymongoResult?.success &&
                paymongoResult.data?.data?.attributes?.status === "succeeded"
                  ? "paid"
                  : "pending",
              paidAt:
                paymongoResult?.success &&
                paymongoResult.data?.data?.attributes?.status === "succeeded"
                  ? new Date()
                  : null,
            },
            include: PAYMENT_INCLUDES.WITH_USER,
          });
        } catch (updateError) {
          console.error(
            "Failed to update existing payment record:",
            updateError
          );
        }
      }
    }

    if (!payment) {
      if (paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        const paymongoAmount = intentData?.amount
          ? intentData.amount / 100
          : null;

        try {
          const customTransactionId = await generatePaymentId();

          let userId = null;
          let feeType = "unknown";
          let remarks = "Payment created from PayMongo data";

          const description = intentData?.description || "";
          console.log(`PayMongo description: ${description}`);

          const recentPayments = await prisma.payments.findMany({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
              },
              amount: paymongoAmount || 0,
            },
            select: {
              userId: true,
              feeType: true,
              remarks: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          });

          if (recentPayments.length > 0) {
            userId = recentPayments[0].userId;
            feeType = recentPayments[0].feeType || "unknown";
            remarks = recentPayments[0].remarks || description;
          } else {
            const existingUser = await prisma.users.findFirst({
              select: { id: true },
            });
            if (existingUser) {
              userId = existingUser.id;
            }
          }

          payment = await prisma.payments.create({
            data: {
              transactionId: customTransactionId,
              userId: userId,
              amount: paymongoAmount || 0,
              status: intentData?.status === "succeeded" ? "paid" : "pending",
              paymentMethod: "Online Payment",
              paymentIntentId: paymentIntentId,
              referenceNumber: intentDerivedPaymentId || intentDerivedReference,
              feeType: feeType,
              remarks: remarks,
              paidAt: intentData?.status === "succeeded" ? new Date() : null,
            },
            include: PAYMENT_INCLUDES.WITH_USER,
          });
          console.log(
            ` Created payment record from PayMongo data: ${payment.id} with userId: ${userId}`
          );
        } catch (createError) {
          console.error(
            "Failed to create payment record from PayMongo data:",
            createError
          );
        }
      }

      if (!payment) {
        return sendError(
          res,
          "Payment not found. The payment may still be processing. Please wait for the webhook or contact support.",
          404
        );
      }
    }

    console.log(
      `Payment found: ${payment.id}, status: ${payment.status}, paymentMethod: ${payment.paymentMethod}`
    );

    let finalPaymentMethod = payment.paymentMethod;
    if (finalPaymentMethod === "Online Payment" && paymongoResult?.success) {
      const intentData = paymongoResult.data?.data?.attributes;
      console.log(
        "Attempting to extract payment method from PayMongo intent data:",
        JSON.stringify(intentData, null, 2)
      );

      let sourceType = null;

      if (intentData?.payments && intentData.payments.length > 0) {
        const paymentData = intentData.payments[0];
        console.log(
          "Payment data from payments array:",
          JSON.stringify(paymentData, null, 2)
        );

        if (paymentData.data?.attributes?.source?.type) {
          sourceType = paymentData.data.attributes.source.type;
        } else if (paymentData.attributes?.source?.type) {
          sourceType = paymentData.attributes.source.type;
        } else if (paymentData.source?.type) {
          sourceType = paymentData.source.type;
        }
      }

      if (!sourceType && intentData?.source?.type) {
        sourceType = intentData.source.type;
      }

      if (!sourceType && intentData?.payment_method?.type) {
        sourceType = intentData.payment_method.type;
      }

      if (sourceType) {
        const extractedMethod = formatPaymentMethod(sourceType);
        console.log(
          `Extracted payment method from PayMongo: ${extractedMethod} (source: ${sourceType})`
        );
        finalPaymentMethod = extractedMethod;

        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: { paymentMethod: extractedMethod },
          });
          console.log(`Updated payment method in database: ${extractedMethod}`);
        } catch (updateError) {
          console.error("Failed to update payment method:", updateError);
        }
      } else {
        console.log("Could not extract payment method from PayMongo response");
      }
    }

    if (payment.status === "pending" && paymongoResult?.success) {
      const paymongoStatus = paymongoResult.data?.data?.attributes?.status;

      if (paymongoStatus === "succeeded") {
        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: {
              status: "paid",
              paidAt: new Date(),
            },
          });
          payment.status = "paid";
          payment.paidAt = new Date();

          // Send receipt email when payment status changes to paid
          if (payment.user && (payment.paymentEmail || payment.user.email)) {
            const recipientEmail = payment.paymentEmail || payment.user.email;
            // BCC to student's email if payer email is different
            const bccEmail = payment.paymentEmail && payment.user.email !== payment.paymentEmail
              ? payment.user.email
              : undefined;
            console.log(
              `Sending payment receipt email to ${recipientEmail} after status sync${bccEmail ? ` (BCC: ${bccEmail})` : ''}`
            );

            try {
              const emailSent = await sendPaymentReceiptEmail(
                recipientEmail,
                {
                  transactionId: payment.transactionId,
                  referenceNumber: payment.referenceNumber,
                  amount: parseFloat(payment.amount),
                  paymentMethod: finalPaymentMethod,
                  feeType: payment.feeType,
                  remarks: payment.remarks,
                  paidAt: payment.paidAt,
                  createdAt: payment.createdAt,
                  currency: payment.currency || "PHP",
                },
                {
                  studentName: `${payment.user.firstName} ${payment.user.lastName}`,
                  firstName: payment.user.firstName,
                  lastName: payment.user.lastName,
                  email: payment.user.email,
                  student_id: payment.user.userId,
                },
                bccEmail
              );

              if (emailSent) {
                console.log(
                  `Payment receipt email sent successfully to ${recipientEmail}`
                );
              } else {
                console.error(
                  `Failed to send payment receipt email to ${recipientEmail}`
                );
              }
            } catch (emailError) {
              console.error(
                "Error sending payment receipt email after status sync:",
                emailError
              );
            }
          }
        } catch (updateError) {
          console.error("Failed to update payment status:", updateError);
        }
      }
    }

    const statusMap = {
      paid: "succeeded",
      pending: "awaiting_payment_method",
      failed: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
    };

    const responseData = {
      status: statusMap[payment.status] || payment.status,
      dbStatus: payment.status,
      amount: payment.amount,
      transactionId: payment.transactionId || payment.id,
      internalId: payment.id,
      paymongoPaymentId: undefined,
      referenceNumber: payment.referenceNumber,
      paymentMethod: finalPaymentMethod,
      description: payment.remarks || "Payment",
      paidAt: payment.paidAt,
      user: payment.user
        ? {
            firstName: payment.user.firstName,
            lastName: payment.user.lastName,
            email: payment.user.email,
          }
        : null,
    };

    return sendSuccess(res, responseData);
  } catch (error) {
    console.error("Check payment status error:", error);
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500
    );
  }
};

//Export Controller Functions
export {
  createManualTransaction,
  getPaymentDetails,
  getAllPaymentTransactions,
  refreshPaymentStatus,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
  manualSyncPayment,
};

// Export default object for backward compatibility
export default {
  createManualTransaction,
  getPaymentDetails,
  getAllTransactions: getAllPaymentTransactions,
  refreshPaymentStatus,
  manualSyncPayment,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
};
