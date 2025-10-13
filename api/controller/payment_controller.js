import {
  createManualPayment,
  getPaymentWithSync,
  getPaymentsByUser,
  getAllTransactions,
  cancelPayment,
  getAvailablePaymentMethods,
  forceSyncPaymentStatus,
  bulkSyncPendingPayments,
  cleanupOrphanedPayments,
  sendPaymentLinkViaEmail,
  sendSuccess,
  sendError,
} from "../services/payment_service.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  createPaymentIntent as createPayMongoPaymentIntent,
  createPaymentMethod as createPayMongoPaymentMethod,
  attachPaymentMethod as attachPayMongoPaymentMethod,
  getPaymentIntent as getPayMongoPaymentIntent,
} from "../services/paymongo_service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMENT_INCLUDES,
} from "../constants/payment_constants.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Payment Controller
 * Handles HTTP requests and delegates business logic to services
 */

// ==================== Payment Operations ====================

// Create manual transaction (Physical Payment)
const createManualTransaction = async (req, res) => {
  try {
    const result = await createManualPayment(req.body);
    return sendSuccess(res, result, SUCCESS_MESSAGES.MANUAL_TRANSACTION_CREATED, 201);
  } catch (error) {
    console.error("Create manual transaction error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Get payment details
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentWithSync(paymentId);
    return sendSuccess(res, payment);
  } catch (error) {
    console.error("Get payment details error:", error);
    const statusCode = error.message === ERROR_MESSAGES.PAYMENT_NOT_FOUND ? 404 : 500;
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, statusCode, error.message);
  }
};

