import express from 'express';
import paymentController from '../../controller/payment_controller.js';
import {
    validateCreatePayment,
    validatePagination,
    validatePaymentId,
    validateUserId
} from '../../middleware/paymentValidator.js';

const {
    createPayment,
    getPaymentDetails,
    getPaymentsByUserId,
    getAllTransactions,
    cancelPayment,
    getAvailablePaymentMethods
} = paymentController;

/**
 * Payment Routes
 * 
 * Handles all payment-related API endpoints including:
 * - Creating payment links via PayMongo
 * - Managing payment status (cancel, etc.)
 */

const router = express.Router();

// Create payment link (Public endpoint - no auth required)
router.post('/', validateCreatePayment, createPayment);

// Get all transactions for admin management
router.get('/admin/allTransactions', validatePagination, getAllTransactions);

// Get payment details by ID
router.get('/:paymentId', validatePaymentId, getPaymentDetails);

// Get payments by user ID
router.get('/user/:userId', validateUserId, validatePagination, getPaymentsByUserId);

// Cancel a pending payment
router.put('/:paymentId/cancel', validatePaymentId, cancelPayment);

// Get available payment methods
router.get('/methods/available', getAvailablePaymentMethods);

export default router;