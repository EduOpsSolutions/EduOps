import { create } from 'zustand';

import createSearchStore from './searchStore';
import axios from 'axios';
import { getCookieItem } from '../utils/jwt';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const useLedgerSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    studentName: "",
    course: "",
    batch: "",
    year: ""
  },
  searchableFields: ["name"],
  exactMatchFields: ["course", "batch", "year"],
  initialItemsPerPage: 10,

});

const useLedgerStore = create((set, get) => ({
  selectedStudent: null,
  showLedger: false,
  isModalOpen: false,
  ledgerEntries: [],

  setSelectedStudent: (student) => set({ selectedStudent: student, showLedger: true }),
  
  clearSelectedStudent: () => set({ 
    selectedStudent: null, 
    showLedger: false 
  }),

  handleStudentClick: (student) => {
    set({
      selectedStudent: student,
      showLedger: true
    });
  },

  handleBackToResults: () => {
    set({
      selectedStudent: null,
      showLedger: false
    });
  },

  openAddTransactionModal: () => set({ isModalOpen: true }),
  
  closeAddTransactionModal: () => set({ isModalOpen: false }),

  handleModalSubmit: async (formData) => {
    try {
      const token = getCookieItem('token');
      let payload;
      if (!formData.isDebitDisabled && formData.debitAmount) {
        // DEBIT AMOUNT - Student Fee
        payload = {
          studentId: formData.userId,
          type: formData.typeOfFee,
          amount: formData.debitAmount,
          name: formData.typeOfFee,
        ...(formData.courseId && { courseId: formData.courseId }),
        ...(formData.academicPeriodId && { batchId: formData.academicPeriodId })
        }
        await axios.post(`${API_BASE_URL}/student-fees`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (!formData.isCreditDisabled && formData.creditAmount) {
        // CREDIT AMOUNT - Payments
        payload = {
          studentId: formData.studentId,
          purpose: formData.typeOfFee,
          referenceNumber: formData.orNumber,
          remarks: formData.remarks,
          amountPaid: formData.creditAmount,
          ...(formData.courseId && { courseId: formData.courseId }),
          ...(formData.academicPeriodId && { academicPeriodId: formData.academicPeriodId })
        };
        await axios.post(`${API_BASE_URL}/payments/manual`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        throw new Error('Please enter a valid Debit or Credit amount.');
      }
      set({ isModalOpen: false });
    } catch (error) {
      // handle error as needed
      throw error;
    }
  },

  // Data management
  setLedgerEntries: (entries) => {
    set({ ledgerEntries: entries });
  },

  addLedgerEntry: (entry) => {
    set((state) => ({
      ledgerEntries: [...state.ledgerEntries, entry]
    }));
  },

  updateLedgerEntry: (id, updatedEntry) => {
    set((state) => ({
      ledgerEntries: state.ledgerEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    }));
  },

  deleteLedgerEntry: (id) => {
    set((state) => ({
      ledgerEntries: state.ledgerEntries.filter((entry) => entry.id !== id)
    }));
  },

  resetStore: () => {
    set({
      selectedStudent: null,
      showLedger: false,
      isModalOpen: false,
      ledgerEntries: []
    });
  }
}));

export { useLedgerSearchStore, useLedgerStore };