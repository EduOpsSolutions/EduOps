import { PrismaClient } from "@prisma/client";
import { sendPaymentReceiptEmail } from "./paymentEmailService.js";
import {
    getPaymentIntent as getPayMongoPaymentIntent,
    formatPaymentMethod,
} from "./paymongo_service.js";
import { generatePaymentId } from "./payment_service.js";
import { PAYMENT_INCLUDES } from "../constants/payment_constants.js";

const prisma = new PrismaClient();

/**
 * Extract payment method from PayMongo intent data
 */
const extractPaymentMethod = async (payment, intentData) => {
    let finalPaymentMethod = payment.paymentMethod;

    if (finalPaymentMethod !== "Online Payment") {
        return finalPaymentMethod;
    }

    console.log(
        "Attempting to extract payment method from PayMongo intent data:",
        JSON.stringify(intentData, null, 2)
    );

    let sourceType = null;

    if (intentData?.payments && intentData.payments.length > 0) {
        const paymentData = intentData.payments[0];
        console.log(
            "Payment data from payments array:",
            JSON.stringify(paymentData, null, 2)
        );

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
        console.log(
            `Extracted payment method from PayMongo: ${extractedMethod} (source: ${sourceType})`
        );
        finalPaymentMethod = extractedMethod;

        try {
            await prisma.payments.update({
                where: { id: payment.id },
                data: { paymentMethod: extractedMethod },
            });
            console.log(`Updated payment method in database: ${extractedMethod}`);
        } catch (updateError) {
            console.error("Failed to update payment method:", updateError);
        }
    } else {
        console.log("Could not extract payment method from PayMongo response");
    }

    return finalPaymentMethod;
};

/**
 * Send receipt email for payment
 */
const sendReceiptEmail = async (payment, finalPaymentMethod, context = "status sync") => {
    if (!payment.user || (!payment.paymentEmail && !payment.user.email)) {
        return;
    }

    const recipientEmail = payment.paymentEmail || payment.user.email;
    const bccEmail = payment.paymentEmail && payment.user.email !== payment.paymentEmail
        ? payment.user.email
        : undefined;

    console.log(
        `Sending payment receipt email to ${recipientEmail} after ${context}${bccEmail ? ` (BCC: ${bccEmail})` : ''}`
    );

    try {
        const emailSent = await sendPaymentReceiptEmail(
            recipientEmail,
            {
                transactionId: payment.transactionId,
                referenceNumber: payment.referenceNumber,
                amount: parseFloat(payment.amount),
                paymentMethod: finalPaymentMethod,
                feeType: payment.feeType,
                remarks: payment.remarks,
                paidAt: payment.paidAt,
                createdAt: payment.createdAt,
                currency: payment.currency || "PHP",
            },
            {
                studentName: `${payment.user.firstName} ${payment.user.lastName}`,
                firstName: payment.user.firstName,
                lastName: payment.user.lastName,
                email: payment.user.email,
                student_id: payment.user.userId,
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
            `Error sending payment receipt email after ${context}:`,
            emailError
        );
    }
};

/**
 * Extract derived payment IDs from intent data
 */
const extractDerivedPaymentIds = (paymongoResult) => {
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

        console.log("[CheckStatus] derived paymongo payment/ref:", {
            intentDerivedPaymentId,
            intentDerivedReference,
        });
    } catch (e) {
        console.warn("Unable to derive payment id from intent:", e);
    }

    return { intentDerivedPaymentId, intentDerivedReference };
};

/**
 * Find payment by intent ID or reference
 */
