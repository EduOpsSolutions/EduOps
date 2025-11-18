import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createPaymentIntent as createPayMongoPaymentIntent } from "./paymongo_service.js";
import { generatePaymentId } from "./payment_service.js";

const prisma = new PrismaClient();

/**
 * Payment Intent Service
 * Handles payment intent creation with race condition protection and idempotency
 */

/**
 * Build payment description from request data
 */
export const buildPaymentDescription = (data) => {
  const { remarks, description, purpose, firstName, lastName } = data;
  
  let paymongoDescription = remarks || description;
  if (!paymongoDescription && purpose && (firstName || lastName)) {
    paymongoDescription = `${purpose} - Payment for ${firstName || ""} ${lastName || ""}`.trim();
  }
  return paymongoDescription || "Payment";
};

/**
 * Check and validate existing payment with race condition protection
 * Returns payment state and instructions for next steps
 */
export const checkExistingPaymentWithLock = async (paymentId) => {
  if (!paymentId) {
    return { 
      exists: false, 
      shouldProceed: true,
      useNewIdempotencyKey: true,
    };
  }

  // Fetch payment record
  const existingPayment = await prisma.payments.findUnique({
    where: { id: paymentId },
  });

  if (!existingPayment) {
    return { 
      exists: false, 
      shouldProceed: false, 
      error: {
        message: "Payment record not found for provided paymentId",
        statusCode: 404,
      }
    };
  }

  // Check if payment is already processed
  if (existingPayment.status !== "pending") {
    console.warn("[PaymentIntent] payment not pending, lock enforced", { 
      paymentId, 
      status: existingPayment.status 
    });
    return {
      exists: true,
      shouldProceed: false,
      error: {
        message: "Payment link is locked or already processed",
        statusCode: 409,
      }
    };
  }

  // If payment intent already exists, return cached (prevents duplicate API calls)
  if (existingPayment.paymentIntentId) {
    console.log("[PaymentIntent] Intent already exists, returning cached", { 
      paymentIntentId: existingPayment.paymentIntentId 
    });
    return {
      exists: true,
      shouldProceed: false,
      useCached: true,
      cachedData: {
        data: {
          id: existingPayment.paymentIntentId,
          attributes: {
            amount: Math.round(parseFloat(existingPayment.amount) * 100),
            currency: existingPayment.currency || "PHP",
            status: "awaiting_payment_method",
          },
        },
      },
    };
  }

  // Validate idempotency key exists
  const idempotencyKey = existingPayment.idempotencyKey;
  if (!idempotencyKey) {
    console.error("[PaymentIntent]  CRITICAL: No idempotency key found!", {
      paymentId,
      transactionId: existingPayment.transactionId,
    });
    return {
      exists: true,
      shouldProceed: false,
      error: {
        message: "Payment configuration error - missing idempotency key",
        statusCode: 500,
      }
    };
  }

  console.log("[PaymentIntent]  Using idempotency key from database", {
    paymentId,
    idempotencyKey: idempotencyKey.substring(0, 8) + "...",
    transactionId: existingPayment.transactionId,
  });

  return {
    exists: true,
    shouldProceed: true,
    payment: existingPayment,
    idempotencyKey,
    useNewIdempotencyKey: false,
  };
};

/**
 * Create payment intent with race condition detection
 * This handles the double-check pattern to catch concurrent requests
 */
