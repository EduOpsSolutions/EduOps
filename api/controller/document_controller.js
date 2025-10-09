import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import DocumentModel from '../model/document_model.js';
import { uploadSingle } from '../middleware/multerMiddleware.js';
import { uploadFile } from '../utils/fileStorage.js';  
import { filePaths } from '../constants/file_paths.js';

// Role-based access helper
const checkDocumentAccess = (userRole, documentPrivacy, operation = 'read') => {
  const accessRules = {
    admin: {
      read: ['public', 'student', 'teacher', 'admin'],
      write: ['public', 'student', 'teacher', 'admin'],
      manage: true
    },
    teacher: {
      read: ['public', 'teacher'],
      write: ['teacher'],
      manage: false
    },
    student: {
      read: ['public', 'student'],
      write: [],
      manage: false
    }
  };

  const userAccess = accessRules[userRole] || accessRules.student;
  
  if (operation === 'manage') {
    return userAccess.manage;
  }
  
  return userAccess[operation]?.includes(documentPrivacy.toLowerCase()) || false;
};

// Document Templates Management (Admin Only)

export const createDocumentTemplate = async (req, res) => {
  try {
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    // Only admins can create document templates
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      documentName,
      description,
      privacy,
      requestBasis,
      downloadable,
      price,
      amount
    } = req.body;

    // Validate required fields
    if (!documentName || !privacy) {
      return res.status(400).json({
        error: true,
        message: 'Document name and privacy level are required'
      });
    }

    // Handle file upload if present
    let uploadFileUrl = null;
    if (req.file) {
      const fileResult = await uploadFile(req.file, filePaths.documents);  // Changed from saveFile to uploadFile
      uploadFileUrl = fileResult.downloadURL;  // Changed from url to downloadURL based on your fileStorage response
    }

    const documentData = {
      documentName,
      description: description || '',
      privacy: privacy.toLowerCase(),
      requestBasis: requestBasis === 'true' || requestBasis === true,
      downloadable: downloadable === 'true' || downloadable === true,
      price: price || 'free',
      amount: price === 'paid' ? amount : null,
      uploadFile: uploadFileUrl  // Changed variable name to avoid confusion
    };

    const document = await DocumentModel.createDocumentTemplate(documentData);

    res.status(201).json({
      error: false,
      data: document,
      message: 'Document template created successfully'
    });

  } catch (error) {
    console.error('Create document template error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create document template'
    });
  }
};

export const getAllDocumentTemplates = async (req, res) => {
  try {
    const userRole = req.user.data.role;
    const includeHidden = req.query.includeHidden === 'true';

    // Only admins can see hidden documents
    const showHidden = userRole === 'admin' && includeHidden;

    const documents = await DocumentModel.getAllDocumentTemplates(showHidden);

    // Filter documents based on user role and privacy
    const filteredDocuments = documents.filter(doc => 
      checkDocumentAccess(userRole, doc.privacy, 'read')
    );

    res.json({
      error: false,
      data: filteredDocuments,
      message: 'Documents retrieved successfully'
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve documents'
    });
  }
};

export const getDocumentTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.data.role;

    const document = await DocumentModel.getDocumentTemplateById(id);

    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Document not found'
      });
    }

    // Check access permissions
    if (!checkDocumentAccess(userRole, document.privacy, 'read')) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Insufficient permissions to view this document.'
      });
    }

    res.json({
      error: false,
      data: document,
      message: 'Document retrieved successfully'
    });

  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve document'
    });
  }
};

export const updateDocumentTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    // Only admins can update document templates
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const document = await DocumentModel.getDocumentTemplateById(id);
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Document not found'
      });
    }

    const updateData = { ...req.body };
    
    // Handle file upload if present
    if (req.file) {
      const fileResult = await uploadFile(req.file, filePaths.documents);  // Changed from saveFile to uploadFile
      updateData.uploadFile = fileResult.downloadURL;  // Changed from url to downloadURL
    }

    // Convert string booleans to actual booleans
    if (updateData.requestBasis !== undefined) {
      updateData.requestBasis = updateData.requestBasis === 'true' || updateData.requestBasis === true;
    }
    if (updateData.downloadable !== undefined) {
      updateData.downloadable = updateData.downloadable === 'true' || updateData.downloadable === true;
    }

    const updatedDocument = await DocumentModel.updateDocumentTemplate(id, updateData);

    res.json({
      error: false,
      data: updatedDocument,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update document'
    });
  }
};

