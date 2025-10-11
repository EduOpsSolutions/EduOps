import { PrismaClient } from "@prisma/client";
import axios from "axios";
import {
  PAYMENT_STATUS,
  PAYMENT_INCLUDES,
  ERROR_MESSAGES,
} from "../constants/payment_constants.js";
import { sendPaymentLinkEmail } from "./paymentEmailService.js";

const prisma = new PrismaClient();
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

// Extract fee type from remarks
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

const transformPaymentForFrontend = (payment, paymongoDetails = null) => {
  const fullName = payment.user
    ? `${payment.user.firstName || ""}${
        payment.user.middleName ? ` ${payment.user.middleName}` : ""
      } ${payment.user.lastName || ""}`.trim()
    : "Unknown Student";


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
    feeType:
      payment.feeType ||
      extractFeeTypeFromRemarks(payment.remarks) ||
      "unknown",
    studentId: payment.user?.userId || "N/A", 
    userId: payment.user?.userId || "N/A",
    firstName: payment.user?.firstName || "Unknown",
    lastName: payment.user?.lastName || "User",
    email: payment.user?.email || "N/A",
    phoneNumber: payment.user?.phoneNumber || "N/A",
    paymongoDetails: paymongoDetails,
  };
};

// Build where clause for payment queries
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

const calculatePagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  };
};

const mapPayMongoStatusToPrisma = (paymongoStatus) => {
  const statusMap = {
    'paid': 'paid',
    'pending': 'pending',  
    'failed': 'failed',
    'expired': 'failed', 
    'cancelled': 'cancelled',
    'refunded': 'refunded'
  };
  
  return statusMap[paymongoStatus] || 'pending'; 
};

// Create manual payment
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

// Get payment with sync
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


// Get all transactions
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

  const transformedPayments = payments.map((payment) => {
    return transformPaymentForFrontend(payment, null);
  });

  return {
    payments: transformedPayments,
    total,
    pagination: calculatePagination(page, limit, total),
  };
};




// Bulk sync pending payments
export const bulkSyncPendingPayments = async () => {
  
  // Find pending payments older than 2 minutes
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

  
  return {
    totalChecked: pendingPayments.length,
    totalUpdated: updatedCount,
    results
  };
};

// Cleanup orphaned payments
export const cleanupOrphanedPayments = async () => {
  
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
      
      // Mark old pending payments as failed
      const paymentAge = Date.now() - payment.createdAt.getTime();
      const ageInHours = paymentAge / (1000 * 60 * 60);
      
      if (ageInHours > 24) { // Older than 24 hours
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: "failed",
            paymongoResponse: JSON.stringify({
              error: "Payment expired during cleanup",
              cleanupAt: new Date(),
              ageInHours: Math.round(ageInHours)
            })
          },
        });
        
        updatedCount++;
        results.push({
          paymentId: payment.id,
          action: 'marked_as_failed',
          reason: `Expired (${Math.round(ageInHours)} hours old)`
        });
        
      } else {
        results.push({
          paymentId: payment.id,
          action: 'no_change',
          status: payment.status,
          ageInHours: Math.round(ageInHours)
        });
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

  
  return {
    totalChecked: pendingPayments.length,
    totalUpdated: updatedCount,
    results
  };
};

// Mark expired payments as failed
export const markExpiredPayments = async () => {
  
  const now = Date.now();
  
  // Expiration thresholds (in milliseconds)
  const EXPIRATION_THRESHOLDS = {
    'Online Payment': 60 * 1000,
    'default': 25 * 60 * 60 * 1000 // Default: 25 hours
  };
  
  // Get all pending payments
  const pendingPayments = await prisma.payments.findMany({
    where: {
      status: 'pending'
    }
  });

  
  let updatedCount = 0;
  const results = [];

  for (const payment of pendingPayments) {
    try {
      const paymentMethod = payment.paymentMethod || 'default';
      const expirationThreshold = EXPIRATION_THRESHOLDS[paymentMethod] || EXPIRATION_THRESHOLDS['default'];
      
      // Calculate payment age
      const paymentAge = now - payment.createdAt.getTime();
      
      // Check if payment has expired
      if (paymentAge > expirationThreshold) {
        const ageInMinutes = Math.floor(paymentAge / (60 * 1000));
        const thresholdInMinutes = Math.floor(expirationThreshold / (60 * 1000));
        
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
            remarks: payment.remarks 
              ? `${payment.remarks} (Expired - no payment attempt after ${ageInMinutes} minutes)`
              : `Payment expired without attempt after ${ageInMinutes} minutes`
          }
        });
        
        updatedCount++;
        results.push({
          paymentId: payment.id,
          paymentMethod: paymentMethod,
          action: 'marked_as_failed',
          reason: `Expired (${ageInMinutes} min old, threshold: ${thresholdInMinutes} min)`,
          age: ageInMinutes
        });
        
      }
    } catch (error) {
      console.error(`Error marking payment ${payment.id} as expired:`, error);
      results.push({
        paymentId: payment.id,
        action: 'error',
        error: error.message
      });
    }
  }

  
  return {
    totalChecked: pendingPayments.length,
    totalExpired: updatedCount,
    results
  };
};


// Send success response
export const sendSuccess = (
  res,
  data,
  message = "Operation successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

// Send payment link via email
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
    // Generate custom payment ID
    const customPaymentId = await generatePaymentId();
    
    // Create PayMongo payment link
    const paymongoResponse = await axios.post(
      'https://api.paymongo.com/v1/links',
      {
        data: {
          attributes: {
            amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            description: description || `Payment for ${firstName} ${lastName}`,
            remarks: feeType ? `Fee Type: ${feeType.replace('_', ' ')}` : 'EduOps Payment'
          }
        }
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentLink = paymongoResponse.data.data;
    const checkoutUrl = paymentLink.attributes.checkout_url; // pm.link/eduops/xxxxx
    const paymongoId = paymentLink.id;
    const referenceNumber = paymentLink.attributes.reference_number;

    // Create pending payment record with PayMongo link data
    const payment = await prisma.payments.create({
      data: {
        id: customPaymentId,
        userId: userId || null,
        amount: parseFloat(amount),
        status: PAYMENT_STATUS.PENDING,
        paymentMethod: "Online Payment", // Will be updated by webhook
        feeType: feeType || 'tuition_fee',
        referenceNumber: referenceNumber,
        paymongoId: paymongoId,
        checkoutUrl: checkoutUrl,
        remarks: description || `Payment for ${firstName} ${lastName}`,
      },
    });


    const user = { firstName, lastName };
    const paymentDetails = {
      amount: parseFloat(amount),
      description,
      remarks: feeType ? `Fee Type: ${feeType.replace('_', ' ')}` : '',
    };

    // Send email with PayMongo link
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
        checkoutUrl: checkoutUrl, // PayMongo hosted link
        paymentId: payment.id,
        referenceNumber: referenceNumber
      };
    } else {
      await prisma.payments.delete({
        where: { id: payment.id }
      });
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error creating payment link:", error);
    return {
      success: false,
      message: "Failed to create payment link",
      error: error.response?.data?.errors?.[0]?.detail || error.message
    };
  }
};

// Send error response
export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (error) response.error = error;
  return res.status(statusCode).json(response);
};