export const createPaymentIntentWithProtection = async (requestData, existingPayment, idempotencyKey) => {
  const { paymentId, amount } = requestData;
  const paymongoDescription = buildPaymentDescription(requestData);

  //Before calling PayMongo, set a lock flag to prevent duplicates
  if (paymentId && existingPayment) {
    console.log("[PaymentIntent] Acquiring lock to prevent concurrent PayMongo calls");
    
    // Try to atomically set paymentIntentId to "CREATING" as a lock
    const lockResult = await prisma.payments.updateMany({
      where: {
        id: paymentId,
        status: "pending",
        paymentIntentId: null,
      },
      data: {
        paymentIntentId: "CREATING", // Temporary lock value
      },
    });

    if (lockResult.count === 0) {
      // Another request already locked this payment or it has an intent
      console.warn("[PaymentIntent] Payment already locked, fetching existing intent");
      
      const currentPayment = await prisma.payments.findUnique({
        where: { id: paymentId },
        select: { paymentIntentId: true, amount: true, status: true },
      });

      if (currentPayment?.paymentIntentId && currentPayment.paymentIntentId !== "CREATING") {
        console.log("[PaymentIntent] Returning existing intent from concurrent request");
        return {
          success: true,
          data: {
            data: {
              id: currentPayment.paymentIntentId,
              attributes: {
                amount: Math.round(parseFloat(currentPayment.amount) * 100),
                currency: "PHP",
                status: "awaiting_payment_method",
              },
            },
          },
          raceDetected: true,
        };
      }
      
      // If still "CREATING", wait a moment and retry
      if (currentPayment?.paymentIntentId === "CREATING") {
        console.log("[PaymentIntent] Another request is creating intent, waiting...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const retryPayment = await prisma.payments.findUnique({
          where: { id: paymentId },
          select: { paymentIntentId: true, amount: true },
        });
        
        if (retryPayment?.paymentIntentId && retryPayment.paymentIntentId !== "CREATING") {
          console.log("[PaymentIntent] Got intent after waiting");
          return {
            success: true,
            data: {
              data: {
                id: retryPayment.paymentIntentId,
                attributes: {
                  amount: Math.round(parseFloat(retryPayment.amount) * 100),
                  currency: "PHP",
                  status: "awaiting_payment_method",
                },
              },
            },
            raceDetected: true,
          };
        }
      }
    } else {
      console.log("[PaymentIntent] Lock acquired successfully");
    }
  }

  console.log("[PaymentIntent] Calling PayMongo API", {
    description: paymongoDescription,
    idempotencyKey: idempotencyKey ? idempotencyKey.substring(0, 8) + "..." : "WILL_GENERATE_NEW",
  });

  // Call PayMongo API
  const result = await createPayMongoPaymentIntent({
    ...requestData,
    description: paymongoDescription,
    idempotencyKey: idempotencyKey,
  });

  if (!result.success) {
    console.warn("[PaymentIntent] PayMongo API failed:", result.message || result.error);
    
    // Rollback lock
    if (paymentId && existingPayment) {
      await prisma.payments.updateMany({
        where: {
          id: paymentId,
          paymentIntentId: "CREATING",
        },
        data: {
          paymentIntentId: null,
        },
      });
    }
    
    return {
      success: false,
      error: result.message,
      details: result.error,
    };
  }

  const paymentIntentId = result.data?.data?.id;
  console.log("[PaymentIntent] PayMongo API success, intentId:", paymentIntentId);

  // Handle race condition detection if paymentId provided
  if (paymentId && existingPayment) {
    // Update payment record with real intent ID, replacing "CREATING" lock
    const updateResult = await prisma.payments.updateMany({
      where: {
        id: paymentId,
        paymentIntentId: "CREATING", // Only update if we hold the lock
      },
      data: {
        paymentIntentId: paymentIntentId,
        remarks: existingPayment.remarks || paymongoDescription,
        feeType: existingPayment.feeType || requestData.feeType || requestData.purpose || "tuition_fee",
      },
    });

    if (updateResult.count === 0) {
      console.warn("[PaymentIntent] Could not update - lock was lost or already updated");
    
      const currentPayment = await prisma.payments.findUnique({
        where: { id: paymentId },
        select: { paymentIntentId: true, amount: true },
      });

      if (currentPayment?.paymentIntentId && currentPayment.paymentIntentId !== paymentIntentId && currentPayment.paymentIntentId !== "CREATING") {
        console.warn("[PaymentIntent] RACE DETECTED: Different intent ID in database", {
          ourIntentId: paymentIntentId,
          theirIntentId: currentPayment.paymentIntentId,
        });
        
        return {
          success: true,
          data: {
            data: {
              id: currentPayment.paymentIntentId,
              attributes: {
                amount: Math.round(parseFloat(currentPayment.amount) * 100),
                currency: "PHP",
                status: "awaiting_payment_method",
              },
            },
          },
          raceDetected: true,
        };
      }
    } else {
      console.log("[PaymentIntent] Successfully updated payment with real intent ID");
    }
  } else {
    // Create new payment record without paymentId
    await createPaymentRecordWithIntent(
      paymentIntentId,
      idempotencyKey || result.data?.data?.attributes?.idempotency_key,
      requestData,
      paymongoDescription
    );
  }

  return {
    success: true,
    data: result.data,
    raceDetected: false,
  };
};

/**
 * Detect race condition by double-checking payment state after PayMongo call
 * This is the KEY to preventing duplicate payment intents
 */
