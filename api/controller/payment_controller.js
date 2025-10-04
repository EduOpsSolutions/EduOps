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

// Fee type name
const FEE_TYPE_MAP = {
    'tuition_fee': 'Tuition Fee',
    'document_fee': 'Document Fee',
    'book_fee': 'Book Fee',
};

// Response helpers
const sendSuccess = (res, data, message = "Operation successful", statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, message, statusCode = 500, error = null) => {
    const response = { success: false, message };
    if (error) response.error = error;
    return res.status(statusCode).json(response);
};

// Generate unique payment ID
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
        const { userId, firstName, middleName, lastName, email, phoneNumber, feeType, amount } = req.body;

        const feeName = FEE_TYPE_MAP[feeType] || feeType;
        const paymentAmount = parseFloat(amount);
        const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
        const paymentDescription = `${feeName} - Payment for ${fullName}`;

        // Create payment link
        const paymentLinkResult = await createPaymentLink({
            amount: paymentAmount,
            description: paymentDescription,
            remarks: `EduOps ${feeType} payment`,
        });

        if (!paymentLinkResult.success) {
            return sendError(res, "Failed to create payment link", 400, paymentLinkResult.error);
        }

        // Save payment record
        const customPaymentId = await generatePaymentId();
        const payment = await prisma.payments.create({
            data: {
                id: customPaymentId,
                paymentId: paymentLinkResult.paymentLinkId,
                userId: userId,
                firstName,
                middleName: middleName || null,
                lastName,
                email,
                phoneNumber: phoneNumber || null,
                feeType,
                amount: paymentAmount,
                checkoutUrl: paymentLinkResult.checkoutUrl,
                paymongoResponse: paymentLinkResult.data,
                status: "pending",
            },
        });

        // Send payment link email
        await sendPaymentLinkEmail(email, payment.checkoutUrl, {
            amount: paymentAmount,
            description: paymentDescription,
            remarks: `EduOps ${feeType} payment`,
        }, { firstName, lastName, email });

        return sendSuccess(res, {
            paymentId: payment.id,
            checkoutUrl: payment.checkoutUrl,
            amount: payment.amount,
            status: payment.status,
        }, "Payment link created successfully", 201);
    } catch (error) {
        console.error("Create payment error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};


export const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payments.findUnique({
            where: { id: paymentId },
            include: {
                user: { select: { id: true, userId: true, firstName: true, lastName: true, email: true } },
            },
        });

        if (!payment) {
            return sendError(res, "Payment not found", 404);
        }

        // Sync status with PayMongo
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

        return sendSuccess(res, payment);
    } catch (error) {
        console.error("Get payment details error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};



export const getPaymentsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return sendError(res, "User not found", 404);
        }

        const whereClause = { userId };
        if (status) whereClause.status = status;

        const [payments, total] = await Promise.all([
            prisma.payments.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: parseInt(limit),
                include: {
                    user: { select: { id: true, userId: true, firstName: true, lastName: true, email: true } },
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
        console.error("Get payments by user ID error:", error);
        return sendError(res, "Internal server error", 500, error.message);
    }
};



export const cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payments.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            return sendError(res, "Payment not found", 404);
        }

        if (payment.status !== "pending") {
            return sendError(res, "Payment cannot be cancelled", 400);
        }

        // Archive payment link in PayMongo
        const archiveResult = await archivePaymentLink(payment.paymentId);
        if (!archiveResult.success) {
            return sendError(res, "Failed to cancel payment", 400, archiveResult.error);
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
            const payment = await prisma.payments.findFirst({
                where: { paymentId: paymentLinkId },
            });

            if (payment) {
                await prisma.payments.update({
                    where: { id: payment.id },
                    data: {
                        status: "paid",
                        paidAt: new Date(),
                        paymongoResponse: eventData,
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
            return sendError(res, "Failed to fetch payment methods", 400, result.error);
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
    getPaymentsByUserId,
    cancelPayment,
    handleWebhook,
    getAvailablePaymentMethods,
};
