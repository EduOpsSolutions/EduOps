import { create } from 'zustand';
import createSearchStore from './searchStore';
import Swal from 'sweetalert2';

// Sample data for now
const mockDocuments = [
  {
    id: 1,
    fileSignature: "sdj768djk",
    documentName: "Grades - Polando Dolor",
    createdAt: "2024-03-23"
  },
  {
    id: 2,
    fileSignature: "sdj3154d",
    documentName: "TOR - James Williams", 
    createdAt: "2024-02-10"
  },
  {
    id: 3,
    fileSignature: "abc123xy",
    documentName: "Certificate - Maria Santos",
    createdAt: "2024-03-15"
  },
  {
    id: 4,
    fileSignature: "def456uv",
    documentName: "Transcript - John Doe",
    createdAt: "2024-03-20"
  }
];

export const useDocumentValidationSearchStore = createSearchStore({
  initialData: mockDocuments,
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

export const useDocumentValidationStore = create((set, get) => ({
  selectedDocument: null,
  loading: false,
  error: '',
  
  isViewerModalOpen: false,
  
  fetchDocuments: async () => {
    try {
      set({ loading: true, error: '' });
      
      const searchStore = useDocumentValidationSearchStore.getState();
      searchStore.setData(mockDocuments);
      
      set({ error: '' });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      set({ error: 'Failed to load documents. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  handleViewFile: (document) => {
    set({
      selectedDocument: document,
      isViewerModalOpen: true
    });
  },

  handleCloseViewer: () => {
    set({
      isViewerModalOpen: false,
      selectedDocument: null
    });
  },

  handleDownload: async (document) => {
    try {
      const result = await Swal.fire({
        title: 'Download Document',
        text: `Do you want to download "${document.documentName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
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

        setTimeout(() => {
          Swal.fire({
            title: 'Download Successful',
            text: `"${document.documentName}" has been downloaded successfully.`,
            icon: 'success',
            confirmButtonColor: '#dc2626',
          });
          
          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
            encodeURIComponent(`Document: ${document.documentName}\nFile Signature: ${document.fileSignature}\nCreated: ${document.createdAt}`));
          element.setAttribute('download', `${document.fileSignature}.txt`);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }, 1500);
      }
    } catch (error) {
      console.error("Download failed:", error);
      Swal.fire({
        title: 'Download Failed',
        text: `Failed to download "${document.documentName}". Please try again.`,
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  },

  resetStore: () => set({
    selectedDocument: null,
    loading: false,
    error: '',
    isViewerModalOpen: false,
  })
})); 