const detectAndHandleRaceCondition = async (paymentId, newIntentId, amount) => {
  // Re-fetch payment to see if another request updated it
  const latestPayment = await prisma.payments.findUnique({
    where: { id: paymentId },
    select: { paymentIntentId: true, status: true, transactionId: true },
  });

  // Check if another request created a different intent
  if (latestPayment?.paymentIntentId && latestPayment.paymentIntentId !== newIntentId) {
    console.warn("[PaymentIntent]  RACE DETECTED: Another request created different intent", {
      ourIntentId: newIntentId,
      theirIntentId: latestPayment.paymentIntentId,
      transactionId: latestPayment.transactionId,
    });
    
    // Return their intent ID to maintain consistency
    return {
      raceDetected: true,
      data: {
        data: {
          id: latestPayment.paymentIntentId,
          attributes: {
            amount: Math.round(parseFloat(amount) * 100),
            currency: "PHP",
            status: "awaiting_payment_method",
          },
        },
      },
    };
  }

  return { raceDetected: false };
};

/**
 * Update payment with intent ID atomically
 * Only updates if payment is still pending and has no intent ID
 */
const updatePaymentWithIntentAtomic = async (
  paymentId, 
  paymentIntentId, 
  existingPayment, 
  paymongoDescription, 
  feeType, 
  purpose
) => {
  const updateResult = await prisma.payments.updateMany({
    where: {
      id: paymentId,
      status: "pending",
      paymentIntentId: null, // CRITICAL: Only update if no intent ID yet
    },
    data: {
      paymentIntentId: paymentIntentId,
      remarks: existingPayment.remarks || paymongoDescription,
      feeType: existingPayment.feeType || feeType || purpose || "tuition_fee",
    },
  });

  if (updateResult.count === 0) {
    console.warn("[PaymentIntent] Payment already updated by another request", {
      paymentId,
      paymentIntentId,
    });
  } else {
    console.log("[PaymentIntent] Successfully updated payment with intent ID", {
      paymentId,
      paymentIntentId,
      transactionId: existingPayment.transactionId,
    });
  }

  return updateResult;
};

/**
 * Create new payment record with intent (when no paymentId provided)
 */
const createPaymentRecordWithIntent = async (
  paymentIntentId,
  idempotencyKey,
  requestData,
  paymongoDescription
) => {
  const { userId, amount, feeType, purpose } = requestData;

  // Check for duplicate by intent ID or idempotency key
  const existingPaymentWithIntent = await prisma.payments.findFirst({
    where: {
      OR: [
        { paymentIntentId: paymentIntentId },
        { idempotencyKey: idempotencyKey },
      ],
    },
  });

  if (existingPaymentWithIntent) {
    console.log("[PaymentIntent] Payment with this intent/key already exists, reusing", {
      paymentId: existingPaymentWithIntent.id,
      transactionId: existingPaymentWithIntent.transactionId,
    });
    return { alreadyExists: true };
  }

  const customTransactionId = await generatePaymentId();
  console.log("[PaymentIntent] Creating new payment record", { customTransactionId });

  // Resolve user ID if needed
  let finalUserId = userId;
  if (typeof userId === "string" && userId.length <= 20) {
    try {
      const user = await prisma.users.findUnique({
        where: { userId: userId },
        select: { id: true },
      });
      if (user) {
        finalUserId = user.id;
      }
    } catch (userError) {
      console.error("Error finding user:", userError);
    }
  }

  await prisma.payments.create({
    data: {
      transactionId: customTransactionId,
      userId: finalUserId,
      amount: parseFloat(amount),
      status: "pending",
      paymentMethod: "Online Payment",
      paymentIntentId: paymentIntentId,
      idempotencyKey: idempotencyKey,
      feeType: feeType || purpose || "tuition_fee",
      remarks: paymongoDescription,
    },
  });

  console.log("[PaymentIntent] New payment record created");
  return { alreadyExists: false };
};

/**
 * Validate payment intent request
 */
export const validatePaymentIntentRequest = (requestData) => {
  const { amount, userId } = requestData;

  if (!amount || amount <= 0) {
    return { 
      valid: false, 
      error: {
        message: "Amount is required and must be greater than 0",
        statusCode: 400,
      }
    };
  }

  if (!userId) {
    return { 
      valid: false, 
      error: {
        message: "User ID is required",
        statusCode: 400,
      }
    };
  }

  return { valid: true };
};
