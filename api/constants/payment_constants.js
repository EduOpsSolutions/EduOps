/**
 * Payment Constants
 * Centralized configuration and constants for payment operations
 */

// PayMongo API Configuration
export const PAYMONGO_CONFIG = {
  BASE_URL: 'https://api.paymongo.com/v1',
  ENDPOINTS: {
    PAYMENTS: '/payments',
    PAYMENT_INTENTS: '/payment_intents',
    PAYMENT_METHODS: '/payment_methods',
  },
  WEBHOOK_SECRET: process.env.PAYMONGO_WEBHOOK_SECRET,
  SECRET_KEY: process.env.PAYMONGO_SECRET_KEY
};

// PayMongo authentication headers utility
export const createPayMongoAuthHeaders = () => {
  if (!PAYMONGO_CONFIG.SECRET_KEY) {
    console.error('PayMongo SECRET_KEY is not set in environment variables');
    throw new Error('PayMongo SECRET_KEY is not configured');
  }
  
  const encodedKey = Buffer.from(`${PAYMONGO_CONFIG.SECRET_KEY}:`).toString('base64');
  return {
    'Authorization': `Basic ${encodedKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// PayMongo payment method mappings
export const PAYMONGO_METHOD_MAP = {
  'card': 'Credit/Debit Card',
  'gcash': 'GCash',
  'grab_pay': 'GrabPay',
  'paymaya': 'PayMaya',
  'bank_transfer': 'Bank Transfer',
  'over_the_counter': 'Over the Counter',
  'online_banking': 'Online Banking'
};

// Fee type mappings for display
export const FEE_TYPE_MAP = {
  'down_payment': 'Down Payment',
  'tuition_fee': 'Tuition Fee', 
  'document_fee': 'Document Fee',
  'book_fee': 'Book Fee',
};

// Payment status constants (matches Prisma enum)
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Database query includes for consistent data fetching
export const PAYMENT_INCLUDES = {
  WITH_USER: {
    user: {
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true
      }
    }
  },
  WITH_USER_FULL: {
    user: {
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true
      }
    }
  }
};

// Error messages
export const ERROR_MESSAGES = {
  PAYMENT_NOT_FOUND: 'Payment not found',
  USER_NOT_FOUND: 'User not found',
  PAYMENT_CANNOT_BE_CANCELLED: 'Payment cannot be cancelled',
  PAYMONGO_ERROR: 'PayMongo service error',
  INVALID_PAYMENT_DATA: 'Invalid payment data provided'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PAYMENT_CREATED: 'Payment created successfully',
  PAYMENT_CANCELLED: 'Payment cancelled successfully',
  PAYMENT_SYNCED: 'Payment status synced successfully'
};

// PayMongo webhook event types
export const PAYMONGO_EVENTS = {
  SOURCE_CHARGEABLE: 'source.chargeable',
  PAYMENT_PAID: 'payment.paid',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_REFUND_UPDATED: 'payment.refund.updated',
  PAYMENT_CANCELLED: 'payment.cancelled',
  PAYMENT_CANCELED: 'payment.canceled',
  LINK_PAYMENT_PAID: 'link.payment.paid',
  LINK_PAYMENT_FAILED: 'link.payment.failed',
  LINK_PAYMENT_EXPIRED: 'link.payment.expired',
  LINK_UPDATED: 'link.updated',
  LINK_STATUS_UPDATED: 'link.status.updated',
  LINK_ARCHIVED: 'link.archived',
  LINK_CANCELLED: 'link.cancelled',
  LINK_CANCELED: 'link.canceled'
};

export default {
  PAYMONGO_CONFIG,
  createPayMongoAuthHeaders,
  PAYMONGO_METHOD_MAP,
  FEE_TYPE_MAP,
  PAYMENT_STATUS,
  PAYMENT_INCLUDES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAYMONGO_EVENTS
};