export const deleteDocumentTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.data.role;

    // Only admins can delete document templates
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const document = await DocumentModel.getDocumentTemplateById(id);
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Document not found'
      });
    }

    await DocumentModel.deleteDocumentTemplate(id);

    res.json({
      error: false,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to delete document'
    });
  }
};

export const toggleDocumentVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;
    const userRole = req.user.data.role;

    // Only admins can toggle document visibility
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const document = await DocumentModel.getDocumentTemplateById(id);
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Document not found'
      });
    }

    const updatedDocument = await DocumentModel.hideDocumentTemplate(id, isHidden);

    res.json({
      error: false,
      data: updatedDocument,
      message: `Document ${isHidden ? 'hidden' : 'shown'} successfully`
    });

  } catch (error) {
    console.error('Toggle document visibility error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update document visibility'
    });
  }
};

// Document Requests Management

export const createDocumentRequest = async (req, res) => {
  try {
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    // Students and teachers can create document requests
    if (!['student', 'teacher'].includes(userRole)) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Only students and teachers can request documents.'
      });
    }

    const {
      documentId,
      email,
      phone,
      mode,
      paymentMethod,
      address,
      city,
      state,
      zipCode,
      country,
      purpose,
      additionalNotes
    } = req.body;

    // Validate document exists and user has access
    const document = await DocumentModel.getDocumentTemplateById(documentId);
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Document template not found'
      });
    }

    // Check if user can request this document based on privacy
    if (!checkDocumentAccess(userRole, document.privacy, 'read')) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You cannot request this document.'
      });
    }

    const requestData = {
      studentId: userId, // Using userId as studentId for now
      documentId,
      email,
      phone,
      mode: mode || 'pickup',
      paymentMethod,
      address: mode === 'delivery' ? address : null,
      city: mode === 'delivery' ? city : null,
      state: mode === 'delivery' ? state : null,
      zipCode: mode === 'delivery' ? zipCode : null,
      country: mode === 'delivery' ? country : null,
      purpose,
      additionalNotes
    };

    const request = await DocumentModel.createDocumentRequest(requestData);

    res.status(201).json({
      error: false,
      data: request,
      message: 'Document request created successfully'
    });

  } catch (error) {
    console.error('Create document request error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create document request'
    });
  }
};

export const getAllDocumentRequests = async (req, res) => {
  try {
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    let requests;

    if (userRole === 'admin') {
      // Admins can see all requests
      requests = await DocumentModel.getAllDocumentRequests();
    } else if (userRole === 'teacher') {
      // Teachers can see requests for documents they have access to
      requests = await DocumentModel.getAllDocumentRequests();
      requests = requests.filter(request => 
        checkDocumentAccess(userRole, request.document.privacy, 'read')
      );
    } else {
      // Students can only see their own requests
      requests = await DocumentModel.getDocumentRequestsByStudent(userId);
    }

    res.json({
      error: false,
      data: requests,
      message: 'Document requests retrieved successfully'
    });

  } catch (error) {
    console.error('Get document requests error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve document requests'
    });
  }
};

export const getDocumentRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    const request = await DocumentModel.getDocumentRequestById(id);

    if (!request) {
      return res.status(404).json({
        error: true,
        message: 'Document request not found'
      });
    }

    // Check access permissions
    if (userRole === 'student' && request.studentId !== userId) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You can only view your own requests.'
      });
    }

    if (userRole === 'teacher' && !checkDocumentAccess(userRole, request.document.privacy, 'read')) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    res.json({
      error: false,
      data: request,
      message: 'Document request retrieved successfully'
    });

  } catch (error) {
    console.error('Get document request error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve document request'
    });
  }
};

export const updateDocumentRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const userRole = req.user.data.role;

    // Only admins can update request status
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const request = await DocumentModel.getDocumentRequestById(id);
    if (!request) {
      return res.status(404).json({
        error: true,
        message: 'Document request not found'
      });
    }

    const updatedRequest = await DocumentModel.updateDocumentRequestStatus(id, status, remarks);

    res.json({
      error: false,
      data: updatedRequest,
      message: 'Document request status updated successfully'
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update request status'
    });
  }
};

