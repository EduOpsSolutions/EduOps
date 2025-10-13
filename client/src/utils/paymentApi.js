/**
 * Payment API Utilities
 * Utility functions for payment-related operations
 */

/**
 * Generate a unique payment ID for display purposes
 * This is for UI display only and is not stored in the database
 * @returns {string} A unique 7-character payment ID in format PAY-XXXXXX
 */
export const generatePaymentId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomChars = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  
  return `PAY-${randomChars}`;
};

/**
 * Send payment link via email
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Email send result
 */
export const sendPaymentLinkEmail = async (paymentData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending payment link email:', error);
    return {
      success: false,
      error: 'Failed to send payment link email'
    };
  }
};
