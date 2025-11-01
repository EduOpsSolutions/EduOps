import { create } from 'zustand';
import createSearchStore from './searchStore';
import documentApi from '../utils/documentApi';
import Swal from 'sweetalert2';

const useDocumentRequestSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    name: "",
    document: "",
    status: "",
    sortBy: "descending"
  },
  searchableFields: ["name", "documentName"],
  exactMatchFields: ["status"],
  initialItemsPerPage: 5,
  filterFunction: (data, params) => {
    let filteredResults = [...data];

    if (params.name?.trim()) {
      filteredResults = filteredResults.filter(request =>
        request.name.toLowerCase().includes(params.name.toLowerCase())
      );
    }

    if (params.document?.trim()) {
      filteredResults = filteredResults.filter(request =>
        request.documentName?.toLowerCase().includes(params.document.toLowerCase())
      );
    }

    if (params.status) {
      filteredResults = filteredResults.filter(request =>
        request.status === params.status
      );
    }

    filteredResults.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (params.sortBy === "ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return filteredResults;
  },
  showResultsOnLoad: true
});

const useDocumentRequestStore = create((set, get) => ({
  selectedRequest: null,
  updateModal: false,
  viewDetailsModal: false,
  updateStatus: "in_process",
  updateRemarks: "",
  loading: false,
  error: null,

  // Fetch all document requests
  fetchDocumentRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await documentApi.requests.getAll();
      
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch document requests');
      }

      const formattedRequests = response.data.map(request => 
        documentApi.helpers.formatDocumentRequest(request)
      );

      const searchStore = useDocumentRequestSearchStore.getState();
      searchStore.setData(formattedRequests);
      searchStore.initializeSearch();
      
      set({ loading: false });
    } catch (error) {
      console.error('Failed to fetch document requests:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch document requests'
      });
    }
  },

  // Search document requests
  searchDocumentRequests: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await documentApi.requests.search(filters);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to search document requests');
      }

      const formattedRequests = response.data.map(request => 
        documentApi.helpers.formatDocumentRequest(request)
      );

      const searchStore = useDocumentRequestSearchStore.getState();
      searchStore.setData(formattedRequests);
      
      set({ loading: false });
    } catch (error) {
      console.error('Failed to search document requests:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to search document requests'
      });
    }
  },

  // Create new document request
  createDocumentRequest: async (requestData, documentInfo = null) => {
    try {
      set({ loading: true, error: null });
      
      const validation = documentApi.helpers.validateDocumentRequest(requestData);
      if (!validation.isValid) {
        throw new Error('Please fill in all required fields correctly');
      }

      Swal.fire({
        title: 'Submitting Request...',
        text: 'Please wait while we process your document request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await documentApi.requests.create(requestData);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to create document request');
      }

      await get().fetchDocumentRequests(); // Refresh the list

      // Show different success message based on document type
      const isFreeDocument = !documentInfo?.amount || documentInfo?.price === 'free';
      
      Swal.fire({
        title: 'Success!',
        text: isFreeDocument 
          ? 'Your document request has been submitted successfully.'
          : 'Document request submitted successfully',
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Failed to create document request:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to create document request'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create document request',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      
      throw error;
    }
  },

  handleRequestSelect: (request) => {
    set({
      selectedRequest: request,
      updateStatus: request.status,
      updateRemarks: request.remarks || "",
      updateModal: true
    });
  },

  viewRequestDetails: (request, event) => {
    if (event) {
      event.stopPropagation();
    }

    set({
      selectedRequest: request,
      viewDetailsModal: true
    });
  },

  closeUpdateModal: () => {
    set({
      updateModal: false,
      selectedRequest: null,
      updateStatus: "in_process",
      updateRemarks: ""
    });
  },

  closeViewDetailsModal: () => {
    set({
      viewDetailsModal: false,
      selectedRequest: null
    });
  },

  refreshSelectedRequest: async () => {
    const { selectedRequest } = get();
    if (!selectedRequest) return;

    try {
      // Fetch the updated request data
      const response = await documentApi.requests.getById(selectedRequest.id);
      if (!response.error) {
        const formattedRequest = documentApi.helpers.formatDocumentRequest(response.data);
        set({ selectedRequest: formattedRequest });
      }
    } catch (error) {
      console.error('Failed to refresh selected request:', error);
    }
  },

  setUpdateStatus: (status) => {
    set({ updateStatus: status });
  },

  setUpdateRemarks: (remarks) => {
    set({ updateRemarks: remarks });
  },

  // Update document request status (admin only)
  handleSubmitStatusUpdate: async () => {
    const { selectedRequest, updateStatus, updateRemarks } = get();

    if (!selectedRequest) return;

    try {
      set({ loading: true, error: null });
      
      // Convert display status to database enum format
      const statusMap = {
        'In Process': 'in_process',
        'In Transit': 'in_transit',
        'Delivered': 'delivered',
        'Failed': 'failed',
        'Fulfilled': 'fulfilled',
      };
      
      const dbStatus = statusMap[updateStatus] || updateStatus.toLowerCase().replace(/ /g, '_');
      
      const response = await documentApi.requests.updateStatus(
        selectedRequest.id, 
        dbStatus, 
        updateRemarks
      );
      
      if (response.error) {
        throw new Error(response.message || 'Failed to update request status');
      }

      await get().fetchDocumentRequests(); // Refresh the list

      Swal.fire({
        title: 'Success!',
        text: 'Request status updated successfully',
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      get().closeUpdateModal();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update request status:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to update request status'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update request status',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    }
  },

  resetStore: () => {
    set({
      selectedRequest: null,
      updateModal: false,
      viewDetailsModal: false,
      updateStatus: "in_process",
      updateRemarks: "",
      loading: false,
      error: null
    });
  }
}));

export { useDocumentRequestSearchStore, useDocumentRequestStore };