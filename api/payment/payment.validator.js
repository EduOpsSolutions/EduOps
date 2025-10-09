import Joi from 'joi';

/**
 * Payment Validators
 * Consolidated input validation for payment operations
 */

// ==================== Validation Schemas ====================

const createPaymentSchema = Joi.object({
    userId: Joi.string().min(1).max(100).required().messages({
        'any.required': 'User ID is required',
        'string.empty': 'User ID cannot be empty',
        'string.min': 'User ID must be at least 1 character long'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email address is required',
        'string.email': 'Please provide a valid email address'
    }),
    phoneNumber: Joi.string().max(20).allow('', null).optional(),
    feeType: Joi.string().min(1).max(100).required().messages({
        'any.required': 'Fee type is required',
        'string.empty': 'Fee type cannot be empty'
    }),
    amount: Joi.number().min(1).max(100000).precision(2).required().messages({
        'any.required': 'Amount is required',
        'number.min': 'Amount must be at least 1 PHP',
        'number.max': 'Amount cannot exceed 100,000 PHP'
    })
}).unknown(true);

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    status: Joi.string().valid('pending', 'paid', 'failed', 'expired', 'cancelled').optional(),
    search: Joi.string().optional(),
    searchTerm: Joi.string().optional()
});

const createManualTransactionSchema = Joi.object({
    studentId: Joi.string().min(1).max(100).required().messages({
        'any.required': 'Student ID is required',
        'string.empty': 'Student ID cannot be empty'
    }),
    firstName: Joi.string().min(1).max(100).optional(),
    lastName: Joi.string().min(1).max(100).optional(),
    purpose: Joi.string().min(1).max(100).required().messages({
        'any.required': 'Fee type (purpose) is required',
        'string.empty': 'Fee type cannot be empty'
    }),
    paymentMethod: Joi.string().min(1).max(50).optional(),
    amountPaid: Joi.number().min(1).max(100000).precision(2).required().messages({
        'any.required': 'Amount paid is required',
        'number.min': 'Amount must be at least 1 PHP',
        'number.max': 'Amount cannot exceed 100,000 PHP'
    }),
    referenceNumber: Joi.string().max(100).required().messages({
        'any.required': 'Reference number is required'
    }),
    remarks: Joi.string().max(500).allow('', null).optional()
});

// ==================== Validator Factory ====================

/**
 * Create a validator middleware function
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 * @param {Object} options - Joi validation options
 * @returns {Function} Express middleware function
 */
const createValidator = (schema, source = 'body', options = {}) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: source === 'query',
            allowUnknown: source === 'body',
            ...options
        });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errorMessages
            });
        }

        // Don't modify req.query as it's read-only in newer Express versions
        if (source !== 'query') {
            req[source] = value;
        }
        next();
    };
};

/**
 * Create parameter validator
 * @param {string} paramName - Parameter name to validate
 * @param {Object} schema - Joi schema for the parameter
 * @param {string} errorMessage - Error message for validation failure
 * @returns {Function} Express middleware function
 */
const validateParam = (paramName, schema, errorMessage) => (req, res, next) => {
    const { error } = schema.validate(req.params[paramName]);
    if (error) {
        return res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
    next();
};

// ==================== Exported Validators ====================

export const validateCreatePayment = createValidator(createPaymentSchema, 'body', {
    stripUnknown: false,
    allowUnknown: true
});

export const validateCreateManualTransaction = createValidator(createManualTransactionSchema, 'body', {
    stripUnknown: false,
    allowUnknown: true
});

export const validatePagination = createValidator(paginationSchema, 'query');

export const validatePaymentId = validateParam(
    'paymentId', 
    Joi.string().required().min(1), 
    'Valid payment ID is required'
);

export const validateUserId = validateParam(
    'userId', 
    Joi.string().required().min(1), 
    'Valid user ID is required'
);

export const validateEmail = validateParam(
    'email', 
    Joi.string().email().required(), 
    'Valid email address is required'
);

export const validateEnrollmentId = validateParam(
    'enrollmentId', 
    Joi.string().required().min(1), 
    'Valid enrollment ID is required'
);

// ==================== Default Export for Backward Compatibility ====================

export default {
    validateCreatePayment,
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId,
    validateUserId,
    validateEmail,
    validateEnrollmentId
};