import React, { useState, useEffect } from 'react';
import SearchField from '../../components/textFields/SearchField';
import ThinRedButton from '../../components/buttons/ThinRedButton';
import axiosInstance from '../../utils/axios.js';
import EnrollmentDetailsModal from '../../components/modals/enrollment/EnrollmentDetailsModal';
import { getCookieItem } from '../../utils/jwt';
import { useEnrollmentPeriodStore } from '../../stores/enrollmentPeriodStore';
import Swal from 'sweetalert2';
function EnrollmentRequests() {
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollmentRequest, setSelectedEnrollmentRequest] =
    useState(null);
  const [showEnrollmentDetailsModal, setShowEnrollmentDetailsModal] =
    useState(false);
  const [activePeriods, setActivePeriods] = useState([]);
  
  const { endEnrollment } = useEnrollmentPeriodStore();
  useEffect(() => {
    fetchEnrollmentRequests();
    fetchActivePeriods();
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const fetchEnrollmentRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/enrollment/requests', {
        params: {
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${getCookieItem('token')}`,
        },
      });
      if (!response.data.error) {
        setEnrollmentRequests(response.data.data);
      } else {
        setError(
          'Error fetching enrollment requests: ' + response.data.message
        );
      }
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      setError('Failed to load enrollment requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const handleSearch = () => {
    fetchEnrollmentRequests();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchActivePeriods = async () => {
    try {
      const response = await axiosInstance.get('/academic-periods');
      const ongoingPeriods = response.data.filter(period => {
        const now = new Date();
        const startDate = new Date(period.startAt);
        const endDate = new Date(period.endAt);
        return !period.enrollmentEnded && now >= startDate && now <= endDate;
      });
      setActivePeriods(ongoingPeriods);
    } catch (error) {
      console.error('Error fetching active periods:', error);
    }
  };

  const handleEndEnrollment = async () => {
    try {
      // First fetch active periods
      const response = await axiosInstance.get('/academic-periods');
      const ongoingPeriods = response.data.filter(period => {
        const now = new Date();
        const startDate = new Date(period.startAt);
        const endDate = new Date(period.endAt);
        return !period.enrollmentEnded && now >= startDate && now <= endDate;
      });

      if (ongoingPeriods.length === 0) {
        await Swal.fire({
          title: 'No Active Enrollment',
          text: 'There are no ongoing enrollment periods to end.',
          icon: 'info',
          confirmButtonColor: '#890E07'
        });
        return;
      }

      // If multiple periods, let user select which one to end
      let selectedPeriod;
      if (ongoingPeriods.length === 1) {
        selectedPeriod = ongoingPeriods[0];
      } else {
        const { value: periodId } = await Swal.fire({
          title: 'Select Enrollment Period to End',
          text: 'Multiple ongoing enrollment periods found. Select which one to end:',
          input: 'select',
          inputOptions: ongoingPeriods.reduce((options, period) => {
            options[period.id] = `${period.periodName} - ${period.batchName}`;
            return options;
          }, {}),
          inputPlaceholder: 'Select a period...',
          showCancelButton: true,
          confirmButtonColor: '#890E07',
          cancelButtonColor: '#6B7280'
        });

        if (!periodId) return;
        selectedPeriod = ongoingPeriods.find(p => p.id === periodId);
      }

      // Confirm the action
      const result = await Swal.fire({
        title: 'End Enrollment Period?',
        html: `
          <p>Are you sure you want to end enrollment for:</p>
          <p><strong>${selectedPeriod.periodName} - ${selectedPeriod.batchName}</strong></p>
          <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.5rem;">This action will prevent new enrollees.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#890E07',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, end enrollment',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      // End the enrollment
      const endResult = await endEnrollment(selectedPeriod.id);
      
      if (endResult.success) {
        await Swal.fire({
          title: 'Enrollment Ended',
          text: `Enrollment for ${selectedPeriod.periodName} - ${selectedPeriod.batchName} has been successfully ended.`,
          icon: 'success',
          confirmButtonColor: '#890E07'
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: endResult.error || 'Failed to end enrollment. Please try again.',
          icon: 'error',
          confirmButtonColor: '#890E07'
        });
      }
    } catch (error) {
      console.error('Error ending enrollment:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to end enrollment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#890E07'
      });
    }
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <EnrollmentDetailsModal
        data={selectedEnrollmentRequest}
        show={showEnrollmentDetailsModal}
        handleClose={() => {
          setShowEnrollmentDetailsModal(false);
          setSelectedEnrollmentRequest(null);
        }}
        handleSave={() => {}}
      />
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Enrollment Requests
            </h1>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              {/* Search Field */}
              <div className="order-1 sm:order-1">
                <SearchField
                  name="searchTerm"
                  placeholder="Search User"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={handleSearch}
                  className="w-full sm:w-80"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>

              <div className="flex justify-start w-full sm:w-auto order-2 sm:order-2">
                <ThinRedButton onClick={handleEndEnrollment}>End Enrollment</ThinRedButton>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                  <p className="text-lg">Loading Enrollment Requests...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            ID
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Name
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Courses
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Amount Balance
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Amount Paid
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            O.R.
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Phone
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Email
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Date
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Step
                          </th>
                          {/* <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Actions
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {enrollmentRequests.map((request, index) => (
                          <tr
                            key={request.id || index}
                            className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                            onClick={() => {
                              setSelectedEnrollmentRequest(request);
                              setShowEnrollmentDetailsModal(true);
                            }}
                          >
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.id}
                              >
                                {request.enrollmentId}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-24 sm:max-w-32 md:max-w-none"
                                title={request.name}
                              >
                                {request.firstName} {request.lastName} 
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.courses || 'N/A'}
                              >
                                {request.courses || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-28 md:max-w-none"
                                title={request.amountBalance || 'N/A'}
                              >
                                {request.amountBalance || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.amountPaid || 'N/A'}
                              >
                                {request.amountPaid || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.or || 'N/A'}
                              >
                                {request.or || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.phoneNumber || 'N/A'}
                              >
                                {request.phoneNumber || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.preferredEmail || 'N/A'}
                              >
                                {request.preferredEmail || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.date || 'N/A'}
                              >
                                {new Date(request.createdAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  }
                                ) || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={request.step || 'N/A'}
                              >
                                {request.step || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {enrollmentRequests.length === 0 && !loading && (
                          <tr>
                            <td
                              colSpan="11"
                              className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                            >
                              No enrollment requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentRequests;