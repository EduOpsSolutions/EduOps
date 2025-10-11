import axiosInstance from './axios';

/**
 * Send payment link via email
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} API response
 */
export const sendPaymentLinkEmail = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/payments/send-email', paymentData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending payment link email:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send payment link email'
    };
  }
};

const paymentApi = {
  sendPaymentLinkEmail
};

export default paymentApi;