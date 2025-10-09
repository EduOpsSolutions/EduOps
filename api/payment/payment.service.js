import { PrismaClient } from "@prisma/client";
import {
  createPaymentLink,
  getPaymentLink,
  archivePaymentLink,
  getPaymentMethods,
  getPaymentDetails,
  extractPayMongoDetails,
} from "./paymongo.service.js";
import {
  FEE_TYPE_MAP,
  PAYMENT_STATUS,
  PAYMENT_INCLUDES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./payment.constants.js";
import { sendPaymentLinkEmail } from "./paymentEmailService.js";

const prisma = new PrismaClient();

/**
 * Payment Service
 * Core business logic for payment operations
 */

// ==================== Helper Functions ====================

/**
 * Generate unique payment ID
 * @returns {Promise<string>} Unique 7-character payment ID
 */
const generatePaymentId = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let paymentId;

  do {
    paymentId = Array.from({ length: 7 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");

    const existing = await prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!existing) break;
  } while (true);

  return paymentId;
};

/**
 * Extract fee type from remarks (fallback for old payments)
 * @param {string} remarks - Payment remarks
 * @returns {string|null} Extracted fee type
 */
const extractFeeTypeFromRemarks = (remarks) => {
  if (!remarks) return null;

  const feeTypeMap = {
    down_payment: "down_payment",
    tuition_fee: "tuition_fee",
    document_fee: "document_fee",
    book_fee: "book_fee",
  };

  const lowerRemarks = remarks.toLowerCase();
  for (const [key, value] of Object.entries(feeTypeMap)) {
    if (lowerRemarks.includes(key)) {
      return value;
    }
  }
  return null;
};

/**
 * Transform payment data for frontend consumption
 * @param {Object} payment - Payment record
 * @param {Object} paymongoDetails - PayMongo details
 * @returns {Object} Transformed payment data
 */
const transformPaymentForFrontend = (payment, paymongoDetails = null) => {
  const fullName = payment.user
    ? `${payment.user.firstName || ""}${
        payment.user.middleName ? ` ${payment.user.middleName}` : ""
      } ${payment.user.lastName || ""}`.trim()
    : "Unknown Student";

  // Determine payment method with priority order:
  // 1. Use existing paymentMethod if already set from PayMongo webhook
  // 2. For online payments with PayMongo data: "Online Payment"
  // 3. For manual transactions without PayMongo data: "Physical Payment"
  let paymentMethod = payment.paymentMethod;
  if (!paymentMethod) {
    paymentMethod =
      payment.checkoutUrl && payment.paymongoId
        ? "Online Payment"
        : "Physical Payment";
  }

  return {
    ...payment,
    paymentMethod: paymentMethod,
    // Use direct feeType field, fallback to extracting from remarks
    feeType:
      payment.feeType ||
      extractFeeTypeFromRemarks(payment.remarks) ||
      "unknown",
    // Map user data to top level for frontend compatibility
    studentId: payment.user?.userId || "N/A", // This is the actual Student ID (e.g., "2024-00001")
    studentName: fullName, // Combined first, middle, and last name
    userId: payment.user?.userId || "N/A", // Same as studentId - this is the unique student identifier
    firstName: payment.user?.firstName || "Unknown",
    lastName: payment.user?.lastName || "User",
    email: payment.user?.email || "N/A",
    phoneNumber: payment.user?.phoneNumber || "N/A",
    // Add PayMongo details
    paymongoDetails: paymongoDetails,
  };
};

/**
 * Build where clause for payment queries
 * @param {Object} filters - Query filters
 * @returns {Object} Prisma where clause
 */
const buildPaymentWhereClause = (filters) => {
  const whereClause = {};
  
  if (filters.userId) {
    whereClause.userId = filters.userId;
  }
  
  if (filters.status) {
    whereClause.status = filters.status;
  }
  
  if (filters.searchTerm) {
    whereClause.OR = [
      {
        user: {
          firstName: { contains: filters.searchTerm, mode: "insensitive" },
        },
      },
      {
        user: {
          lastName: { contains: filters.searchTerm, mode: "insensitive" },
        },
      },
      {
        user: {
          userId: { contains: filters.searchTerm },
        },
      },
      { remarks: { contains: filters.searchTerm, mode: "insensitive" } },
    ];
  }
  
  return whereClause;
};

/**
 * Calculate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
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
    'unpaid': 'failed', // PayMongo 'unpaid' maps to our 'failed' for better clarity
    'failed': 'failed',
    'expired': 'failed', // Map expired to failed for consistency
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'refunded': 'refunded'
  };
  
  return statusMap[paymongoStatus] || 'pending'; // Default to pending if unknown status
};

// ==================== Core Payment Operations ====================

/**
 * Create online payment with PayMongo
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment creation result
 */
export const createOnlinePayment = async (paymentData) => {
  const {
    userId,
    firstName,
    middleName,
    lastName,
    email,
    phoneNumber,
    feeType,
    amount,
  } = paymentData;

  const feeName = FEE_TYPE_MAP[feeType] || feeType;
  const paymentAmount = parseFloat(amount);
  const fullName = middleName
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;
  const paymentDescription = `${feeName} - Payment for ${fullName}`;

  // Create payment link
  const paymentLinkResult = await createPaymentLink({
    amount: paymentAmount,
    description: paymentDescription,
    remarks: `EduOps ${feeType} payment`,
  });

  if (!paymentLinkResult.success) {
    throw new Error(paymentLinkResult.error || ERROR_MESSAGES.PAYMONGO_ERROR);
  }

  // Save payment record
  const customPaymentId = await generatePaymentId();
  const payment = await prisma.payments.create({
    data: {
      id: customPaymentId,
      paymongoId: paymentLinkResult.paymentLinkId,
      userId: userId,
      amount: paymentAmount,
      checkoutUrl: paymentLinkResult.checkoutUrl,
      paymongoResponse: JSON.stringify(paymentLinkResult.data),
      status: PAYMENT_STATUS.PENDING,
      paymentMethod: "Online Payment",
      feeType: feeType,
      remarks: `EduOps ${feeType} payment - ${paymentDescription}`,
    },
  });

  // Send payment link email
  await sendPaymentLinkEmail(
    email,
    payment.checkoutUrl,
    {
      amount: paymentAmount,
      description: paymentDescription,
      remarks: `EduOps ${feeType} payment`,
    },
    { firstName, lastName, email }
  );

  return {
    paymentId: payment.id,
    checkoutUrl: payment.checkoutUrl,
    amount: payment.amount,
    status: payment.status,
  };
};

/**
 * Create manual payment (Physical Payment)
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Payment creation result
 */
export const createManualPayment = async (transactionData) => {
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

  // Generate custom payment ID
  const customPaymentId = await generatePaymentId();

  // Create payment record for manual transaction
  const payment = await prisma.payments.create({
    data: {
      id: customPaymentId,
      userId: studentId,
      amount: parseFloat(amountPaid),
      status: PAYMENT_STATUS.PAID,
      paymentMethod: paymentMethod || "Physical Payment",
      referenceNumber: referenceNumber,
      feeType: purpose,
      remarks: remarks || `Manual ${purpose} payment`,
      paidAt: new Date(),
    },
  });

  return {
    paymentId: payment.id,
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

  // Sync status with PayMongo if it's an online payment
  if (payment.paymongoId) {
    try {
      console.log(`Syncing payment ${paymentId} with PayMongo ID: ${payment.paymongoId}`);
      
      const paymongoResult = await getPaymentLink(payment.paymongoId);
      if (paymongoResult.success) {
        const paymongoStatus = paymongoResult.data.data.attributes.status;
        const mappedStatus = mapPayMongoStatusToPrisma(paymongoStatus);
        console.log(`PayMongo link status: ${paymongoStatus}, Mapped to: ${mappedStatus}, Current DB status: ${payment.status}`);
        
        if (payment.status !== mappedStatus) {
          console.log(`Updating payment ${paymentId} status from ${payment.status} to ${mappedStatus}`);
          
          await prisma.payments.update({
            where: { id: payment.id },
            data: {
              status: mappedStatus,
              paidAt: mappedStatus === "paid" ? new Date() : null,
            },
          });
          payment.status = mappedStatus;
          if (mappedStatus === "paid") {
            payment.paidAt = new Date();
          }
          
          console.log(`Successfully updated payment ${paymentId} to status: ${mappedStatus}`);
        } else {
          console.log(`Payment ${paymentId} status unchanged: ${mappedStatus}`);
        }
      } else {
        console.error(`Failed to get PayMongo link details:`, paymongoResult.error);
      }
    } catch (error) {
      console.error(`Error syncing payment ${paymentId} with PayMongo:`, error.message);
      // Continue without throwing - return the payment even if sync fails
    }
  } else {
    console.log(`Payment ${paymentId} has no PayMongo ID, skipping sync`);
  }

  return payment;
};

/**
 * Get payments by user with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated payments
 */
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
      include: PAYMENT_INCLUDES.WITH_USER_FULL,
    }),
    prisma.payments.count({ where: whereClause }),
  ]);

  // Auto-sync PayMongo payments status (for payments that might have changed)
  // Only sync payments that are older than 2 minutes to give PayMongo time to process new payments
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const paymongoPayments = payments.filter(p => 
    p.paymongoId && 
    (p.status === 'paid' || p.status === 'pending') &&
    new Date(p.createdAt) < twoMinutesAgo  // Only sync payments older than 2 minutes
  );
  
  if (paymongoPayments.length > 0) {
    console.log(`Auto-syncing ${paymongoPayments.length} PayMongo payment statuses...`);
    
    // Sync each PayMongo payment in parallel (but limit to avoid rate limits)
    const syncPromises = paymongoPayments.slice(0, 10).map(async (payment) => {
      try {
        const syncedPayment = await getPaymentWithSync(payment.id);
        // Update the payment object in our list if status changed
        const index = payments.findIndex(p => p.id === payment.id);
        if (index !== -1 && syncedPayment.status !== payment.status) {
          payments[index].status = syncedPayment.status;
          payments[index].paidAt = syncedPayment.paidAt;
          console.log(`Updated payment ${payment.id} status from ${payment.status} to ${syncedPayment.status}`);
        }
      } catch (error) {
        console.warn(`Failed to sync payment ${payment.id}:`, error.message);
      }
    });
    
    await Promise.all(syncPromises);
  }

  // Transform the data for frontend consumption
  const transformedPayments = payments.map((payment) => {
    const paymongoDetails = extractPayMongoDetails(payment.paymongoResponse);
    return transformPaymentForFrontend(payment, paymongoDetails);
  });

  return {
    payments: transformedPayments,
    total,
    pagination: calculatePagination(page, limit, total),
  };
};

