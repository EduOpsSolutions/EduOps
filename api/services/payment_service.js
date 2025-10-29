import { PrismaClient } from "@prisma/client";
import {
  PAYMENT_STATUS,
  PAYMENT_INCLUDES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../constants/payment_constants.js";
import { sendPaymentLinkEmail, sendPaymentReceiptEmail } from "./paymentEmailService.js";

const prisma = new PrismaClient();

//Core business logic for payment operations

/**
 * Generate unique payment ID in format: PAY-YYYYMMDD-XXXXX
 * @returns {Promise<string>} Unique payment ID
 */
export const generatePaymentId = async () => {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const date = new Date();
  const dateStr = date.getFullYear() + 
                  String(date.getMonth() + 1).padStart(2, '0') + 
                  String(date.getDate()).padStart(2, '0');

  let paymentId;

  do {
    const suffix = Array.from({ length: 5 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    paymentId = `PAY-${dateStr}-${suffix}`;
    const existing = await prisma.payments.findUnique({
      where: { transactionId: paymentId },
    });
    if (!existing) break;
  } while (true);

  return paymentId;
};

const calculatePagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Map PayMongo status to valid Prisma PaymentStatus enum values
 * @param {string} paymongoStatus - PayMongo status
 * @returns {string} Mapped Prisma status
 */
const mapPayMongoStatusToPrisma = (paymongoStatus) => {
  const statusMap = {
    'paid': 'paid',
    'pending': 'pending', 
    'unpaid': 'failed', 
    'failed': 'failed',
    'expired': 'failed', 
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'refunded': 'refunded'
  };
  
  return statusMap[paymongoStatus] || 'pending'; 
};

/**
 * Shape a payment record for the frontend list/table
 * @param {Object} payment
 * @param {Object} _options (reserved)
 * @returns {Object}
 */
const transformPaymentForFrontend = (payment, _options) => {
  if (!payment.user && payment.userId) {
    console.log(`Payment ${payment.id} has userId ${payment.userId} but no user relation loaded`);
  }
  
  return {
    id: payment.id,
    transactionId: payment.transactionId || payment.id,
    referenceNumber: payment.referenceNumber || null,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    feeType: payment.feeType || null,
    remarks: payment.remarks || null,
    paidAt: payment.paidAt || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    userId: payment.user ? payment.user.id : null, 
    studentId: payment.user ? payment.user.userId : null, 
    firstName: payment.user ? payment.user.firstName : null,
    lastName: payment.user ? payment.user.lastName : null,
    email: payment.user ? payment.user.email : null,
  };
};

/**
 * Build Prisma where clause for payments queries
 * @param {Object} filters
 * @param {string} [filters.userId]
 * @param {string} [filters.status]
 * @param {string} [filters.searchTerm]
 * @returns {Object} Prisma where clause
 */
const buildPaymentWhereClause = (filters = {}) => {
  const { userId, status, searchTerm } = filters;
  const where = {};

  if (userId) where.userId = userId;
  if (status) where.status = status;

  if (searchTerm && String(searchTerm).trim().length > 0) {
    where.OR = [
      { transactionId: { contains: searchTerm, mode: 'insensitive' } },
      { referenceNumber: { contains: searchTerm, mode: 'insensitive' } },
      { paymentMethod: { contains: searchTerm, mode: 'insensitive' } },
      { remarks: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  return where;
};

// Core Payment Operations 
/**
 * Create manual payment (Physical Payment)
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Payment creation result
 */
export const createManualPayment = async (transactionData) => {
  console.log('createManualPayment received data:', transactionData);
  const {
    studentId,
    firstName,
    lastName,
    purpose,
    paymentMethod,
    amountPaid,
    referenceNumber,
    remarks,
  } = transactionData;

  const user = await prisma.users.findUnique({
    where: {
      userId: studentId
    }
  });

  if (!user) {
    throw new Error(`User with student ID '${studentId}' not found`);
  }

  const customTransactionId = await generatePaymentId();

  // Create payment record for manual transaction
  const paymentData = {
    transactionId: customTransactionId,
    userId: user.id, 
    amount: parseFloat(amountPaid),
    status: PAYMENT_STATUS.PAID,
    paymentMethod: paymentMethod || "Physical Payment",
    referenceNumber: referenceNumber,
    feeType: purpose,
    remarks: remarks || null,
    paidAt: new Date(),
  };
  
  console.log('Creating payment with data:', paymentData);
  const payment = await prisma.payments.create({
    data: paymentData,
  });

  // Send receipt email for manual payment
  /*
  try {
    console.log(`Sending payment receipt email to ${user.email} for manual payment`);
    
    const emailSent = await sendPaymentReceiptEmail(
      user.email,
      {
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        amount: parseFloat(payment.amount),
        paymentMethod: payment.paymentMethod,
        feeType: payment.feeType,
        remarks: payment.remarks,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        currency: 'PHP'
      },
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        student_id: user.userId
      }
    );

    if (emailSent) {
      console.log(`Payment receipt email sent successfully to ${user.email}`);
    } else {
      console.error(`Failed to send payment receipt email to ${user.email}`);
    }
  } catch (emailError) {
    console.error('Error sending payment receipt email for manual payment:', emailError);
    // Don't fail the payment creation if email fails
  }
  */

  return {
    paymentId: payment.id,
    transactionId: payment.transactionId,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
  };
};

/**
 * Get payment details with PayMongo sync
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentWithSync = async (paymentId) => {
  const payment = await prisma.payments.findUnique({
    where: { id: paymentId },
    include: PAYMENT_INCLUDES.WITH_USER,
  });

  if (!payment) {
    throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
  }

  return payment;
};

export const getPaymentsByUser = async (userId, options = {}) => {
  const { page = 1, limit = 10, status } = options;

  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const whereClause = buildPaymentWhereClause({ userId, status });

  const [payments, total] = await Promise.all([
    prisma.payments.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: PAYMENT_INCLUDES.WITH_USER,
    }),
    prisma.payments.count({ where: whereClause }),
  ]);

  return {
    payments,
    pagination: calculatePagination(page, limit, total),
  };
};

/**
 * Get all transactions with advanced filtering and auto-sync
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated transactions
 */
export const getAllTransactions = async (options = {}) => {
  const { page = 1, limit = 10, status, searchTerm } = options;

  const whereClause = buildPaymentWhereClause({ status, searchTerm });

  const [payments, total] = await Promise.all([
    prisma.payments.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: PAYMENT_INCLUDES.WITH_USER,
    }),
    prisma.payments.count({ where: whereClause }),
  ]);

  const transformedPayments = payments.map((payment) => {
    return transformPaymentForFrontend(payment, null);
  });

  return {
    payments: transformedPayments,
    total,
    pagination: calculatePagination(page, limit, total),
  };
};

/**
 * Get available payment methods
 * @returns {Promise<Object>} Available payment methods
 */
export const getAvailablePaymentMethods = async () => {
  return {
    methods: [
      { id: 'gcash', name: 'GCash', type: 'gcash' },
      { id: 'maya', name: 'Maya', type: 'maya' },
      { id: 'card', name: 'Credit/Debit Card', type: 'card' }
    ]
  };
};

/**
 * Force sync payment status with PayMongo
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Sync result
 */
export const forceSyncPaymentStatus = async (paymentId) => {
  const payment = await prisma.payments.findUnique({
    where: { id: paymentId },
    include: PAYMENT_INCLUDES.WITH_USER,
  });

  if (!payment) {
    throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
  }

  if (!payment.referenceNumber) {
    return {
      paymentId: payment.id,
      status: payment.status,
      message: "Not an online payment, no sync needed"
    };
  }

  console.log(`Force syncing payment ${paymentId} with reference: ${payment.referenceNumber}`);
  
  return {
    paymentId: payment.id,
    status: payment.status,
    message: "Payment status retrieved"
  };
};

/**
 * Force sync all pending payments with PayMongo
 * @returns {Promise<Object>} Bulk sync result
 */
export const bulkSyncPendingPayments = async () => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const pendingPayments = await prisma.payments.findMany({
    where: {
      status: PAYMENT_STATUS.PENDING,
      referenceNumber: { not: null }, 
      createdAt: { lt: twoMinutesAgo }, 
    },
    take: 50, 
  });

  let updatedCount = 0;
  const results = [];

  for (const payment of pendingPayments) {
    try {
      const syncResult = await forceSyncPaymentStatus(payment.id);
      
      if (syncResult.previousStatus !== syncResult.newStatus) {
        updatedCount++;
      }
      
      results.push(syncResult);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error bulk syncing payment ${payment.id}:`, error);
      results.push({
        paymentId: payment.id,
        error: error.message
      });
    }
  }

  console.log(`Bulk sync completed. Updated ${updatedCount} out of ${pendingPayments.length} payments.`);
  
  return {
    totalChecked: pendingPayments.length,
    totalUpdated: updatedCount,
    results
  };
};

/**
 * Check for orphaned or failed payments and update their status
 * This function helps track payments that may have been removed from PayMongo dashboard
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupOrphanedPayments = async () => {
  console.log('Starting orphaned payments cleanup...');
  
  // Find pending payments older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const pendingPayments = await prisma.payments.findMany({
    where: {
      status: PAYMENT_STATUS.PENDING,
      referenceNumber: { not: null },
      createdAt: { lt: oneDayAgo },
    },
    take: 50, 
  });

  let updatedCount = 0;
  const results = [];

  for (const payment of pendingPayments) {
    try {
      console.log(`Checking orphaned payment ${payment.id} with reference: ${payment.referenceNumber}`);
      
      // Mark old pending payments as failed
      console.log(`Marking old pending payment ${payment.id} as failed (PIPM flow)`);
      
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: "failed",
        },
      });
      
      updatedCount++;
      results.push({
        paymentId: payment.id,
        action: 'marked_as_failed',
        reason: 'Payment expired'
      });
    } catch (error) {
      console.error(`Error checking orphaned payment ${payment.id}:`, error);
      results.push({
        paymentId: payment.id,
        action: 'error',
        error: error.message
      });
    }
  }

  console.log(`Orphaned payments cleanup completed. Updated ${updatedCount} payments.`);
  
  return {
    totalChecked: pendingPayments.length,
    totalUpdated: updatedCount,
    results
  };
};

// Response Helpers 
/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Express response
 */
export const sendSuccess = (
  res,
  data,
  message = "Operation successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send payment link via email
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Email send result
 */
export const sendPaymentLinkViaEmail = async (paymentData) => {
  const {
    email,
    firstName,
    lastName,
    amount,
    description,
    feeType,
    userId
  } = paymentData;

  try {

    const customTransactionId = await generatePaymentId();

    const payment = await prisma.payments.create({
      data: {
        transactionId: customTransactionId,
        userId: userId || null,
        amount: parseFloat(amount),
        status: PAYMENT_STATUS.PENDING,
        paymentMethod: "Online Payment", 
        feeType: feeType || 'tuition_fee',
        remarks: description || `Payment for ${firstName} ${lastName}`,
        paymentEmail: email, // Store the email from payment form
      },
    });

    console.log(`Created pending payment record: ${payment.id}`);
    
  // Use dynamic baseUrl for production and development
  const isProd = process.env.ENVIRONMENT === 'production';
  const baseUrl = isProd
    ? process.env.PRODUCTION_CLIENT_URL || 'https://preprod-eduops.danred-server.uk'
    : process.env.CLIENT_URL || 'http://localhost:3000';
  const checkoutUrl = `${baseUrl}/payment?paymentId=${payment.id}`;

    // User and payment details for email
    const user = { firstName, lastName };
    const paymentDetails = {
      amount: parseFloat(amount),
      description,
      remarks: feeType ? `Fee Type: ${feeType.replace('_', ' ')}` : '',
    };

    const emailSent = await sendPaymentLinkEmail(
      email,
      checkoutUrl,
      paymentDetails,
      user
    );

    if (emailSent) {
      return {
        success: true,
        message: "Payment link sent to your email successfully!",
        paymentId: payment.id
      };
    } else {
      await prisma.payments.delete({
        where: { id: payment.id }
      });
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error sending payment link via email:", error);
    return {
      success: false,
      message: "Failed to send payment link via email",
      error: error.message
    };
  }
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} error - Error details
 * @returns {Object} Express response
 */
export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (error) response.error = error;
  return res.status(statusCode).json(response);
};