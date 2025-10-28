import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios';
import Swal from 'sweetalert2';
import ModalTextField from '../../form/ModalTextField';

function AcademicPeriodModal({
  setAddAcademicPeriodModal,
  addAcademicPeriodModal,
  fetchPeriods,
}) {
  const [formData, setFormData] = useState({
    batchName: '',
    startAt: '',
    endAt: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!addAcademicPeriodModal) {
      setFormData({
        batchName: '',
        startAt: '',
        endAt: '',
        enrollmentOpenAt: '',
        enrollmentCloseAt: '',
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
    if (!formData.startAt) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endAt) {
      setError('End date is required');
      return false;
    }
    if (!formData.enrollmentOpenAt) {
      setError('Enrollment open date is required');
      return false;
    }
    if (!formData.enrollmentCloseAt) {
      setError('Enrollment close date is required');
      return false;
    }
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      setError('End date must be after start date');
      return false;
    }
    if (new Date(formData.enrollmentOpenAt) >= new Date(formData.enrollmentCloseAt)) {
      setError('Enrollment close date must be after enrollment open date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await Swal.fire({
      title: 'Create Batch?',
      text: 'Do you want to create this batch?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, create',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      setError('');

      // Check for overlapping enrollment window before submitting
      const enrollmentOpenDateTime = new Date(formData.enrollmentOpenAt);
      enrollmentOpenDateTime.setHours(0, 0, 0, 0);
      const enrollmentCloseDateTime = new Date(formData.enrollmentCloseAt);
      enrollmentCloseDateTime.setHours(23, 59, 59, 999);

      // Fetch all periods to check for overlap
      const periodsResp = await axiosInstance.get('/academic-periods');
      const overlapping = periodsResp.data.find(period => {
        if (period.deletedAt || period.isEnrollmentClosed) return false;
        const existingOpen = new Date(period.enrollmentOpenAt);
        const existingClose = new Date(period.enrollmentCloseAt);
        // Overlap: new.open <= existing.close && new.close >= existing.open
        return (
          enrollmentOpenDateTime <= existingClose &&
          enrollmentCloseDateTime >= existingOpen
        );
      });
      if (overlapping) {
        setError('There is already an ongoing or overlapping enrollment window. Only one open enrollment period is allowed at a time.');
        setLoading(false);
        return;
      }

      const startDateTime = new Date(formData.startAt);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(formData.endAt);
      endDateTime.setHours(23, 59, 59, 999);

      const payload = {
        batchName: formData.batchName.trim(),
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        enrollmentOpenAt: enrollmentOpenDateTime.toISOString(),
        enrollmentCloseAt: enrollmentCloseDateTime.toISOString(),
      };

      console.log('Payload for creating academic period:', payload);
      const response = await axiosInstance.post(
        '/academic-periods/create',
        payload
      );
      console.log('Academic Period created:', response.data);

      await fetchPeriods();
      await Swal.fire({
        title: 'Created!',
        text: 'The batch has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#890E07',
        timer: 2000,
        showConfirmButton: false
      });
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
      Swal.fire({
        title: 'Discard Changes?',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No, keep editing',
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6b7280',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          setAddAcademicPeriodModal(false);
        }
      });
    } else {
      setAddAcademicPeriodModal(false);
    }
  };

  if (!addAcademicPeriodModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Create Batch</h2>
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

            {/* Removed Period Name: using batch and dates only */}

            <div className="flex flex-row justify-center items-center gap-4">
              <ModalTextField
                label="Enrollment Open Date"
                name="enrollmentOpenAt"
                type="date"
                value={formData.enrollmentOpenAt}
                onChange={handleInputChange}
                required
                className="w-1/2"
              />

              <ModalTextField
                label="Enrollment Close Date"
                name="enrollmentCloseAt"
                type="date"
                value={formData.enrollmentCloseAt}
                onChange={handleInputChange}
                required
                className="w-1/2"
              />
            </div>

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
    </>
  );
}

export default AcademicPeriodModal;