// Document Validation (Admin Only)

export const createDocumentValidation = async (req, res) => {
  try {
    const userId = req.user.data.id;
    const userRole = req.user.data.role;

    // Only admins can create document validations
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { fileSignature, documentName } = req.body;

    if (!fileSignature || !documentName) {
      return res.status(400).json({
        error: true,
        message: 'File signature and document name are required'
      });
    }

    // Handle file upload
    let filePath = null;
    if (req.file) {
      const fileResult = await uploadFile(req.file, filePaths.documents);  // Changed from saveFile to uploadFile
      filePath = fileResult.downloadURL;  // Changed from url to downloadURL
    }

    const validationData = {
      fileSignature,
      documentName,
      filePath,
      userId
    };

    const validation = await DocumentModel.createDocumentValidation(validationData);

    res.status(201).json({
      error: false,
      data: validation,
      message: 'Document validation created successfully'
    });

  } catch (error) {
    console.error('Create document validation error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create document validation'
    });
  }
};

export const getAllDocumentValidations = async (req, res) => {
  try {
    const userRole = req.user.data.role;

    // Only admins can view document validations
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const validations = await DocumentModel.getAllDocumentValidations();

    res.json({
      error: false,
      data: validations,
      message: 'Document validations retrieved successfully'
    });

  } catch (error) {
    console.error('Get document validations error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve document validations'
    });
  }
};

export const getDocumentValidationBySignature = async (req, res) => {
  try {
    const { signature } = req.params;
    const userRole = req.user.data.role;

    // Anyone can validate a document signature (public endpoint)
    const validation = await DocumentModel.getDocumentValidationBySignature(signature);

    if (!validation) {
      return res.status(404).json({
        error: true,
        message: 'Document validation not found'
      });
    }

    // Return limited information for non-admins
    const responseData = userRole === 'admin' ? validation : {
      fileSignature: validation.fileSignature,
      documentName: validation.documentName,
      createdAt: validation.createdAt,
      isValid: true
    };

    res.json({
      error: false,
      data: responseData,
      message: 'Document validation retrieved successfully'
    });

  } catch (error) {
    console.error('Get document validation error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve document validation'
    });
  }
};

// Search endpoints with role-based filtering

export const searchDocumentTemplates = async (req, res) => {
  try {
    const userRole = req.user.data.role;
    const filters = req.query;

    // Only admins can include hidden documents
    if (filters.includeHidden && userRole !== 'admin') {
      delete filters.includeHidden;
    }

    const documents = await DocumentModel.searchDocumentTemplates(filters);

    // Filter based on user role and privacy
    const filteredDocuments = documents.filter(doc => 
      checkDocumentAccess(userRole, doc.privacy, 'read')
    );

    res.json({
      error: false,
      data: filteredDocuments,
      message: 'Document search completed successfully'
    });

  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to search documents'
    });
  }
};

export const searchDocumentRequests = async (req, res) => {
  try {
    const userId = req.user.data.id;
    const userRole = req.user.data.role;
    const filters = req.query;

    let requests;

    if (userRole === 'admin') {
      requests = await DocumentModel.searchDocumentRequests(filters);
    } else if (userRole === 'teacher') {
      requests = await DocumentModel.searchDocumentRequests(filters);
      requests = requests.filter(request => 
        checkDocumentAccess(userRole, request.document.privacy, 'read')
      );
    } else {
      // Students can only search their own requests
      filters.studentId = userId;
      requests = await DocumentModel.searchDocumentRequests(filters);
    }

    res.json({
      error: false,
      data: requests,
      message: 'Document request search completed successfully'
    });

  } catch (error) {
    console.error('Search document requests error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to search document requests'
    });
  }
};

export const searchDocumentValidations = async (req, res) => {
  try {
    const userRole = req.user.data.role;

    // Only admins can search document validations
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const filters = req.query;
    const validations = await DocumentModel.searchDocumentValidations(filters);

    res.json({
      error: false,
      data: validations,
      message: 'Document validation search completed successfully'
    });

  } catch (error) {
    console.error('Search document validations error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to search document validations'
    });
  }
};