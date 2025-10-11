/**
 * Payment Constants
 * Centralized configuration and constants for payment operations
 */

// PayMongo API Configuration
export const PAYMONGO_CONFIG = {
  BASE_URL: 'https://api.paymongo.com/v1',
  ENDPOINTS: {
    LINKS: '/links',
    PAYMENTS: '/payments',
    PAYMENT_METHODS: '/payment_methods',
  },
  WEBHOOK_SECRET: process.env.PAYMONGO_WEBHOOK_SECRET,
  SECRET_KEY: process.env.PAYMONGO_SECRET_KEY
};

// PayMongo authentication headers utility
export const createPayMongoAuthHeaders = () => {
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
  'paymaya': 'PayMaya',
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
    users: {
      select: {
        id: true,
        student_id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true
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
  INVALID_PAYMENT_DATA: 'Invalid payment data provided',
  INTERNAL_SERVER_ERROR: 'Internal server error'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PAYMENT_CREATED: 'Payment created successfully',
  PAYMENT_CANCELLED: 'Payment cancelled successfully',
  PAYMENT_SYNCED: 'Payment status synced successfully',
  MANUAL_TRANSACTION_CREATED: 'Manual transaction created successfully'
};

// PayMongo webhook event types
// NOTE: PayMongo Links only support link.payment.paid, NOT link.payment.failed
// For failed payments with Links, manual expiration checker is implemented
export const PAYMONGO_EVENTS = {
  PAYMENT_PAID: 'payment.paid',
  PAYMENT_FAILED: 'payment.failed', 
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_REFUND_UPDATED: 'payment.refund.updated',
  PAYMENT_CANCELLED: 'payment.cancelled',
  PAYMENT_CANCELED: 'payment.canceled',
  LINK_PAYMENT_PAID: 'link.payment.paid', 
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
