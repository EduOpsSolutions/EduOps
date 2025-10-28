import { create } from 'zustand';

import createSearchStore from './searchStore';
import axios from 'axios';

// Initial ledger entries
const initialLedgerEntries = [
  {
    id: 1,
    date: "4/3/24",
    time: "6:29:23AM",
    orNumber: "100000058",
    debitAmount: "28,650.00",
    creditAmount: "0.00",
    balance: "28,650.00",
    type: "Assessment",
    remarks: "Assessment Computation"
  }
];

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
  
  fetchFunction: async (params) => {
    // Fetch real student data from /api/v1/assessment
    const res = await axios.get('/api/v1/assessment');
    let students = res.data || [];
    console.log('[LedgerStore] fetchFunction got students:', students);
    // Filter client-side for now (can be optimized server-side if needed)
    if (params.studentName) {
      students = students.filter(s => s.name.toLowerCase().includes(params.studentName.toLowerCase()));
    }
    if (params.course) {
      students = students.filter(s => s.course === params.course);
    }
    if (params.batch) {
      students = students.filter(s => s.batch === params.batch);
    }
    if (params.year) {
      students = students.filter(s => String(s.year) === String(params.year));
    }
    return students;
  }
});

const useLedgerStore = create((set, get) => ({
  selectedStudent: null,
  showLedger: false,
  isModalOpen: false,
  ledgerEntries: [...initialLedgerEntries],

  setSelectedStudent: (student) => set({ selectedStudent: student }),
  
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

  handleModalSubmit: (transactionData) => {
    const { ledgerEntries } = get();
    
    // Calculation
    const lastEntry = ledgerEntries[ledgerEntries.length - 1];
    const lastBalance = parseFloat(lastEntry?.balance.replace(/,/g, '') || '0');
    const debitAmount = parseFloat(transactionData.debitAmount?.replace(/,/g, '') || '0');
    const creditAmount = parseFloat(transactionData.creditAmount?.replace(/,/g, '') || '0');
    const newBalance = lastBalance + debitAmount - creditAmount;

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: '2-digit' 
      }),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      orNumber: transactionData.orNumber || `${Date.now()}`,
      debitAmount: transactionData.debitAmount || "0.00",
      creditAmount: transactionData.creditAmount || "0.00",
      balance: newBalance.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }),
      type: transactionData.typeOfFee || "Manual Entry",
      remarks: transactionData.remarks || ""
    };

    set((state) => ({
      ledgerEntries: [...state.ledgerEntries, newEntry],
      isModalOpen: false
    }));
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
      ledgerEntries: [...initialLedgerEntries]
    });
  }
}));

export { useLedgerSearchStore, useLedgerStore };