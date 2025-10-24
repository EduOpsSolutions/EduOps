import { create } from 'zustand';
import createSearchStore from './searchStore';
import { getCookieItem } from '../utils/jwt';


const token = getCookieItem('token');
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Fetch course-batch pairs
const fetchCourseBatchPairs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fees/course-batches`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching course-batch pairs:', error);
    throw error;
  }
};

// Fetch fees for a specific course and batch
const fetchFees = async (courseId, batchId) => {
  try {
    const token = getCookieItem('token');
    const response = await fetch(`${API_BASE_URL}/fees?courseId=${courseId}&batchId=${batchId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
};

// Edit a fee by ID
const editFee = async (id, updatedData) => {
  try {
    const token = getCookieItem('token');
    const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error editing fee:', error);
    throw error;
  }
};

// Delete fee by ID
const deleteFee = async (id) => {
  try {
    const token = getCookieItem('token');
    const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw error;
  }
};

const useFeesSearchStore = createSearchStore({
  initialData: [],
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
  },
  fetchData: fetchCourseBatchPairs
});

const useFeesStore = create((set, get) => ({
  fees: [],
  isEditMode: false,
  editedFees: [],
  originalFees: [],
  showAddFeeModal: false,
  showDiscardModal: false,
  showSaveModal: false,
  showSaveNotifyModal: false,
  showDeleteModal: false,
  feeToDelete: null,

  fetchFees: async (courseId, batchId) => {
    const fees = await fetchFees(courseId, batchId);
    set({fees, originalFees: [...fees], editedFees: [...fees]});
  },

  openDeleteModal: (id) => set({ showDeleteModal: true, feeToDelete: id }),
  closeDeleteModal: () => set({ showDeleteModal: false, feeToDelete: null }),

  confirmDeleteFee: async () => {
    const { feeToDelete, handleDeleteFee, closeDeleteModal } = get();
    if (feeToDelete) {
      await handleDeleteFee(feeToDelete);
      closeDeleteModal();
    }
  },

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

  handleAddFee: async (newFee) => {
    const token = getCookieItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFee)
      });
      if (!response.ok) throw new Error('Failed to add fee');
      const createdFee = await response.json();
      set((state) => ({
        fees: [...state.fees, createdFee],
        showAddFeeModal: false
      }));
    } catch (error) {
      console.error('Error adding fee:', error);
      // Optionally, handle error state here
    }
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

handleConfirmSave: async () => {
  const { editedFees, originalFees } = get();
  const token = getCookieItem('token');
  try {
    // Only update fees that have changed
    for (const fee of editedFees) {
      const payload = {
        name: fee.name,
        price: fee.price,
        dueDate: fee.dueDate
      };
      await editFee(fee.id, payload);
    }
    set({
      fees: [...editedFees],
      isEditMode: false,
      showSaveModal: false,
      showSaveNotifyModal: true,
      originalFees: [...editedFees]
    });
  } catch (error) {
    console.error('Error saving fees:', error);
  }
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

  handleDeleteFee: async (id) => {
    const { isEditMode } = get();
    try{
      await deleteFee(id);
      if (isEditMode) {
      set((state) => ({
        editedFees: state.editedFees.filter((fee) => fee.id !== id)
      }));
    } else {
      set((state) => ({
        fees: state.fees.filter((fee) => fee.id !== id)
      }));
    }
    } catch (error) {
      console.error('Error deleting fee:', error);
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
      fees: [],
      isEditMode: false,
      editedFees: [],
      originalFees: [],
      showAddFeeModal: false,
      showDiscardModal: false,
      showSaveModal: false,
      showSaveNotifyModal: false
    });
  }
}));

export { useFeesSearchStore, useFeesStore };