import { create } from 'zustand';
import createSearchStore from './searchStore';
import documentApi from '../utils/documentApi';
import Swal from 'sweetalert2';

export const useDocumentSignatureSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    fileSignature: '',
    documentName: ''
  },
  initialItemsPerPage: 10,
  showResultsOnLoad: true,
  filterFunction: (data, searchParams) => {
    return data.filter(document => {
      return (
        (searchParams.fileSignature === '' ||
          document.fileSignature.toLowerCase().includes(searchParams.fileSignature.toLowerCase())) &&
        (searchParams.documentName === '' ||
          document.documentName.toLowerCase().includes(searchParams.documentName.toLowerCase()))
      );
    });
  }
});

export const useDocumentSignatureStore = create((set, get) => ({
  loading: false,
  error: '',
  isValidateModalOpen: false,
  validateResult: null,
  validateSignature: '',

  // Fetch all document signatures (admin only)
  fetchDocuments: async () => {
    try {
      set({ loading: true, error: '' });

      const response = await documentApi.validations.getAll();
      
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch document signatures');
      }

      const searchStore = useDocumentSignatureSearchStore.getState();
      searchStore.setData(response.data);
      searchStore.initializeSearch();

      set({ error: '' });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      set({ error: error.message || 'Failed to load documents. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  // Search document signatures
  searchDocuments: async (filters = {}) => {
    try {
      set({ loading: true, error: '' });

      const response = await documentApi.validations.search(filters);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to search document signatures');
      }

      const searchStore = useDocumentSignatureSearchStore.getState();
      searchStore.setData(response.data);

      set({ error: '' });
    } catch (error) {
      console.error("Failed to search documents:", error);
      set({ error: error.message || 'Failed to search documents. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  // Create new document signature (admin only)
  createDocumentSignature: async (signatureData, file) => {
    try {
      set({ loading: true, error: '' });

      const formData = documentApi.helpers.createFormData(signatureData, file);
      const response = await documentApi.validations.create(formData);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to create document signature');
      }

      await get().fetchDocuments(); // Refresh the list

      Swal.fire({
        title: 'Success!',
        html: `
          <div style="text-align: center;">
            <p>Document uploaded successfully!</p>
            <p style="margin-top: 12px; font-size: 14px; color: #6b7280;">
              File signature has been automatically generated based on the file content.
            </p>
            ${response.data?.fileSignature ? `
              <div style="margin-top: 16px; padding: 12px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">File Signature:</p>
                <p style="font-size: 16px; font-weight: 600; color: #111827; font-family: monospace;">${response.data.fileSignature}</p>
              </div>
            ` : ''}
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error("Failed to create document validation:", error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create document signature';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details && Array.isArray(errorData.details)) {
          // Show validation errors
          errorMessage = errorData.details.map(d => d.msg).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      
      throw error;
    }
  },

  // Validate document by signature (public)
  validateDocumentSignature: async (signature) => {
    try {
      set({ loading: true, error: '', validateResult: null });

      const response = await documentApi.validations.validateSignature(signature);
      
      if (response.error) {
        set({ 
          validateResult: { 
            isValid: false, 
            message: response.message || 'Document validation failed' 
          }
        });
      } else {
        set({ 
          validateResult: { 
            isValid: true, 
            data: response.data,
            message: 'Document is valid'
          }
        });
      }

      set({ loading: false });
    } catch (error) {
      console.error("Failed to validate document:", error);
      set({ 
        loading: false,
        validateResult: { 
          isValid: false, 
          message: 'Document not found or invalid signature' 
        }
      });
    }
  },

  handleViewFile: (document) => {
    // Open file directly in new tab
    if (document.filePath) {
      window.open(document.filePath, '_blank', 'noopener,noreferrer');
    }
  },

  handleOpenValidateModal: () => {
    set({
      isValidateModalOpen: true,
      validateResult: null,
      validateSignature: ''
    });
  },

  handleCloseValidateModal: () => {
    set({
      isValidateModalOpen: false,
      validateResult: null,
      validateSignature: ''
    });
  },

  setValidateSignature: (signature) => {
    set({ validateSignature: signature });
  },

  handleDownload: async (document) => {
    try {
      const result = await Swal.fire({
        title: 'Download Document',
        text: `Do you want to download "${document.documentName}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6b7280',
        buttonsStyling: true,
        focusConfirm: false,
        customClass: {
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel'
        }
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Downloading...',
          text: 'Please wait while we prepare your download.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // If the document has a file path, download it
        if (document.filePath) {
          const success = await documentApi.helpers.downloadFile(
            document.filePath, 
            `${document.fileSignature}_${document.documentName}`
          );
          
          if (success) {
            Swal.fire({
              title: 'Download Successful',
              text: `"${document.documentName}" has been downloaded successfully.`,
              icon: 'success',
              confirmButtonColor: '#992525',
              buttonsStyling: true,
              customClass: {
                confirmButton: 'swal2-confirm'
              }
            });
          } else {
            throw new Error('Download failed');
          }
        } else {
          // Fallback: create a text file with document info
          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(`Document: ${document.documentName}\nFile Signature: ${document.fileSignature}\nCreated: ${document.createdAt}`));
          element.setAttribute('download', `${document.fileSignature}.txt`);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          Swal.fire({
            title: 'Download Successful',
            text: `"${document.documentName}" information has been downloaded successfully.`,
            icon: 'success',
            confirmButtonColor: '#992525',
            buttonsStyling: true,
            customClass: {
              confirmButton: 'swal2-confirm'
            }
          });
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
      Swal.fire({
        title: 'Download Failed',
        text: `Failed to download "${document.documentName}". Please try again.`,
        icon: 'error',
        confirmButtonColor: '#992525',
        buttonsStyling: true,
        customClass: {
          confirmButton: 'swal2-confirm'
        }
      });
    }
  },

  resetStore: () => set({
    loading: false,
    error: '',
    isValidateModalOpen: false,
    validateResult: null,
    validateSignature: ''
  })
})); 