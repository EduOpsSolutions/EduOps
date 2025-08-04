import { create } from 'zustand';

export const useGradeSearchStore = create((set, get) => ({
  searchTerm: '',
  currentPage: 1,
  itemsPerPage: 5,
  filteredCourses: [],
  totalItems: 0,
  totalPages: 0,

  setSearchTerm: (term) => {
    set({ searchTerm: term, currentPage: 1 });
    const store = get();
    store.filterCourses();
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  setItemsPerPage: (itemsPerPage) => {
    set({ itemsPerPage, currentPage: 1 });
    const store = get();
    store.filterCourses();
  },

  filterCourses: () => {
    const { searchTerm, itemsPerPage } = get();
    const { courses } = useGradeStore.getState();

    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.schedule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.room.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    set({
      filteredCourses: filtered,
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
    store.filterCourses();
  }
}));

const useGradeStore = create((set, get) => ({
  loading: false,
  error: null,
  courses: [],
  students: [],
  selectedCourse: null,
  gradeNotReadyModal: false,
  gradeDetailsModal: false,
  studentsGradeModal: false,
  gradesVisible: false,
  localGrades: [],
  changesMade: false,
  saving: false,

  _persistentStudentData: {},
  _persistentVisibility: {},
  gradeStatusOptions: [
    { value: 'ng', label: 'NG', color: 'bg-gray-300' },
    { value: 'pass', label: 'PASS', color: 'bg-green-500' },
    { value: 'fail', label: 'FAIL', color: 'bg-red-400' },
  ],

  getStudentGrade: (studentId) => {
    const { localGrades, students } = get();

    const localGrade = localGrades.find(item => item.studentId === studentId);
    if (localGrade) return localGrade.grade;

    const student = students.find(s => s.id === studentId);
    return student ? student.grade : null;
  },

  // Handle grade changes - updates local state only
  handleGradeChange: (studentId, grade) => {
    set(state => {
      const existingIndex = state.localGrades.findIndex(item => item.studentId === studentId);
      let updatedGrades;

      if (existingIndex >= 0) {
        updatedGrades = [...state.localGrades];
        updatedGrades[existingIndex].grade = grade;
      } else {
        updatedGrades = [...state.localGrades, { studentId, grade }];
      }

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
    const { localGrades, selectedCourse, gradesVisible } = state;
    const courseId = selectedCourse?.id;

    set({ saving: true });

    try {
      if (localGrades.length > 0) {
        set(state => {
          const updatedStudents = state.students.map(student => {
            const localGrade = localGrades.find(item => item.studentId === student.id);
            if (localGrade) {
              return { ...student, grade: localGrade.grade };
            }
            return student;
          });

          return { students: updatedStudents };
        });
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      const freshState = get();
      const updatedStudents = freshState.students;

      if (courseId) {
        const persistStudents = JSON.parse(JSON.stringify(updatedStudents));

        set(state => {
          const updatedData = {
            _persistentStudentData: {
              ...state._persistentStudentData,
              [courseId]: persistStudents
            },
            _persistentVisibility: {
              ...state._persistentVisibility,
              [courseId]: gradesVisible
            }
          };
          return updatedData;
        });
      }

      await get().saveGrades();

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
    set({ localGrades: [], changesMade: false });
  },

  setChangesMade: (value) => set({ changesMade: value }),

  bulkUpdateGrades: (localGrades) => {
    set(state => {
      const updatedStudents = state.students.map(student => {
        const localGrade = localGrades.find(item => item.studentId === student.id);
        if (localGrade) {
          return { ...student, grade: localGrade.grade };
        }
        return student;
      });

      return { students: updatedStudents };
    });
  },

  saveGrades: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  },

  closeGradeDetailsModal: () => set({ gradeDetailsModal: false }),
  closeGradeNotReadyModal: () => set({ gradeNotReadyModal: false }),
  closeStudentsGradeModal: () => set({ studentsGradeModal: false }),

  fetchCourses: async () => {
    try {
      set({ loading: true, error: null });

      const sampleCourses = [
        {
          id: 1,
          name: 'A1',
          schedule: 'TTh',
          time: '6:30AM - 7:30AM',
          room: 'Room 01'
        },
        {
          id: 2,
          name: 'A1',
          schedule: 'TTh',
          time: '9:30AM - 10:30AM',
          room: 'VR 02'
        },
      ];

      setTimeout(() => {
        set({
          loading: false,
          courses: sampleCourses
        });
        useGradeSearchStore.getState().filterCourses();
      }, 500);
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch courses'
      });
    }
  },

  handleGradeStudents: (course) => {
    set({ selectedCourse: course });

    const state = get();
    const courseId = course?.id;

    const SampleStudents = [
      {
        id: 2012923,
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@example.com',
        enrollmentDate: '2024-09-01',
        grade: 'ng',
        hasDoc: false
      },
      {
        id: 2102312,
        name: 'Marsa Fe',
        email: 'marsa.fe@example.com',
        enrollmentDate: '2024-09-02',
        grade: 'ng',
        hasDoc: true
      },
    ];

    const hasSavedData = !!(courseId &&
      state._persistentStudentData &&
      state._persistentStudentData[courseId]);

    let currentStudents;
    try {
      if (hasSavedData) {
        currentStudents = JSON.parse(JSON.stringify(state._persistentStudentData[courseId]));
      } else {
        currentStudents = JSON.parse(JSON.stringify(SampleStudents));
      }
    } catch (err) {
      currentStudents = JSON.parse(JSON.stringify(SampleStudents));
    }

    const hasSavedVisibility = !!(courseId &&
      state._persistentVisibility &&
      state._persistentVisibility[courseId] !== undefined);

    const currentVisibility = hasSavedVisibility
      ? state._persistentVisibility[courseId]
      : true;

    set({
      students: currentStudents,
      studentsGradeModal: true,
      gradesVisible: currentVisibility,
      localGrades: [],
      changesMade: false
    });
  },

  setLocalGrades: (grades) => {
    set({ localGrades: grades, changesMade: true });
  },

  resetStore: () => {
    const currentState = get();
    const persistentData = currentState._persistentStudentData;
    const persistentVisibility = currentState._persistentVisibility;

    set({
      selectedCourse: null,
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