const findPaymentRecord = async (paymentIntentId, intentDerivedPaymentId, intentDerivedReference, paymongoResult) => {
    let payment = await prisma.payments.findFirst({
        where: { paymentIntentId: paymentIntentId },
        include: PAYMENT_INCLUDES.WITH_USER,
    });

    console.log("[CheckStatus] db payment by intent:", {
        found: !!payment,
        status: payment?.status,
        hasPaymentEmail: !!payment?.paymentEmail,
        paymentEmail: payment?.paymentEmail,
        userEmail: payment?.user?.email,
    });

    if (!payment) {
        payment = await prisma.payments.findFirst({
            where: { referenceNumber: paymentIntentId },
            include: PAYMENT_INCLUDES.WITH_USER,
        });
        console.log("[CheckStatus] db payment by referenceNumber:", {
            found: !!payment,
            status: payment?.status,
        });
    }

    if (!payment) {
        const recentPayments = await prisma.payments.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            select: {
                id: true,
                transactionId: true,
                paymentIntentId: true,
                referenceNumber: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        const unmatchedPayment = recentPayments.find(
            (p) => !p.paymentIntentId && p.status === "pending"
        );

        if (unmatchedPayment) {
            try {
                payment = await prisma.payments.update({
                    where: { id: unmatchedPayment.id },
                    data: {
                        paymentIntentId: paymentIntentId,
                        referenceNumber: intentDerivedPaymentId || intentDerivedReference,
                        status:
                            paymongoResult?.success &&
                                paymongoResult.data?.data?.attributes?.status === "succeeded"
                                ? "paid"
                                : "pending",
                        paidAt:
                            paymongoResult?.success &&
                                paymongoResult.data?.data?.attributes?.status === "succeeded"
                                ? new Date()
                                : null,
                    },
                    include: PAYMENT_INCLUDES.WITH_USER,
                });
            } catch (updateError) {
                console.error("Failed to update existing payment record:", updateError);
            }
        }
    }

    return payment;
};

/**
 * Create payment from PayMongo data
 */
const createPaymentFromPaymongoData = async (paymentIntentId, intentDerivedPaymentId, intentDerivedReference, paymongoResult) => {
    if (!paymongoResult?.success) {
        return null;
    }

    const intentData = paymongoResult.data?.data?.attributes;
    const paymongoAmount = intentData?.amount ? intentData.amount / 100 : null;

    try {
        const customTransactionId = await generatePaymentId();
        let userId = null;
        let feeType = "unknown";
        let remarks = "Payment created from PayMongo data";

        const description = intentData?.description || "";
        console.log(`PayMongo description: ${description}`);

        const recentPayments = await prisma.payments.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
                },
                amount: paymongoAmount || 0,
            },
            select: {
                userId: true,
                feeType: true,
                remarks: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
        });

        if (recentPayments.length > 0) {
            userId = recentPayments[0].userId;
            feeType = recentPayments[0].feeType || "unknown";
            remarks = recentPayments[0].remarks || description;
        } else {
            const existingUser = await prisma.users.findFirst({
                select: { id: true },
            });
            if (existingUser) {
                userId = existingUser.id;
            }
        }

        const payment = await prisma.payments.create({
            data: {
                transactionId: customTransactionId,
                userId: userId,
                amount: paymongoAmount || 0,
                status: intentData?.status === "succeeded" ? "paid" : "pending",
                paymentMethod: "Online Payment",
                paymentIntentId: paymentIntentId,
                referenceNumber: intentDerivedPaymentId || intentDerivedReference,
                feeType: feeType,
                remarks: remarks,
                paidAt: intentData?.status === "succeeded" ? new Date() : null,
            },
            include: PAYMENT_INCLUDES.WITH_USER,
        });

        console.log(
            `Created payment record from PayMongo data: ${payment.id} with userId: ${userId}`
        );

        return payment;
    } catch (createError) {
        console.error("Failed to create payment record from PayMongo data:", createError);
        return null;
    }
};

/**
 * Update payment status based on PayMongo data
 */
