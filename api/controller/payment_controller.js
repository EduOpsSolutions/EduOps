import {
  createManualPayment,
  getPaymentWithSync,
  getPaymentsByUser,
  getAllTransactions,
  getAvailablePaymentMethods,
  forceSyncPaymentStatus,
  bulkSyncPendingPayments,
  cleanupOrphanedPayments,
  sendPaymentLinkViaEmail,
  sendSuccess,
  sendError,
  generatePaymentId,
} from "../services/payment_service.js";
import { sendPaymentReceiptEmail } from "../services/paymentEmailService.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  createPaymentIntent as createPayMongoPaymentIntent,
  attachPaymentMethod as attachPayMongoPaymentMethod,
  getPaymentIntent as getPayMongoPaymentIntent,
  formatPaymentMethod,
} from "../services/paymongo_service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMENT_INCLUDES,
} from "../constants/payment_constants.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Payment Controller
 * Handles HTTP requests and delegates business logic to services
 */

// Create manual transaction (Physical Payment)
const createManualTransaction = async (req, res) => {
  try {
    const result = await createManualPayment(req.body);
    return sendSuccess(res, result, SUCCESS_MESSAGES.MANUAL_TRANSACTION_CREATED, 201);
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Get payment details */
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentWithSync(paymentId);
    return sendSuccess(res, payment);
  } catch (error) {
    const statusCode = error.message === ERROR_MESSAGES.PAYMENT_NOT_FOUND ? 404 : 500;
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, statusCode, error.message);
  }
};

/* Get payments by user ID */
const getPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, status } = req.query;
    
    const result = await getPaymentsByUser(userId, { page, limit, status });
    return sendSuccess(res, result);
  } catch (error) {
    const statusCode = error.message === ERROR_MESSAGES.USER_NOT_FOUND ? 404 : 500;
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, statusCode, error.message);
  }
};


/* Get available payment method */
const getPaymentMethods = async (req, res) => {
  try {
    const result = await getAvailablePaymentMethods();
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Refresh payment status from PayMongo */
const refreshPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentWithSync(paymentId);
    return sendSuccess(res, result, "Payment status refreshed successfully");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Get all transactions for admin management */
const getAllPaymentTransactions = async (req, res) => {
  try {
    const { page, limit, status, searchTerm } = req.query;
    const result = await getAllTransactions({ page, limit, status, searchTerm });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Force sync payment status with PayMongo */
const forceSyncPaymentStatusController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await forceSyncPaymentStatus(paymentId);
    return sendSuccess(res, result, "Payment status force synced successfully");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Manual sync specific payment by intent ID */
const manualSyncPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return sendError(res, "Payment intent ID is required", 400);
    }

    
    // Get the latest status from PayMongo
    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);
    
    if (!paymongoResult?.success) {
      return sendError(res, "Failed to get payment status from PayMongo", 500);
    }

    // Find the payment record
    let payment = await prisma.payments.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: PAYMENT_INCLUDES.WITH_USER
    });

    if (!payment) {
      return sendError(res, "Payment record not found", 404);
    }

    const paymongoStatus = paymongoResult.data?.data?.attributes?.status;

    if (paymongoStatus === 'succeeded' && payment.status === 'pending') {
      const updatedPayment = await prisma.payments.update({
        where: { id: payment.id },
        data: { 
          status: 'paid',
          paidAt: new Date()
        },
        include: PAYMENT_INCLUDES.WITH_USER
      });
      
      // Send receipt email when payment status changes to paid
      /*
      if (updatedPayment.users && updatedPayment.users.email) {
        console.log(`Sending payment receipt email to ${updatedPayment.users.email} after manual sync`);
        
        try {
          const emailSent = await sendPaymentReceiptEmail(
            updatedPayment.users.email,
            {
              transactionId: updatedPayment.transactionId,
              referenceNumber: updatedPayment.referenceNumber,
              amount: parseFloat(updatedPayment.amount),
              paymentMethod: updatedPayment.paymentMethod || 'Online Payment',
              feeType: updatedPayment.feeType,
              remarks: updatedPayment.remarks,
              paidAt: updatedPayment.paidAt,
              createdAt: updatedPayment.createdAt,
              currency: updatedPayment.currency || 'PHP'
            },
                {
                  firstName: updatedPayment.users.firstName,
                  lastName: updatedPayment.users.lastName,
                  email: updatedPayment.users.email,
                  student_id: updatedPayment.users.userId
                }
          );

          if (emailSent) {
            console.log(`Payment receipt email sent successfully to ${updatedPayment.users.email}`);
          } else {
            console.error(`Failed to send payment receipt email to ${updatedPayment.users.email}`);
          }
        } catch (emailError) {
          console.error('Error sending payment receipt email after manual sync:', emailError);
        }
      }
      */
      
      return sendSuccess(res, {
        paymentId: payment.id,
        oldStatus: 'pending',
        newStatus: 'paid',
        paymongoStatus: paymongoStatus
      }, "Payment status synced successfully");
    }

    return sendSuccess(res, {
      paymentId: payment.id,
      status: payment.status,
      paymongoStatus: paymongoStatus,
      synced: false,
      reason: 'Status already up to date'
    }, "Payment status is already up to date");

  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Bulk sync all pending payments (Admin endpoint) */
