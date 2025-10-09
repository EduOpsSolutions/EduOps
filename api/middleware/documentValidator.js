import { body, param, query, validationResult } from 'express-validator';

// Validation helper to check for errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            message: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Document Template Validations
const validateCreateDocumentTemplate = [
    body('documentName')
        .notEmpty()
        .withMessage('Document name is required')
        .isLength({ max: 255 })
        .withMessage('Document name must be less than 255 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    
    body('privacy')
        .optional()
        .isIn(['public', 'student_only', 'teacher_only', "Student's Only", "Teacher's Only", 'Public'])
        .withMessage('Invalid privacy setting'),
    
    body('requestBasis')
        .optional()
        .isIn(['Yes', 'No', true, false])
        .withMessage('Request basis must be Yes or No'),
    
    body('downloadable')
        .optional()
        .isIn(['Yes', 'No', true, false])
        .withMessage('Downloadable must be Yes or No'),
    
    body('price')
        .optional()
        .isIn(['Free', 'Paid', 'free', 'paid'])
        .withMessage('Price must be Free or Paid'),
    
    body('amount')
        .optional()
        .custom((value, { req }) => {
            if (req.body.price === 'Paid' || req.body.price === 'paid') {
                if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
                    throw new Error('Amount is required and must be a positive number for paid documents');
                }
            }
            return true;
        }),
    
    handleValidationErrors
];

const validateUpdateDocumentTemplate = [
    param('id')
        .isString()
        .withMessage('Document ID must be provided'),
    
    ...validateCreateDocumentTemplate.slice(0, -1), 
    handleValidationErrors
];

// Document Request Validations
const validateCreateDocumentRequest = [
    body('documentId')
        .notEmpty()
        .withMessage('Document ID is required'),
    
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),
    
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Valid phone number is required'),
    
    body('mode')
        .optional()
        .isIn(['pickup', 'delivery'])
        .withMessage('Mode must be either pickup or delivery'),
    
    body('address')
        .optional()
        .custom((value, { req }) => {
            if (req.body.mode === 'delivery' && !value) {
                throw new Error('Address is required for delivery mode');
            }
            return true;
        }),
    
    body('city')
        .optional()
        .custom((value, { req }) => {
            if (req.body.mode === 'delivery' && !value) {
                throw new Error('City is required for delivery mode');
            }
            return true;
        }),
    
    body('purpose')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Purpose must be less than 500 characters'),
    
    body('additionalNotes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Additional notes must be less than 1000 characters'),
    
    handleValidationErrors
];

const validateUpdateDocumentRequestStatus = [
    param('id')
        .isString()
        .withMessage('Request ID must be provided'),
    
    body('status')
        .isIn(['in_process', 'in_transit', 'delivered', 'failed', 'fulfilled', 'In Process', 'In Transit', 'Delivered', 'Failed', 'Fulfilled'])
        .withMessage('Invalid status'),
    
    body('remarks')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Remarks must be less than 500 characters'),
    
    handleValidationErrors
];

// Document Validation Validations
const validateCreateDocumentValidation = [
    body('documentName')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Document name must be less than 255 characters'),
    
    body('userId')
        .optional()
        .isString()
        .withMessage('User ID must be a valid string'),
    
    handleValidationErrors
];

const validateVerifySignature = [
    param('signature')
        .isLength({ min: 8, max: 32 })
        .isAlphanumeric()
        .withMessage('Invalid signature format'),
    
    handleValidationErrors
];

// Search Validations
const validateSearchDocumentTemplates = [
    query('documentName')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Document name search term too long'),
    
    query('privacy')
        .optional()
        .isIn(['public', 'student_only', 'teacher_only', "Student's Only", "Teacher's Only", 'Public'])
        .withMessage('Invalid privacy filter'),
    
    query('price')
        .optional()
        .isIn(['Free', 'Paid', 'free', 'paid'])
        .withMessage('Invalid price filter'),
    
    query('includeHidden')
        .optional()
        .isBoolean()
        .withMessage('Include hidden must be a boolean'),
    
    handleValidationErrors
];

const validateSearchDocumentRequests = [
    query('name')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Name search term too long'),
    
    query('document')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Document search term too long'),
    
    query('status')
        .optional()
        .isIn(['in_process', 'in_transit', 'delivered', 'failed', 'fulfilled', 'In Process', 'In Transit', 'Delivered', 'Failed', 'Fulfilled'])
        .withMessage('Invalid status filter'),
    
    query('sortBy')
        .optional()
        .isIn(['ascending', 'descending'])
        .withMessage('Sort by must be ascending or descending'),
    
    handleValidationErrors
];

const validateSearchDocumentValidations = [
    query('fileSignature')
        .optional()
        .isLength({ max: 32 })
        .withMessage('File signature search term too long'),
    
    query('documentName')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Document name search term too long'),
    
    handleValidationErrors
];

// File operation validations
const validateFilename = [
    param('filename')
        .notEmpty()
        .withMessage('Filename is required')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage('Invalid filename format'),
    
    handleValidationErrors
];

// Role-based access validation middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        
        if (!userRole) {
            return res.status(401).json({
                error: true,
                message: 'Authentication required'
            });
        }
        
        if (roles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({
                error: true,
                message: 'Insufficient permissions'
            });
        }
    };
};

// Export all validations
export {
    // Document Template Validations
    validateCreateDocumentTemplate,
    validateUpdateDocumentTemplate,
    
    // Document Request Validations
    validateCreateDocumentRequest,
    validateUpdateDocumentRequestStatus,
    
    // Document Validation Validations
    validateCreateDocumentValidation,
    validateVerifySignature,
    
    // Search Validations
    validateSearchDocumentTemplates,
    validateSearchDocumentRequests,
    validateSearchDocumentValidations,
    
    // File Validations
    validateFilename,
    
    // Role-based access
    requireRole,
    
    // Error handler
    handleValidationErrors
};