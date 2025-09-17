import { PrismaClient } from "@prisma/client";
import {
    createPaymentLink,
    getPaymentLink,
    archivePaymentLink,
    getPaymentMethods,
    processWebhookEvent,
    verifyWebhookSignature,
    PAYMENT_STATUS,
} from "../utils/paymongo.js";
import { sendPaymentLinkEmail } from "../services/paymentEmailService.js";

const prisma = new PrismaClient();

// Response helpers
const sendSuccess = (
    res,
    data,
    message = "Operation successful",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, message, statusCode = 500, error = null) => {
    const response = { success: false, message };
    if (error) response.error = error;
    return res.status(statusCode).json(response);
};

// Database operations
const findEnrollment = async (enrollmentId) => {
    return prisma.enrollment_request.findUnique({
        where: { enrollmentId },
    });
};

const findPayment = async (paymentId, includeRelations = false) => {
    const options = { where: { id: paymentId } };

    if (includeRelations) {
        options.include = {
            user: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
            enrollment: {
                select: { enrollmentId: true, enrollmentStatus: true },
            },
        };
    }

    return prisma.payments.findUnique(options);
};

const syncPaymentStatus = async (payment) => {
    const paymongoResult = await getPaymentLink(payment.paymentId);

    if (paymongoResult.success) {
        const paymongoStatus = paymongoResult.data.data.attributes.status;

        if (payment.status !== paymongoStatus) {
            await prisma.payments.update({
                where: { id: payment.id },
                data: {
                    status: paymongoStatus,
                    paidAt: paymongoStatus === "paid" ? new Date() : null,
                },
            });
            payment.status = paymongoStatus;
        }
    }
};

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

export const createPayment = async (req, res) => {
    try {
        const {
            enrollmentId,
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            feeType,
            amount,
        } = req.body;

        // Validate enrollment ID is provided
        if (!enrollmentId) {
            return sendError(
                res,
                "Enrollment ID is required for payment processing",
                400
            );
        }

        // Validate enrollment exists
        const enrollment = await findEnrollment(enrollmentId);
        if (!enrollment) {
            return sendError(
                res,
                `Enrollment not found with ID "${enrollmentId}". Please verify your enrollment ID and try again.`,
                404
            );
        }
        const paymentAmount = parseFloat(amount);
        const paymentDescription = `${feeType} - Payment by ${firstName} ${lastName}`;

        const paymentLinkResult = await createPaymentLinkOrMock({
            amount: paymentAmount,
            description: paymentDescription,
            remarks: `EduOps ${feeType} payment`,
        });

        if (!paymentLinkResult.success) {
            return sendError(
                res,
                "Failed to create payment link",
                400,
                paymentLinkResult.error
            );
        }

        const payment = await savePaymentRecord(paymentLinkResult, {
            enrollmentId,
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            feeType,
            amount: paymentAmount,
        });

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

        return sendSuccess(
            res,
            {
                paymentId: payment.id,
                checkoutUrl: payment.checkoutUrl,
                amount: payment.amount,
                status: payment.status,
            },
            "Payment link created successfully",
            201
        );
    } catch (error) {
        console.error("Create payment error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

const createPaymentLinkOrMock = async (paymentData) => {
    if (!process.env.PAYMONGO_SECRET_KEY) {
        return {
            success: true,
            data: { mock: true },
            checkoutUrl: "https://checkout.paymongo.com/s/mock-payment-link",
            paymentLinkId: "mock-payment-" + Date.now(),
        };
    }
    return createPaymentLink(paymentData);
};

const savePaymentRecord = async (paymentLinkResult, paymentDetails) => {
    const customPaymentId = await generatePaymentId();

    return prisma.payments.create({
        data: {
            id: customPaymentId,
            paymentId: paymentLinkResult.paymentLinkId,
            enrollmentId: paymentDetails.enrollmentId,
            firstName: paymentDetails.firstName,
            middleName: paymentDetails.middleName || null,
            lastName: paymentDetails.lastName,
            email: paymentDetails.email,
            phoneNumber: paymentDetails.phoneNumber || null,
            feeType: paymentDetails.feeType,
            amount: paymentDetails.amount,
            checkoutUrl: paymentLinkResult.checkoutUrl,
            paymongoResponse: paymentLinkResult.data,
            status: "pending",
        },
    });
};

export const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await findPayment(paymentId, true);
        if (!payment) {
            return sendError(res, "Payment not found", 404);
        }

        // Sync status with PayMongo
        await syncPaymentStatus(payment);

        return sendSuccess(res, payment);
    } catch (error) {
        console.error("Get payment details error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

export const getPaymentsByEnrollmentId = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const enrollment = await findEnrollment(enrollmentId);
        if (!enrollment) {
            return sendError(res, "Enrollment not found", 404);
        }

        const whereClause = { enrollmentId };
        if (status) whereClause.status = status;
        const [payments, total] = await Promise.all([
            prisma.payments.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: parseInt(limit),
                include: {
                    enrollment: {
                        select: { enrollmentId: true, enrollmentStatus: true },
                    },
                },
            }),
            prisma.payments.count({ where: whereClause }),
        ]);

        return sendSuccess(res, {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get payments by enrollment ID error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

export const cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Find payment
        const payment = await findPayment(paymentId);
        if (!payment) {
            return sendError(res, "Payment not found", 404);
        }

        // Check if payment can be cancelled
        if (payment.status !== "pending") {
            return sendError(res, "Payment cannot be cancelled", 400);
        }

        // Archive payment link in PayMongo
        const archiveResult = await archivePaymentLink(payment.paymentId);
        if (!archiveResult.success) {
            return sendError(
                res,
                "Failed to cancel payment",
                400,
                archiveResult.error
            );
        }

        // Update payment status
        await prisma.payments.update({
            where: { id: paymentId },
            data: { status: "cancelled" },
        });

        return sendSuccess(res, null, "Payment cancelled successfully");
    } catch (error) {
        console.error("Cancel payment error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

/* Handle PayMongo webhooks */
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers["paymongo-signature"];
        const payload = JSON.stringify(req.body);

        // Verify webhook signature if configured
        if (process.env.PAYMONGO_WEBHOOK_SECRET && signature) {
            const isValid = verifyWebhookSignature(payload, signature);
            if (!isValid) {
                return sendError(res, "Invalid webhook signature", 401);
            }
        }

        const eventResult = processWebhookEvent(req.body);

        if (!eventResult.success) {
            return sendError(res, "Failed to process webhook event", 400);
        }

        const { eventType, eventData } = eventResult;

        // Handle payment completion
        if (eventType === "link.payment.paid") {
            const paymentLinkId = eventData.attributes.id;

            const payment = await findPayment(paymentLinkId, "paymentId");

            if (payment) {
                await prisma.payments.update({
                    where: { id: payment.id },
                    data: {
                        status: "paid",
                        paidAt: new Date(),
                        paymongoResponse: eventData,
                        updatedAt: new Date(),
                    },
                });
            }
        }

        return sendSuccess(res, null, "Webhook processed successfully");
    } catch (error) {
        console.error("Webhook handling error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

export const getAvailablePaymentMethods = async (req, res) => {
    try {
        const result = await getPaymentMethods();

        if (!result.success) {
            return sendError(
                res,
                "Failed to fetch payment methods",
                400,
                result.error
            );
        }

        return sendSuccess(res, result.data);
    } catch (error) {
        console.error("Get payment methods error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};

export default {
    createPayment,
    getPaymentDetails,
    getPaymentsByEnrollmentId,
    cancelPayment,
    handleWebhook,
    getAvailablePaymentMethods,
};