const bulkSyncPendingPaymentsController = async (req, res) => {
  try {
    const result = await bulkSyncPendingPayments();
    return sendSuccess(res, result, "Bulk sync of pending payments completed");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Clean up orphaned payments (Admin endpoint) */
const cleanupOrphanedPaymentsController = async (req, res) => {
  try {
    const result = await cleanupOrphanedPayments();
    return sendSuccess(res, result, "Orphaned payments cleanup completed");
  } catch (error) {
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

// Webhook Handling
const handleWebhook = async (req, res) => {
  try {

    // Verify webhook signature
    verifyWebhookSignature(req);

    // Process webhook event
    const event = req.body;
    const eventType = event.data.attributes.type;
    
    const result = await processWebhookEvent(event);


    // Always respond with 200 to acknowledge the webhook
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

/* Send payment link via email */
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

/* Create payment intent (PIPM flow) */
const createPaymentIntent = async (req, res) => {
  try {
    const { firstName, lastName, purpose, remarks, description, userId, amount, feeType } = req.body;
    
    if (!amount || amount <= 0) {
      return sendError(res, "Amount is required and must be greater than 0", 400);
    }
    
    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }
    
    let paymongoDescription = remarks || description;
    if (!paymongoDescription && purpose && (firstName || lastName)) {
      paymongoDescription = `${purpose} - Payment for ${firstName || ''} ${lastName || ''}`.trim();
    }
    if (!paymongoDescription) paymongoDescription = 'Payment';

    const result = await createPayMongoPaymentIntent({
      ...req.body,
      description: paymongoDescription
    });
    
    if (result.success) {
      const paymentIntentId = result.data?.data?.id;
      
      if (paymentIntentId && userId && amount) {
        const customTransactionId = await generatePaymentId();
        
        let finalUserId = userId;
        if (typeof userId === 'string' && userId.length > 20) {
          try {
            const user = await prisma.users.findUnique({
              where: { id: userId },
              select: { id: true, student_id: true }
            });
            
            if (user && user.student_id) {
              finalUserId = user.student_id;
            }
          } catch (userError) {
            console.error('Error finding user:', userError);
          }
        }
        
        try {
          await prisma.payments.create({
            data: {
              transactionId: customTransactionId,
              userId: finalUserId, 
              amount: parseFloat(amount),
              status: 'pending',
              paymentMethod: 'Online Payment', 
              paymentIntentId: paymentIntentId,
              feeType: feeType || purpose || 'tuition_fee',
              remarks: paymongoDescription,
            },
          });
        } catch (dbError) {
          console.error('Failed to create payment record:', dbError);
        }
      }
      
      return sendSuccess(res, result.data, "Payment intent created successfully");
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Create payment intent error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Attach payment method to payment intent */
const attachPaymentMethod = async (req, res) => {
  try {
    const result = await attachPayMongoPaymentMethod(req.body);
    
    if (result.success) {
      return sendSuccess(res, result.data, "Payment method attached successfully");
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Attach payment method error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

/* Check payment status by payment intent ID */
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);

    let intentDerivedPaymentId = null;
    let intentDerivedReference = null;
    try {
      if (paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        
        intentDerivedPaymentId = intentData?.latest_payment || null;
        if (!intentDerivedPaymentId && Array.isArray(intentData?.payments) && intentData.payments.length > 0) {
          const firstPayment = intentData.payments[0];
          intentDerivedPaymentId = firstPayment?.id || firstPayment?.data?.id || null;
          intentDerivedReference = firstPayment?.data?.attributes?.reference_number || null;
        }
        if (!intentDerivedPaymentId && intentData?.payment_intent?.payments?.length) {
          const p = intentData.payment_intent.payments[0];
          intentDerivedPaymentId = p?.id || p?.data?.id || null;
          intentDerivedReference = p?.data?.attributes?.reference_number || null;
        }
      }
    } catch (e) {
      console.warn('Unable to derive payment id from intent:', e);
    }
    
    let payment = await prisma.payments.findFirst({
      where: { paymentIntentId: paymentIntentId },
      include: PAYMENT_INCLUDES.WITH_USER
    });
    
    if (!payment) {
      payment = await prisma.payments.findFirst({
        where: { referenceNumber: paymentIntentId },
        include: PAYMENT_INCLUDES.WITH_USER
      });
    }
    if (!payment) {
      const recentPayments = await prisma.payments.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
          }
        },
        select: {
          id: true,
          transactionId: true,
          paymentIntentId: true,
          referenceNumber: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      const unmatchedPayment = recentPayments.find(p => !p.paymentIntentId && p.status === 'pending');
      if (unmatchedPayment) {
        try {
          payment = await prisma.payments.update({
            where: { id: unmatchedPayment.id },
            data: {
              paymentIntentId: paymentIntentId,
              referenceNumber: intentDerivedPaymentId || intentDerivedReference, 
              status: paymongoResult?.success && paymongoResult.data?.data?.attributes?.status === 'succeeded' ? 'paid' : 'pending',
              paidAt: paymongoResult?.success && paymongoResult.data?.data?.attributes?.status === 'succeeded' ? new Date() : null,
            },
            include: PAYMENT_INCLUDES.WITH_USER
          });
        } catch (updateError) {
          console.error('Failed to update existing payment record:', updateError);
        }
      }
    }

    if (!payment) {
      if (paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        const paymongoAmount = intentData?.amount ? intentData.amount / 100 : null;
        
        try {
          const customTransactionId = await generatePaymentId();
          
          let userId = 'student001';
          let feeType = 'unknown';
          let remarks = 'Payment created from PayMongo data';
          
          const description = intentData?.description || '';
          console.log(`PayMongo description: ${description}`);
          
          const recentPayments = await prisma.payments.findMany({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 2 * 60 * 60 * 1000) 
              },
              amount: paymongoAmount || 0
            },
            select: {
              userId: true,
              feeType: true,
              remarks: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          });
          
          if (recentPayments.length > 0) {
            userId = recentPayments[0].userId;
            feeType = recentPayments[0].feeType || 'unknown';
            remarks = recentPayments[0].remarks || description;
          } else {
            const existingUser = await prisma.users.findFirst({
              select: { id: true, student_id: true }
            });
            if (existingUser) {
              userId = existingUser.student_id || existingUser.id;
            }
          }
          
          payment = await prisma.payments.create({
            data: {
              transactionId: customTransactionId,
              userId: userId,
              amount: paymongoAmount || 0,
              status: intentData?.status === 'succeeded' ? 'paid' : 'pending',
              paymentMethod: 'Online Payment',
              paymentIntentId: paymentIntentId,
              referenceNumber: intentDerivedPaymentId || intentDerivedReference, 
              feeType: feeType,
              remarks: remarks,
              paidAt: intentData?.status === 'succeeded' ? new Date() : null,
            },
            include: PAYMENT_INCLUDES.WITH_USER
          });
          console.log(` Created payment record from PayMongo data: ${payment.id} with userId: ${userId}`);
        } catch (createError) {
          console.error('Failed to create payment record from PayMongo data:', createError);
        }
      }
      
      if (!payment) {
        return sendError(res, "Payment not found. The payment may still be processing. Please wait for the webhook or contact support.", 404);
      }
    }

    console.log(`Payment found: ${payment.id}, status: ${payment.status}, paymentMethod: ${payment.paymentMethod}`);

    let finalPaymentMethod = payment.paymentMethod;
    if (finalPaymentMethod === 'Online Payment' && paymongoResult?.success) {
      const intentData = paymongoResult.data?.data?.attributes;
      console.log('Attempting to extract payment method from PayMongo intent data:', JSON.stringify(intentData, null, 2));
      
      let sourceType = null;
      
      if (intentData?.payments && intentData.payments.length > 0) {
        const paymentData = intentData.payments[0];
        console.log('Payment data from payments array:', JSON.stringify(paymentData, null, 2));
        
        if (paymentData.data?.attributes?.source?.type) {
          sourceType = paymentData.data.attributes.source.type;
        } else if (paymentData.attributes?.source?.type) {
          sourceType = paymentData.attributes.source.type;
        } else if (paymentData.source?.type) {
          sourceType = paymentData.source.type;
        }
      }
      
      if (!sourceType && intentData?.source?.type) {
        sourceType = intentData.source.type;
      }

      if (!sourceType && intentData?.payment_method?.type) {
        sourceType = intentData.payment_method.type;
      }
      
      if (sourceType) {
        const extractedMethod = formatPaymentMethod(sourceType);
        console.log(`Extracted payment method from PayMongo: ${extractedMethod} (source: ${sourceType})`);
        finalPaymentMethod = extractedMethod;
        
        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: { paymentMethod: extractedMethod }
          });
          console.log(`Updated payment method in database: ${extractedMethod}`);
        } catch (updateError) {
          console.error('Failed to update payment method:', updateError);
        }
      } else {
        console.log('Could not extract payment method from PayMongo response');
      }
    }

    if (payment.status === 'pending' && paymongoResult?.success) {
      const paymongoStatus = paymongoResult.data?.data?.attributes?.status;
      
      if (paymongoStatus === 'succeeded') {
        try {
          await prisma.payments.update({
            where: { id: payment.id },
            data: { 
              status: 'paid',
              paidAt: new Date()
            }
          });
          payment.status = 'paid';
          payment.paidAt = new Date();

          // Send receipt email when payment status changes to paid
          /*
          if (payment.users && payment.users.email) {
            console.log(`Sending payment receipt email to ${payment.users.email} after status sync`);
            
            try {
              const emailSent = await sendPaymentReceiptEmail(
                payment.users.email,
                {
                  transactionId: payment.transactionId,
                  referenceNumber: payment.referenceNumber,
                  amount: parseFloat(payment.amount),
                  paymentMethod: finalPaymentMethod,
                  feeType: payment.feeType,
                  remarks: payment.remarks,
                  paidAt: payment.paidAt,
                  createdAt: payment.createdAt,
                  currency: payment.currency || 'PHP'
                },
                {
                  firstName: payment.users.firstName,
                  lastName: payment.users.lastName,
                  email: payment.users.email,
                  student_id: payment.users.userId
                }
              );

              if (emailSent) {
                console.log(`Payment receipt email sent successfully to ${payment.users.email}`);
              } else {
                console.error(`Failed to send payment receipt email to ${payment.users.email}`);
              }
            } catch (emailError) {
              console.error('Error sending payment receipt email after status sync:', emailError);
            }
          }
          */
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
      }
    }

    const statusMap = {
      'paid': 'succeeded',
      'pending': 'awaiting_payment_method',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };

    const responseData = {
      status: statusMap[payment.status] || payment.status, 
      dbStatus: payment.status, 
      amount: payment.amount,
      transactionId: payment.transactionId || payment.id, 
      internalId: payment.id, 
      paymongoPaymentId: undefined,
      referenceNumber: payment.referenceNumber,
      paymentMethod: finalPaymentMethod, 
      description: payment.remarks || "Payment",
      paidAt: payment.paidAt,
      user: payment.users ? {
        firstName: payment.users.first_name,
        lastName: payment.users.last_name,
        email: payment.users.email
      } : null
    };
    
    return sendSuccess(res, responseData);
  } catch (error) {
    console.error("Check payment status error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/* Cancel payment */
const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return sendError(res, "Payment ID is required", 400);
    }
    
    console.log(`Attempting to cancel payment: ${paymentId}`);

    const payment = await prisma.payments.findFirst({
      where: {
        OR: [
          { id: paymentId },
          { transactionId: paymentId }
        ]
      }
    });
    
    if (!payment) {
      return sendError(res, "Payment not found", 404);
    }
    
    // Check if payment can be cancelled
    if (payment.status === 'paid') {
      return sendError(res, "Cannot cancel a paid payment", 400);
    }
    
    if (payment.status === 'cancelled') {
      return sendError(res, "Payment is already cancelled", 400);
    }
    
    // Update payment status to cancelled
    const updatedPayment = await prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });
    
    console.log(`Successfully cancelled payment: ${payment.id} (${payment.transactionId})`);
    
    return sendSuccess(res, {
      id: updatedPayment.id,
      transactionId: updatedPayment.transactionId,
      status: updatedPayment.status,
      cancelledAt: updatedPayment.updatedAt
    }, "Payment cancelled successfully");
    
  } catch (error) {
    console.error("Cancel payment error:", error);
    return sendError(res, error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500, error.message);
  }
};

//Export Controller Functions 
export {
  createManualTransaction,
  getPaymentDetails,
  getPaymentsByUserId,
  getAllPaymentTransactions,
  getPaymentMethods,
  refreshPaymentStatus,
  forceSyncPaymentStatusController,
  bulkSyncPendingPaymentsController,
  cleanupOrphanedPaymentsController,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
  cancelPayment,
  manualSyncPayment,
};

// Export default object for backward compatibility
export default {
  createManualTransaction,
  getPaymentDetails,
  getPaymentsByUserId,
  getAllTransactions: getAllPaymentTransactions,
  getAvailablePaymentMethods: getPaymentMethods,
  refreshPaymentStatus,
  forceSyncPaymentStatus: forceSyncPaymentStatusController,
  manualSyncPayment,
  bulkSyncPendingPayments: bulkSyncPendingPaymentsController,
  cleanupOrphanedPayments: cleanupOrphanedPaymentsController,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
  cancelPayment,
};