import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// PayMongo API Configuration
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';
const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;

/**
 * Create authorization header for PayMongo API
 * @param {boolean} usePublicKey - Whether to use public key (for payment methods and client operations)
 * @returns {Object} Authorization headers
 */
const createAuthHeaders = (usePublicKey = false) => {
    const key = usePublicKey ? PUBLIC_KEY : SECRET_KEY;
    const encodedKey = Buffer.from(`${key}:`).toString('base64');
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

/**
 * Create a Payment Intent for card payments
 * @param {Object} intentData - Payment intent information
 * @param {number} intentData.amount - Amount in PHP (will be converted to centavos)
 * @param {string} intentData.description - Payment description
 * @param {string} intentData.statement_descriptor - Statement descriptor for card payments
 * @param {Array} intentData.payment_method_allowed - Allowed payment methods
 * @param {Object} intentData.payment_method_options - Payment method options
 * @param {Object} intentData.payment_method_data - Payment method data for direct processing
 * @param {boolean} intentData.confirm - Whether to confirm the payment intent immediately
 * @param {string} intentData.return_url - Return URL for payment methods that require redirect (like Maya)
 * @returns {Promise<Object>} Payment intent response
 */
export const createPaymentIntent = async (intentData) => {
    try {
        const { 
            amount, 
            description, 
            statement_descriptor,
            payment_method_allowed,
            payment_method_options,
            payment_method_data,
            confirm,
            return_url
        } = intentData;
        const amountInCentavos = Math.round(amount * 100);

        const data = {
            data: {
                attributes: {
                    amount: amountInCentavos,
                    payment_method_allowed: payment_method_allowed || ["card", "paymaya"],
                    payment_method_options: payment_method_options || {
                        card: { request_three_d_secure: "any" }
                    },
                    currency: "PHP",
                    description: description || "EduOps Payment",
                    statement_descriptor: statement_descriptor || "EduOps"
                }
            }
        };

        // Add return_url if provided (required for Maya payments)
        if (return_url) {
            data.data.attributes.return_url = return_url;
        }

        // Add payment method data and confirm if provided
        if (payment_method_data) {
            data.data.attributes.payment_method_data = payment_method_data;
        }

        if (confirm !== undefined) {
            data.data.attributes.confirm = confirm;
        }

        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/payment_intents`,
            data,
            { headers: createAuthHeaders() }
        );

        return {
            success: true,
            data: response.data,
            paymentIntentId: response.data.data.id,
            clientKey: response.data.data.attributes.client_key
        };
    } catch (error) {
        console.error('PayMongo Payment Intent Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Create a Payment Method for card payments
 * @param {Object} paymentMethodData - Payment method information
 * @param {Object} paymentMethodData.details - Card details
 * @param {Object} paymentMethodData.billing - Billing information
 * @returns {Promise<Object>} Payment method response
 */
export const createPaymentMethod = async (paymentMethodData) => {
    try {
        const { details, billing, type } = paymentMethodData;

        const data = {
            data: {
                attributes: {
                    billing,
                    type: type || "card" // Use provided type or default to card
                }
            }
        };

        // Only include details if it's provided and not empty
        if (details && Object.keys(details).length > 0) {
            data.data.attributes.details = details;
        }

        // No return_url here - it goes in attachment per latest PayMongo guidance

        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/payment_methods`,
            data,
            { headers: createAuthHeaders(true) } // Use public key
        );

        return {
            success: true,
            data: response.data,
            paymentMethodId: response.data.data.id
        };
    } catch (error) {
        console.error('PayMongo Payment Method Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Attach Payment Method to Payment Intent
 * @param {string} paymentIntentId - Payment intent ID
 * @param {string} paymentMethodId - Payment method ID
 * @param {string} clientKey - Client key from payment intent
 * @param {string} returnUrl - Return URL for payment methods that require redirect (like Maya)
 * @returns {Promise<Object>} Attach response
 */
export const attachPaymentMethodToIntent = async (paymentIntentId, paymentMethodId, clientKey, returnUrl) => {
    try {
        const data = {
            data: {
                attributes: {
                    payment_method: paymentMethodId,
                    client_key: clientKey
                }
            }
        };

        // Add return_url if provided (required for Maya payments)
        if (returnUrl) {
            data.data.attributes.return_url = returnUrl;
        }

        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}/attach`,
            data,
            { headers: createAuthHeaders(true) } // Use public key
        );

        return {
            success: true,
            data: response.data,
            status: response.data.data.attributes.status,
            nextAction: response.data.data.attributes.next_action
        };
    } catch (error) {
        console.error('PayMongo Attach Payment Method Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Create a Source for e-wallet payments (GCash, GrabPay, Maya)
 * @param {Object} sourceData - Source information
 * @param {number} sourceData.amount - Amount in PHP (will be converted to centavos)
 * @param {string} sourceData.type - Payment type (gcash, grab_pay, paymaya)
 * @param {Object} sourceData.billing - Billing information
 * @param {Object} sourceData.redirect - Redirect URLs
 * @returns {Promise<Object>} Source response
 */
export const createSource = async (sourceData) => {
    try {
        const { amount, type, billing, redirect } = sourceData;
        const amountInCentavos = Math.round(amount * 100);

        const data = {
            data: {
                attributes: {
                    amount: amountInCentavos,
                    redirect: redirect || {
                        success: `${process.env.CLIENT_URL}/payment`,
                        failed: `${process.env.CLIENT_URL}/payment`
                    },
                    billing,
                    source_type: type, // Changed from 'type' to 'source_type'
                    currency: 'PHP'
                }
            }
        };

        const response = await axios.post(
            `${PAYMONGO_BASE_URL}/sources`,
            data,
            { headers: createAuthHeaders(true) } // Use public key
        );

        return {
            success: true,
            data: response.data,
            sourceId: response.data.data.id,
            checkoutUrl: response.data.data.attributes.redirect.checkout_url
        };
    } catch (error) {
        console.error('PayMongo Source Error:', error.response?.data || error.message);
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
    createPaymentIntent,
    createPaymentMethod,
    attachPaymentMethodToIntent,
    createSource
};