const updatePaymentStatus = async (payment, intentData, finalPaymentMethod) => {
    const paymongoIntentStatus = intentData?.status;

    console.log("[CheckStatus] RAW INTENT DATA - Status:", paymongoIntentStatus, "| Payments count:", intentData?.payments?.length || 0);

    // Check actual payment status from payments array
    let actualPaymentStatus = null;
    if (intentData?.payments && intentData.payments.length > 0) {
        const latestPayment = intentData.payments[0];
        actualPaymentStatus = latestPayment.attributes?.status || latestPayment.data?.attributes?.status;
        console.log("[CheckStatus] Actual payment status from payments array:", actualPaymentStatus);
        console.log("[CheckStatus] Payment details:", {
            id: latestPayment.id || latestPayment.data?.id,
            status: actualPaymentStatus,
            failed_code: latestPayment.attributes?.failed_code || latestPayment.data?.attributes?.failed_code,
            failed_message: latestPayment.attributes?.failed_message || latestPayment.data?.attributes?.failed_message,
        });
    } else {
        console.log("[CheckStatus] No payments in payments array yet");
    }

    console.log("[CheckStatus] Intent status:", paymongoIntentStatus);
    console.log("[CheckStatus] Payment status:", actualPaymentStatus);

    // Check if payment succeeded
    if (paymongoIntentStatus === "succeeded" || actualPaymentStatus === "paid") {
        console.log("[CheckStatus] Payment transitioning from pending to paid");

        // Extract payment ID for reference number
        let paymentReferenceNumber = payment.referenceNumber;
        if (intentData?.payments && intentData.payments.length > 0) {
            const paidPayment = intentData.payments[0];
            const paymentId = paidPayment.id || paidPayment.data?.id;
            if (paymentId) {
                paymentReferenceNumber = paymentId;
                console.log("[CheckStatus] 📝 Extracted reference number:", paymentId);
            }
        }

        await prisma.payments.update({
            where: { id: payment.id },
            data: {
                status: "paid",
                paidAt: new Date(),
                referenceNumber: paymentReferenceNumber,
            },
        });

        payment.status = "paid";
        payment.paidAt = new Date();
        payment.referenceNumber = paymentReferenceNumber;

        await sendReceiptEmail(payment, finalPaymentMethod, "status sync");
    }
    // Check if payment failed
    else if (actualPaymentStatus === "failed") {
        console.log("[CheckStatus] Payment transitioning from pending to failed");

        const failedPayment = intentData.payments[0];
        const failedCode = failedPayment.attributes?.failed_code || failedPayment.data?.attributes?.failed_code;
        const failedMessage = failedPayment.attributes?.failed_message || failedPayment.data?.attributes?.failed_message;
        const paymentId = failedPayment.id || failedPayment.data?.id;

        console.log("[CheckStatus] Failed details:", {
            code: failedCode,
            message: failedMessage,
            paymentId: paymentId,
        });

        await prisma.payments.update({
            where: { id: payment.id },
            data: {
                status: "failed",
                referenceNumber: paymentId || payment.referenceNumber,
            },
        });

        payment.status = "failed";
        console.log("[CheckStatus] Payment status updated to failed in database");
    }
    // Check if payment was refunded
    else if (actualPaymentStatus === "refunded") {
        console.log("[CheckStatus] Payment transitioning from pending to refunded");

        const refundedPayment = intentData.payments[0];
        const paymentId = refundedPayment.id || refundedPayment.data?.id;
        const refunds = refundedPayment.attributes?.refunds || refundedPayment.data?.attributes?.refunds || [];

        console.log("[CheckStatus] Refund details:", {
            paymentId: paymentId,
            refundsCount: refunds.length,
        });

        await prisma.payments.update({
            where: { id: payment.id },
            data: {
                status: "refunded",
                referenceNumber: paymentId || payment.referenceNumber,
            },
        });

        payment.status = "refunded";
        console.log("[CheckStatus] Payment status updated to refunded in database");
    }
};

/**
 * Check if paid payment needs refund status update
 */
