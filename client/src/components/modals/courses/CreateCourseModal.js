import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../utils/axios';
import DiscardChangesModal from '../common/DiscardChangesModal';
import ModalTextField from '../../form/ModalTextField';
import ModalSelectField from '../../form/ModalSelectField';

function CreateCourseModal({
  setCreateCourseModal,
  create_course_modal,
  fetchCourses,
  isLocked = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    maxNumber: 30,
    visibility: 'hidden',
    description: '',
    price: '',
    scheduleDays: [],
    scheduleTime: '',
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const daysDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        daysDropdownRef.current &&
        !daysDropdownRef.current.contains(event.target)
      ) {
        setIsDaysDropdownOpen(false);
      }
    };

    if (isDaysDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDaysDropdownOpen]);

  useEffect(() => {
    if (!create_course_modal) {
      setShowDiscardModal(false);
      setFormData({
        name: '',
        maxNumber: 30,
        visibility: 'hidden',
        description: '',
        price: '',
        scheduleDays: [],
        scheduleTime: '',
      });
      setError('');
    }
  }, [create_course_modal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxNumber' ? parseInt(value) || 0 : value,
    }));
    if (error) setError('');
  };

  // Helper function to sort days by week order
  const sortDaysByWeekOrder = (days) => {
    const weekOrder = ['M', 'T', 'W', 'TH', 'F', 'SAT', 'SUN'];
    return [...days].sort(
      (a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b)
    );
  };

  // Handle day selection with auto-sorting
  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const currentDays = prev.scheduleDays || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return {
        ...prev,
        scheduleDays: sortDaysByWeekOrder(newDays),
      };
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Course name is required');
      return false;
    }
    if (formData.maxNumber <= 0) {
      setError('Number of students must be greater than 0');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Valid price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const scheduleDaysString = formData.scheduleDays.join('');

      const payload = {
        name: formData.name.trim(),
        maxNumber: parseInt(formData.maxNumber),
        visibility: formData.visibility,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        schedule:
          scheduleDaysString && formData.scheduleTime.trim()
            ? {
                days: scheduleDaysString,
                time: formData.scheduleTime.trim(),
              }
            : null,
      };

      const response = await axiosInstance.post('/courses/create', payload);
      console.log('Course created:', response.data);

      await fetchCourses();
      setCreateCourseModal(false);
    } catch (error) {
      console.error(
        'Failed to create course: ',
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          'Failed to create course. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.entries(formData).some(([key, value]) => {
      if (key === 'maxNumber') return value !== 30;
      if (key === 'visibility') return value !== 'hidden';
      if (key === 'scheduleDays') return value.length > 0;
      return value.toString().trim() !== '';
    });
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowDiscardModal(true);
    } else {
      setCreateCourseModal(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setCreateCourseModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  if (!create_course_modal) return null;

  const visibilityOptions = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-visible">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Course Creation</h2>
            <button
              className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
              onClick={handleClose}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Name */}
            <ModalTextField
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
            />

            {/* Row 1: Students, Visibility, Price */}
            <div className="flex flex-row justify-center items-center gap-4">
              <ModalTextField
                label="# of Students"
                name="maxNumber"
                type="number"
                value={formData.maxNumber}
                onChange={handleInputChange}
                min="1"
                required
                className="w-1/3"
              />

              {!isLocked && (
                <ModalSelectField
                  label="Visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  options={visibilityOptions}
                  className="w-1/3"
                />
              )}

              <ModalTextField
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                required
                className={isLocked ? 'w-1/2' : 'w-1/3'}
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>
            </div>

            {/* Description */}
            <ModalTextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter course description"
            />

            {/* Schedule Fields */}
            <div className="flex flex-row justify-center items-center gap-4">
              {/* Schedule Days Multi-Select Dropdown */}
              <div className="w-1/2 relative" ref={daysDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Days
                </label>
                <button
                  type="button"
                  onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2"
                >
                  <span
                    className={
                      formData.scheduleDays.length > 0
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }
                  >
                    {formData.scheduleDays.length > 0
                      ? formData.scheduleDays.join('')
                      : 'Select days'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isDaysDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Floating Dropdown */}
                {isDaysDropdownOpen && (
                  <div className="absolute z-[80] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 space-y-1">
                      {[
                        { value: 'M', label: 'Monday' },
                        { value: 'T', label: 'Tuesday' },
                        { value: 'W', label: 'Wednesday' },
                        { value: 'TH', label: 'Thursday' },
                        { value: 'F', label: 'Friday' },
                        { value: 'SAT', label: 'Saturday' },
                        { value: 'SUN', label: 'Sunday' },
                      ].map((day) => (
                        <label
                          key={day.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.scheduleDays.includes(day.value)}
                            onChange={() => handleDayToggle(day.value)}
                            className="w-4 h-4 text-dark-red-2 border-gray-300 rounded focus:ring-dark-red-2"
                          />
                          <span className="text-sm text-gray-700">
                            {day.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <ModalTextField
                label="Schedule Time"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleInputChange}
                placeholder="e.g. 6:30AM - 7:30AM"
                className="w-1/2"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DiscardChangesModal
        show={showDiscardModal}
        onConfirm={handleDiscardChanges}
        onCancel={handleCancelDiscard}
      />
    </>
  );
}

export default CreateCourseModal;
