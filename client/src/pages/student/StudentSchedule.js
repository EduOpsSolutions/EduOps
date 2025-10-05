import React, { useEffect, useState } from 'react';
import Calendar from '../../components/calendar/Calendar';
import axiosInstance from '../../utils/axios';
import Spinner from '../../components/common/Spinner';
import DateSelectModal from '../../components/modals/schedule/DateSelectModal';
import ViewScheduleModal from '../../components/modals/schedule/ViewScheduleModal';

function StudentSchedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDateSelectModal, setShowDateSelectModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchMySchedules = async () => {
      try {
        setLoading(true);
        const resp = await axiosInstance.get('/schedules/mine');
        if (Array.isArray(resp.data)) {
          setEvents(resp.data);
        } else {
          setEvents([]);
        }
      } catch (e) {
        console.error('Failed to fetch student schedules', e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMySchedules();
  }, []);

  const handleDateTimeClick = (date, eventsForDate = []) => {
    setSelectedDate(date);
    setEventsForSelectedDate(eventsForDate);
    setShowDateSelectModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDateSelectModal(false);
    setShowViewModal(true);
  };

  const handleCloseModals = () => {
    setShowDateSelectModal(false);
    setShowViewModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    setEventsForSelectedDate([]);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full py-10">
        <Spinner size="lg" message="Loading your schedules..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <Calendar events={events} onDateTimeClick={handleDateTimeClick} />

      <DateSelectModal
        isOpen={showDateSelectModal}
        onClose={handleCloseModals}
        selectedDate={selectedDate || new Date()}
        events={eventsForSelectedDate}
        onEventClick={handleEventClick}
      />

      <ViewScheduleModal
        isOpen={showViewModal}
        onClose={handleCloseModals}
        event={selectedEvent}
      />
    </div>
  );
}

export default StudentSchedule;
