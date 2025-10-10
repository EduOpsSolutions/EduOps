import express from 'express';
import paymentController from '../../controller/payment_controller.js';
import {
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId,
    validateUserId
} from '../../middleware/paymentValidator.js';

/**
 * Payment Routes
 * Consolidated routing for all payment-related API endpoints
 */

const {
    createManualTransaction,
    getPaymentDetails,
    getPaymentsByUserId,
    getAllTransactions,
    cancelPayment,
    getAvailablePaymentMethods,
    refreshPaymentStatus,
    forceSyncPaymentStatus,
    bulkSyncPendingPayments,
    cleanupOrphanedPayments,
    sendPaymentLinkEmail,
    checkPaymentStatus,
    handleWebhook
} = paymentController;

const router = express.Router();

// ==================== Public Endpoints ====================

/**
 * POST /api/v1/payments/send-email
 * Send payment link via email (Public endpoint - no auth required)
 */
router.post('/send-email', sendPaymentLinkEmail);

/**
 * GET /api/v1/payments/check-status/:paymentIntentId
 * Check payment status by payment intent ID (Public endpoint - no auth required)
 */
router.get('/check-status/:paymentIntentId', checkPaymentStatus);

/**
 * POST /api/v1/payments/webhook
 * PayMongo webhook endpoint (Public endpoint - no auth required)
 */
router.post('/webhook', handleWebhook);

// ==================== Admin Endpoints ====================

/**
 * POST /api/v1/payments/manual
 * Create manual transaction (Admin endpoint - requires validation)
 */
router.post('/manual', validateCreateManualTransaction, createManualTransaction);

/**
 * GET /api/v1/payments/admin/allTransactions
 * Get all transactions for admin management
 */
router.get('/admin/allTransactions', validatePagination, getAllTransactions);

/**
 * POST /api/v1/payments/admin/cleanup
 * Clean up orphaned payments (Admin endpoint)
 */
router.post('/admin/cleanup', cleanupOrphanedPayments);

/**
 * POST /api/v1/payments/admin/bulk-sync
 * Force sync all pending payments (Admin endpoint)
 */
router.post('/admin/bulk-sync', bulkSyncPendingPayments);

// ==================== Payment Management Endpoints ====================

/**
 * GET /api/v1/payments/methods/available
 * Get available payment methods
 */
router.get('/methods/available', getAvailablePaymentMethods);

/**
 * GET /api/v1/payments/:paymentId
 * Get payment details by ID
 */
router.get('/:paymentId', validatePaymentId, getPaymentDetails);

/**
 * GET /api/v1/payments/:paymentId/status
 * Refresh payment status from PayMongo
 */
router.get('/:paymentId/status', validatePaymentId, refreshPaymentStatus);

/**
 * POST /api/v1/payments/:paymentId/force-sync
 * Force sync payment status with PayMongo (more aggressive sync)
 */
router.post('/:paymentId/force-sync', validatePaymentId, forceSyncPaymentStatus);

/**
 * PUT /api/v1/payments/:paymentId/cancel
 * Cancel a pending payment
 */
router.put('/:paymentId/cancel', validatePaymentId, cancelPayment);

// ==================== User-Specific Endpoints ====================

/**
 * GET /api/v1/payments/user/:userId
 * Get payments by user ID
 */
router.get('/user/:userId', validateUserId, validatePagination, getPaymentsByUserId);

// ==================== Enhanced PayMongo Integration ====================

/**
 * POST /api/v1/payments/create-intent
 * Create PayMongo Payment Intent for credit/debit cards
 */
router.post('/create-intent', async (req, res) => {
    try {
        const { createPaymentIntent } = await import('../../utils/paymongo.js');
        const { 
            amount, 
            description, 
            statement_descriptor,
            payment_method_allowed,
            payment_method_options,
            currency,
            return_url 
        } = req.body;
        
        const intentData = { 
            amount, 
            description, 
            statement_descriptor,
            payment_method_allowed: payment_method_allowed || ["card"],
            payment_method_options,
            currency: currency || "PHP",
            return_url
        };
        const paymentIntent = await createPaymentIntent(intentData);
        
        res.json({
            success: true,
            data: paymentIntent.data, // Return the direct PayMongo response structure
            paymentIntentId: paymentIntent.paymentIntentId,
            clientKey: paymentIntent.clientKey
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment intent'
        });
    }
});

