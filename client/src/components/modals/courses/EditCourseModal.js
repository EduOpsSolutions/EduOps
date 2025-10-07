import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../utils/axios';
import DiscardChangesModal from '../common/DiscardChangesModal';
import ModalTextField from '../../form/ModalTextField';
import ModalSelectField from '../../form/ModalSelectField';

function EditCourseModal({
  edit_course_modal,
  setEditCourseModal,
  selectedCourse,
  fetchCourses,
  isLocked = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    visibility: 'hidden',
    price: '',
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  useEffect(() => {
    if (selectedCourse && edit_course_modal) {
      const courseData = {
        name: selectedCourse.name || '',
        visibility: selectedCourse.visibility || 'hidden',
        price: selectedCourse.price || '',
      };
      setFormData(courseData);
    }
  }, [selectedCourse, edit_course_modal]);

  useEffect(() => {
    if (!edit_course_modal) {
      setShowDiscardModal(false);
      setFormData({
        name: '',
        visibility: 'hidden',
        price: '',
      });
      setError('');
    }
  }, [edit_course_modal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxNumber' ? parseInt(value) || 0 : value,
    }));
    if (error) setError('');
  };


  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Course name is required');
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

      const payload = {
        name: formData.name.trim(),
        visibility: formData.visibility,
        price: parseFloat(formData.price),
    
      };

      const response = await axiosInstance.put(
        `/courses/${selectedCourse.id}`,
        payload
      );
      console.log('Course updated:', response.data);

      await fetchCourses();
      setEditCourseModal(false);
    } catch (error) {
      console.error(
        'Failed to update course: ',
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          'Failed to update course. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.entries(formData).some(([key, value]) => {
    });
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowDiscardModal(true);
    } else {
      setEditCourseModal(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setEditCourseModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  if (!edit_course_modal) return null;

  const visibilityOptions = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Course</h2>
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
            <ModalTextField
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
            />

            {/* Row 1: Visibility and Price */}
            <div className="flex flex-row justify-center items-center gap-4">
              <div className="w-1/2">
                {!isLocked && (
                  <ModalSelectField
                    label="Visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    options={visibilityOptions}
                  />
                )}
              </div>
              <div className="w-1/2">
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
                >
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                </ModalTextField>
              </div>
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
                    <span>Updating...</span>
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

export default EditCourseModal;
