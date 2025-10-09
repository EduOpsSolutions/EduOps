import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import DocumentModel from '../model/document_model.js';

// DOCUMENT TEMPLATES

// Get all document templates
export const getAllDocumentTemplates = async (req, res) => {
    try {
        const { includeHidden } = req.query;
        const documents = await DocumentModel.getAllDocumentTemplates(includeHidden === 'true');
        
        res.json({
            error: false,
            message: 'Document templates retrieved successfully',
            data: documents
        });
    } catch (error) {
        console.error('Error fetching document templates:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch document templates'
        });
    }
};

// Create a new document template
export const createDocumentTemplate = async (req, res) => {
    try {
        const documentData = {
            documentName: req.body.documentName,
            description: req.body.description,
            privacy: req.body.privacy?.toLowerCase().replace(/['\s]/g, '_') || 'public',
            requestBasis: req.body.requestBasis === 'Yes' || req.body.requestBasis === true,
            downloadable: req.body.downloadable === 'Yes' || req.body.downloadable === true,
            price: req.body.price?.toLowerCase() === 'paid' ? 'paid' : 'free',
            amount: req.body.amount,
            uploadFile: req.file ? req.file.filename : null,
            isHidden: req.body.isHidden || false
        };

        const document = await DocumentModel.createDocumentTemplate(documentData);
        
        res.status(201).json({
            error: false,
            message: 'Document template created successfully',
            data: document
        });
    } catch (error) {
        console.error('Error creating document template:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to create document template'
        });
    }
};

// Update document template
export const updateDocumentTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            privacy: req.body.privacy?.toLowerCase().replace(/['\s]/g, '_'),
            requestBasis: req.body.requestBasis === 'Yes' || req.body.requestBasis === true,
            downloadable: req.body.downloadable === 'Yes' || req.body.downloadable === true,
            price: req.body.price?.toLowerCase() === 'paid' ? 'paid' : 'free',
        };

        if (req.file) {
            updateData.uploadFile = req.file.filename;
        }

        const document = await DocumentModel.updateDocumentTemplate(id, updateData);
        
        res.json({
            error: false,
            message: 'Document template updated successfully',
            data: document
        });
    } catch (error) {
        console.error('Error updating document template:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to update document template'
        });
    }
};

// Delete document template
export const deleteDocumentTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await DocumentModel.deleteDocumentTemplate(id);
        
        res.json({
            error: false,
            message: 'Document template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document template:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to delete document template'
        });
    }
};

// Hide/Show document template
export const toggleDocumentTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { isHidden } = req.body;
        
        const document = await DocumentModel.hideDocumentTemplate(id, isHidden);
        
        res.json({
            error: false,
            message: `Document template ${isHidden ? 'hidden' : 'shown'} successfully`,
            data: document
        });
    } catch (error) {
        console.error('Error toggling document template:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to toggle document template visibility'
        });
    }
};

// Search document templates
export const searchDocumentTemplates = async (req, res) => {
    try {
        const filters = {
            documentName: req.query.documentName,
            privacy: req.query.privacy?.toLowerCase().replace(/['\s]/g, '_'),
            price: req.query.price?.toLowerCase(),
            includeHidden: req.query.includeHidden === 'true'
        };

        const documents = await DocumentModel.searchDocumentTemplates(filters);
        
        res.json({
            error: false,
            message: 'Document templates retrieved successfully',
            data: documents
        });
    } catch (error) {
        console.error('Error searching document templates:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to search document templates'
        });
    }
};

// DOCUMENT REQUESTS

// Get all document requests
export const getAllDocumentRequests = async (req, res) => {
    try {
        const requests = await DocumentModel.getAllDocumentRequests();
        
        // Format the response to match frontend expectations
        const formattedRequests = requests.map(request => ({
            id: request.id,
            date: request.createdAt.toISOString().split('T')[0],
            displayDate: request.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            name: `${request.student.firstName} ${request.student.middleName || ''} ${request.student.lastName}`.trim(),
            document: request.document.documentName,
            status: request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' '),
            remarks: request.remarks || '',
            email: request.email,
            phone: request.phone,
            mode: request.mode,
            paymentMethod: request.paymentMethod,
            address: request.address,
            city: request.city,
            state: request.state,
            zipCode: request.zipCode,
            country: request.country,
            purpose: request.purpose,
            additionalNotes: request.additionalNotes
        }));

        res.json({
            error: false,
            message: 'Document requests retrieved successfully',
            data: formattedRequests
        });
    } catch (error) {
        console.error('Error fetching document requests:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch document requests'
        });
    }
};

// Create a document request
export const createDocumentRequest = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.documentId) {
            return res.status(400).json({
                error: true,
                message: 'documentId is required'
            });
        }

        if (!req.body.email) {
            return res.status(400).json({
                error: true,
                message: 'email is required'
            });
        }

        // For testing purposes, use a default student ID if not provided
        const studentId = req.user?.id || req.body.studentId || 'clm0example123student';

        const requestData = {
            studentId: studentId,
            documentId: req.body.documentId,
            email: req.body.email,
            phone: req.body.phone,
            mode: req.body.mode?.toLowerCase() || 'pickup',
            paymentMethod: req.body.paymentMethod,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            country: req.body.country,
            purpose: req.body.purpose,
            additionalNotes: req.body.additionalNotes
        };

        console.log('Creating document request with data:', requestData);
        const request = await DocumentModel.createDocumentRequest(requestData);
        
        res.status(201).json({
            error: false,
            message: 'Document request created successfully',
            data: request
        });
    } catch (error) {
        console.error('Error creating document request:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            error: true,
            message: 'Failed to create document request',
            details: error.message
        });
    }
};

