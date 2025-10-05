import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios';
import DiscardChangesModal from '../common/DiscardChangesModal';
import ModalTextField from '../../form/ModalTextField';

function AcademicPeriodModal({
  setAddAcademicPeriodModal,
  addAcademicPeriodModal,
  fetchPeriods,
}) {
  const [formData, setFormData] = useState({
    batchName: '',
    periodName: '',
    startAt: '',
    endAt: '',
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!addAcademicPeriodModal) {
      setShowDiscardModal(false);
      setFormData({
        batchName: '',
        periodName: '',
        startAt: '',
        endAt: '',
      });
      setError('');
    }
  }, [addAcademicPeriodModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.batchName.trim()) {
      setError('Batch name is required');
      return false;
    }
    if (!formData.periodName.trim()) {
      setError('Period name is required');
      return false;
    }
    if (!formData.startAt) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endAt) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      setError('End date must be after start date');
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

      const startDateTime = new Date(formData.startAt);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(formData.endAt);
      endDateTime.setHours(23, 59, 59, 999);

      const payload = {
        batchName: formData.batchName.trim(),
        periodName: formData.periodName.trim(),
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      };

      console.log('Payload for creating academic period:', payload);
      const response = await axiosInstance.post(
        '/academic-periods/create',
        payload
      );
      console.log('Academic Period created:', response.data);

      await fetchPeriods();
      setAddAcademicPeriodModal(false);
    } catch (error) {
      console.error(
        'Failed to create academic period: ',
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          'Failed to create academic period. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.values(formData).some((value) => value.trim() !== '');
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowDiscardModal(true);
    } else {
      setAddAcademicPeriodModal(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setAddAcademicPeriodModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  if (!addAcademicPeriodModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Period Creation</h2>
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
            {/* Batch Name */}
            <ModalTextField
              label="Batch Name"
              name="batchName"
              value={formData.batchName}
              onChange={handleInputChange}
              placeholder="Enter batch name"
              required
            />

            {/* Period Name */}
            <ModalTextField
              label="Period Name"
              name="periodName"
              value={formData.periodName}
              onChange={handleInputChange}
              placeholder="Enter period name"
              required
            />

            {/* Date Range */}
            <div className="flex flex-row justify-center items-center gap-4">
              <ModalTextField
                label="Start Date"
                name="startAt"
                type="date"
                value={formData.startAt}
                onChange={handleInputChange}
                required
                className="w-1/2"
              />

              <ModalTextField
                label="End Date"
                name="endAt"
                type="date"
                value={formData.endAt}
                onChange={handleInputChange}
                required
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

export default AcademicPeriodModal;
