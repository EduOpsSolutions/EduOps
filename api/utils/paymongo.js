import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// PayMongo API Configuration
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';
const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

/**
 * Create authorization header for PayMongo API
 * @returns {Object} Authorization headers
 */
const createAuthHeaders = () => {
    const encodedKey = Buffer.from(`${SECRET_KEY}:`).toString('base64');
    return {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};

/**
 * Create a Payment Link for checkout
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount in PHP (will be converted to centavos)
 * @param {string} paymentData.description - Payment description
 * @param {string} paymentData.remarks - Additional remarks
 * @returns {Promise<Object>} Payment link response
 */
export const createPaymentLink = async (paymentData) => {
    try {
        const { amount, description, remarks } = paymentData;
        const amountInCentavos = Math.round(amount * 100);

        const data = {
            data: {
                attributes: {
                    amount: amountInCentavos,
                    currency: 'PHP',
                    description: description || 'EduOps Payment',
                    remarks: remarks || 'Payment for EduOps services'
                }
            }
        };

        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/links`,
            data,
            { headers: createAuthHeaders() }
        );

        return {
            success: true,
            data: response.data,
            checkoutUrl: response.data.data.attributes.checkout_url,
            paymentLinkId: response.data.data.id
        };
    } catch (error) {
        console.error('PayMongo Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Retrieve payment link details
 * @param {string} paymentLinkId - Payment link ID
 * @returns {Promise<Object>} Payment link details
 */
export const getPaymentLink = async (paymentLinkId) => {
    try {
        const response = await axios.get(
            `${PAYMONGO_BASE_URL}/links/${paymentLinkId}`,
            { headers: createAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Get Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/* Archive (disable) a payment link */
export const archivePaymentLink = async (paymentLinkId) => {
    try {
        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/links/${paymentLinkId}/archive`,
            {},
            { headers: createAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Archive Payment Link Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Get list of available payment methods for the merchant
 * @returns {Promise<Object>} Available payment methods
 */
export const getPaymentMethods = async () => {
    try {
        const response = await axios.get(
            `${PAYMONGO_BASE_URL}/merchants/capabilities/payment_methods`,
            { headers: createAuthHeaders() }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('PayMongo Get Payment Methods Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

export default {
    createPaymentLink,
    getPaymentLink,
    archivePaymentLink,
    getPaymentMethods,
};