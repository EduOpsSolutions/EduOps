import {
  createManualPayment,
  getPaymentWithSync,
  getAllTransactions,
  sendPaymentLinkViaEmail,
  bulkSyncPendingPayments,
  cleanupOrphanedPayments,
  sendSuccess,
  sendError,
} from "../services/payment_service.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "../services/paymongo_service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMENT_INCLUDES,
} from "../constants/payment_constants.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Payment controller

// Create manual transaction
const createManualTransaction = async (req, res) => {
  try {
    const result = await createManualPayment(req.body);
    return sendSuccess(res, result, SUCCESS_MESSAGES.MANUAL_TRANSACTION_CREATED, 201);
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};


// Refresh payment status
const refreshPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentWithSync(paymentId);
    return sendSuccess(res, result, "Payment status refreshed successfully");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

// Get all transactions
const getAllPaymentTransactions = async (req, res) => {
  try {
    const { page, limit, status, searchTerm } = req.query;
    const result = await getAllTransactions({ page, limit, status, searchTerm });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};


// Bulk sync pending payments
const bulkSyncPendingPaymentsController = async (req, res) => {
  try {
    const result = await bulkSyncPendingPayments();
    return sendSuccess(res, result, "Bulk sync of pending payments completed");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

const cleanupOrphanedPaymentsController = async (req, res) => {
  try {
    const result = await cleanupOrphanedPayments();
    return sendSuccess(res, result, "Orphaned payments cleanup completed");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};


// Handle webhook events
const handleWebhook = async (req, res) => {
  try {
    verifyWebhookSignature(req);

    const event = req.body;
    const result = await processWebhookEvent(event);
    return res.status(200).json({
      statusCode: 200,
      body: { message: "SUCCESS", result },
    });
  } catch (error) {
    // Handle specific webhook errors
    if (error.message.includes("Webhook secret not configured")) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }
    
    if (error.message.includes("Missing") || error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      statusCode: 200,
      body: { message: "ERROR_ACKNOWLEDGED" },
    });
  }
};

// Send payment link via email
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
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    let payment = await prisma.payments.findFirst({
      where: {
        paymongoId: paymentIntentId
      },
      include: PAYMENT_INCLUDES.WITH_USER
    });

    if (!payment) {
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
      } else if (pendingPayments.length > 1) {
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
      }
    }

    if (!payment) {
      return sendError(res, "Payment not found. The payment may still be processing. Please wait for the webhook or contact support.", 404);
    }

    const statusMap = {
      'paid': 'succeeded',
      'pending': 'awaiting_payment_method',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };

    return sendSuccess(res, {
      status: statusMap[payment.status] || payment.status,
      dbStatus: payment.status,
      amount: payment.amount,
      transactionId: payment.id,
      paymongoPaymentId: payment.paymongoId,
      referenceNumber: payment.referenceNumber,
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
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

// Export functions
export {
  createManualTransaction,
  getAllPaymentTransactions,
  refreshPaymentStatus,
  bulkSyncPendingPaymentsController,
  cleanupOrphanedPaymentsController,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
};

export default {
  createManualTransaction,
  getAllTransactions: getAllPaymentTransactions,
  refreshPaymentStatus,
  bulkSyncPendingPayments: bulkSyncPendingPaymentsController,
  cleanupOrphanedPayments: cleanupOrphanedPaymentsController,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
};