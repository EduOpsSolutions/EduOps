import express from 'express';
import paymentController from '../../controller/payment_controller.js';
import {
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId
} from '../../middleware/paymentValidator.js';
import { verifyToken, validateUserIsAdmin } from '../../middleware/authValidator.js';

const {
    createManualTransaction,
    getAllTransactions,
    createPaymentIntent,
    attachPaymentMethod,
    sendPaymentLinkEmail,
    checkPaymentStatus,
    handleWebhook,
    getPaymentDetails,
    refreshPaymentStatus,
    adminCleanupOrphanedPayments
} = paymentController;

const router = express.Router();

// Public endpoints
router.post('/send-email', sendPaymentLinkEmail);
router.get('/check-status/:paymentIntentId', checkPaymentStatus);
router.post('/webhook', handleWebhook);

// Admin endpoints
router.post('/manual', verifyToken, validateUserIsAdmin, validateCreateManualTransaction, createManualTransaction);
router.get('/admin/allTransactions', verifyToken, validateUserIsAdmin, validatePagination, getAllTransactions);
router.post('/admin/cleanup-orphaned-payments', verifyToken, validateUserIsAdmin, adminCleanupOrphanedPayments);

// PIPM Flow endpoints
router.post('/create-intent', createPaymentIntent);
router.post('/attach-method', attachPaymentMethod);

// Payment management
router.get('/:paymentId', validatePaymentId, getPaymentDetails);
router.get('/:paymentId/status', validatePaymentId, refreshPaymentStatus);

export default router;