import {
  createOnlinePayment,
  createManualPayment,
  getPaymentWithSync,
  getPaymentsByUser,
  getAllTransactions,
  cancelPayment,
  getAvailablePaymentMethods,
  forceSyncPaymentStatus,
  sendSuccess,
  sendError,
} from "./payment.service.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "./paymongo.service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./payment.constants.js";

/**
 * Payment Controller
 * Handles HTTP requests and delegates business logic to services
 */

// ==================== Payment Operations ====================

/**
 * Create online payment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createPayment = async (req, res) => {
  try {
    const result = await createOnlinePayment(req.body);
    return sendSuccess(res, result, SUCCESS_MESSAGES.PAYMENT_CREATED, 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/**
 * Create manual transaction (Physical Payment)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
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

// ==================== Export Controller Functions ====================

// Export individual functions for named imports
export {
  createPayment,
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
  handleWebhook,
};

// Export default object for backward compatibility
export default {
  createPayment,
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
  handleWebhook,
};