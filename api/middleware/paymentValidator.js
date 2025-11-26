import Joi from 'joi';

// Validation Schemas
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    status: Joi.string().valid('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded').optional(),
    paymentMethod: Joi.string().optional(),
    feeType: Joi.string().optional(),
    dateFrom: Joi.string().isoDate().optional(),
    dateTo: Joi.string().isoDate().optional(),
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
    amountPaid: Joi.number().min(50).max(100000).precision(2).required().messages({
        'any.required': 'Amount paid is required',
        'number.min': 'Amount must be at least 50 PHP',
        'number.max': 'Amount cannot exceed 100,000 PHP'
    }),
    referenceNumber: Joi.string().max(100).required().messages({
        'any.required': 'Reference number is required'
    }),
    remarks: Joi.string().max(500).allow('', null).optional()
});

/**
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

// Exported Validators 
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

// Default Export for Backward Compatibility 
export default {
    validateCreateManualTransaction,
    validatePagination,
    validatePaymentId
};