import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import createSearchStore from './searchStore';

export const useEnrollmentPeriodSearchStore = createSearchStore({
  defaultSearchParams: {
    periodName: '',
    batch: '',
    year: ''
  },
  initialItemsPerPage: 10,
  showResultsOnLoad: true,
  filterFunction: (data, searchParams) => {
    return data.filter(period => {
      return (
        (searchParams.periodName === '' || 
         period.periodName.toLowerCase().includes(searchParams.periodName.toLowerCase())) &&
        (searchParams.batch === '' || period.batchName.includes(searchParams.batch)) &&
        (searchParams.year === '' || 
         new Date(period.startAt).getFullYear().toString().includes(searchParams.year))
      );
    });
  }
});

export const useEnrollmentPeriodStore = create((set, get) => ({
  selectedPeriod: null,
  periodCourses: [],
  loading: false,
  error: '',

  showCourses: false,
  addCourseModal: false,
  addAcademicPeriodModal: false,

  fetchPeriods: async () => {
    try {
      set({ loading: true, error: '' });
      const response = await axiosInstance.get("/academic-periods");
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }

      const visiblePeriods = response.data
        .filter(period => period && !period.deletedAt)
        .map(period => ({
          ...period,
          id: period.id,
          periodName: period.periodName,
          batchName: period.batchName,
          startAt: period.startAt,
          year: new Date(period.startAt).getFullYear().toString()
        }));

      const searchStore = useEnrollmentPeriodSearchStore.getState();
      searchStore.setData(visiblePeriods);
      
      set({ error: '' });
    } catch (error) {
      console.error("Failed to fetch periods:", error);
      set({ error: 'Failed to load academic periods. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPeriodCourses: async () => {
    const { selectedPeriod } = get();
    if (!selectedPeriod) return;
    
    try {
      set({ loading: true });
      
      const response = await axiosInstance.get(`/academic-period-courses/${selectedPeriod.id}/courses`);
      
      const activeCourses = response.data.map(pc => ({
        id: pc.id,
        course: pc.course?.name || 'N/A',
        schedule: typeof pc.course?.schedule === 'string' ? pc.course.schedule : JSON.stringify(pc.course?.schedule) || 'N/A',
        enrolledStudents: pc.course?.maxNumber || 0,
      }));
      
      set({ periodCourses: activeCourses, error: '' });
    } catch (error) {
      console.error("Failed to fetch period courses:", error);
      set({ error: 'Failed to load period courses. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },

  handlePeriodSelect: (period) => {
    if (!period || !period.id) {
      console.error('Invalid period selected');
      set({ error: 'Invalid period selected' });
      return;
    }
    set({ selectedPeriod: period, showCourses: true });
  },

  handleBackToResults: () => {
    set({ showCourses: false, selectedPeriod: null });
  },

  deleteCourse: async (courseId) => {
    const { selectedPeriod, fetchPeriodCourses } = get();
    
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        set({ loading: true });
        await axiosInstance.delete(`/academic-period-courses/${selectedPeriod.id}/courses/${courseId}`);
        await fetchPeriodCourses();
        set({ error: '' });
      } catch (error) {
        console.error("Failed to delete course:", error);
        set({ error: 'Failed to delete course. Please try again.' });
      } finally {
        set({ loading: false });
      }
    }
  },

  resetStore: () => set({
    selectedPeriod: null,
    periodCourses: [],
    loading: false,
    error: '',
    showCourses: false,
    addCourseModal: false,
    addAcademicPeriodModal: false,
  })
}));