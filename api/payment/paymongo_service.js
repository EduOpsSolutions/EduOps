import axios from 'axios';
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { 
  PAYMONGO_CONFIG, 
  createPayMongoAuthHeaders,
  PAYMONGO_METHOD_MAP,
  PAYMONGO_EVENTS 
} from './payment_constants.js';

const prisma = new PrismaClient();

/**
 * PayMongo Service
 * Consolidated PayMongo API operations and webhook processing
 */

// ==================== PayMongo API Operations ====================

/**
 * Create a Payment Link for checkout
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount in PHP (will be converted to centavos)
 * @param {string} paymentData.description - Payment description
 * @param {string} paymentData.remarks - Additional remarks
 * @returns {Promise<Object>} Payment link response
 */
export const createPaymentLink = async (paymentData) => {
    try {
        const { amount, description, remarks } = paymentData;
        const amountInCentavos = Math.round(amount * 100);

        const data = {
            data: {
                attributes: {
                    amount: amountInCentavos,
                    currency: 'PHP',
                    description: description || 'EduOps Payment',
                    remarks: remarks || 'Payment for EduOps services'
                }
            }
        };

        const response = await axios.post(
            `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.LINKS}`,
            data,
            { headers: createPayMongoAuthHeaders() }
        );

        return {
            success: true,
            data: response.data,
            checkoutUrl: response.data.data.attributes.checkout_url,
            paymentLinkId: response.data.data.id
        };
    } catch (error) {
        console.error('PayMongo Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errors?.[0]?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'PayMongo API Error'
        };
    }
};

/**
 * Retrieve payment link details
 * @param {string} paymentLinkId - Payment link ID
 * @returns {Promise<Object>} Payment link details
 */
