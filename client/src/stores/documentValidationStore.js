import { create } from 'zustand';
import documentApi from '../utils/documentApi';
import crypto from 'crypto-js';

export const useDocumentValidationStore = create((set, get) => ({
  loading: false,
  error: null,
  documentInfo: null,
  comparisonResult: null,

  // Validate signature and fetch document info
  validateSignature: async (signature) => {
    try {
      set({ loading: true, error: null, documentInfo: null, comparisonResult: null });

      const response = await documentApi.validations.validateSignature(signature);
      
      if (response.error) {
        set({ 
          loading: false, 
          error: 'Invalid Signature Passed, Please try again.',
          documentInfo: null 
        });
        return;
      }

      set({ 
        loading: false, 
        documentInfo: response.data,
        error: null 
      });
    } catch (error) {
      console.error('Validation error:', error);
      set({ 
        loading: false, 
        error: 'Invalid Signature Passed, Please try again.',
        documentInfo: null 
      });
    }
  },

  // Compare uploaded file signature with document signature
  compareFileSignature: async (file, expectedSignature) => {
    try {
      set({ loading: true });

      // Read file and generate signature
      const fileSignature = await get().generateFileSignature(file);
      
      const isMatch = fileSignature === expectedSignature;

      set({ 
        loading: false,
        comparisonResult: {
          isMatch,
          uploadedSignature: fileSignature,
          expectedSignature
        }
      });
    } catch (error) {
      console.error('File comparison error:', error);
      set({ 
        loading: false,
        error: 'Failed to compare file signatures. Please try again.'
      });
    }
  },

  // Generate file signature (SHA-256 hash)
  generateFileSignature: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const wordArray = crypto.lib.WordArray.create(arrayBuffer);
          const hash = crypto.SHA256(wordArray).toString();
          const signature = hash.substring(0, 7);
          resolve(signature);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  },

  // Reset validation state
  resetValidation: () => {
    set({ 
      documentInfo: null, 
      comparisonResult: null, 
      error: null 
    });
  },

  // Reset entire store
  resetStore: () => {
    set({ 
      loading: false,
      error: null,
      documentInfo: null,
      comparisonResult: null
    });
  }
}));

export default useDocumentValidationStore;
