import {
  createManualPayment,
  getPaymentWithSync,
  getAllTransactions,
  sendPaymentLinkViaEmail,
  sendSuccess,
  sendError,
} from "../services/payment_service.js";
import { sendPaymentReceiptEmail } from "../services/paymentEmailService.js";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  attachPaymentMethod as attachPayMongoPaymentMethod,
} from "../services/paymongo_service.js";
import {
  validatePaymentIntentRequest,
  checkExistingPaymentWithLock,
  createPaymentIntentWithProtection,
} from "../services/payment_intent_service.js";
import { checkAndSyncPaymentStatus } from "../services/payment_status_service.js";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMENT_INCLUDES,
} from "../constants/payment_constants.js";
import pkg from "@prisma/client";
import { cleanupOrphanedPayments } from "../services/payment_service.js";

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Payment Controller
 * Handles HTTP requests and delegates business logic to services
 */

// Create manual transaction (Physical Payment)
const createManualTransaction = async (req, res) => {
  try {
    const result = await createManualPayment(req.body);
    return sendSuccess(
      res,
      result,
      SUCCESS_MESSAGES.MANUAL_TRANSACTION_CREATED,
      201
    );
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Get payment details */
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentWithSync(paymentId);
    return sendSuccess(res, payment);
  } catch (error) {
    const statusCode =
      error.message === ERROR_MESSAGES.PAYMENT_NOT_FOUND ? 404 : 500;
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode,
      error.message
    );
  }
};

/* Refresh payment status from PayMongo */
const refreshPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentWithSync(paymentId);
    return sendSuccess(res, result, "Payment status refreshed successfully");
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Get all transactions for admin management */
const getAllPaymentTransactions = async (req, res) => {
  try {
    const { page, limit, status, paymentMethod, feeType, dateFrom, dateTo, searchTerm } = req.query;
    const result = await getAllTransactions({
      page,
      limit,
      status,
      paymentMethod,
      feeType,
      dateFrom,
      dateTo,
      searchTerm,
    });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
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
      include: PAYMENT_INCLUDES.WITH_USER,
    });

    if (!payment) {
      return sendError(res, "Payment record not found", 404);
    }

    const paymongoStatus = paymongoResult.data?.data?.attributes?.status;

    if (paymongoStatus === "succeeded" && payment.status === "pending") {
      const updatedPayment = await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
        include: PAYMENT_INCLUDES.WITH_USER,
      });

      // Send receipt email when payment status changes to paid
      if (
        updatedPayment.user &&
        (updatedPayment.paymentEmail || updatedPayment.user.email)
      ) {
        const recipientEmail =
          updatedPayment.paymentEmail || updatedPayment.user.email;
        // BCC to student's email if payer email is different
        const bccEmail =
          updatedPayment.paymentEmail &&
          updatedPayment.user.email !== updatedPayment.paymentEmail
            ? updatedPayment.user.email
            : undefined;
        console.log(
          `Sending payment receipt email to ${recipientEmail} after manual sync${
            bccEmail ? ` (BCC: ${bccEmail})` : ""
          }`
        );

        try {
          const emailSent = await sendPaymentReceiptEmail(
            recipientEmail,
            {
              transactionId: updatedPayment.transactionId,
              referenceNumber: updatedPayment.referenceNumber,
              amount: parseFloat(updatedPayment.amount),
              paymentMethod: updatedPayment.paymentMethod || "Online Payment",
              feeType: updatedPayment.feeType,
              remarks: updatedPayment.remarks,
              paidAt: updatedPayment.paidAt,
              createdAt: updatedPayment.createdAt,
              currency: updatedPayment.currency || "PHP",
            },
            {
              studentName: `${updatedPayment.user.firstName} ${updatedPayment.user.lastName}`,
              firstName: updatedPayment.user.firstName,
              lastName: updatedPayment.user.lastName,
              email: updatedPayment.user.email,
              student_id: updatedPayment.user.userId,
            },
            bccEmail
          );

          if (emailSent) {
            console.log(
              `Payment receipt email sent successfully to ${recipientEmail}`
            );
          } else {
            console.error(
              `Failed to send payment receipt email to ${recipientEmail}`
            );
          }
        } catch (emailError) {
          console.error(
            "Error sending payment receipt email after manual sync:",
            emailError
          );
        }
      }

      return sendSuccess(
        res,
        {
          paymentId: payment.id,
          oldStatus: "pending",
          newStatus: "paid",
          paymongoStatus: paymongoStatus,
        },
        "Payment status synced successfully"
      );
    }

    return sendSuccess(
      res,
      {
        paymentId: payment.id,
        status: payment.status,
        paymongoStatus: paymongoStatus,
        synced: false,
        reason: "Status already up to date",
      },
      "Payment status is already up to date"
    );
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

