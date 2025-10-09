import express from 'express';
import {
  // Document Templates
  createDocumentTemplate,
  getAllDocumentTemplates,
  getDocumentTemplateById,
  updateDocumentTemplate,
  deleteDocumentTemplate,
  toggleDocumentVisibility,
  searchDocumentTemplates,
  
  // Document Requests
  createDocumentRequest,
  getAllDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequestStatus,
  searchDocumentRequests,
  
  // Document Validations
  createDocumentValidation,
  getAllDocumentValidations,
  getDocumentValidationBySignature,
  searchDocumentValidations
} from '../../controller/document_controller.js';

import {
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  validateUserRole
} from '../../middleware/authValidator.js';

import {
  validateCreateDocumentTemplate,
  validateUpdateDocumentTemplate,
  validateCreateDocumentRequest,
  validateUpdateDocumentRequestStatus,  
  validateCreateDocumentValidation
} from '../../middleware/documentValidator.js';

import { uploadSingle } from '../../middleware/multerMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(validateIsActiveUser);

// Document Templates Routes (Admin access required for CUD operations)

// GET /api/v1/documents/templates - All authenticated users can view (filtered by role)
router.get('/templates', getAllDocumentTemplates);

// GET /api/v1/documents/templates/search - All authenticated users can search (filtered by role)
router.get('/templates/search', searchDocumentTemplates);

// GET /api/v1/documents/templates/:id - All authenticated users can view specific document (filtered by role)
router.get('/templates/:id', getDocumentTemplateById);

// POST /api/v1/documents/templates - Admin only
router.post('/templates', 
  validateUserIsAdmin, 
  uploadSingle('file'), 
  validateCreateDocumentTemplate, 
  createDocumentTemplate
);

// PUT /api/v1/documents/templates/:id - Admin only
router.put('/templates/:id', 
  validateUserIsAdmin, 
  uploadSingle('file'), 
  validateUpdateDocumentTemplate, 
  updateDocumentTemplate
);

// DELETE /api/v1/documents/templates/:id - Admin only
router.delete('/templates/:id', 
  validateUserIsAdmin, 
  deleteDocumentTemplate
);

// PATCH /api/v1/documents/templates/:id/visibility - Admin only
router.patch('/templates/:id/visibility', 
  validateUserIsAdmin, 
  toggleDocumentVisibility
);

// Document Requests Routes

// GET /api/v1/documents/requests - Role-based access (admins see all, students see own)
router.get('/requests', getAllDocumentRequests);

// GET /api/v1/documents/requests/search - Role-based access
router.get('/requests/search', searchDocumentRequests);

// GET /api/v1/documents/requests/:id - Role-based access
router.get('/requests/:id', getDocumentRequestById);

// POST /api/v1/documents/requests - Students and teachers only
router.post('/requests', 
  validateUserRole(['student', 'teacher']), 
  validateCreateDocumentRequest, 
  createDocumentRequest
);

// PATCH /api/v1/documents/requests/:id/status - Admin only
router.patch('/requests/:id/status', 
  validateUserIsAdmin, 
  validateUpdateDocumentRequestStatus,  // Changed from validateUpdateRequestStatus
  updateDocumentRequestStatus
);

// Document Validation Routes (Admin access for management, public for verification)

// GET /api/v1/documents/validations - Admin only
router.get('/validations', 
  validateUserIsAdmin, 
  getAllDocumentValidations
);

// GET /api/v1/documents/validations/search - Admin only
router.get('/validations/search', 
  validateUserIsAdmin, 
  searchDocumentValidations
);

// GET /api/v1/documents/validate/:signature - Public endpoint (limited info for non-admins)
router.get('/validate/:signature', getDocumentValidationBySignature);

// POST /api/v1/documents/validations - Admin only
router.post('/validations', 
  validateUserIsAdmin, 
  uploadSingle('file'), 
  validateCreateDocumentValidation, 
  createDocumentValidation
);

export default router;