/**
 * Cancel payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelPayment = async (paymentId) => {
  const payment = await prisma.payments.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw new Error(ERROR_MESSAGES.PAYMENT_CANNOT_BE_CANCELLED);
  }

  // Archive payment link in PayMongo
  const archiveResult = await archivePaymentLink(payment.paymongoId);
  if (!archiveResult.success) {
    throw new Error(archiveResult.error || ERROR_MESSAGES.PAYMONGO_ERROR);
  }

  // Update payment status
  await prisma.payments.update({
    where: { id: paymentId },
    data: { status: PAYMENT_STATUS.CANCELLED },
  });

  return { message: SUCCESS_MESSAGES.PAYMENT_CANCELLED };
};

/**
 * Get available payment methods
 * @returns {Promise<Object>} Available payment methods
 */
export const getAvailablePaymentMethods = async () => {
  const result = await getPaymentMethods();
  if (!result.success) {
    throw new Error(result.error || ERROR_MESSAGES.PAYMONGO_ERROR);
  }
  return result.data;
};

/**
 * Force sync payment status with PayMongo (more aggressive than regular sync)
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

  if (!payment.paymongoId) {
    // Not an online payment, return as-is
    return {
      paymentId: payment.id,
      status: payment.status,
      message: "Not an online payment, no sync needed"
    };
  }

  console.log(`Force syncing payment ${paymentId} with PayMongo ID: ${payment.paymongoId}`);
  
  try {
    const paymongoResult = await getPaymentLink(payment.paymongoId);
    
    if (!paymongoResult.success) {
      // If PayMongo link is not accessible, mark as failed
      console.log(`PayMongo link not accessible for payment ${paymentId}, marking as failed`);
      
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          paymongoResponse: JSON.stringify({
            error: "PayMongo link not accessible during force sync",
            syncAt: new Date(),
            originalError: paymongoResult.error
          })
        },
      });
      
      return {
        paymentId: payment.id,
        previousStatus: payment.status,
        newStatus: "failed",
        message: "Payment marked as failed - PayMongo link not accessible"
      };
    }

    const paymongoStatus = paymongoResult.data.data.attributes.status;
    const mappedStatus = mapPayMongoStatusToPrisma(paymongoStatus);
    
    console.log(`PayMongo link status: ${paymongoStatus}, Mapped to: ${mappedStatus}, Current DB status: ${payment.status}`);
    
    if (payment.status !== mappedStatus) {
      console.log(`Force updating payment ${paymentId} status from ${payment.status} to ${mappedStatus}`);
      
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: mappedStatus,
          paidAt: mappedStatus === "paid" ? new Date() : null,
          paymongoResponse: JSON.stringify({
            ...paymongoResult.data,
            forceSyncAt: new Date()
          })
        },
      });
      
      console.log(`Successfully force updated payment ${paymentId} to status: ${mappedStatus}`);
      
      return {
        paymentId: payment.id,
        previousStatus: payment.status,
        newStatus: mappedStatus,
        message: "Payment status force updated successfully"
      };
    } else {
      return {
        paymentId: payment.id,
        status: payment.status,
        message: "Payment status already up to date"
      };
    }
  } catch (error) {
    console.error(`Error force syncing payment ${paymentId}:`, error);
    throw new Error(`Failed to force sync payment: ${error.message}`);
  }
};

/**
 * Force sync all pending payments with PayMongo
 * @returns {Promise<Object>} Bulk sync result
 */
