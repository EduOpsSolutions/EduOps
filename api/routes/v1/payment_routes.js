import express from 'express';
import paymentController from '../../controller/payment_controller.js';
import {
    validateCreatePayment,
    validatePagination,
    validatePaymentId,
    validateUserId,
    validateEmail,
    validateEnrollmentId
} from '../../middleware/paymentValidator.js';

const {
    createPayment,
    getPaymentDetails,
    getPaymentsByEnrollmentId,
    getUserPaymentsByEmail,
    cancelPayment,
    handleWebhook,
    getAvailablePaymentMethods
} = paymentController;

/**
 * Payment Routes
 * 
 * Handles all payment-related API endpoints including:
 * - Creating payment links via PayMongo
 * - Processing webhooks from PayMongo
 * - Managing payment status (cancel, etc.)
 */

const router = express.Router();

// Create payment link (Public endpoint - no auth required)
router.post('/', validateCreatePayment, createPayment);

// Get payment details by ID
router.get('/:paymentId', validatePaymentId, getPaymentDetails);

// Get payments by enrollment ID
router.get('/enrollment/:enrollmentId', validateEnrollmentId, validatePagination, getPaymentsByEnrollmentId);

// Cancel a pending payment
router.put('/:paymentId/cancel', validatePaymentId, cancelPayment);

// Get available payment methods
router.get('/methods/available', getAvailablePaymentMethods);

// Handle PayMongo webhooks (Public endpoint for webhook events)
router.post('/webhook', handleWebhook);

export default router;