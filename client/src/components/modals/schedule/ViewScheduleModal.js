import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdPerson } from 'react-icons/md';
import axiosInstance from '../../../utils/axios';
import Spinner from '../../common/Spinner';

function ViewScheduleModal({ isOpen, onClose, event }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculateTotalHours = (ev) => {
    try {
      if (
        !ev?.periodStart ||
        !ev?.periodEnd ||
        !ev?.time_start ||
        !ev?.time_end ||
        !ev?.days
      )
        return '';
      const [sh, sm] = String(ev.time_start).split(':').map(Number);
      const [eh, em] = String(ev.time_end).split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm);
      if (minutes <= 0) return '';
      const hoursPerSession = minutes / 60;
      const dayMap = { SU: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, S: 6 };
      const selectedDays = new Set(
        String(ev.days)
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => dayMap[d])
          .filter((n) => n !== undefined)
      );
      if (selectedDays.size === 0) return '';
      const start = new Date(ev.periodStart);
      const end = new Date(ev.periodEnd);
      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
      )
        return '';
      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (selectedDays.has(d.getDay())) count++;
      }
      const total = count * hoursPerSession;
      const fixed = total.toFixed(1);
      return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (!isOpen || !event?.id) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const resp = await axiosInstance.get(
          `/schedules/${event.id}/students`,
          {
            signal: controller.signal,
          }
        );
        setStudents(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        if (e.name !== 'CanceledError') {
          setStudents([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen, event?.id]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-y-auto">
        <div className="bg-white flex items-center justify-between p-4 border-b sticky top-0">
          <h3 className="text-lg font-semibold">Schedule Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="text-base font-medium">
                {event.courseName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Academic Period</p>
              <p className="text-base font-medium">
                {event.academicPeriodName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teacher</p>
              <p className="text-base font-medium">
                {event.teacherName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-base font-medium">{event.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days</p>
              <p className="text-base font-medium">{event.days || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-base font-medium">
                {event.time_start} - {event.time_end}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Total Hours</p>
              <p className="text-base font-medium">
                {calculateTotalHours(event) || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Period{' '}
                <span className="text-[0.6rem] md:text-[0.8rem]">
                  (YYYY-MM-DD)
                </span>
              </p>
              <p className="text-base font-medium">
                {event.periodStart || '—'} to {event.periodEnd || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-base font-medium whitespace-pre-wrap">
                {event.notes || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <MdPerson />
            <h4 className="font-semibold">Enrolled Students</h4>
          </div>
          <div className="border rounded">
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-gray-600">
                  <Spinner
                    size="lg"
                    color="text-dark-red-2"
                    message="Loading Students..."
                    className="py-20"
                  />
                </div>
              ) : students.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                  No students enrolled.
                </div>
              ) : (
                <table className="w-full text-sm max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 w-[15%]">Student ID</th>
                      <th className="text-left px-3 py-2 w-[30%]">Name</th>
                      <th className="text-left px-3 py-2 w-[40%]">Email</th>
                      <th className="text-left px-3 py-2 w-[15%]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 truncate max-w-0" title={s.userId}>
                          {s.userId}
                        </td>
                        <td className="px-3 py-2 truncate max-w-0" title={s.name}>
                          {s.name}
                        </td>
                        <td className="px-3 py-2 truncate max-w-0" title={s.email}>
                          {s.email}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                            {s.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ViewScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    courseName: PropTypes.string,
    academicPeriodName: PropTypes.string,
    teacherName: PropTypes.string,
    location: PropTypes.string,
    days: PropTypes.string,
    time_start: PropTypes.string,
    time_end: PropTypes.string,
    periodStart: PropTypes.string,
    periodEnd: PropTypes.string,
    notes: PropTypes.string,
  }),
};

export default ViewScheduleModal;
