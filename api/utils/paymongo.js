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
 * Create a Payment Intent for card payments
 * @param {Object} intentData - Payment intent information
 * @param {number} intentData.amount - Amount in PHP (will be converted to centavos)
 * @param {string} intentData.description - Payment description
 * @param {string} intentData.statement_descriptor - Statement descriptor for card payments
 * @param {Array} intentData.payment_method_allowed - Allowed payment methods
 * @param {Object} intentData.payment_method_options - Payment method options
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



export default {
    createPaymentIntent,
    createPaymentMethod,
    attachPaymentMethodToIntent
};