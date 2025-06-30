import { create } from 'zustand';
import createSearchStore from './searchStore';

// Sample data
const sampleStudents = [
  {
    id: 1,
    studentId: "3213562",
    studentName: "Polano Dolor",
    course: "A1 German Basic",
    email: "polanodolor@gmail.com",
    phoneNumber: "09123456789",
  },
  {
    id: 2,
    studentId: "3213563",
    studentName: "Juan Dela Cruz",
    course: "A2 German Intermediate",
    email: "juan.delacruz@gmail.com",
    phoneNumber: "09987654321",
  },
  {
    id: 3,
    studentId: "3213564",
    studentName: "Maria Santos",
    course: "B1 German Advanced",
    email: "maria.santos@gmail.com",
    phoneNumber: "09111222333",
  },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: i + 4,
    studentId: `321356${i + 5}`,
    studentName: `Test Student ${i + 1}`,
    course: `${["A1", "A2", "B1", "B2", "C1"][i % 5]} German ${
      ["Basic", "Intermediate", "Advanced"][i % 3]
    }`,
    email: `student${i + 1}@example.com`,
    phoneNumber: `091234567${String(i % 100).padStart(2, "0")}`,
  })),
];

const useTransactionSearchStore = createSearchStore({
  initialData: sampleStudents,
  defaultSearchParams: {
    searchTerm: ""
  },
  searchableFields: ["studentName", "studentId"],
  exactMatchFields: [],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    return data.filter(student => 
      student.studentName.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
      student.studentId.includes(params.searchTerm)
    );
  },
  showResultsOnLoad: true
});

const useTransactionStore = create((set, get) => ({
  selectedStudent: null,
  addTransactionModal: false,
  
  openAddTransactionModal: () => set({ addTransactionModal: true }),
  closeAddTransactionModal: () => set({ addTransactionModal: false }),

  handleStudentClick: (student) => {
    set({ selectedStudent: student, addTransactionModal: true });
  },

  handleModalSubmit: (transactionData) => {
    console.log('Transaction submitted:', transactionData);
    set({ addTransactionModal: false, selectedStudent: null });
  },

  resetStore: () => {
    set({
      selectedStudent: null,
      addTransactionModal: false
    });
  }
}))

export { useTransactionSearchStore, useTransactionStore };