export const getPaymentLink = async (paymentLinkId) => {
    try {
        const response = await axios.get(
            `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.LINKS}/${paymentLinkId}`,
            { headers: createPayMongoAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Get Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errors?.[0]?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Failed to get payment link'
        };
    }
};

/**
 * Archive (disable) a payment link
 * @param {string} paymentLinkId - Payment link ID
 * @returns {Promise<Object>} Archive result
 */
export const archivePaymentLink = async (paymentLinkId) => {
    try {
        const response = await axios.post(
            `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.LINKS}/${paymentLinkId}/archive`,
            {},
            { headers: createPayMongoAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Archive Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errors?.[0]?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Failed to archive payment link'
        };
    }
};

/**
 * Get list of available payment methods for the merchant
 * @returns {Promise<Object>} Available payment methods
 */
export const getPaymentMethods = async () => {
    try {
        const response = await axios.get(
            `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_METHODS}`,
            { headers: createPayMongoAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Get Payment Methods Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errors?.[0]?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Failed to get payment methods'
        };
    }
};

/**
 * Retrieve payment details by payment ID
 * @param {string} paymentId - Payment ID from PayMongo
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
    try {
        const response = await axios.get(
            `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENTS}/${paymentId}`,
            { headers: createPayMongoAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Get Payment Details Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errors?.[0]?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'Failed to get payment details'
        };
    }
};

// ==================== PayMongo Webhook Processing ====================

/**
 * Extract and format payment method from PayMongo webhook data
 * @param {Object} eventData - Webhook event data
 * @returns {string} Formatted payment method
 */
export const getPaymentMethodFromPayMongo = (eventData) => {
  let paymentMethod = "Online Payment"; // Default fallback

  try {
    // For link.payment.paid events, the payment method is nested deep in the payments array
    if (
      eventData.attributes?.payments &&
      eventData.attributes.payments.length > 0
    ) {
      const payment = eventData.attributes.payments[0]; // Get the first payment
      if (payment.data?.attributes?.source?.type) {
        paymentMethod = formatPaymentMethod(
          payment.data.attributes.source.type
        );
        return paymentMethod;
      }
    }

    // Fallback: Check direct source paths
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
 * Extract PayMongo details for frontend consumption
 * @param {string|Object} paymongoResponse - PayMongo response data
 * @returns {Object|null} Extracted PayMongo details
 */
export const extractPayMongoDetails = (paymongoResponse) => {
  if (!paymongoResponse) return null;

  try {
    let responseData = paymongoResponse;
    if (typeof paymongoResponse === "string") {
      responseData = JSON.parse(paymongoResponse);
    }

    const data = responseData.data;
    if (!data) return null;

    const details = {
      paymongoId: null,
      referenceNumber: null,
      externalReferenceNumber: null,
      paymongoStatus: null,
      paymongoCreatedAt: null,
      paymongoUpdatedAt: null,
      fee: null,
      netAmount: null,
      sourceType: null,
      statementDescriptor: null,
      balanceTransactionId: null,
      paidAt: null,
    };

    // Extract basic link details
    if (data.attributes) {
      details.paymongoId = data.id;
      details.referenceNumber = data.attributes.reference_number;
      details.paymongoStatus = data.attributes.status;
      details.paymongoCreatedAt = data.attributes.created_at;
      details.paymongoUpdatedAt = data.attributes.updated_at;
    }

    // Extract payment details from nested payments array
    if (
      data.attributes?.data?.attributes?.payments &&
      data.attributes.data.attributes.payments.length > 0
    ) {
      const payment =
        data.attributes.data.attributes.payments[0].data.attributes;
      details.externalReferenceNumber = payment.external_reference_number;
      details.fee = payment.fee;
      details.netAmount = payment.net_amount;
      details.sourceType = payment.source?.type;
      details.statementDescriptor = payment.statement_descriptor;
      details.balanceTransactionId = payment.balance_transaction_id;
      details.paidAt = payment.paid_at;
    }

    return details;
  } catch (error) {
    console.error("Error extracting PayMongo details:", error);
    return null;
  }
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

  // Create signature string
  const rawBody = JSON.stringify(req.body);
  const signatureString = `${timestamp}.${rawBody}`;

  // Generate HMAC
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signatureString)
    .digest("hex");

  // Verify signature
  if (computedSignature !== expectedSignature) {
    throw new Error("Invalid webhook signature");
  }

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
  console.log(`Event data ID: ${eventData.id}`);
  console.log(`Event data attributes:`, JSON.stringify(eventData.attributes, null, 2));

  let paymentRecord = null;
  let updateData = {};

  switch (eventType) {
    case PAYMONGO_EVENTS.LINK_PAYMENT_PAID:
      console.log(`Processing link.payment.paid event`);
      const linkPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: linkPaymentMethod,
        referenceNumber: eventData.attributes.reference_number,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: { paymongoId: eventData.id },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_PAID:
      console.log(`Processing payment.paid event`);
      const directPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: directPaymentMethod,
        referenceNumber: eventData.attributes.reference_number,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            {
              referenceNumber: eventData.attributes.external_reference_number,
            },
          ],
        },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_FAILED:
    case PAYMONGO_EVENTS.LINK_PAYMENT_FAILED:
      console.log(`Processing payment failed event: ${eventType}`);
      updateData = {
        status: "failed",
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            { referenceNumber: eventData.attributes.reference_number },
          ],
        },
      });
      break;

    case PAYMONGO_EVENTS.LINK_PAYMENT_EXPIRED:
      console.log(`Processing link.payment.expired event`);
      updateData = {
        status: "failed", // Mark expired test payments as failed
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            { referenceNumber: eventData.attributes.reference_number },
          ],
        },
      });
      break;

    case PAYMONGO_EVENTS.LINK_UPDATED:
    case PAYMONGO_EVENTS.LINK_STATUS_UPDATED:
      console.log(`Processing link status update event: ${eventType}`);
      // Check if link status changed to failed/expired
      const linkStatus = eventData.attributes.status;
      console.log(`Link status from webhook: ${linkStatus}`);
      
      if (linkStatus === 'failed' || linkStatus === 'expired' || linkStatus === 'unpaid') {
        updateData = {
          status: "failed",
          paymongoResponse: JSON.stringify(event),
        };

        paymentRecord = await prisma.payments.findFirst({
          where: {
            OR: [
              { paymongoId: eventData.id },
              { referenceNumber: eventData.attributes.reference_number },
            ],
          },
        });
      }
      break;

    case PAYMONGO_EVENTS.LINK_ARCHIVED:
    case PAYMONGO_EVENTS.LINK_CANCELLED:
    case PAYMONGO_EVENTS.LINK_CANCELED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELLED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELED:
      console.log(`Processing cancellation/archive event: ${eventType}`);
      updateData = {
        status: "cancelled",
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            { referenceNumber: eventData.attributes.reference_number },
          ],
        },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_REFUNDED:
    case PAYMONGO_EVENTS.PAYMENT_REFUND_UPDATED:
      console.log(`Processing ${eventType} event`);
      updateData = {
        status: "refunded",
        paymongoResponse: JSON.stringify(event),
        paidAt: null, // Clear paidAt for refunded payments
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            { referenceNumber: eventData.attributes.reference_number },
          ],
        },
      });
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
      return {
        handled: false,
        message: "Event type not handled but acknowledged",
      };
  }

  // Update payment record if found
  if (paymentRecord && Object.keys(updateData).length > 0) {
    console.log(`Updating payment ${paymentRecord.id} with data:`, updateData);
    
    await prisma.payments.update({
      where: { id: paymentRecord.id },
      data: updateData,
    });

    console.log(`Successfully updated payment ${paymentRecord.id} to status: ${updateData.status}`);
    console.log(`PAYMENT STATUS CHANGE: ${paymentRecord.id} changed from ${paymentRecord.status} to ${updateData.status}`);

    return {
      handled: true,
      message: "Payment updated successfully",
      paymentId: paymentRecord.id,
    };
  } else if (!paymentRecord) {
    console.warn(`No payment record found for PayMongo ID: ${eventData.id}`);
    console.warn(`Tried to find payment with reference: ${eventData.attributes.reference_number}`);
    console.warn(`Event type: ${eventType} - This payment might need manual investigation`);
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