/**
 * POST /api/v1/payments/create-method
 * Create PayMongo Payment Method for credit/debit cards and e-wallets
 */
router.post('/create-method', async (req, res) => {
    try {
        const { createPaymentMethod } = await import('../../utils/paymongo.js');
        const { details, billing, type } = req.body;
        
        const paymentMethodData = { 
            details, 
            billing, 
            type: type || "card" // Support different payment method types
        };
        const paymentMethod = await createPaymentMethod(paymentMethodData);
        
        res.json({
            success: true,
            data: paymentMethod.data, // Return the direct PayMongo response structure
            paymentMethodId: paymentMethod.paymentMethodId
        });
    } catch (error) {
        console.error('Error creating payment method:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment method'
        });
    }
});

/**
 * POST /api/v1/payments/attach-method
 * Attach Payment Method to Payment Intent
 */
router.post('/attach-method', async (req, res) => {
    try {
        const { attachPaymentMethodToIntent } = await import('../../utils/paymongo.js');
        const { paymentIntentId, paymentMethodId, clientKey, return_url } = req.body;
        
        const result = await attachPaymentMethodToIntent(paymentIntentId, paymentMethodId, clientKey, return_url);
        
        res.json({
            success: true,
            data: result.data, // Return the direct PayMongo response structure
            status: result.status,
            nextAction: result.nextAction
        });
    } catch (error) {
        console.error('Error attaching payment method:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to attach payment method'
        });
    }
});





// Response helpers
const sendSuccess = (res, data, message = "Operation successful", statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, message, statusCode = 500, error = null) => {
    const response = { success: false, message };
    if (error) response.error = error;
    return res.status(statusCode).json(response);
};

/**
 * Create Payment Intent for card payments
 * POST /api/v1/payments/create-intent
 */
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, description, statement_descriptor, payment_method_allowed, return_url } = req.body;

        if (!amount || amount <= 0) {
            return sendError(res, "Valid amount is required", 400);
        }

        const result = await createPaymentIntent({
            amount: parseFloat(amount),
            description: description || "EduOps Payment",
            statement_descriptor: statement_descriptor || "EduOps",
            payment_method_allowed: payment_method_allowed,
            return_url: return_url
        });

        if (!result.success) {
            return sendError(res, "Failed to create payment intent", 400, result.error);
        }

        return sendSuccess(res, result.data, "Payment intent created successfully");
    } catch (error) {
        console.error("Create payment intent error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
});

/**
 * Create Payment Method for different payment types
 * POST /api/v1/payments/create-method
 */
router.post('/create-method', async (req, res) => {
    try {
        const { details, billing, type } = req.body;

        if (!billing) {
            return sendError(res, "Billing information is required", 400);
        }

        // Validate billing information
        const { name, email } = billing;
        if (!name || !email) {
            return sendError(res, "Name and email are required in billing information", 400);
        }

        // For card payments, validate card details
        if (!type || type === 'card') {
            if (!details) {
                return sendError(res, "Card details are required for card payments", 400);
            }
            
            const { card_number, exp_month, exp_year, cvc } = details;
            if (!card_number || !exp_month || !exp_year || !cvc) {
                return sendError(res, "Complete card details are required", 400);
            }
        }

        const result = await createPaymentMethod({
            details,
            billing,
            type: type || 'card'
            // No return_url here - it goes in attachment per latest PayMongo guidance
        });

        if (!result.success) {
            return sendError(res, "Failed to create payment method", 400, result.error);
        }

        return sendSuccess(res, result.data, "Payment method created successfully");
    } catch (error) {
        console.error("Create payment method error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
});

/**
 * Attach Payment Method to Payment Intent
 * POST /api/v1/payments/attach-method
 */
router.post('/attach-method', async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId, clientKey, return_url } = req.body;

        if (!paymentIntentId || !paymentMethodId || !clientKey) {
            return sendError(res, "Payment intent ID, payment method ID, and client key are required", 400);
        }

        const result = await attachPaymentMethodToIntent(paymentIntentId, paymentMethodId, clientKey, return_url);

        if (!result.success) {
            return sendError(res, "Failed to attach payment method", 400, result.error);
        }

        return sendSuccess(res, result.data, "Payment method attached successfully");
    } catch (error) {
        console.error("Attach payment method error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
});



export default router;