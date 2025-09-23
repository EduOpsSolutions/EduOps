import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import createSearchStore from './searchStore';

export const useEnrollmentPeriodSearchStore = createSearchStore({
  defaultSearchParams: {
    periodName: '',
    batch: '',
    year: '',
    status: ''
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
         new Date(period.startAt).getFullYear().toString().includes(searchParams.year)) &&
        (searchParams.status === '' || period.status === searchParams.status)
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
        .map(period => {
          const now = new Date();
          const startDate = new Date(period.startAt);
          const endDate = new Date(period.endAt);
          
          let status;
          // Check if enrollment was manually ended
          if (period.enrollmentEnded) {
            status = 'Ended';
          } else if (now < startDate) {
            status = 'Upcoming';
          } else if (now >= startDate && now <= endDate) {
            status = 'Ongoing';
          } else {
            status = 'Ended';
          }

          return {
            ...period,
            id: period.id,
            periodName: period.periodName,
            batchName: period.batchName,
            startAt: period.startAt,
            endAt: period.endAt,
            status: status,
            year: new Date(period.startAt).getFullYear().toString(),
            createdAt: period.createdAt
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date, newest first

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

  endEnrollment: async (periodId) => {
    try {
      set({ loading: true, error: '' });
      
      // Call API to end enrollment for the period
      await axiosInstance.patch(`/academic-periods/${periodId}/end-enrollment`);

      // Refresh the periods data to reflect the change
      const { fetchPeriods } = get();
      await fetchPeriods();
      
      return { success: true };
    } catch (error) {
      console.error("Failed to end enrollment:", error);
      const errorMessage = error.response?.data?.message || 'Failed to end enrollment. Please try again.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
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