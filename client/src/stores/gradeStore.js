import { create } from 'zustand';
import { getCookieItem } from '../utils/jwt';

export const useGradeSearchStore = create((set, get) => ({
  searchTerm: '',
  currentPage: 1,
  itemsPerPage: 5,
  filteredSchedules: [],
  totalItems: 0,
  totalPages: 0,

  setSearchTerm: (term) => {
    set({ searchTerm: term, currentPage: 1 });
    const store = get();
    store.filterSchedules();
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  setItemsPerPage: (itemsPerPage) => {
    set({ itemsPerPage, currentPage: 1 });
    const store = get();
    store.filterSchedules();
  },

  filterSchedules: () => {
    const { searchTerm, itemsPerPage } = get();
    const { schedules } = useGradeStore.getState();

    const filtered = schedules.filter(schedule =>
      schedule.course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.days.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${schedule.time_start} - ${schedule.time_end}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    set({
      filteredSchedules: filtered,
      totalItems,
      totalPages
    });
  },

  resetSearch: () => {
    set({
      searchTerm: '',
      currentPage: 1,
      itemsPerPage: 5
    });
    const store = get();
    store.filterSchedules();
  }
}));

const useGradeStore = create((set, get) => ({
  loading: false,
  error: null,
  schedules: [],
  students: [],
  selectedSchedule: null,
  gradeNotReadyModal: false,
  gradeDetailsModal: false,
  studentsGradeModal: false,
  gradesVisible: false,
  localGrades: [],
  changesMade: false,
  saving: false,
  pendingFiles: {}, // Store pending files: { studentId: { file, fileName, studentGradeId, studentId, courseId, periodId, userId } }

  _persistentStudentData: {},
  _persistentVisibility: {},
  gradeStatusOptions: [
    { value: 'ng', label: 'NG', color: 'bg-gray-300' },
    { value: 'pass', label: 'PASS', color: 'bg-green-500' },
    { value: 'fail', label: 'FAIL', color: 'bg-red-400' },
  ],


  getStudentGrade: (studentGradeId, userId) => {
    const { localGrades, students } = get();
    
    // If studentGradeId is null, prioritize userId lookup
    if (!studentGradeId || studentGradeId === null) {
      if (userId) {
        const localGradeByUser = localGrades.find(item => item.userId === userId);
        if (localGradeByUser) {
          return localGradeByUser.grade;
        }
      }
    } else {
      // Only try studentGradeId lookup if it's not null
      const localGrade = localGrades.find(item => item.studentGradeId === studentGradeId);
      if (localGrade) {
        return localGrade.grade;
      }
    }
    
    const student = students.find(s => s.studentGradeId === studentGradeId);
    return student ? student.grade : null;
  },

  // Handle grade changes - updates local state only, using studentGradeId and userId
  handleGradeChange: (studentGradeId, grade, userId) => {
    set(state => {
      if (!studentGradeId || studentGradeId === null) {
        if (userId) {
          const existingByUserIndex = state.localGrades.findIndex(item => item.userId === userId);
          if (existingByUserIndex >= 0) {
            const updatedGrades = [...state.localGrades];
            updatedGrades[existingByUserIndex].grade = grade;
            return { localGrades: updatedGrades, changesMade: true };
          }
          
          // Add new grade with userId
          const newGrade = { studentGradeId, userId, grade };
          const updatedGrades = [...state.localGrades, newGrade];
          return { localGrades: updatedGrades, changesMade: true };
        }
      } else {
        const existingIndex = state.localGrades.findIndex(item => item.studentGradeId === studentGradeId);
        
        if (existingIndex >= 0) {
          // Update existing grade
          const updatedGrades = [...state.localGrades];
          updatedGrades[existingIndex].grade = grade;
          return { localGrades: updatedGrades, changesMade: true };
        }
      }
      
      // Add new grade with both identifiers
      const newGrade = { studentGradeId, grade };
      if (userId) {
        newGrade.userId = userId;
      }
      const updatedGrades = [...state.localGrades, newGrade];
      return { localGrades: updatedGrades, changesMade: true };
    });
  },

  setGradeVisibility: (visible) => {
    const state = get();

    if (visible !== state.gradesVisible) {
      set({ gradesVisible: visible, changesMade: true });
    }
  },

  saveGradeChanges: async () => {
    const state = get();
    const { localGrades, selectedSchedule, gradesVisible, pendingFiles } = state;
    const scheduleId = selectedSchedule?.id;

    set({ saving: true });

    try {
      // Upload pending files first
      const pendingFilesList = Object.values(pendingFiles);
      if (pendingFilesList.length > 0) {
        const token = getCookieItem('token');
        const apiUrl = process.env.REACT_APP_API_URL;
        const uploadPromises = pendingFilesList.map(async (fileData) => {
          const formData = new FormData();
          formData.append('file', fileData.file);

          if (!fileData.studentGradeId || fileData.studentGradeId === null) {
            formData.append('studentId', fileData.studentId);
            formData.append('courseId', fileData.courseId);
            if (fileData.periodId) {
              formData.append('periodId', fileData.periodId);
            }
          }

          const res = await fetch(
            `${apiUrl}/grades/${fileData.studentGradeId || 'null'}/files`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!res.ok) {
            throw new Error(`Failed to upload file for ${fileData.userId}`);
          }
          return res.json();
        });

        await Promise.all(uploadPromises);
        // Clear pending files after successful upload
        set({ pendingFiles: {} });
      }

      // Don't update students array until after successful save
      await new Promise(resolve => setTimeout(resolve, 50));

      const freshState = get();

      if (scheduleId) {
        const persistStudents = JSON.parse(JSON.stringify(freshState.students));

        set(state => {
          const updatedData = {
            _persistentStudentData: {
              ...state._persistentStudentData,
              [scheduleId]: persistStudents
            },
            _persistentVisibility: {
              ...state._persistentVisibility,
              [scheduleId]: gradesVisible
            }
          };
          return updatedData;
        });
      }

      await get().saveGrades();

      // Only update students array after successful backend save
      if (localGrades.length > 0) {
        set(state => {
          const updatedStudents = state.students.map(student => {
            let localGrade = null;
            
            if (!student.studentGradeId || student.studentGradeId === null) {
              const userId = student.user?.id || student.userId;
              localGrade = localGrades.find(item => item.userId === userId);
            } else {
              localGrade = localGrades.find(item => item.studentGradeId === student.studentGradeId);
            }
            
            if (localGrade) {
              return { ...student, grade: localGrade.grade };
            }
            return student;
          });

          return { students: updatedStudents };
        });
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      set({
        localGrades: [],
        changesMade: false,
        saving: false
      });

      return true;
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },

  resetGradeChanges: () => {
    set({ localGrades: [], changesMade: false, pendingFiles: {} });
  },

  setChangesMade: (value) => set({ changesMade: value }),

  addPendingFile: (studentId, fileData) => {
    // Create a preview URL for the file 
    const previewUrl = URL.createObjectURL(fileData.file);
    
    set(state => ({
      pendingFiles: {
        ...state.pendingFiles,
        [studentId]: {
          ...fileData,
          previewUrl // Add preview URL for immediate display
        }
      },
      changesMade: true
    }));
  },

  // Check if student has a pending file
  hasPendingFile: (studentId) => {
    const state = get();
    return !!state.pendingFiles[studentId];
  },

  // Get pending file for a student
  getPendingFile: (studentId) => {
    const state = get();
    return state.pendingFiles[studentId];
  },

  // Clear all pending files
  clearPendingFiles: () => {
    set({ pendingFiles: {} });
  },

  saveGrades: async () => {
    const state = get();
    const { localGrades, selectedSchedule, students } = state;
    if (!selectedSchedule) return;
    const courseId = selectedSchedule.courseId;
    const periodId = selectedSchedule.academicPeriodId;
    const token = getCookieItem('token');
    // Map frontend grade values to Prisma enum values
    const mapGradeValue = (grade) => {
      if (grade === 'pass') return 'Pass';
      if (grade === 'fail') return 'Fail';
      return 'NoGrade';
    };
    // Prepare batch payload
    const payload = localGrades.map(lg => {
      let student = null;
      
      if (!lg.studentGradeId || lg.studentGradeId === null) {
        if (lg.userId) {
          student = students.find(s => (s.user?.id || s.userId) === lg.userId);
        }
      } else {
        student = students.find(s => s.studentGradeId === lg.studentGradeId);
      }
      
      return {
        studentId: student?.user?.id || student?.userId || student?.id || lg.userId,
        courseId,
        periodId,
        grade: mapGradeValue(lg.grade)
      };
    });
  const apiUrl = process.env.REACT_APP_API_URL;
  const res = await fetch(`${apiUrl}/grades/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save grades');
    return await res.json();
  },

  closeGradeDetailsModal: () => set({ gradeDetailsModal: false }),
  closeGradeNotReadyModal: () => set({ gradeNotReadyModal: false }),
  closeStudentsGradeModal: () => set({ studentsGradeModal: false }),

  fetchSchedules: async () => {
    try {
      set({ loading: true, error: null });
      const token = getCookieItem('token');
  const apiUrl = process.env.REACT_APP_API_URL;
  const res = await fetch(`${apiUrl}/schedules?includeCourse=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch schedules');
      const data = await res.json();
      set({ loading: false, schedules: data });
      useGradeSearchStore.getState().filterSchedules();
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch schedules'
      });
    }
  },

  handleGradeStudents: async (schedule) => {
    set({ selectedSchedule: schedule });
    set({ loading: true, error: null });
    try {
      const token = getCookieItem('token');
  const apiUrl = process.env.REACT_APP_API_URL;
  const res = await fetch(`${apiUrl}/grades/schedule/${schedule.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch students for schedule');
      const data = await res.json();
      set({
        students: data.students || [],
        studentsGradeModal: true,
        gradesVisible: true,
        localGrades: [],
        changesMade: false,
        loading: false
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch students for schedule'
      });
    }
  },

  setLocalGrades: (grades) => {
    set({ localGrades: grades, changesMade: true });
  },

  resetStore: () => {
    const currentState = get();
    const persistentData = currentState._persistentStudentData;
    const persistentVisibility = currentState._persistentVisibility;

    set({
      selectedSchedule: null,
      gradeNotReadyModal: false,
      gradeDetailsModal: false,
      studentsGradeModal: false,
      error: null,
      localGrades: [],
      changesMade: false,
      _persistentStudentData: persistentData,
      _persistentVisibility: persistentVisibility
    });
  }
}));

export default useGradeStore;