/**
 * Get payments by user ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, status } = req.query;
    
    const result = await getPaymentsByUser(userId, { page, limit, status });
    return sendSuccess(res, result);
  } catch (error) {
    console.error("Get payments by user ID error:", error);
    const statusCode = error.message === ERROR_MESSAGES.USER_NOT_FOUND ? 404 : 500;
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, statusCode, error.message);
  }
};

/**
 * Cancel payment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const cancelPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await cancelPayment(paymentId);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    console.error("Cancel payment error:", error);
    let statusCode = 500;
    if (error.message === ERROR_MESSAGES.PAYMENT_NOT_FOUND) statusCode = 404;
    if (error.message === ERROR_MESSAGES.PAYMENT_CANNOT_BE_CANCELLED) statusCode = 400;
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, statusCode, error.message);
  }
};

/**
 * Get available payment methods
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getPaymentMethods = async (req, res) => {
  try {
    const result = await getAvailablePaymentMethods();
    return sendSuccess(res, result);
  } catch (error) {
    console.error("Get payment methods error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Refresh payment status from PayMongo
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const refreshPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentWithSync(paymentId);
    return sendSuccess(res, result, "Payment status refreshed successfully");
  } catch (error) {
    console.error("Refresh payment status error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Get all transactions for admin management
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllPaymentTransactions = async (req, res) => {
  try {
    const { page, limit, status, searchTerm } = req.query;
    const result = await getAllTransactions({ page, limit, status, searchTerm });
    return sendSuccess(res, result);
  } catch (error) {
    console.error("Get all transactions error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Force sync payment status with PayMongo
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const forceSyncPaymentStatusController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await forceSyncPaymentStatus(paymentId);
    return sendSuccess(res, result, "Payment status force synced successfully");
  } catch (error) {
    console.error("Force sync payment status error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Bulk sync all pending payments (Admin endpoint)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const bulkSyncPendingPaymentsController = async (req, res) => {
  try {
    const result = await bulkSyncPendingPayments();
    return sendSuccess(res, result, "Bulk sync of pending payments completed");
  } catch (error) {
    console.error("Bulk sync pending payments error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Clean up orphaned payments (Admin endpoint)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const cleanupOrphanedPaymentsController = async (req, res) => {
  try {
    const result = await cleanupOrphanedPayments();
    return sendSuccess(res, result, "Orphaned payments cleanup completed");
  } catch (error) {
    console.error("Cleanup orphaned payments error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

// ==================== Webhook Handling ====================

/**
 * Handle PayMongo Webhook Events
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const handleWebhook = async (req, res) => {
  try {
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Time:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Verify webhook signature
    verifyWebhookSignature(req);

    // Process webhook event
    const event = req.body;
    const eventType = event.data.attributes.type;
    console.log(`📨 Processing webhook event: ${eventType}`);
    
    const result = await processWebhookEvent(event);

    console.log('=== WEBHOOK PROCESSED ===');
    console.log('Result:', result);
    console.log('Time:', new Date().toISOString());

    // Always respond with 200 to acknowledge the webhook
    return res.status(200).json({
      statusCode: 200,
      body: { message: "SUCCESS", result },
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    console.error("Time:", new Date().toISOString());
    
    // Handle specific webhook errors
    if (error.message.includes("Webhook secret not configured")) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }
    
    if (error.message.includes("Missing") || error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }

    // Still return 200 for other processing errors to prevent webhook retries
    return res.status(200).json({
      statusCode: 200,
      body: { message: "ERROR_ACKNOWLEDGED" },
    });
  }
};

/**
 * Send payment link via email
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const sendPaymentLinkEmail = async (req, res) => {
  try {
    const result = await sendPaymentLinkViaEmail(req.body);
    
    if (result.success) {
      return sendSuccess(res, { 
        checkoutID: result.checkoutID,
        checkoutUrl: result.checkoutUrl 
      }, result.message, 200);
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Send payment link email error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Create payment intent (PIPM flow)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createPaymentIntent = async (req, res) => {
  try {
    const result = await createPayMongoPaymentIntent(req.body);
    
    if (result.success) {
      return sendSuccess(res, result.data, "Payment intent created successfully");
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Create payment intent error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Create payment method (PIPM flow)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createPaymentMethod = async (req, res) => {
  try {
    const result = await createPayMongoPaymentMethod(req.body);
    
    if (result.success) {
      return sendSuccess(res, result.data, "Payment method created successfully");
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Create payment method error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Attach payment method to payment intent (PIPM flow)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const attachPaymentMethod = async (req, res) => {
  try {
    const result = await attachPayMongoPaymentMethod(req.body);
    
    if (result.success) {
      return sendSuccess(res, result.data, "Payment method attached successfully");
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Attach payment method error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Check payment status by payment intent ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    console.log(`Checking payment status for intent: ${paymentIntentId}`);
    
    // First, get the latest status from PayMongo
    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);
    
    // Find payment by PayMongo payment intent ID
    let payment = await prisma.payments.findFirst({
      where: {
        paymongoId: paymentIntentId
      },
      include: PAYMENT_INCLUDES.WITH_USER
    });

    // If not found by paymongoId, check all pending payments with status "Online Payment"
    if (!payment) {
      console.log(`Payment not found by paymongoId, checking pending payments...`);
      
      // Get all pending payments from the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pendingPayments = await prisma.payments.findMany({
        where: {
          status: 'pending',
          paymentMethod: 'Online Payment',
          createdAt: {
            gte: yesterday
          }
        },
        include: PAYMENT_INCLUDES.WITH_USER
      });

      console.log(`Found ${pendingPayments.length} pending payments. Updating with paymongoId...`);
      
      // If there's exactly one pending payment in the last 24 hours, assume it's this one
      // and update it with the paymongoId
      if (pendingPayments.length === 1) {
        payment = await prisma.payments.update({
          where: { id: pendingPayments[0].id },
          data: {
            paymongoId: paymentIntentId,
            status: 'paid',
            paidAt: new Date()
          },
          include: PAYMENT_INCLUDES.WITH_USER
        });
        console.log(`✅ Updated pending payment ${payment.id} with paymongoId and status paid`);
      } else if (pendingPayments.length > 1) {
        // Multiple pending payments - use the most recent one
        const mostRecent = pendingPayments.sort((a, b) => b.createdAt - a.createdAt)[0];
        payment = await prisma.payments.update({
          where: { id: mostRecent.id },
          data: {
            paymongoId: paymentIntentId,
            status: 'paid',
            paidAt: new Date()
          },
          include: PAYMENT_INCLUDES.WITH_USER
        });
        console.log(`✅ Updated most recent pending payment ${payment.id} with paymongoId and status paid`);
      }
    }

    if (!payment) {
      console.log(`❌ No payment found for intent: ${paymentIntentId}`);
      return sendError(res, "Payment not found. The payment may still be processing. Please wait for the webhook or contact support.", 404);
    }

    console.log(`Payment found: ${payment.id}, status: ${payment.status}`);

    // Map our database status to PayMongo status format
    const statusMap = {
      'paid': 'succeeded',
      'pending': 'awaiting_payment_method',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };

    return sendSuccess(res, {
      status: statusMap[payment.status] || payment.status, // Return 'succeeded' for 'paid'
      dbStatus: payment.status, // Also return the actual DB status
      amount: payment.amount,
      transactionId: payment.id, // Our internal transaction ID (PAY-XXXXXX)
      paymongoPaymentId: payment.paymongoId, // PayMongo Payment ID (pay_xxxxx or pi_xxxxx)
      referenceNumber: payment.referenceNumber, // PayMongo Reference Number (for receipts)
      paymentMethod: payment.paymentMethod,
      description: payment.remarks || "Payment",
      paidAt: payment.paidAt,
      user: payment.users ? {
        firstName: payment.users.first_name,
        lastName: payment.users.last_name,
        email: payment.users.email
      } : null
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

// ==================== Export Controller Functions ====================

// Export individual functions for named imports
export {
  createManualTransaction,
  getPaymentDetails,
  getPaymentsByUserId,
  getAllPaymentTransactions,
  cancelPaymentById,
  getPaymentMethods,
  refreshPaymentStatus,
  forceSyncPaymentStatusController,
  bulkSyncPendingPaymentsController,
  cleanupOrphanedPaymentsController,
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
};

// Export default object for backward compatibility
export default {
  createManualTransaction,
  getPaymentDetails,
  getPaymentsByUserId,
  getAllTransactions: getAllPaymentTransactions,
  cancelPayment: cancelPaymentById,
  getAvailablePaymentMethods: getPaymentMethods,
  refreshPaymentStatus,
  forceSyncPaymentStatus: forceSyncPaymentStatusController,
  bulkSyncPendingPayments: bulkSyncPendingPaymentsController,
  cleanupOrphanedPayments: cleanupOrphanedPaymentsController,
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
};