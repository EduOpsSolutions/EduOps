import { create } from 'zustand';
import createSearchStore from './searchStore';
import documentApi from '../utils/documentApi';
import Swal from 'sweetalert2';

const useManageDocumentsSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    documentName: "",
    privacy: "",
    price: "",
    includeHidden: false
  },
  searchableFields: ["documentName", "description"],
  exactMatchFields: ["privacy", "price"],
  initialItemsPerPage: 5,
  showResultsOnLoad: true,
  filterFunction: (data, params) => {
    return data.filter(document => {
      const documentNameMatch = !params.documentName ||
        document.documentName.toLowerCase().includes(params.documentName.toLowerCase()) ||
        (document.description && document.description.toLowerCase().includes(params.documentName.toLowerCase()));

      const privacyMatch = !params.privacy || document.privacy === params.privacy;

      const priceMatch = !params.price ||
        (params.price === "free" && document.price === "free") ||
        (params.price === "paid" && document.price === "paid");

      const hiddenMatch = params.includeHidden || !document.isHidden;

      return documentNameMatch && privacyMatch && priceMatch && hiddenMatch;
    });
  }
});

const useManageDocumentsStore = create((set, get) => ({
  documents: [],
  showAddDocumentModal: false,
  showEditDocumentModal: false,
  selectedDocument: null,
  loading: false,
  error: null,

  // Fetch all document templates
  fetchDocuments: async (includeHidden = false) => {
    try {
      set({ loading: true, error: null });
      
      const response = await documentApi.templates.getAll(includeHidden);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch documents');
      }

      const formattedDocuments = response.data.map(doc => ({
        ...doc,
        // Format for display compatibility
        displayPrice: doc.price === 'free' ? 'Free' : 'Paid',
        displayAmount: doc.price === 'paid' && doc.amount ? 
          parseFloat(doc.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '',
        requestBasisDisplay: doc.requestBasis ? 'Yes' : 'No',
        downloadableDisplay: doc.downloadable ? 'Yes' : 'No',
        // Map isActive to isHidden for frontend compatibility
        isHidden: !doc.isActive
      }));

      set({ documents: formattedDocuments });

      const searchStore = useManageDocumentsSearchStore.getState();
      searchStore.setData(formattedDocuments);
      searchStore.initializeSearch();

      set({ loading: false });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch documents'
      });
    }
  },

  // Search document templates
  searchDocuments: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const response = await documentApi.templates.search(filters);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to search documents');
      }

      const formattedDocuments = response.data.map(doc => ({
        ...doc,
        displayPrice: doc.price === 'free' ? 'Free' : 'Paid',
        displayAmount: doc.price === 'paid' && doc.amount ? 
          parseFloat(doc.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '',
        requestBasisDisplay: doc.requestBasis ? 'Yes' : 'No',
        downloadableDisplay: doc.downloadable ? 'Yes' : 'No'
      }));

      set({ documents: formattedDocuments });

      const searchStore = useManageDocumentsSearchStore.getState();
      searchStore.setData(formattedDocuments);

      set({ loading: false });
    } catch (error) {
      console.error('Failed to search documents:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to search documents'
      });
    }
  },

  handleDocumentClick: (document) => {
    set({
      selectedDocument: document,
      showEditDocumentModal: true
    });
  },

  handleCloseEditDocumentModal: () => {
    set({
      showEditDocumentModal: false,
      selectedDocument: null
    });
  },

  // Update document template
  handleUpdateDocument: async (updatedDocument, file) => {
    try {
      set({ loading: true, error: null });

      // Filter to only send editable fields
      const editableData = {
        documentName: updatedDocument.documentName,
        description: updatedDocument.description,
        privacy: updatedDocument.privacy,
        requestBasis: updatedDocument.requestBasis,
        downloadable: updatedDocument.downloadable,
        price: updatedDocument.price,
        amount: updatedDocument.amount
      };

      const formData = documentApi.helpers.createFormData(editableData, file);
      const response = await documentApi.templates.update(updatedDocument.id, formData);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to update document');
      }

      await get().fetchDocuments(get().searchStore?.searchParams?.includeHidden || false);

      set({
        showEditDocumentModal: false,
        selectedDocument: null,
        loading: false
      });

      Swal.fire({
        title: 'Success!',
        text: 'Document has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#992525',
      });
    } catch (error) {
      console.error('Failed to update document:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to update document'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update document',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    }
  },

  handleAddDocument: () => {
    set({ showAddDocumentModal: true });
  },

  handleCloseAddDocumentModal: () => {
    set({ showAddDocumentModal: false });
  },

  // Create new document template
  handleAddDocumentSubmit: async (newDocument, file) => {
    try {
      set({ loading: true, error: null });

      const formData = documentApi.helpers.createFormData(newDocument, file);
      const response = await documentApi.templates.create(formData);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to create document');
      }

      await get().fetchDocuments(get().searchStore?.searchParams?.includeHidden || false);

      set({
        showAddDocumentModal: false,
        loading: false
      });

      Swal.fire({
        title: 'Success!',
        text: 'Document has been added successfully.',
        icon: 'success',
        confirmButtonColor: '#992525',
      });
    } catch (error) {
      console.error('Failed to create document:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to create document'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create document',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    }
  },

  // Delete document template
  handleDeleteDocument: async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This document will be permanently deleted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        set({ loading: true, error: null });

        const response = await documentApi.templates.delete(id);
        
        if (response.error) {
          throw new Error(response.message || 'Failed to delete document');
        }

        await get().fetchDocuments(get().searchStore?.searchParams?.includeHidden || false);

        set({ loading: false });

        Swal.fire({
          title: 'Deleted!',
          text: 'Document has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#992525',
        });
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to delete document'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to delete document',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    }
  },

  // Toggle document visibility
  handleHideDocument: async (id) => {
    try {
      const document = get().documents.find(doc => doc.id === id);
      if (!document) return;

      set({ loading: true, error: null });

      const newIsActive = document.isHidden;
      const response = await documentApi.templates.toggleVisibility(id, newIsActive);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to update document visibility');
      }

      const searchStore = useManageDocumentsSearchStore.getState();
      const includeHidden = searchStore.searchParams?.includeHidden || false;
      
      // Fetch fresh data from API immediately
      await get().fetchDocuments(includeHidden);
      
      set({ loading: false });

      const wasHidden = document.isHidden;
      let successMessage = `Document has been ${wasHidden ? 'shown' : 'hidden'} successfully.`;
      
      if (!wasHidden && !includeHidden) {
        successMessage += ' The document is now hidden from this list. Check "Include Hidden" to see it.';
      }

      Swal.fire({
        title: 'Success!',
        text: successMessage,
        icon: 'success',
        confirmButtonColor: '#992525',
      });
    } catch (error) {
      console.error('Failed to update document visibility:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to update document visibility'
      });
      
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update document visibility',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    }
  },

  resetStore: () => {
    set({
      documents: [],
      showAddDocumentModal: false,
      showEditDocumentModal: false,
      selectedDocument: null,
      loading: false,
      error: null
    });
  }
}));

export { useManageDocumentsStore, useManageDocumentsSearchStore };