// Update document request status
export const updateDocumentRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        
        const request = await DocumentModel.updateDocumentRequestStatus(
            id, 
            status.toLowerCase().replace(' ', '_'), 
            remarks
        );
        
        res.json({
            error: false,
            message: 'Document request status updated successfully',
            data: request
        });
    } catch (error) {
        console.error('Error updating document request:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to update document request'
        });
    }
};

// Get document requests by student
export const getStudentDocumentRequests = async (req, res) => {
    try {
        const studentId = req.user?.id || req.params.studentId;
        const requests = await DocumentModel.getDocumentRequestsByStudent(studentId);
        
        res.json({
            error: false,
            message: 'Student document requests retrieved successfully',
            data: requests
        });
    } catch (error) {
        console.error('Error fetching student document requests:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch student document requests'
        });
    }
};

// Search document requests
export const searchDocumentRequests = async (req, res) => {
    try {
        const filters = {
            studentName: req.query.name,
            documentName: req.query.document,
            status: req.query.status?.toLowerCase().replace(' ', '_'),
            sortBy: req.query.sortBy || 'descending'
        };

        const requests = await DocumentModel.searchDocumentRequests(filters);
        
        // Format the response
        const formattedRequests = requests.map(request => ({
            id: request.id,
            date: request.createdAt.toISOString().split('T')[0],
            displayDate: request.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            name: `${request.student.firstName} ${request.student.middleName || ''} ${request.student.lastName}`.trim(),
            document: request.document.documentName,
            status: request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' '),
            remarks: request.remarks || '',
            email: request.email,
            phone: request.phone,
            mode: request.mode,
            paymentMethod: request.paymentMethod,
            address: request.address,
            city: request.city,
            state: request.state,
            zipCode: request.zipCode,
            country: request.country,
            purpose: request.purpose,
            additionalNotes: request.additionalNotes
        }));

        res.json({
            error: false,
            message: 'Document requests retrieved successfully',
            data: formattedRequests
        });
    } catch (error) {
        console.error('Error searching document requests:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to search document requests'
        });
    }
};

// DOCUMENT VALIDATION

// Create document validation with file signature
export const createDocumentValidation = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No file uploaded'
            });
        }

        // Generate unique file signature
        const fileSignature = crypto.randomBytes(8).toString('hex');
        
        const validationData = {
            fileSignature,
            documentName: req.body.documentName || req.file.originalname,
            filePath: req.file.path,
            userId: req.user?.id || req.body.userId
        };

        const validation = await DocumentModel.createDocumentValidation(validationData);
        
        res.status(201).json({
            error: false,
            message: 'Document validation created successfully',
            data: validation,
            fileSignature
        });
    } catch (error) {
        console.error('Error creating document validation:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to create document validation'
        });
    }
};

// Get all document validations
export const getAllDocumentValidations = async (req, res) => {
    try {
        const validations = await DocumentModel.getAllDocumentValidations();
        
        res.json({
            error: false,
            message: 'Document validations retrieved successfully',
            data: validations
        });
    } catch (error) {
        console.error('Error fetching document validations:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch document validations'
        });
    }
};

// Verify document by signature
export const verifyDocumentSignature = async (req, res) => {
    try {
        const { signature } = req.params;
        const validation = await DocumentModel.getDocumentValidationBySignature(signature);
        
        if (!validation) {
            return res.status(404).json({
                error: true,
                message: 'Document signature not found'
            });
        }
        
        res.json({
            error: false,
            message: 'Document signature verified successfully',
            data: validation
        });
    } catch (error) {
        console.error('Error verifying document signature:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to verify document signature'
        });
    }
};

// Search document validations
export const searchDocumentValidations = async (req, res) => {
    try {
        const filters = {
            fileSignature: req.query.fileSignature,
            documentName: req.query.documentName
        };

        const validations = await DocumentModel.searchDocumentValidations(filters);
        
        res.json({
            error: false,
            message: 'Document validations retrieved successfully',
            data: validations
        });
    } catch (error) {
        console.error('Error searching document validations:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to search document validations'
        });
    }
};

// FILE OPERATIONS

// Upload handler (multer will handle file saving)
export const uploadDocument = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            error: true, 
            message: 'No file uploaded' 
        });
    }
    res.status(201).json({
        error: false,
        message: 'File uploaded successfully',
        data: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            url: `/documents/${req.file.filename}`
        }
    });
};

// List all uploaded files
export const listUploadedFiles = (req, res) => {
    const dir = path.join(__dirname, '../public/documents');
    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).json({ 
                error: true, 
                message: 'Unable to list files' 
            });
        }
        const fileList = files.map(file => ({
            filename: file,
            url: `/documents/${file}`
        }));
        res.json({
            error: false,
            message: 'Files retrieved successfully',
            data: fileList
        });
    });
};

// Download a document file
export const downloadDocumentFile = (req, res) => {
    const file = req.params.filename;
    const filePath = path.join(__dirname, '../public/documents', file);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            error: true, 
            message: 'File not found' 
        });
    }
    res.download(filePath);
};

// Delete a document file
export const deleteDocumentFile = (req, res) => {
    const file = req.params.filename;
    const filePath = path.join(__dirname, '../public/documents', file);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            error: true, 
            message: 'File not found' 
        });
    }
    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).json({ 
                error: true, 
                message: 'Unable to delete file' 
            });
        }
        res.json({ 
            error: false, 
            message: 'File deleted successfully' 
        });
    });
};