// Webhook Handling
const handleWebhook = async (req, res) => {
  const startTime = Date.now();
  let webhookEventRecord = null;

  console.log("[Webhook] ===== WEBHOOK RECEIVED =====");
  console.log("[Webhook] Timestamp:", new Date().toISOString());
  console.log("[Webhook] Headers:", JSON.stringify(req.headers, null, 2));

  try {
    // Read raw body if provided by raw parser; otherwise use JSON body
    let rawBodyString = null;
    if (req.body && Buffer.isBuffer(req.body)) {
      rawBodyString = req.body.toString("utf8");
    } else if (typeof req.body === "string") {
      rawBodyString = req.body;
    }

    const event = rawBodyString ? JSON.parse(rawBodyString) : req.body;
    const signature = req.get("Paymongo-Signature");
    const eventId = event?.data?.id;
    const eventType = event?.data?.attributes?.type;

    console.log("[Webhook] Event Type:", eventType);
    console.log("[Webhook] Event ID:", eventId);

    // Create initial webhook event log
    webhookEventRecord = await prisma.webhook_events.create({
      data: {
        eventId: eventId,
        eventType: eventType || "unknown",
        payload: event,
        signature: signature,
        signatureVerified: false,
        status: "pending",
      },
    });

    // Verify webhook signature (uses raw body if available)
    const isVerified = verifyWebhookSignature(req);

    // Update signature verification status
    await prisma.webhook_events.update({
      where: { id: webhookEventRecord.id },
      data: { signatureVerified: isVerified },
    });

    res.status(200).json({
      statusCode: 200,
      body: { message: "SUCCESS" },
    });

    try {
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: { status: "processing" },
      });

      const result = await processWebhookEvent(event);
      const processingTime = Date.now() - startTime;

      // Update webhook event log with success
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: {
          status: "success",
          processedAt: new Date(),
          processingTimeMs: processingTime,
          paymentId: result?.paymentId || null,
        },
      });

      console.log(
        `[Webhook] Successfully processed ${eventType} in ${processingTime}ms`
      );
    } catch (processingError) {
      console.error("Webhook processing error:", processingError);
      const processingTime = Date.now() - startTime;

      // Update webhook event log with failure
      await prisma.webhook_events.update({
        where: { id: webhookEventRecord.id },
        data: {
          status: "failed",
          error: processingError.message || "Unknown processing error",
          processedAt: new Date(),
          processingTimeMs: processingTime,
        },
      });
    }
    return; // response already sent
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error.message);
    console.error("[Webhook] Error stack:", error.stack);

    // Log error to webhook_events if record was created
    if (webhookEventRecord) {
      try {
        await prisma.webhook_events.update({
          where: { id: webhookEventRecord.id },
          data: {
            status: "failed",
            error: error.message,
            processedAt: new Date(),
            processingTimeMs: Date.now() - startTime,
          },
        });
      } catch (logError) {
        console.error("[Webhook] Failed to log error:", logError);
      }
    }

    // Handle specific webhook errors
    if (error.message.includes("Webhook secret not configured")) {
      console.error("[Webhook] Webhook secret not configured in environment");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    if (
      error.message.includes("Missing") ||
      error.message.includes("Invalid")
    ) {
      console.error("[Webhook] Signature verification failed:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.error("[Webhook] Acknowledging webhook with error state");
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
      return sendSuccess(
        res,
        {
          paymentId: result.paymentId,
        },
        result.message,
        200
      );
    } else {
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Create payment intent */
const createPaymentIntent = async (req, res) => {
  try {
    console.log("[CreateIntent] ===== REQUEST START =====");
    console.log("[CreateIntent] incoming body:", {
      userId: req.body.userId,
      amount: req.body.amount,
      feeType: req.body.feeType,
      paymentId: req.body.paymentId,
      purpose: req.body.purpose,
      timestamp: new Date().toISOString(),
    });

    // Validate request
    const validation = validatePaymentIntentRequest(req.body);
    if (!validation.valid) {
      return sendError(
        res,
        validation.error.message,
        validation.error.statusCode
      );
    }

    // Check existing payment with race condition protection
    const paymentCheck = await checkExistingPaymentWithLock(req.body.paymentId);

    if (!paymentCheck.shouldProceed) {
      if (paymentCheck.error) {
        return sendError(
          res,
          paymentCheck.error.message,
          paymentCheck.error.statusCode
        );
      }
      if (paymentCheck.useCached) {
        return sendSuccess(
          res,
          paymentCheck.cachedData,
          "Payment intent already exists for this payment"
        );
      }
    }

    // Create payment intent with race detection
    const result = await createPaymentIntentWithProtection(
      req.body,
      paymentCheck.payment,
      paymentCheck.idempotencyKey
    );

    if (result.success) {
      const message = result.raceDetected
        ? "Payment intent already created by concurrent request"
        : "Payment intent created successfully";

      return sendSuccess(res, result.data, message);
    } else {
      console.warn("[CreateIntent] paymongo response failed:", result.error);
      return sendError(res, result.error, 500, result.details);
    }
  } catch (error) {
    console.error("Create payment intent error", error);
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Attach payment method to payment intent */
const attachPaymentMethod = async (req, res) => {
  try {
    console.log("[AttachMethod] incoming body:", {
      hasPi: !!req.body?.payment_intent_id,
      hasPm: !!req.body?.payment_method_id,
      hasClient: !!req.body?.client_key,
    });

    // Race condition protection: Get idempotency key from payment record
    const { payment_intent_id } = req.body;
    let idempotencyKey = null;

    if (payment_intent_id) {
      const payment = await prisma.payments.findFirst({
        where: { paymentIntentId: payment_intent_id },
        select: { idempotencyKey: true, status: true },
      });

      if (payment) {
        idempotencyKey = payment.idempotencyKey;

        // If payment is already processing or completed, prevent duplicate attachment
        if (payment.status === "paid" || payment.status === "processing") {
          console.log(
            "[AttachMethod] Payment already processed, skipping attachment"
          );
          return sendSuccess(
            res,
            { data: { attributes: { status: payment.status } } },
            "Payment already processed"
          );
        }
      }
    }

    const result = await attachPayMongoPaymentMethod({
      ...req.body,
      idempotencyKey: idempotencyKey,
    });
    if (result.success) {
      const status =
        result.data?.data?.data?.attributes?.status ||
        result.data?.data?.attributes?.status;
      console.log(
        "[AttachMethod] paymongo attach success. intent status:",
        status
      );
      return sendSuccess(
        res,
        result.data,
        "Payment method attached successfully"
      );
    } else {
      console.warn(
        "[AttachMethod] paymongo attach failed:",
        result.message || result.error
      );
      return sendError(res, result.message, 500, result.error);
    }
  } catch (error) {
    console.error("Attach payment method error:", error);
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

/* Check payment status by payment intent ID */
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const responseData = await checkAndSyncPaymentStatus(paymentIntentId);
    return sendSuccess(res, responseData);
  } catch (error) {
    console.error("Check payment status error:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode
    );
  }
};

const adminCleanupOrphanedPayments = async (req, res) => {
  try {
    const result = await cleanupOrphanedPayments();
    return sendSuccess(res, result, "Orphaned payments cleanup completed");
  } catch (error) {
    return sendError(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      500,
      error.message
    );
  }
};

//Export Controller Functions
export {
  createManualTransaction,
  getPaymentDetails,
  getAllPaymentTransactions,
  refreshPaymentStatus,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
  manualSyncPayment,
  adminCleanupOrphanedPayments,
};

// Export default object for backward compatibility
export default {
  createManualTransaction,
  getPaymentDetails,
  getAllTransactions: getAllPaymentTransactions,
  refreshPaymentStatus,
  manualSyncPayment,
  createPaymentIntent,
  attachPaymentMethod,
  sendPaymentLinkEmail,
  checkPaymentStatus,
  handleWebhook,
  adminCleanupOrphanedPayments,
};
