import { create } from 'zustand';
import createSearchStore from './searchStore';
import axiosInstance from '../utils/axios';

const useCourseSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    searchTerm: ""
  },
  searchableFields: ["name", "id"],
  exactMatchFields: [],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    if (!params.searchTerm) return data;
    
    return data.filter(course => 
      course.name.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
      course.id.toString().includes(params.searchTerm)
    );
  },
  showResultsOnLoad: true
});

const useCourseStore = create((set, get) => ({
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
  
  createCourseModal: false,
  editCourseModal: false,

  fetchCourses: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get("/courses");
      const courses = response.data;
      
      set({ courses, loading: false });
      
      const searchStore = useCourseSearchStore.getState();
      searchStore.setData(courses);
      
    } catch (error) {
      console.error("Failed to fetch courses: ", error);
      set({ 
        error: error.message || "Failed to fetch courses", 
        loading: false 
      });
    }
  },

  setSelectedCourse: (course) => set({ selectedCourse: course }),
  
  clearSelectedCourse: () => set({ selectedCourse: null }),

  handleRowClick: (course) => {
    set({ 
      selectedCourse: course, 
      editCourseModal: true 
    });
  },

  openCreateCourseModal: () => set({ createCourseModal: true }),
  
  closeCreateCourseModal: () => set({ createCourseModal: false }),
  
  openEditCourseModal: () => set({ editCourseModal: true }),
  
  closeEditCourseModal: () => set({ 
    editCourseModal: false, 
    selectedCourse: null 
  }),

  clearError: () => set({ error: null }),

  resetStore: () => {
    set({
      selectedCourse: null,
      loading: false,
      error: null,
      createCourseModal: false,
      editCourseModal: false
    });
  }
}));

export { useCourseSearchStore, useCourseStore };