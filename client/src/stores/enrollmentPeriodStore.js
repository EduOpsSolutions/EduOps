import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import createSearchStore from './searchStore';

export const useEnrollmentPeriodSearchStore = createSearchStore({
  defaultSearchParams: {
    periodName: '',
    batch: '',
    year: '',
    status: '',
  },
  initialItemsPerPage: 10,
  showResultsOnLoad: true,
  filterFunction: (data, searchParams) => {
    return data.filter((period) => {
      return (
        (searchParams.batch === '' ||
          period.batchName.includes(searchParams.batch)) &&
        (searchParams.year === '' ||
          new Date(period.startAt)
            .getFullYear()
            .toString()
            .includes(searchParams.year)) &&
        (searchParams.status === '' || period.status === searchParams.status)
      );
    });
  },
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
      const response = await axiosInstance.get('/academic-periods');

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }

      const visiblePeriods = response.data
        .filter((period) => period && !period.deletedAt)
        .map((period) => {
          const now = new Date();
          const startDate = new Date(period.startAt);
          const endDate = new Date(period.endAt);

          // Calculate actual period status based on dates
          let periodStatus;
          if (now < startDate) {
            periodStatus = 'Upcoming';
          } else if (now >= startDate && now <= endDate) {
            periodStatus = 'Ongoing';
          } else {
            periodStatus = 'Ended';
          }

          // Determine enrollment status (database status field)
          const enrollmentOpen =
            period.status === 'ongoing' || period.status === 'upcoming';

          // Display status combines both period and enrollment info
          let displayStatus;
          if (periodStatus === 'Ended') {
            displayStatus = 'Ended';
          } else if (periodStatus === 'Ongoing') {
            displayStatus = enrollmentOpen
              ? 'Ongoing'
              : 'Ongoing (Enrollment Closed)';
          } else {
            // Upcoming
            displayStatus = enrollmentOpen
              ? 'Upcoming'
              : 'Upcoming (Enrollment Closed)';
          }

          return {
            ...period,
            id: period.id,
            periodName: period.periodName,
            batchName: period.batchName,
            startAt: period.startAt,
            endAt: period.endAt,
            status: displayStatus,
            periodStatus: periodStatus, // The actual period status
            enrollmentOpen: enrollmentOpen, // Whether enrollment is open
            year: new Date(period.startAt).getFullYear().toString(),
            createdAt: period.createdAt,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const searchStore = useEnrollmentPeriodSearchStore.getState();
      searchStore.setData(visiblePeriods);

      set({ error: '' });
    } catch (error) {
      console.error('Failed to fetch periods:', error);
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

      // Fetch courses linked to this period
      const [coursesResp, schedulesResp] = await Promise.all([
        axiosInstance.get(
          `/academic-period-courses/${selectedPeriod.id}/courses`
        ),
        axiosInstance.get(`/schedules/period/${selectedPeriod.id}`),
      ]);

      const schedules = Array.isArray(schedulesResp.data)
        ? schedulesResp.data
        : [];

      // Group schedules by courseId for quick access
      const schedulesByCourseId = schedules.reduce((acc, sched) => {
        const key = sched.course?.id || sched.courseId || sched.course;
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(sched);
        return acc;
      }, {});

      const activeCourses = coursesResp.data.map((pc) => ({
        id: pc.id,
        courseId: pc.courseId,
        course: pc.course?.name || 'N/A',
        enrolledStudents: pc.course?.maxNumber || 0,
        schedules: schedulesByCourseId[pc.courseId] || [],
      }));

      set({ periodCourses: activeCourses, error: '' });
    } catch (error) {
      console.error('Failed to fetch period courses:', error);
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

    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        set({ loading: true });
        await axiosInstance.delete(
          `/academic-period-courses/${selectedPeriod.id}/courses/${courseId}`
        );
        await fetchPeriodCourses();
        set({ error: '' });
      } catch (error) {
        console.error('Failed to delete course:', error);
        set({ error: 'Failed to delete course. Please try again.' });
      } finally {
        set({ loading: false });
      }
    }
  },

  endEnrollment: async (periodId) => {
    try {
      set({ loading: true, error: '' });

      await axiosInstance.patch(`/academic-periods/${periodId}/end-enrollment`);

      const { fetchPeriods } = get();
      await fetchPeriods();

      return { success: true };
    } catch (error) {
      console.error('Failed to end enrollment:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to end enrollment. Please try again.';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  resetStore: () =>
    set({
      selectedPeriod: null,
      periodCourses: [],
      loading: false,
      error: '',
      showCourses: false,
      addCourseModal: false,
      addAcademicPeriodModal: false,
    }),
}));
