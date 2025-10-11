import express from 'express';
import paymentController from '../../controller/payment_controller.js';
import {
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId
} from '../../middleware/paymentValidator.js';

const {
    createManualTransaction,
    getAllTransactions,
    refreshPaymentStatus,
    bulkSyncPendingPayments,
    cleanupOrphanedPayments,
    sendPaymentLinkEmail,
    checkPaymentStatus,
    handleWebhook
} = paymentController;

const router = express.Router();

// Public endpoints
router.post('/send-email', sendPaymentLinkEmail);
router.get('/check-status/:paymentIntentId', checkPaymentStatus);
router.post('/webhook', handleWebhook);

// Admin endpoints
router.post('/manual', validateCreateManualTransaction, createManualTransaction);
router.get('/admin/allTransactions', validatePagination, getAllTransactions);
router.post('/admin/cleanup', cleanupOrphanedPayments);
router.post('/admin/bulk-sync', bulkSyncPendingPayments);

// Payment management
router.get('/:paymentId/status', validatePaymentId, refreshPaymentStatus);

export default router;