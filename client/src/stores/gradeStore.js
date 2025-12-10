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
  gradesVisible: 'hidden',
  localGrades: [],
  changesMade: false,
  saving: false,
  pendingFiles: {},
  academicPeriod: null,
  isPeriodLocked: false,
  gradeStatusOptions: [
    { value: 'ng', label: 'NG', color: 'bg-gray-300' },
    { value: 'pass', label: 'PASS', color: 'bg-green-500' },
    { value: 'fail', label: 'FAIL', color: 'bg-red-400' },
  ],


  getStudentGrade: (studentGradeId, userId) => {
    const { localGrades, students } = get();

    // Prefer CSV-uploaded grade if present
    let grade = null;
    if (!studentGradeId || studentGradeId === null) {
      if (userId) {
        const localGradeByUser = localGrades.find(item => item.userId === userId);
        if (localGradeByUser) {
          grade = localGradeByUser.grade;
        }
      }
    } else {
      const localGrade = localGrades.find(item => item.studentGradeId === studentGradeId);
      if (localGrade) {
        grade = localGrade.grade;
      }
    }

    // If no CSV-uploaded grade, fall back to original
    if (grade === null || grade === undefined) {
      const student = students.find(s => s.studentGradeId === studentGradeId);
      grade = student ? student.grade : null;
    }
    return grade;
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

  setGradeVisibility: (visibility) => {
    const state = get();
    if (visibility !== state.gradesVisible) {
      set({ gradesVisible: visibility, changesMade: true });
    }
  },

  saveGradeChanges: async () => {
    const state = get();
    const { localGrades, pendingFiles } = state;

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
            const errorData = await res.json();
            if (errorData.reason === 'PERIOD_LOCKED') {
              throw new Error(`Cannot upload files: The academic period "${errorData.periodName}" has ended and is locked.`);
            }
            throw new Error(errorData.error || `Failed to upload file for ${fileData.userId}`);
          }
          return res.json();
        });

        await Promise.all(uploadPromises);
        // Clear pending files after successful upload
        set({ pendingFiles: {} });
      }

      // Don't update students array until after successful save
      await new Promise(resolve => setTimeout(resolve, 50));

      if (localGrades.length > 0) {
        await get().saveGrades();
      }
      // Always save visibility 
      await get().saveVisibility();

      // Do not update students array locally after save; rely on backend refetch

      await new Promise(resolve => setTimeout(resolve, 50));

      set({
        // Do not clear localGrades after save
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
      if (grade === 'PASS' || grade === 'pass') return 'Pass';
      if (grade === 'FAIL' || grade === 'fail') return 'Fail';
      if (grade === 'NOGRADE' || grade === 'nograde') return 'NoGrade';
      return 'NoGrade';
    };
    // Prepare batch payload
        const payload = students.map(student => {
          // Match localGrades by studentGradeId, readable userId, or internal userId
          const localGrade = localGrades.find(lg =>
            lg.studentGradeId === student.studentGradeId ||
            lg.studentId === student.user?.userId ||
            lg.userId === student.user?.id
          );
          return {
            studentId: student.user?.id, // internal ID for backend
            courseId,
            periodId,
            grade: localGrade ? mapGradeValue(localGrade.grade) : mapGradeValue(student.grade)
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
    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.reason === 'PERIOD_LOCKED') {
        throw new Error(`Cannot save grades: The academic period "${errorData.periodName}" has ended and is locked.`);
      }
      throw new Error(errorData.error || 'Failed to save grades');
    }
    return await res.json();
  },

  saveVisibility: async () => {
    const state = get();
    const { selectedSchedule, gradesVisible } = state;
    if (!selectedSchedule) return;
    
    const courseId = selectedSchedule.courseId;
    const periodId = selectedSchedule.academicPeriodId;
    const token = getCookieItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    
    const payload = {
      courseId,
      periodId,
      visibility: gradesVisible 
    };
    
    const res = await fetch(`${apiUrl}/grades/visibility`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.reason === 'PERIOD_LOCKED') {
        throw new Error(`Cannot change visibility: The academic period "${errorData.periodName}" has ended and is locked.`);
      }
      throw new Error(errorData.error || 'Failed to save visibility setting');
    }
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

      let initialVisibility = 'hidden';
      if (data.students && data.students.length > 0) {
        const firstStudentWithGrade = data.students.find(s => s.visibility !== undefined);
        if (firstStudentWithGrade) {
          initialVisibility = firstStudentWithGrade.visibility;
        }
      }

      // Fetch academic period information if periodId exists
      let academicPeriod = null;
      let isPeriodLocked = false;
      const periodId = schedule.academicPeriodId || schedule.periodId;

      if (periodId) {
        try {
          const periodRes = await fetch(`${apiUrl}/academic-periods/${periodId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (periodRes.ok) {
            academicPeriod = await periodRes.json();
            // Check if period is locked (endAt date has passed)
            const now = new Date();
            const endDate = new Date(academicPeriod.endAt);
            isPeriodLocked = endDate < now;
          }
        } catch (periodError) {
          console.error('Failed to fetch academic period:', periodError);
          // Don't block the modal from opening if period fetch fails
        }
      }

      set({
        students: data.students || [],
        studentsGradeModal: true,
        gradesVisible: initialVisibility,
        localGrades: [],
        changesMade: false,
        loading: false,
        academicPeriod,
        isPeriodLocked,
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch students for schedule'
      });
    }
  },

  setLocalGrades: (grades) => {
  set({ localGrades: Array.isArray(grades) ? grades : [], changesMade: true });
  },

  resetStore: () => {
    set({
      selectedSchedule: null,
      gradeNotReadyModal: false,
      gradeDetailsModal: false,
      studentsGradeModal: false,
      error: null,
      localGrades: [],
      changesMade: false,
      academicPeriod: null,
      isPeriodLocked: false,
    });
  }
}));

export default useGradeStore;