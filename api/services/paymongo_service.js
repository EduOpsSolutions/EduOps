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
          referenceNumber: eventData.attributes.reference_number || eventData.id
        },
      });
      if (!paymentRecord) {
        console.warn(`Payment record not found for link payment. Reference: ${eventData.attributes.reference_number || eventData.id}`);
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_PAID:
      const directPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      
      const paymentId = eventData.id; 
      const paymentIntentIdFromWebhook = eventData.attributes?.payment_intent_id; 
      
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: directPaymentMethod,
        referenceNumber: paymentId, 
      };
      
      if (paymentIntentIdFromWebhook) {
        updateData.paymentIntentId = paymentIntentIdFromWebhook;
      }

      if (paymentIntentIdFromWebhook) {
        paymentRecord = await prisma.payments.findFirst({
          where: {
            paymentIntentId: paymentIntentIdFromWebhook
          },
        });
      }

      if (!paymentRecord) {
        paymentRecord = await prisma.payments.findFirst({
          where: {
            referenceNumber: paymentId
          },
        });
      }

      if (!paymentRecord) {
        console.warn(`Payment record not found for direct payment. Payment ID: ${paymentId}, Intent ID: ${paymentIntentIdFromWebhook}`);

        const recentPayments = await prisma.payments.findMany({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: {
              gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        
        if (recentPayments.length > 0) {
          const webhookPaymentId = eventData.id;
          const webhookIntentId = eventData.attributes?.payment_intent_id; 
          
          let matchingPayment = recentPayments.find(p => 
            !p.paymentIntentId || 
            p.paymentIntentId === webhookIntentId || 
            p.referenceNumber === webhookPaymentId || 
            p.referenceNumber === webhookIntentId
          );
          
          if (matchingPayment) {
            paymentRecord = matchingPayment;
          } else {
            const unmatchedPayment = recentPayments.find(p => !p.paymentIntentId);
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
      updateData = {
        status: "failed",
        referenceNumber: eventData.attributes.reference_number || eventData.id,
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber: eventData.attributes.reference_number || eventData.id
        },
      });

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
      }
      break;

    case PAYMONGO_EVENTS.LINK_PAYMENT_EXPIRED:
      updateData = {
        status: "failed", 
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber: eventData.attributes.reference_number || eventData.id,
        },
      });
      break;

    case PAYMONGO_EVENTS.LINK_UPDATED:
    case PAYMONGO_EVENTS.LINK_STATUS_UPDATED:
      const linkStatus = eventData.attributes.status;
      
      if (linkStatus === 'failed' || linkStatus === 'expired' || linkStatus === 'unpaid') {
        updateData = {
          status: "failed",
        };

        paymentRecord = await prisma.payments.findFirst({
          where: {
            referenceNumber: eventData.attributes.reference_number || eventData.id,
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
          referenceNumber: eventData.attributes.reference_number || eventData.id,
        },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_REFUNDED:
    case PAYMONGO_EVENTS.PAYMENT_REFUND_UPDATED:
      const refundedPaymentId = eventData.attributes.payment_id;
      
      updateData = {
        status: "refunded",
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          referenceNumber: eventData.attributes.reference_number || refundedPaymentId
        },
      });
      
      if (!paymentRecord) {
        console.log(`Payment not found for refund. Refund ID: ${eventData.id}, Payment ID: ${refundedPaymentId}`);
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
      await prisma.payments.update({
        where: { id: paymentRecord.id },
        data: updateData,
      });
    } catch (updateError) {
      console.error(`Failed to update payment ${paymentRecord.id}:`, updateError);
    }

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

// PayMongo API Functions 

/**
 * Create Payment Intent via PayMongo API
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} PayMongo response
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const { amount, currency = 'PHP', description, payment_method_allowed = ['card', 'gcash', 'paymaya'], payment_method_options } = paymentData;
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Amount is required and must be greater than 0');
    }
    
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

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating PayMongo Payment Intent:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to create payment intent';
    if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.map(err => err.detail || err.title).join(', ');
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
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
