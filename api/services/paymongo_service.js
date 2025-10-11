import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { 
  PAYMONGO_CONFIG, 
  PAYMONGO_METHOD_MAP,
  PAYMONGO_EVENTS 
} from '../constants/payment_constants.js';

const prisma = new PrismaClient();

// PayMongo webhook processing

// Extract payment method from PayMongo webhook data
export const getPaymentMethodFromPayMongo = (eventData) => {
  let paymentMethod = "Online Payment"; // Default fallback

  try {
    if (
      eventData.attributes?.payments &&
      eventData.attributes.payments.length > 0
    ) {
      const payment = eventData.attributes.payments[0];
      if (payment.data?.attributes?.source?.type) {
        paymentMethod = formatPaymentMethod(
          payment.data.attributes.source.type
        );
        return paymentMethod;
      }
    }

    if (eventData.attributes?.source?.type) {
      paymentMethod = formatPaymentMethod(eventData.attributes.source.type);
    } else if (eventData.attributes?.payment_method?.type) {
      paymentMethod = formatPaymentMethod(
        eventData.attributes.payment_method.type
      );
    } else if (eventData.attributes?.payment_method_used) {
      paymentMethod = formatPaymentMethod(
        eventData.attributes.payment_method_used
      );
    } else if (eventData.attributes?.method) {
      paymentMethod = formatPaymentMethod(eventData.attributes.method);
    }
  } catch (error) {
    console.error("Error extracting payment method:", error);
  }

  return paymentMethod;
};

export const formatPaymentMethod = (rawMethod) => {
  if (!rawMethod) return "Online Payment";

  const lowerMethod = rawMethod.toLowerCase();
  return (
    PAYMONGO_METHOD_MAP[lowerMethod] ||
    rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1)
  );
};

// Verify PayMongo webhook signature
export const verifyWebhookSignature = (req) => {
  const webhookSecret = PAYMONGO_CONFIG.WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Webhook secret not configured");
  }

  const signature = req.get("Paymongo-Signature");
  if (!signature) {
    throw new Error("Missing Paymongo-Signature header");
  }

  const sigParts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = sigParts.t;
  const testSignature = sigParts.te;
  const liveSignature = sigParts.li;

  const expectedSignature =
    process.env.NODE_ENV === "production" ? liveSignature : testSignature;

  const rawBody = JSON.stringify(req.body);
  const signatureString = `${timestamp}.${rawBody}`;

  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signatureString)
    .digest("hex");

  if (computedSignature !== expectedSignature) {
    throw new Error("Invalid webhook signature");
  }

  return true;
};

// Process PayMongo webhook event
export const processWebhookEvent = async (event) => {
  const eventType = event.data.attributes.type;
  const eventData = event.data.attributes.data;

  console.log(`Webhook received: ${eventType} (${eventData.id})`);

  let paymentRecord = null;
  let updateData = {};

  switch (eventType) {
    case PAYMONGO_EVENTS.LINK_PAYMENT_PAID:
      const linkPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: linkPaymentMethod,
        referenceNumber: eventData.attributes.reference_number,
        paymongoId: eventData.id,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_PAID:
      const directPaymentMethod = getPaymentMethodFromPayMongo(eventData);
      updateData = {
        status: "paid",
        paidAt: new Date(),
        paymentMethod: directPaymentMethod,
        referenceNumber: eventData.attributes.reference_number,
        paymongoId: eventData.id,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
      break;

    case PAYMONGO_EVENTS.PAYMENT_FAILED:
      updateData = {
        status: "failed",
        referenceNumber: eventData.attributes.reference_number,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
      break;

    case PAYMONGO_EVENTS.LINK_PAYMENT_EXPIRED:
      updateData = {
        status: "failed",
        referenceNumber: eventData.attributes.reference_number,
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: eventData.id
        },
      });

      if (!paymentRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        paymentRecord = await prisma.payments.findFirst({
          where: {
            status: 'pending',
            paymentMethod: 'Online Payment',
            createdAt: { gte: yesterday }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
      break;

    case PAYMONGO_EVENTS.LINK_UPDATED:
    case PAYMONGO_EVENTS.LINK_STATUS_UPDATED:
      const linkStatus = eventData.attributes.status;
      
      if (linkStatus === 'failed' || linkStatus === 'expired' || linkStatus === 'unpaid') {
        updateData = {
          status: "failed",
          paymongoId: eventData.id,
          paymongoResponse: JSON.stringify(event),
        };

        paymentRecord = await prisma.payments.findFirst({
          where: {
            OR: [
              { paymongoId: eventData.id },
              { referenceNumber: eventData.attributes.reference_number },
            ],
          },
        });
      }
      break;

    case PAYMONGO_EVENTS.LINK_ARCHIVED:
    case PAYMONGO_EVENTS.LINK_CANCELLED:
    case PAYMONGO_EVENTS.LINK_CANCELED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELLED:
    case PAYMONGO_EVENTS.PAYMENT_CANCELED:
      updateData = {
        status: "cancelled",
        paymongoResponse: JSON.stringify(event),
      };

      paymentRecord = await prisma.payments.findFirst({
        where: {
          OR: [
            { paymongoId: eventData.id },
            { referenceNumber: eventData.attributes.reference_number },
          ],
        },
      });
      break;

    case PAYMONGO_EVENTS.PAYMENT_REFUNDED:
    case PAYMONGO_EVENTS.PAYMENT_REFUND_UPDATED:
      const refundedPaymentId = eventData.attributes.payment_id;
      
      updateData = {
        status: "refunded",
        paymongoResponse: JSON.stringify(event),
      };

      // For refunds, we need to be very specific to avoid updating wrong payments
      // First try to find by the exact payment_id from the refund event
      paymentRecord = await prisma.payments.findFirst({
        where: {
          paymongoId: refundedPaymentId
        },
      });

      // Only if not found by payment_id, try reference number as fallback
      if (!paymentRecord && eventData.attributes.reference_number) {
        paymentRecord = await prisma.payments.findFirst({
          where: {
            referenceNumber: eventData.attributes.reference_number
          },
        });
      }

      // Log the refund attempt for debugging
      if (paymentRecord) {
        console.log(`Refund webhook: Found payment ${paymentRecord.id} (${paymentRecord.referenceNumber}) for refund of ${refundedPaymentId}`);
      } else {
        console.log(`Refund webhook: No payment found for refund of ${refundedPaymentId}`);
      }
      break;

    default:
      return {
        handled: false,
        message: "Event type not handled but acknowledged",
      };
  }

  if (paymentRecord && Object.keys(updateData).length > 0) {
    await prisma.payments.update({
      where: { id: paymentRecord.id },
      data: updateData,
    });

    console.log(`Payment ${paymentRecord.id}: ${paymentRecord.status} → ${updateData.status}`);

    return {
      handled: true,
      message: "Payment updated successfully",
      paymentId: paymentRecord.id,
    };
  } else if (!paymentRecord) {
    console.warn(`Payment not found for PayMongo ID: ${eventData.id}`);
    return {
      handled: false,
      message: "Payment record not found",
    };
  }

  return {
    handled: true,
    message: "Event processed successfully",
  };
};
