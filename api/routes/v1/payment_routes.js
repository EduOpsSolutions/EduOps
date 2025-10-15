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
    createPaymentIntent,
    attachPaymentMethod,
    sendPaymentLinkEmail,
    checkPaymentStatus,
    handleWebhook,
    getPaymentDetails,
    getPaymentsByUserId,
    getAvailablePaymentMethods,
    forceSyncPaymentStatus,
    manualSyncPayment,
    cancelPayment
} = paymentController;

const router = express.Router();

// Public endpoints
router.post('/send-email', sendPaymentLinkEmail);
router.get('/check-status/:paymentIntentId', checkPaymentStatus);
router.post('/sync/:paymentIntentId', manualSyncPayment);
router.post('/webhook', handleWebhook);

// Admin endpoints
router.post('/manual', validateCreateManualTransaction, createManualTransaction);
router.get('/admin/allTransactions', validatePagination, getAllTransactions);
router.post('/admin/cleanup', cleanupOrphanedPayments);
router.post('/admin/bulk-sync', bulkSyncPendingPayments);

// PIPM Flow endpoints
router.post('/create-intent', createPaymentIntent);
router.post('/attach-method', attachPaymentMethod);

// Payment management
router.get('/:paymentId', validatePaymentId, getPaymentDetails);
router.get('/:paymentId/status', validatePaymentId, refreshPaymentStatus);
router.get('/:paymentId/force-sync', validatePaymentId, forceSyncPaymentStatus);
router.delete('/:paymentId/cancel', validatePaymentId, cancelPayment);
router.get('/user/:userId', getPaymentsByUserId);
router.get('/methods/available', getAvailablePaymentMethods);

export default router;