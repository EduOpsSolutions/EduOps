import { create } from 'zustand';
import createSearchStore from './searchStore';
import Swal from 'sweetalert2';

const sampleDocuments = [
  {
    id: 1,
    documentName: "Certificate",
    description: "Official academic certificate",
    privacy: "Teacher's Only",
    requestBasis: "Yes",
    downloadable: "Yes",
    price: "Paid",
    amount: "25,850.00",
    uploadFile: "certificate_template.pdf",
    isHidden: false
  },
  {
    id: 2,
    documentName: "Form 138",
    description: "Report card for academic records",
    privacy: "Student's Only",
    requestBasis: "Yes",
    downloadable: "No",
    price: "Free",
    amount: "",
    uploadFile: "form138_template.pdf",
    isHidden: false
  },
];

const useManageDocumentsSearchStore = createSearchStore({
  initialData: sampleDocuments,
  defaultSearchParams: {
    documentName: "",
    privacy: "",
    price: ""
  },
  searchableFields: ["documentName", "description", "privacy", "price"],
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
        (params.price === "Free" && (!document.price || document.price === "Free")) ||
        (params.price === "Paid" && document.price === "Paid");

      return documentNameMatch && privacyMatch && priceMatch;
    });
  }
});

const useManageDocumentsStore = create((set, get) => ({
  documents: [...sampleDocuments],
  showAddDocumentModal: false,
  showEditDocumentModal: false,
  selectedDocument: null,

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

  handleUpdateDocument: (updatedDocument) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc =>
      doc.id === updatedDocument.id ? updatedDocument : doc
    );

    set({
      documents: updatedDocuments,
      showEditDocumentModal: false,
      selectedDocument: null
    });

    const searchStore = useManageDocumentsSearchStore.getState();
    searchStore.updateData(updatedDocuments);

    Swal.fire({
      title: 'Success!',
      text: 'Document has been updated successfully.',
      icon: 'success',
      confirmButtonColor: '#992525',
    });
  },

  handleAddDocument: () => {
    set({ showAddDocumentModal: true });
  },

  handleCloseAddDocumentModal: () => {
    set({ showAddDocumentModal: false });
  },

  handleAddDocumentSubmit: (newDocument) => {
    const { documents } = get();

    const formattedDocument = {
      ...newDocument,
      id: Math.max(...documents.map((d) => d.id), 0) + 1,
      amount: newDocument.price === "Paid" && newDocument.amount ?
        parseFloat(newDocument.amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : "",
      isHidden: false
    };

    const updatedDocuments = [...documents, formattedDocument];
    set({
      documents: updatedDocuments,
      showAddDocumentModal: false
    });

    const searchStore = useManageDocumentsSearchStore.getState();
    searchStore.updateData(updatedDocuments);

    Swal.fire({
      title: 'Success!',
      text: 'Document has been added successfully.',
      icon: 'success',
      confirmButtonColor: '#992525',
    });
  },

  handleDeleteDocument: (id) => {
    const { documents } = get();
    const updatedDocuments = documents.filter((document) => document.id !== id);
    set({
      documents: updatedDocuments
    });

    const searchStore = useManageDocumentsSearchStore.getState();
    searchStore.updateData(updatedDocuments);
  },

  handleHideDocument: (id) => {
    const { documents } = get();
    const updatedDocuments = documents.map((document) =>
      document.id === id
        ? { ...document, isHidden: !document.isHidden }
        : document
    );
    set({
      documents: updatedDocuments
    });

    const searchStore = useManageDocumentsSearchStore.getState();
    searchStore.updateData(updatedDocuments);
  },

  resetStore: () => {
    set({
      documents: [...sampleDocuments],
      showAddDocumentModal: false,
      showEditDocumentModal: false,
      selectedDocument: null
    });
  }
}));

export { useManageDocumentsStore, useManageDocumentsSearchStore };