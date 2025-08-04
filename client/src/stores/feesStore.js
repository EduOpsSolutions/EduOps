import { create } from 'zustand';
import createSearchStore from './searchStore';

// Sample data
const sampleCourses = [
  {
    id: 1,
    name: "A1 German Basic Course",
    batch: "Batch 1",
    year: "2024",
  },
  {
    id: 2,
    name: "A2 German Intermediate Course",
    batch: "Batch 2",
    year: "2023",
  },
  {
    id: 3,
    name: "B1 German Advanced Course",
    batch: "Batch 3",
    year: "2022",
  },
];

// Initial fees data
const initialFeesData = [
  {
    id: 1,
    description: "COURSE FEE",
    amount: "25,850.00",
    dueDate: "May 30, 2024",
  },
  {
    id: 2,
    description: "BOOKS",
    amount: "2,800.00",
    dueDate: "May 30, 2024",
  },
];

const useFeesSearchStore = createSearchStore({
  initialData: sampleCourses,
  defaultSearchParams: {
    courseName: "",
    batch: "",
    year: ""
  },
  searchableFields: ["name"],
  exactMatchFields: ["batch", "year"],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    return data.filter(course => {
      return (
        (params.courseName === "" || 
          course.name.toLowerCase().includes(params.courseName.toLowerCase())) &&
        (params.batch === "" || course.batch === params.batch) &&
        (params.year === "" || course.year === params.year)
      );
    });
  }
});

const useFeesStore = create((set, get) => ({
  fees: [...initialFeesData],
  isEditMode: false,
  editedFees: [],
  originalFees: [...initialFeesData],
  showAddFeeModal: false,
  showDiscardModal: false,
  showSaveModal: false,
  showSaveNotifyModal: false,

  handleEditFees: () => {
    const { fees } = get();
    set({
      isEditMode: true,
      editedFees: [...fees],
      originalFees: [...fees]
    });
  },

  handleAddFees: () => {
    set({ showAddFeeModal: true });
  },

  handleCloseAddFeeModal: () => {
    set({ showAddFeeModal: false });
  },

  handleAddFee: (newFee) => {
    const { fees } = get();
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formattedFee = {
      ...newFee,
      id: Math.max(...fees.map((f) => f.id), 0) + 1,
      amount: parseFloat(newFee.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      dueDate: formatDate(newFee.dueDate),
    };

    set((state) => ({
      fees: [...state.fees, formattedFee],
      showAddFeeModal: false
    }));
  },

  handleInputChange: (id, field, value) => {
    set((state) => ({
      editedFees: state.editedFees.map((fee) => 
        fee.id === id ? { ...fee, [field]: value } : fee
      )
    }));
  },

  handleConfirm: () => {
    set({ showSaveModal: true });
  },

  handleConfirmSave: () => {
    const { editedFees } = get();
    set({
      fees: [...editedFees],
      isEditMode: false,
      showSaveModal: false,
      showSaveNotifyModal: true,
      originalFees: [...editedFees]
    });
  },

  handleCancelSave: () => {
    set({ showSaveModal: false });
  },

  handleCloseSaveNotify: () => {
    set({ showSaveNotifyModal: false });
  },

  handleDiscard: () => {
    set({ showDiscardModal: true });
  },

  handleConfirmDiscard: () => {
    const { originalFees } = get();
    set({
      editedFees: [...originalFees],
      isEditMode: false,
      showDiscardModal: false
    });
  },

  handleCancelDiscard: () => {
    set({ showDiscardModal: false });
  },

  handleFieldUndo: (id, field) => {
    const { fees } = get();
    const originalFee = fees.find((fee) => fee.id === id);
    
    if (originalFee) {
      set((state) => ({
        editedFees: state.editedFees.map((fee) =>
          fee.id === id ? { ...fee, [field]: originalFee[field] } : fee
        )
      }));
    }
  },

  hasFieldChanged: (id, field) => {
    const { fees, editedFees } = get();
    const originalFee = fees.find((fee) => fee.id === id);
    const editedFee = editedFees.find((fee) => fee.id === id);
    return originalFee && editedFee && originalFee[field] !== editedFee[field];
  },

  handleDeleteFee: (id) => {
    const { isEditMode } = get();
    
    if (isEditMode) {
      set((state) => ({
        editedFees: state.editedFees.filter((fee) => fee.id !== id)
      }));
    } else {
      set((state) => ({
        fees: state.fees.filter((fee) => fee.id !== id)
      }));
    }
  },

  handleCancelEdit: () => {
    const { originalFees } = get();
    set({
      isEditMode: false,
      editedFees: [...originalFees],
      showAddFeeModal: false,
      showDiscardModal: false,
      showSaveModal: false,
      showSaveNotifyModal: false
    });
  },

  resetStore: () => {
    set({
      fees: [...initialFeesData],
      isEditMode: false,
      editedFees: [],
      originalFees: [...initialFeesData],
      showAddFeeModal: false,
      showDiscardModal: false,
      showSaveModal: false,
      showSaveNotifyModal: false
    });
  }
}));

export { useFeesSearchStore, useFeesStore };