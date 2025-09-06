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
    remarks: "Done",
    email: "arthur.morgan@example.com",
    phone: "555-123-4567",
    mode: "delivery",
    paymentMethod: "Cash on Delivery",
    address: "2861 Valentine Ave, Valentine, TX 78814",
    city: "Valentine",
    state: "TX",
    zipCode: "78814",
    country: "United States",
    purpose: "Employment Application",
    additionalNotes: "Please expedite if possible"
  },
  {
    id: 2,
    date: "2023-07-16",
    displayDate: "July 16, 2023",
    name: "John Marston",
    document: "Form 138",
    status: "Delivered",
    remarks: "Done",
    email: "john.marston@example.com",
    phone: "555-234-5678",
    mode: "pickup",
    paymentMethod: "Cash (Pay upon Pickup)",
    purpose: "School Transfer",
    additionalNotes: "Need for enrollment at new school"
  },
  {
    id: 3,
    date: "2024-05-20",
    displayDate: "May 20, 2024",
    name: "Polano Dolor",
    document: "Certificate of Enrollment",
    status: "In Transit",
    remarks: "Processing",
    email: "polano.dolor@example.com",
    phone: "555-345-6789",
    mode: "delivery",
    paymentMethod: "Online (Maya)",
    address: "1478 Saint Denis St, Lemoyne, LA 70130",
    city: "Lemoyne",
    state: "LA",
    zipCode: "70130",
    country: "United States",
    purpose: "Scholarship Application",
    additionalNotes: "Required for scholarship submission"
  },
  {
    id: 4,
    date: "2024-03-10",
    displayDate: "March 10, 2024",
    name: "John Doe",
    document: "Transcript of Records",
    status: "In Process",
    remarks: "Under review",
    email: "john.doe@example.com",
    phone: "555-456-7890",
    mode: "pickup",
    paymentMethod: "Cash (Pay upon Pickup)",
    purpose: "Graduate Studies Application",
    additionalNotes: "Need certified copy"
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
  viewDetailsModal: false,
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
      updateStatus: "In Transit",
      updateRemarks: ""
    });
  },

  closeViewDetailsModal: () => {
    set({
      viewDetailsModal: false,
      selectedRequest: null
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
      viewDetailsModal: false,
      updateStatus: "In Transit",
      updateRemarks: ""
    });
  }
}));

export { useDocumentRequestSearchStore, useDocumentRequestStore };