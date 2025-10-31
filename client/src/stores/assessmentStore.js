import { create } from 'zustand';
import createSearchStore from './searchStore';
import { getCookieItem } from '../utils/jwt';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const fetchAssessmentList = async () => {
  const token = getCookieItem('token');
  const res = await fetch(`${API_BASE_URL}/assessment`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch assessment list');
  const data = await res.json();
  // Map backend data to frontend structure, including courseId and batchId
  const mapped = data.map((item, idx) => ({
    id: item.studentId || idx,
    name: item.name,
    course: item.course,
    courseId: item.courseId,
    batch: item.batch,
    batchId: item.batchId,
    year: String(item.year),
    fees: [
      { description: 'COURSE FEE', amount: item.netAssessment?.toLocaleString('en-US', { minimumFractionDigits: 2 }), dueDate: '' }
    ],
    totalPayments: item.totalPayments?.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    remainingBalance: item.remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })
  }));
  return mapped;
};

// Custom search store for assessment that fetches data on initializeSearch
const useAssessmentSearchStore = createSearchStore({
  initialData: [],
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
  },
  fetchFunction: fetchAssessmentList
});

// Patch the initializeSearch method to fetch if data is empty
const originalInit = useAssessmentSearchStore.getState().initializeSearch;
useAssessmentSearchStore.getState().initializeSearch = async () => {
  const state = useAssessmentSearchStore.getState();
  if (state.data.length === 0) {
    useAssessmentSearchStore.setState({ isLoading: true, error: null });
    try {
      const fetched = await fetchAssessmentList();
      useAssessmentSearchStore.getState().setData(fetched);
      useAssessmentSearchStore.getState().performSearch();
    } catch (err) {
      useAssessmentSearchStore.setState({ error: err.message || 'Failed to fetch data' });
    } finally {
      useAssessmentSearchStore.setState({ isLoading: false });
    }
  } else {
    originalInit();
  }
};

// API endpoint for single student assessment (now uses studentId, courseId, batchId)
const fetchStudentAssessment = async (studentId, courseId, batchId) => {
  const token = getCookieItem('token');
  const res = await fetch(`${API_BASE_URL}/assessment/${studentId}?courseId=${courseId}&academicPeriodId=${batchId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error('Failed to fetch student assessment');
  const data = await res.json();
  // Map backend data to frontend structure for selectedStudent
  const fees = [];
  // Add course base price as a fee row if present
  if (data.course && data.course.price) {
    fees.push({
      description: `COURSE FEE${data.course.name ? ` (${data.course.name})` : ''}`,
      amount: Number(data.course.price).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      dueDate: ''
    });
  }
  // Add other fees (exclude any fee that is the base course fee)
  if (data.fees && Array.isArray(data.fees)) {
    data.fees.forEach(fee => {
      // Only add if fee.name is not 'COURSE FEE' or does not match the base course fee
      if (
        !data.course ||
        !fee.name ||
        fee.name.toLowerCase() !== 'course fee' && fee.name !== data.course.name
      ) {
        fees.push({
          description: fee.name,
          amount: Number(fee.price).toLocaleString('en-US', { minimumFractionDigits: 2 }),
          dueDate: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US') : ''
        });
      }
    });
  }
  return {
    id: data.studentId,
    name: data.name || '',
    course: data.course?.name || '',
    batch: data.batch?.batchName || '',
    year: data.batch?.year || '',
    courseId: data.course?.id,
    batchId: data.batch?.id,
    fees,
    studentFees: data.studentFees || [],
    netAssessment: data.netAssessment || 0,
    totalPayments: Number(data.totalPayments || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    remainingBalance: Number(data.remainingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
  };
};

const useAssessmentStore = create((set, get) => ({
  selectedStudent: null,
  transactionHistoryModal: false,
  addFeesModal: false,
  
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  clearSelectedStudent: () => set({ selectedStudent: null }),
  
  handleStudentSelect: async (student) => {
    // Fetch full assessment details for this student, course, and batch
    try {
      const detail = await fetchStudentAssessment(student.id, student.courseId, student.batchId);
      set({ selectedStudent: detail });
    } catch (err) {
      // fallback to basic info if fetch fails
      set({ selectedStudent: student });
    }
  },

  handleBackToResults: async () => {
    set({ selectedStudent: null });
    const fetched = await fetchAssessmentList();
    useAssessmentSearchStore.getState().setData(fetched);
    useAssessmentSearchStore.getState().performSearch();
  },

  openTransactionHistoryModal: () => set({ transactionHistoryModal: true }),
  closeTransactionHistoryModal: () => set({ transactionHistoryModal: false }),
  openAddFeesModal: () => set({ addFeesModal: true }),
  closeAddFeesModal: () => set({ addFeesModal: false }),

  handleAddFee: async (feeData) => {
    const { selectedStudent } = get();
    if (!selectedStudent) return;

    try {
      const token = getCookieItem('token');
      const res = await fetch(`${API_BASE_URL}/student-fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...feeData,
          studentId: selectedStudent.id,
          courseId: selectedStudent.courseId,
          batchId: selectedStudent.batchId
        })
      });
      if (!res.ok) throw new Error('Failed to add fee/discount');
      // After successful add, re-fetch assessment list and selected student details
      await useAssessmentSearchStore.getState().initializeSearch();
      // Refresh selected student details
      const detail = await fetchStudentAssessment(selectedStudent.id, selectedStudent.courseId, selectedStudent.batchId);
      set({
        selectedStudent: detail,
        addFeesModal: false
      });
    } catch (err) {
      set({ addFeesModal: false });
    }
  },

  handleDeleteFee: async (feeId) => {
    const { selectedStudent } = get();
    if (!selectedStudent) return;
    try {
      const token = getCookieItem('token');
      const res = await fetch(`${API_BASE_URL}/student-fees/${feeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to delete fee/discount');
      // After successful delete, refresh selected student details
      const detail = await fetchStudentAssessment(selectedStudent.id, selectedStudent.courseId, selectedStudent.batchId);
      set({ selectedStudent: detail });
    } catch (err) {
      console.error(err);
    }
  },

}));

export { useAssessmentSearchStore, useAssessmentStore };