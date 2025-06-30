import { create } from 'zustand';
import createSearchStore from './searchStore';

// Sample data
const sampleStudents = [
  {
    id: 1,
    name: "DOLOR, POLANO I.",
    course: "A1",
    batch: "Batch 1",
    year: "2024",
    fees: [
      { description: "COURSE FEE", amount: "25,850.00", dueDate: "May 30, 2024" },
      { description: "BOOKS", amount: "2,800.00", dueDate: "May 30, 2024" }
    ],
    totalPayments: "0",
    remainingBalance: "28,650.00"
  },
  {
    id: 2,
    name: "SMITH, JOHN A.",
    course: "A2",
    batch: "Batch 2",
    year: "2024",
    fees: [
      { description: "COURSE FEE", amount: "27,500.00", dueDate: "June 15, 2024" },
      { description: "BOOKS", amount: "3,200.00", dueDate: "June 15, 2024" }
    ],
    totalPayments: "15,000.00",
    remainingBalance: "15,700.00"
  }
];

const useAssessmentSearchStore = createSearchStore({
  initialData: sampleStudents,
  defaultSearchParams: {
    name: "",
    course: "",
    batch: "",
    year: ""
  },
  searchableFields: ["name"],
  exactMatchFields: ["course", "batch", "year"],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    return data.filter(student => {
      const nameMatch = !params.name || 
        student.name.toLowerCase().includes(params.name.toLowerCase());
      const courseMatch = !params.course || student.course === params.course;
      const batchMatch = !params.batch || student.batch === params.batch;
      const yearMatch = !params.year || student.year === params.year;
      
      return nameMatch && courseMatch && batchMatch && yearMatch;
    });
  }
});


const useAssessmentStore = create((set, get) => ({
  selectedStudent: null,
  transactionHistoryModal: false,
  addFeesModal: false,
  
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  clearSelectedStudent: () => set({ selectedStudent: null }),
  
  handleStudentSelect: (student) => {
    set({ selectedStudent: student });
  },

  handleBackToResults: () => {
    set({ selectedStudent: null });
  },

  openTransactionHistoryModal: () => set({ transactionHistoryModal: true }),
  closeTransactionHistoryModal: () => set({ transactionHistoryModal: false }),
  openAddFeesModal: () => set({ addFeesModal: true }),
  closeAddFeesModal: () => set({ addFeesModal: false }),

  handleAddFee: (feeData) => {
    const { selectedStudent } = get();
    if (!selectedStudent) return;

    const updatedFees = [...selectedStudent.fees, feeData];
    const updatedStudent = { ...selectedStudent, fees: updatedFees };
    
    set({
      selectedStudent: updatedStudent,
      addFeesModal: false
    });
  },

  calculateNetAssessment: (fees) => {
    if (!fees || fees.length === 0) return "0.00";
    
    return fees.reduce((total, fee) => {
      const amount = parseFloat(fee.amount.replace(/,/g, '')) || 0;
      return total + amount;
    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  resetStore: () => {
    set({
      selectedStudent: null,
      transactionHistoryModal: false,
      addFeesModal: false
    });
  }
}));

export { useAssessmentSearchStore, useAssessmentStore };