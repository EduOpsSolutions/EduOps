import { create } from 'zustand';
import createSearchStore from './searchStore';

const sampleDocumentRequests = [
  {
    id: 1,
    date: "2024-04-16",
    displayDate: "April 16, 2024",
    name: "Arthur Morgan",
    document: "Certificate of Good Moral",
    status: "Delivered",
    remarks: "Done"
  },
  {
    id: 2,
    date: "2023-07-16",
    displayDate: "July 16, 2023",
    name: "John Marston",
    document: "Form 138",
    status: "Delivered",
    remarks: "Done"
  },
  {
    id: 3,
    date: "2024-05-20",
    displayDate: "May 20, 2024",
    name: "Polano Dolor",
    document: "Certificate of Enrollment",
    status: "In Transit",
    remarks: "Processing"
  },
  {
    id: 4,
    date: "2024-03-10",
    displayDate: "March 10, 2024",
    name: "John Doe",
    document: "Transcript of Records",
    status: "In Process",
    remarks: "Under review"
  },
];

const useDocumentRequestSearchStore = createSearchStore({
  initialData: sampleDocumentRequests,
  defaultSearchParams: {
    name: "",
    document: "",
    status: "",
    sortBy: "descending"
  },
  searchableFields: ["name"],
  exactMatchFields: ["document", "status"],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    let filteredResults = [...data];

    if (params.name?.trim()) {
      filteredResults = filteredResults.filter(request =>
        request.name.toLowerCase().includes(params.name.toLowerCase())
      );
    }

    if (params.document) {
      filteredResults = filteredResults.filter(request =>
        request.document === params.document
      );
    }

    if (params.status) {
      filteredResults = filteredResults.filter(request =>
        request.status === params.status
      );
    }

    filteredResults.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
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
  updateStatus: "In Transit",
  updateRemarks: "",

  handleRequestSelect: (request) => {
    set({
      selectedRequest: request,
      updateStatus: request.status,
      updateRemarks: request.remarks || "",
      updateModal: true
    });
  },

  closeUpdateModal: () => {
    set({
      updateModal: false,
      selectedRequest: null,
      updateStatus: "In Transit",
      updateRemarks: ""
    });
  },

  setUpdateStatus: (status) => {
    set({ updateStatus: status });
  },

  setUpdateRemarks: (remarks) => {
    set({ updateRemarks: remarks });
  },

  handleSubmitStatusUpdate: () => {
    const { selectedRequest, updateStatus, updateRemarks } = get();
    
    if (!selectedRequest) return;

    const searchStore = useDocumentRequestSearchStore.getState();
    const updatedData = searchStore.data.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: updateStatus,
          remarks: updateRemarks
        };
      }
      return request;
    });

    searchStore.updateData(updatedData);
    searchStore.handleSearch();

    get().closeUpdateModal();
  },

  resetStore: () => {
    set({
      selectedRequest: null,
      updateModal: false,
      updateStatus: "In Transit",
      updateRemarks: ""
    });
  }
}));

export { useDocumentRequestSearchStore, useDocumentRequestStore };