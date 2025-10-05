import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  MdClose,
  MdLocationOn,
  MdAccessTime,
  MdPerson,
  MdRepeat,
  MdCalendarToday,
} from 'react-icons/md';
import { FaAlignLeft } from 'react-icons/fa';
import TeacherSelect from '../../inputs/TeacherSelect';
import CourseSelect from '../../inputs/CourseSelect';
import AcademicPeriodSelect from '../../inputs/AcademicPeriodSelect';
import Swal from 'sweetalert2';
import ViewStudentsModal from './ViewStudentsModal';
import axiosInstance from '../../../utils/axios';

/**
 * Create/Edit Schedule Modal
 * Form for creating or editing recurring schedule events
 */
function CreateEditScheduleModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
  teachers,
  isLoadingTeachers,
  courses,
  isLoadingCourses,
  academicPeriods,
  isLoadingAcademicPeriods,
}) {
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    academicPeriodId: '',
    academicPeriodName: '',
    location: '',
    time_start: '',
    time_end: '',
    days: '',
    periodStart: '',
    periodEnd: '',
    teacherId: '',
    teacherName: '',
    notes: '',
    color: '#FFCF00',
  });

  const colorOptions = [
    '#4A90E2', // Blue
    '#F5A623', // Orange
    '#FFCF00', // Yellow
    '#BD10E0', // Purple
    '#50E3C2', // Teal
    '#7ED321', // Green
    '#D0021B', // Red
    '#4A4A4A', // Gray
    '#9013FE', // Violet
  ];

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        courseId: event.courseId || '',
        courseName: event.courseName || event.title || '',
        academicPeriodId: event.academicPeriodId || '',
        academicPeriodName: event.academicPeriodName || '',
        location: event.location || '',
        time_start: event.time_start || '',
        time_end: event.time_end || '',
        days: event.days || '',
        periodStart: event.periodStart || '',
        periodEnd: event.periodEnd || '',
        teacherId: event.teacherId || '',
        teacherName: event.teacherName || '',
        notes: event.notes || '',
        color: event.color || '#FFCF00',
      });
    } else if (selectedDate) {
      // Creating new event with default time from selectedDate if available
      setFormData((prev) => ({
        ...prev,
        periodStart: selectedDate.toISOString().split('T')[0],
      }));
    }
  }, [event, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleTeacherSelect = (teacher) => {
    setFormData((prev) => ({
      ...prev,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
    }));
  };

  const handleCourseSelect = (course) => {
    setFormData((prev) => ({
      ...prev,
      courseId: course.id,
      courseName: course.name,
    }));
  };

  const handleAcademicPeriodSelect = (period) => {
    // Format dates to YYYY-MM-DD for date input
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setFormData((prev) => ({
      ...prev,
      academicPeriodId: period.id,
      academicPeriodName: `${period.periodName}${
        period.batchName ? ` - ${period.batchName}` : ''
      }`,
      // Automatically set schedule dates to match academic period dates
      periodStart: formatDate(period.startAt),
      periodEnd: formatDate(period.endAt),
    }));
  };

  const handleDayToggle = (day) => {
    const daysArray = formData.days
      ? formData.days.split(',').map((d) => d.trim())
      : [];
    const dayIndex = daysArray.indexOf(day);

    if (dayIndex > -1) {
      // Remove day
      daysArray.splice(dayIndex, 1);
    } else {
      // Add day
      daysArray.push(day);
    }

    setFormData((prev) => ({
      ...prev,
      days: daysArray.join(','),
    }));
  };

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsRefreshTick, setStudentsRefreshTick] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.academicPeriodId) {
      Swal.fire({
        title: 'Error',
        text: 'Please select an academic period',
        icon: 'error',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#ff0000',
        confirmButtonTextColor: 'white',
      });
      return;
    }

    // Validate schedule dates are within academic period boundaries
    if (formData.periodStart && formData.periodEnd) {
      const selectedPeriod = academicPeriods.find(
        (p) => p.id === formData.academicPeriodId
      );

      if (selectedPeriod) {
        const scheduleStart = new Date(formData.periodStart);
        const scheduleEnd = new Date(formData.periodEnd);
        const periodStart = new Date(selectedPeriod.startAt);
        const periodEnd = new Date(selectedPeriod.endAt);

        if (formData.time_start === '' || formData.time_end === '') {
          Swal.fire({
            title: 'Error',
            text: 'Please select a time',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        if (formData.time_start >= formData.time_end) {
          Swal.fire({
            title: 'Error',
            text: 'Start time must be before end time',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        if (formData.time_start < '06:00') {
          Swal.fire({
            title: 'Error',
            text: 'Earliest Start Time is 6:00 AM',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        if (formData.time_end >= '21:01') {
          Swal.fire({
            title: 'Error',
            text: 'Latest End Time is 9:00 PM',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        // Validate minimum duration of 30 minutes
        const [startHours, startMinutes] = formData.time_start
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = formData.time_end.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        const durationMinutes = endTotalMinutes - startTotalMinutes;

        if (durationMinutes < 30) {
          Swal.fire({
            title: 'Error',
            text: 'Schedule duration must be at least 30 minutes',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        if (scheduleStart < periodStart || scheduleEnd > periodEnd) {
          Swal.fire({
            title: 'Error',
            text: `Schedule dates must be within the academic period range:\n${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }

        if (scheduleStart > scheduleEnd) {
          Swal.fire({
            title: 'Error',
            text: 'Schedule end date must be after start date',
            icon: 'error',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#ff0000',
            confirmButtonTextColor: 'white',
          });
          return;
        }
      }
    }

    onSave(formData);
  };

  const formatRecurrenceDisplay = () => {
    if (!formData.days || !formData.periodEnd) return '';
    const dayMap = {
      M: 'Mon',
      T: 'Tue',
      W: 'Wed',
      TH: 'Thu',
      F: 'Fri',
      S: 'Sat',
      SU: 'Sun',
    };
    const daysArray = formData.days
      .split(',')
      .map((d) => dayMap[d.trim()] || d.trim());
    const endDate = new Date(formData.periodEnd).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return `Every ${daysArray.join(', ')} until ${endDate}`;
  };

  const calculateTotalHours = () => {
    try {
      const { periodStart, periodEnd, time_start, time_end, days } = formData;
      if (!periodStart || !periodEnd || !time_start || !time_end || !days)
        return '';

      const [sh, sm] = String(time_start).split(':').map(Number);
      const [eh, em] = String(time_end).split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm);
      if (minutes <= 0) return '';
      const hoursPerSession = minutes / 60;

      const dayMap = { SU: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, S: 6 };
      const selectedDays = new Set(
        String(days)
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => dayMap[d])
          .filter((n) => n !== undefined)
      );
      if (selectedDays.size === 0) return '';

      const start = new Date(periodStart);
      const end = new Date(periodEnd);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {event ? 'Edit Schedule' : 'Create Schedule'}
            </h2>
            {selectedDate && (
              <p className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Course Title */}
                <div className="flex items-start gap-3">
                  <FaAlignLeft className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title<span className="text-red-500">*</span>
                    </label>
                    <CourseSelect
                      value={formData.courseId}
                      onChange={handleCourseSelect}
                      courses={courses}
                      isLoading={isLoadingCourses}
                    />
                  </div>
                  {/* Color Indicator */}
                  <div
                    className="w-6 h-6 rounded-full mt-8 border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                </div>

                {/* Academic Period */}
                <div className="flex items-start gap-3">
                  <MdCalendarToday className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Period <span className="text-red-500">*</span>
                    </label>
                    <AcademicPeriodSelect
                      value={formData.academicPeriodId}
                      onChange={handleAcademicPeriodSelect}
                      academicPeriods={academicPeriods}
                      isLoading={isLoadingAcademicPeriods}
                    />
                    {formData.academicPeriodId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Schedule dates must be within the academic period range
                      </p>
                    )}
                    {!formData.academicPeriodId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Select the academic period this schedule applies to
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Location */}
                <div className="flex items-start gap-3">
                  <MdLocationOn className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Location<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Online - VR1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <MdAccessTime className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time<span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="time_start"
                          value={formData.time_start}
                          onChange={handleChange}
                          min="06:00"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="time_end"
                          value={formData.time_end}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repeat */}
                <div className="flex items-start gap-3">
                  <MdRepeat className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repeat<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {/* Day Selection Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'M', label: 'Mon' },
                          { value: 'T', label: 'Tue' },
                          { value: 'W', label: 'Wed' },
                          { value: 'TH', label: 'Thu' },
                          { value: 'F', label: 'Fri' },
                          { value: 'S', label: 'Sat' },
                          { value: 'SU', label: 'Sun' },
                        ].map((day) => {
                          const isSelected = formData.days
                            ? formData.days
                                .split(',')
                                .map((d) => d.trim())
                                .includes(day.value)
                            : false;
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleDayToggle(day.value)}
                              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-dark-red-2 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Start Date<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="periodStart"
                            value={formData.periodStart}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            End Date<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="periodEnd"
                            value={formData.periodEnd}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                            required
                          />
                        </div>
                      </div>
                      {formatRecurrenceDisplay() && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {formatRecurrenceDisplay()}
                        </p>
                      )}
                      {calculateTotalHours() && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          Estimated total hours: {calculateTotalHours()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organizer / Adviser */}
                <div className="flex items-start gap-3">
                  <MdPerson className="text-gray-400 mt-3" size={20} />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organizer / Adviser<span className="text-red-500">*</span>
                    </label>
                    <TeacherSelect
                      value={formData.teacherId}
                      onChange={handleTeacherSelect}
                      teachers={teachers}
                      isLoading={isLoadingTeachers}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Notes & Color Palette */}
              <div className="space-y-4">
                {/* Color Palette */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Color<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add notes, meeting links, or additional information..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dark-red-2 resize-none"
                  ></textarea>
                </div>

                {/* View Students Button (admin/teacher, requires course & period) */}
                {(event || formData.courseId) && (
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(true)}
                    disabled={!formData.academicPeriodId || !formData.courseId}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <MdPerson size={16} />
                    View Students
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(event)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  Delete Event
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-dark-red-2 hover:bg-dark-red-3 text-white rounded transition-colors"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>

      <ViewStudentsModal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        courseId={formData.courseId}
        periodId={formData.academicPeriodId}
        days={formData.days}
        time_start={formData.time_start}
        time_end={formData.time_end}
        refreshToken={studentsRefreshTick}
        scheduleId={event?.id}
        onStudentSelected={({ student, conflict }) => {
          if (conflict?.hasConflicts) {
            Swal.fire({
              title: 'Schedule Conflict',
              text: 'Selected student has a conflicting schedule in this period.',
              icon: 'warning',
              confirmButtonText: 'OK',
              confirmButtonColor: '#992525',
            });
            return;
          }
          if (!event?.id) {
            Swal.fire({
              title: 'Schedule Not Saved',
              text: 'Save the schedule first before adding students.',
              icon: 'info',
              confirmButtonText: 'OK',
              confirmButtonColor: '#000000',
            });
            return;
          }
          axiosInstance
            .post(`/schedules/${event.id}/students`, { userId: student.id })
            .then((resp) => {
              if (resp?.data?.alreadyLinked) {
                Swal.fire({
                  title: 'Already Added',
                  text: `${student.name} is already linked to this schedule.`,
                  icon: 'info',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#000000',
                });
              } else {
                Swal.fire({
                  title: 'Student Added to Schedule',
                  text: `${student.name} added to schedule.`,
                  icon: 'success',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#000000',
                });
              }
              setStudentsRefreshTick((v) => v + 1);
            })
            .catch(() => {
              Swal.fire({
                title: 'Failed to Add Student',
                text: 'Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#992525',
              });
            });
        }}
      />
    </div>
  );
}

CreateEditScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    title: PropTypes.string, // For backward compatibility
    courseId: PropTypes.string,
    courseName: PropTypes.string,
    academicPeriodId: PropTypes.string,
    academicPeriodName: PropTypes.string,
    location: PropTypes.string,
    time_start: PropTypes.string,
    time_end: PropTypes.string,
    days: PropTypes.string,
    periodStart: PropTypes.string,
    periodEnd: PropTypes.string,
    teacherId: PropTypes.string,
    teacherName: PropTypes.string,
    notes: PropTypes.string,
    color: PropTypes.string,
  }),
  selectedDate: PropTypes.instanceOf(Date),
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  teachers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string,
      status: PropTypes.string,
    })
  ),
  isLoadingTeachers: PropTypes.bool,
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      visibility: PropTypes.string,
    })
  ),
  isLoadingCourses: PropTypes.bool,
  academicPeriods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      periodName: PropTypes.string.isRequired,
      batchName: PropTypes.string,
      startAt: PropTypes.string.isRequired,
      endAt: PropTypes.string.isRequired,
      status: PropTypes.string,
    })
  ),
  isLoadingAcademicPeriods: PropTypes.bool,
};

export default CreateEditScheduleModal;
