import axiosInstance from './axios';

// Document Templates API
export const documentTemplatesApi = {
  // Get all document templates (role-based filtering)
  getAll: async (includeHidden = false) => {
    const response = await axiosInstance.get('/documents/templates', {
      params: { includeHidden }
    });
    return response.data;
  },

  // Search document templates
  search: async (filters = {}) => {
    const response = await axiosInstance.get('/documents/templates/search', {
      params: filters
    });
    return response.data;
  },

  // Get document template by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/documents/templates/${id}`);
    return response.data;
  },

  // Create document template (admin only)
  create: async (formData) => {
    const response = await axiosInstance.post('/documents/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document template (admin only)
  update: async (id, formData) => {
    const response = await axiosInstance.put(`/documents/templates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete document template (admin only)
  delete: async (id) => {
    const response = await axiosInstance.delete(`/documents/templates/${id}`);
    return response.data;
  },

  // Toggle document visibility (admin only)
  toggleVisibility: async (id, isActive) => {
    const response = await axiosInstance.patch(`/documents/templates/${id}/visibility`, {
      isActive
    });
    return response.data;
  }
};

// Document Requests API
export const documentRequestsApi = {
  // Get all document requests (role-based access)
  getAll: async () => {
    const response = await axiosInstance.get('/documents/requests');
    return response.data;
  },

  // Search document requests
  search: async (filters = {}) => {
    const response = await axiosInstance.get('/documents/requests/search', {
      params: filters
    });
    return response.data;
  },

  // Get document request by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/documents/requests/${id}`);
    return response.data;
  },

  // Create document request (students and teachers)
  create: async (requestData) => {
    const response = await axiosInstance.post('/documents/requests', requestData);
    return response.data;
  },

  // Update document request status (admin only)
  updateStatus: async (id, status, remarks) => {
    const response = await axiosInstance.patch(`/documents/requests/${id}/status`, {
      status,
      remarks
    });
    return response.data;
  }
};

// Document Validations API
export const documentValidationsApi = {
  // Get all document validations (admin only)
  getAll: async () => {
    const response = await axiosInstance.get('/documents/validations');
    return response.data;
  },

  // Search document validations (admin only)
  search: async (filters = {}) => {
    const response = await axiosInstance.get('/documents/validations/search', {
      params: filters
    });
    return response.data;
  },

  // Validate document by signature (public endpoint)
  validateSignature: async (signature) => {
    const response = await axiosInstance.get(`/documents/validate/${signature}`);
    return response.data;
  },

  // Create document validation (admin only)
  create: async (formData) => {
    const response = await axiosInstance.post('/documents/validations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Helper functions
export const documentHelpers = {
  // Format document for display
  formatDocument: (document) => ({
    ...document,
    formattedAmount: document.price === 'paid' && document.amount 
      ? parseFloat(document.amount).toLocaleString('en-US', {
          minimeFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null,
    displayPrice: document.price === 'free' ? 'FREE' : 
                   document.price === 'paid' ? `₱${document.amount}` : 
                   document.price,
    canDownload: document.downloadable && document.uploadFile,
    requiresRequest: document.requestBasis,
  }),

  // Format document request for display
  formatDocumentRequest: (request) => ({
    ...request,
    displayDate: new Date(request.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    studentName: request.student 
      ? `${request.student.firstName} ${request.student.middleName ? request.student.middleName + ' ' : ''}${request.student.lastName}`
      : 'Unknown Student',
    statusColor: {
      'in_process': 'text-yellow-600 bg-yellow-100',
      'approved': 'text-blue-600 bg-blue-100',
      'ready_for_pickup': 'text-green-600 bg-green-100',
      'delivered': 'text-purple-600 bg-purple-100',
      'rejected': 'text-red-600 bg-red-100',
    }[request.status] || 'text-gray-600 bg-gray-100',
    statusDisplay: {
      'in_process': 'In Process',
      'approved': 'Approved',
      'ready_for_pickup': 'Ready for Pickup',
      'delivered': 'Delivered',
      'rejected': 'Rejected',
    }[request.status] || request.status,
  }),

  // Check if user can access document based on role and privacy
  canAccessDocument: (document, userRole) => {
    const accessRules = {
      admin: ['public', 'student', 'teacher', 'admin'],
      teacher: ['public', 'teacher'],
      student: ['public', 'student']
    };
    
    const allowedPrivacyLevels = accessRules[userRole] || accessRules.student;
    return allowedPrivacyLevels.includes(document.privacy.toLowerCase());
  },

  // Validate document request data
  validateDocumentRequest: (requestData) => {
    const errors = {};

    if (!requestData.documentId) {
      errors.documentId = 'Document is required';
    }

    if (!requestData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
      errors.email = 'Valid email is required';
    }

    if (!requestData.phone || !/^[\d\s\-\+\(\)]+$/.test(requestData.phone)) {
      errors.phone = 'Valid phone number is required';
    }

    if (requestData.mode === 'delivery') {
      if (!requestData.address) errors.address = 'Address is required for delivery';
      if (!requestData.city) errors.city = 'City is required for delivery';
      if (!requestData.state) errors.state = 'State is required for delivery';
      if (!requestData.zipCode) errors.zipCode = 'ZIP code is required for delivery';
      if (!requestData.country) errors.country = 'Country is required for delivery';
    }

    if (!requestData.purpose) {
      errors.purpose = 'Purpose is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Create FormData for file upload
  createFormData: (data, file = null) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (file) {
      formData.append('file', file);
    }

    return formData;
  },

  // Download file helper
  downloadFile: async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }
};

// Export all APIs as default
const documentApi = {
  templates: documentTemplatesApi,
  requests: documentRequestsApi,
  validations: documentValidationsApi,
  helpers: documentHelpers
};

export default documentApi;