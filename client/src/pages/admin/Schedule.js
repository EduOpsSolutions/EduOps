import React, { useState, useEffect } from 'react';
import Calendar from '../../components/calendar/Calendar';
import Spinner from '../../components/common/Spinner';
import DateSelectModal from '../../components/modals/schedule/DateSelectModal';
import CreateEditScheduleModal from '../../components/modals/schedule/CreateEditScheduleModal';
import axiosInstance from '../../utils/axios';
import Swal from 'sweetalert2';
// import { transformScheduleToEvent } from '../../utils/scheduleExamples';

/**
 * Admin Schedule Page
 *
 * This component displays the calendar with recurring schedule events.
 * Events are defined with a 'days' field (e.g., "M,W,F" or "T,TH") and will
 * automatically appear on matching days without needing separate entries per date.
 *
 * To use with API data:
 * 1. Fetch schedules from your API endpoint (e.g., /api/schedules)
 * 2. Transform each schedule using transformScheduleToEvent() from scheduleExamples.js
 * 3. Pass the transformed events to the Calendar component
 *
 * Example:
 * const [schedules, setSchedules] = useState([]);
 * const [isLoading, setIsLoading] = useState(true);
 *
 * useEffect(() => {
 *   setIsLoading(true);
 *   fetch('/api/v1/schedules')
 *     .then(res => res.json())
 *     .then(data => {
 *       const events = data.schedules.map(schedule => transformScheduleToEvent(schedule));
 *       setSchedules(events);
 *     })
 *     .catch(error => console.error('Error fetching schedules:', error))
 *     .finally(() => setIsLoading(false));
 * }, []);
 *
 * return isLoading ? <Spinner /> : <Calendar events={schedules} />;
 */
function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [isLoadingAcademicPeriods, setIsLoadingAcademicPeriods] =
    useState(false);

  // Modal states
  const [showDateSelectModal, setShowDateSelectModal] = useState(false);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

  // Fetch teachers list
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await axiosInstance.get(
          '/users?role=teacher&status=active'
        );

        // API returns { data: users[], count, max_result, page, max_page }
        const users = response.data?.data || response.data;

        if (!users || !Array.isArray(users)) {
          throw new Error('Invalid response format from server');
        }
        setTeachers(users);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch courses list
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await axiosInstance.get('/courses');

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format from server');
        }

        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch academic periods
  useEffect(() => {
    const fetchAcademicPeriods = async () => {
      setIsLoadingAcademicPeriods(true);
      try {
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

            // Determine enrollment status
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
            };
          })
          .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

        setAcademicPeriods(visiblePeriods);
      } catch (error) {
        console.error('Failed to fetch academic periods:', error);
        setAcademicPeriods([]);
      } finally {
        setIsLoadingAcademicPeriods(false);
      }
    };

    fetchAcademicPeriods();
  }, []);

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/schedules');

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format from server');
        }

        // Data is already transformed by the backend
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Handler for clicking on a date/time in the calendar
  const handleDateTimeClick = (date, eventsForDate) => {
    setSelectedDate(date);
    setEventsForSelectedDate(eventsForDate);
    setShowDateSelectModal(true);
  };

  // Handler for clicking on an event in the DateSelectModal
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDateSelectModal(false);
    setShowCreateEditModal(true);
  };

  // Handler for saving an event
  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const response = await axiosInstance.put(
          `/schedules/${selectedEvent.id}`,
          eventData
        );

        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === selectedEvent.id ? response.data : schedule
          )
        );
      } else {
        // Create new event
        const response = await axiosInstance.post('/schedules', eventData);
        setSchedules((prev) => [...prev, response.data]);
      }

      setShowCreateEditModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      Swal.fire({
        title: 'Error',
        text:
          error.response?.data?.message ||
          'Failed to save schedule. Please try again.',
        icon: 'error',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#000000',
        confirmButtonTextColor: 'white',
      });
    }
  };

  // Handler for deleting an event
  const handleDeleteEvent = async (event) => {
    Swal.fire({
      title: 'Are you sure you want to delete this event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#992525',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await axiosInstance.delete(`/schedules/${event.id}`);

        setSchedules((prev) =>
          prev.filter((schedule) => schedule.id !== event.id)
        );
        setShowCreateEditModal(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting schedule:', error);
        Swal.fire({
          title: 'Error',
          text:
            error.response?.data?.message ||
            'Failed to delete schedule. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#000000',
          confirmButtonTextColor: 'white',
        });
      }
    });
  };

  // Handler for closing modals
  const handleCloseModals = () => {
    setShowDateSelectModal(false);
    setShowCreateEditModal(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Spinner
          size="xl"
          color="text-dark-red-2"
          message="Loading schedule data..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <Calendar events={schedules} onDateTimeClick={handleDateTimeClick} />

      {/* Date Select Modal */}
      <DateSelectModal
        isOpen={showDateSelectModal}
        onClose={handleCloseModals}
        selectedDate={selectedDate}
        events={eventsForSelectedDate}
        onEventClick={handleEventClick}
      />

      {/* Create/Edit Schedule Modal */}
      <CreateEditScheduleModal
        isOpen={showCreateEditModal}
        onClose={handleCloseModals}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teachers={teachers}
        isLoadingTeachers={isLoadingTeachers}
        courses={courses}
        isLoadingCourses={isLoadingCourses}
        academicPeriods={academicPeriods}
        isLoadingAcademicPeriods={isLoadingAcademicPeriods}
      />
    </div>
  );
}

export default AdminSchedule;
