import axios from 'axios';
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { 
  PAYMONGO_CONFIG, 
  createPayMongoAuthHeaders,
  PAYMONGO_METHOD_MAP,
  PAYMONGO_EVENTS 
} from '../constants/payment_constants.js';

const prisma = new PrismaClient();

/**
 * PayMongo Service
 * Webhook processing and API calls for PayMongo payments
 */

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
        referenceNumber: eventData.attributes.reference_number, // Update with PayMongo's reference
        paymongoId: eventData.id, // Store PayMongo ID for future reference
        paymongoResponse: JSON.stringify(event),
      };

      // Try to find by paymongoId first, then by any pending payment from last 24h
      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      // If not found, look for recent pending payment (since we create pending payments with EMAIL-xxx ref)
      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
        console.log(`Found pending payment by recent lookup: ${paymentRecord?.id}`);
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_PAID:
      console.log(`Processing payment.paid event`);
      const directPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: directPaymentMethod,
        referenceNumber: eventData.attributes.reference_number, // Update with PayMongo's reference
        paymongoId: eventData.id, // Store PayMongo ID for future reference
        paymongoResponse: JSON.stringify(event),
      };

      // Try to find by paymongoId first
      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      // If not found, look for recent pending payment
      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
        console.log(`Found pending payment by recent lookup: ${paymentRecord?.id}`);
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_FAILED:
    case PAYMONGO_EVENTS.LINK_PAYMENT_FAILED:
      console.log(`Processing payment failed event: ${eventType}`);
      updateData = {
        status: "failed",
        referenceNumber: eventData.attributes.reference_number, // Update with PayMongo's reference if available
        paymongoId: eventData.id, // Store PayMongo ID for future reference
        paymongoResponse: JSON.stringify(event),
      };

      // Try to find by paymongoId first
      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      // If not found, look for recent pending payment
      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
        console.log(`Found pending payment for failed event: ${paymentRecord?.id}`);
      }
      break;

    case PAYMONGO_EVENTS.LINK_PAYMENT_EXPIRED:
      console.log(`Processing link.payment.expired event`);
      updateData = {
        status: "failed", // Mark expired test payments as failed
        paymongoId: eventData.id, // Store PayMongo ID for future reference
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
          paymongoId: eventData.id, // Store PayMongo ID for future reference
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
      console.log('Refund event data:', JSON.stringify(eventData.attributes, null, 2));
      
      // For refund events, eventData.id is the refund ID (rfnd_xxx)
      // The payment ID is in eventData.attributes.payment_id
      const refundedPaymentId = eventData.attributes.payment_id;
      console.log(`Looking for payment with PayMongo ID: ${refundedPaymentId}`);
      
      updateData = {
        status: "refunded",
        paymongoResponse: JSON.stringify(event),
        // Don't clear paidAt - keep it for reference of when it was originally paid
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: refundedPaymentId // Use payment_id from refund attributes
        },
      });
      
      if (!paymentRecord) {
        console.log(`⚠️ Payment not found for refund. Refund ID: ${eventData.id}, Payment ID: ${refundedPaymentId}`);
      }
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

// ==================== PayMongo API Functions ====================

/**
 * Create Payment Intent via PayMongo API
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} PayMongo response
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const { amount, currency = 'PHP', description, payment_method_allowed = ['card', 'gcash', 'paymaya'], payment_method_options } = paymentData;
    
    const requestBody = {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          currency,
          description,
          payment_method_allowed
        }
      }
    };

    // Add payment method options for cards (3D Secure)
    if (payment_method_options) {
      requestBody.data.attributes.payment_method_options = payment_method_options;
    }
    
    const response = await axios.post(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_INTENTS}`,
      requestBody,
      {
        headers: createPayMongoAuthHeaders()
      }
    );

    console.log('PayMongo Payment Intent created:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating PayMongo Payment Intent:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Create Payment Method via PayMongo API
 * @param {Object} paymentMethodData - Payment method data
 * @returns {Promise<Object>} PayMongo response
 */
export const createPaymentMethod = async (paymentMethodData) => {
  try {
    const { type, details, billing } = paymentMethodData;
    
    console.log('Creating PayMongo Payment Method with data:', {
      type,
      details,
      billing,
      url: `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_METHODS}`
    });
    
    const requestBody = {
      data: {
        attributes: {
          type,
          details,
          billing
        }
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Headers:', createPayMongoAuthHeaders());
    
    const response = await axios.post(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_METHODS}`,
      requestBody,
      {
        headers: createPayMongoAuthHeaders()
      }
    );

    console.log('PayMongo Payment Method created:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating PayMongo Payment Method:');
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    return {
      success: false,
      error: error.response?.data || error.message
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
    
    const response = await axios.post(
      `${PAYMONGO_CONFIG.BASE_URL}${PAYMONGO_CONFIG.ENDPOINTS.PAYMENT_INTENTS}/${payment_intent_id}/attach`,
      {
        data: {
          attributes: {
            payment_method: payment_method_id,
            return_url
          }
        }
      },
      {
        headers: createPayMongoAuthHeaders()
      }
    );

    console.log('PayMongo Payment Method attached:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error attaching PayMongo Payment Method:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
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
        headers: createPayMongoAuthHeaders()
      }
    );

    console.log('PayMongo Payment Intent retrieved:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error retrieving PayMongo Payment Intent:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};