export const bulkSyncPendingPayments = async () => {
  console.log('Starting bulk sync of all pending payments...');
  
  // Find all pending payments with PayMongo IDs, but exclude very recent ones
  // to avoid syncing payments that PayMongo hasn't fully processed yet
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const pendingPayments = await prisma.payments.findMany({
    where: {
      status: PAYMENT_STATUS.PENDING,
      paymongoId: { not: null }, // Only online payments
      createdAt: { lt: twoMinutesAgo }, // Only sync payments older than 2 minutes
    },
    take: 50, // Limit to avoid overwhelming PayMongo API
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
      paymongoId: { not: null }, // Only online payments
      createdAt: { lt: oneDayAgo }, // Older than 24 hours
    },
    take: 50, // Limit to avoid overwhelming PayMongo API
  });

  let updatedCount = 0;
  const results = [];

  for (const payment of pendingPayments) {
    try {
      console.log(`Checking orphaned payment ${payment.id} with PayMongo ID: ${payment.paymongoId}`);
      
      const paymongoResult = await getPaymentLink(payment.paymongoId);
      
      if (!paymongoResult.success) {
        // If PayMongo link doesn't exist or is not accessible, mark as failed
        console.log(`PayMongo link not found for payment ${payment.id}, marking as failed`);
        
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: "failed",
            paymongoResponse: JSON.stringify({
              error: "Payment link not found in PayMongo",
              cleanupAt: new Date(),
              originalError: paymongoResult.error
            })
          },
        });
        
        updatedCount++;
        results.push({
          paymentId: payment.id,
          action: 'marked_as_failed',
          reason: 'PayMongo link not accessible'
        });
      } else {
        // Check actual status from PayMongo
        const paymongoStatus = paymongoResult.data.data.attributes.status;
        const mappedStatus = mapPayMongoStatusToPrisma(paymongoStatus);
        
        if (payment.status !== mappedStatus) {
          console.log(`Updating orphaned payment ${payment.id} status from ${payment.status} to ${mappedStatus}`);
          
          await prisma.payments.update({
            where: { id: payment.id },
            data: {
              status: mappedStatus,
              paidAt: mappedStatus === "paid" ? new Date() : null,
              paymongoResponse: JSON.stringify({
                ...paymongoResult.data,
                cleanupAt: new Date()
              })
            },
          });
          
          updatedCount++;
          results.push({
            paymentId: payment.id,
            action: 'status_updated',
            from: payment.status,
            to: mappedStatus
          });
        }
      }
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

// ==================== Response Helpers ====================

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