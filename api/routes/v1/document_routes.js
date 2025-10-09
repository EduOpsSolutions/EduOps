import express from 'express';
import multer from '../../middleware/multerMiddleware.js';
import * as documentController from '../../controller/document_controller.js';
import {
    validateCreateDocumentTemplate,
    validateUpdateDocumentTemplate,
    validateCreateDocumentRequest,
    validateUpdateDocumentRequestStatus,
    validateCreateDocumentValidation,
    validateVerifySignature,
    validateSearchDocumentTemplates,
    validateSearchDocumentRequests,
    validateSearchDocumentValidations,
    validateFilename,
    requireRole
} from '../../middleware/documentValidator.js';

const router = express.Router();

// DOCUMENT TEMPLATES

// Get all document templates (public endpoint for students/teachers)
router.get('/templates', documentController.getAllDocumentTemplates);

// Search document templates
router.get('/templates/search', documentController.searchDocumentTemplates);

// Create new document template (admin only)
router.post('/templates', 
    multer.single('uploadFile'), 
    documentController.createDocumentTemplate
);

// Update document template (admin only)
router.put('/templates/:id', 
    multer.single('uploadFile'), 
    documentController.updateDocumentTemplate
);

// Delete document template (admin only)
router.delete('/templates/:id', 
    documentController.deleteDocumentTemplate
);

// Toggle document template visibility (admin only)
router.patch('/templates/:id/toggle', 
    documentController.toggleDocumentTemplate
);

// DOCUMENT REQUESTS

// Get all document requests (admin only)
router.get('/requests', 
    documentController.getAllDocumentRequests
);

// Search document requests (admin only)
router.get('/requests/search', 
    documentController.searchDocumentRequests
);

// Create document request (student/teacher)
router.post('/requests', 
    documentController.createDocumentRequest
);

// Get current user's document requests (student only)
router.get('/requests/student', 
    documentController.getStudentDocumentRequests
);

// Get specific student's document requests (admin only)
router.get('/requests/student/:studentId', 
    documentController.getStudentDocumentRequests
);

// Update document request status (admin only)
router.patch('/requests/:id/status', 
    documentController.updateDocumentRequestStatus
);

// DOCUMENT VALIDATION

// Get all document validations (admin only)
router.get('/validations', 
    requireRole(['admin']), 
    documentController.getAllDocumentValidations
);

// Search document validations
router.get('/validations/search', 
    validateSearchDocumentValidations, 
    documentController.searchDocumentValidations
);

// Create document validation with signature (admin/teacher)
router.post('/validations', 
    requireRole(['admin', 'teacher']), 
    multer.single('file'), 
    validateCreateDocumentValidation, 
    documentController.createDocumentValidation
);

// Verify document signature (public endpoint)
router.get('/verify/:signature', 
    validateVerifySignature, 
    documentController.verifyDocumentSignature
);

// FILE OPERATIONS

// Upload document file
router.post('/upload', 
    multer.single('file'), 
    documentController.uploadDocument
);

// List uploaded files
router.get('/files', 
    requireRole(['admin', 'teacher']), 
    documentController.listUploadedFiles
);

// Download document file
router.get('/files/:filename', 
    validateFilename, 
    documentController.downloadDocumentFile
);

// Delete document file
router.delete('/files/:filename', 
    requireRole(['admin']), 
    validateFilename, 
    documentController.deleteDocumentFile
);

export { router };