const checkPaidPaymentForRefund = async (payment, intentData) => {
    console.log("[CheckStatus] 🔵 Checking paid payment for refund:", {
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        hasPayments: !!(intentData?.payments && intentData.payments.length > 0),
    });

    if (intentData?.payments && intentData.payments.length > 0) {
        const latestPayment = intentData.payments[0];
        const actualPaymentStatus = latestPayment.attributes?.status || latestPayment.data?.attributes?.status;
        const refunds = latestPayment.attributes?.refunds || latestPayment.data?.attributes?.refunds || [];

        console.log("[CheckStatus] Payment status check from intent:", {
            actualPaymentStatus,
            hasRefunds: refunds.length > 0,
            refundsCount: refunds.length,
            fullRefundsArray: JSON.stringify(refunds, null, 2),
        });

        // Check both status and refunds array
        if (actualPaymentStatus === "refunded" || refunds.length > 0) {
            console.log("[CheckStatus] Paid payment transitioning to refunded");

            await prisma.payments.update({
                where: { id: payment.id },
                data: {
                    status: "refunded",
                },
            });

            payment.status = "refunded";
            console.log("[CheckStatus] Paid payment status updated to refunded in database");
        }
    }
};

/**
 * Main function to check and sync payment status
 */
export const checkAndSyncPaymentStatus = async (paymentIntentId) => {
    console.log("[CheckStatus] start for intent:", paymentIntentId);

    const paymongoResult = await getPayMongoPaymentIntent(paymentIntentId);
    console.log("[CheckStatus] paymongo intent fetch ok:", !!paymongoResult?.success);

    const { intentDerivedPaymentId, intentDerivedReference } = extractDerivedPaymentIds(paymongoResult);

    let payment = await findPaymentRecord(
        paymentIntentId,
        intentDerivedPaymentId,
        intentDerivedReference,
        paymongoResult
    );

    if (!payment) {
        payment = await createPaymentFromPaymongoData(
            paymentIntentId,
            intentDerivedPaymentId,
            intentDerivedReference,
            paymongoResult
        );
    }

    if (!payment) {
        throw new Error(
            "Payment not found. The payment may still be processing. Please wait for the webhook or contact support."
        );
    }

    console.log(
        `Payment found: ${payment.id}, status: ${payment.status}, paymentMethod: ${payment.paymentMethod}`
    );

    let finalPaymentMethod = payment.paymentMethod;
    if (paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        finalPaymentMethod = await extractPaymentMethod(payment, intentData);
    }

    // Check if payment just became paid (within last 10 seconds)
    const isRecentlyPaid = payment.status === "paid" && payment.paidAt &&
        (new Date() - new Date(payment.paidAt)) < 10 * 1000;

    console.log("[CheckStatus] PAYMENT STATUS CHECK:", {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        currentDBStatus: payment.status,
        hasPaymongoResult: !!paymongoResult?.success,
    });

    if (payment.status === "pending" && paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        await updatePaymentStatus(payment, intentData, finalPaymentMethod);
    }

    // Check if paid payment needs refund update
    if (payment.status === "paid" && paymongoResult?.success) {
        const intentData = paymongoResult.data?.data?.attributes;
        await checkPaidPaymentForRefund(payment, intentData);
    } else if (isRecentlyPaid) {
        console.log("[CheckStatus] Payment is recently paid, checking if receipt email should be sent");
        console.log("[CheckStatus] Payment paid at:", payment.paidAt);
        console.log("[CheckStatus] Time since paid:", Math.round((new Date() - new Date(payment.paidAt)) / 1000), "seconds");

        await sendReceiptEmail(payment, finalPaymentMethod, "[CheckStatus] recently paid payment");
    }

    const statusMap = {
        paid: "succeeded",
        pending: "awaiting_payment_method",
        failed: "failed",
        cancelled: "cancelled",
        refunded: "refunded",
    };

    return {
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
        user: payment.user
            ? {
                firstName: payment.user.firstName,
                lastName: payment.user.lastName,
                email: payment.user.email,
            }
            : null,
    };
};
