import express from 'express';
import paymentController from './payment.controller.js';
import {
    validateCreatePayment,
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId,
    validateUserId
} from './payment.validator.js';

/**
 * Payment Routes
 * Consolidated routing for all payment-related API endpoints
 */

const {
    createPayment,
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
    handleWebhook
} = paymentController;

const router = express.Router();

// ==================== Public Endpoints ====================

/**
 * POST /api/v1/payments
 * Create payment link (Public endpoint - no auth required)
 */
router.post('/', validateCreatePayment, createPayment);

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

export default router;