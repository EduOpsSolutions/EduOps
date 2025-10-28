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
  const [currentPeriodInfo, setCurrentPeriodInfo] = useState(null);
  
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
      const now = new Date();
      
      // Only periods with enrollmentStatus 'open' and not closed
      const openPeriods = response.data.filter(period => {
        return (
          (period.enrollmentStatus && period.enrollmentStatus.toLowerCase() === 'open') &&
          !period.isEnrollmentClosed
        );
      });
      setActivePeriods(openPeriods);

      // All periods for info display
      const allPeriods = response.data
        .filter(period => !period.deletedAt)
        .map(period => {
          const startDate = new Date(period.startAt);
          const endDate = new Date(period.endAt);
          let status;
          if (period.status === 'ended') {
            status = 'Ended';
          } else if (now < startDate) {
            status = 'Upcoming';
          } else if (now >= startDate && now <= endDate) {
            status = 'Ongoing';
          } else {
            status = 'Ended';
          }
          return { ...period, calculatedStatus: status };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Set the next available open period as current info
      if (openPeriods.length > 0) {
        setCurrentPeriodInfo(openPeriods[0]);
      } else if (allPeriods.length > 0) {
        // fallback to most recent period
        setCurrentPeriodInfo(allPeriods[0]);
      } else {
        setCurrentPeriodInfo(null);
      }
    } catch (error) {
      console.error('Error fetching active periods:', error);
    }
  };

  const handleEndEnrollment = async () => {
    try {
      const response = await axiosInstance.get('/academic-periods');
      const ongoingPeriods = response.data.filter(period => {
        const now = new Date();
        const enrollmentOpen = new Date(period.enrollmentOpenAt);
        const enrollmentClose = new Date(period.enrollmentCloseAt);
        return !period.isEnrollmentClosed && now >= enrollmentOpen && now <= enrollmentClose;
      });

      if (ongoingPeriods.length === 0) {
        await Swal.fire({
          title: 'No Active Enrollment',
          text: 'There is no ongoing enrollment period to end.',
          icon: 'info',
          confirmButtonColor: '#890E07'
        });
        return;
      }

      const selectedPeriod = ongoingPeriods[0];

      const result = await Swal.fire({
        title: 'End Enrollment Period?',
        html: `
          <p>Are you sure you want to end enrollment for:</p>
          <p><strong>${selectedPeriod.batchName}</strong></p>
          <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.5rem;">This action will prevent new enrollees.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#890E07',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, end enrollment',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (!result.isConfirmed) return;

      const endResult = await endEnrollment(selectedPeriod.id);
      
      if (endResult.success) {
        await Swal.fire({
          title: 'Enrollment Ended',
          text: `Enrollment for ${selectedPeriod.batchName} has been successfully ended.`,
          icon: 'success',
          confirmButtonColor: '#890E07'
        });
        
        await fetchActivePeriods();
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
        handleSave={(updatedData) => {
          setEnrollmentRequests(prev => 
            prev.map(request => 
              request.id === updatedData.id ? updatedData : request
            )
          );
          if (selectedEnrollmentRequest?.id === updatedData.id) {
            setSelectedEnrollmentRequest(updatedData);
          }
          setShowEnrollmentDetailsModal(false);
        }}
        onEnrollmentUpdate={fetchEnrollmentRequests}
      />
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Enrollment Requests
            </h1>
          </div>

          {/* Current Enrollment Period Info */}
          {currentPeriodInfo && (
            <div className="mb-6 md:mb-8">
              <div className={`p-4 rounded-lg border-2 ${(() => {
                switch ((currentPeriodInfo.enrollmentStatus || '').toLowerCase()) {
                  case 'open':
                    return 'bg-green-50 border-green-200';
                  case 'closed':
                    return 'bg-red-50 border-red-200';
                  case 'upcoming':
                    return 'bg-blue-50 border-blue-200';
                  case 'ended':
                    return 'bg-gray-50 border-gray-200';
                  default:
                    return 'bg-gray-50 border-gray-200';
                }
              })()}`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      Current Enrollment Period
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                      <strong>{currentPeriodInfo.batchName}</strong>
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {new Date(currentPeriodInfo.enrollmentOpenAt).toLocaleDateString()} - {new Date(currentPeriodInfo.enrollmentCloseAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${(() => {
                        switch ((currentPeriodInfo.enrollmentStatus || '').toLowerCase()) {
                          case 'open':
                            return 'bg-green-100 text-green-800 border border-green-200';
                          case 'closed':
                            return 'bg-red-100 text-red-800 border border-red-200';
                          case 'upcoming':
                            return 'bg-blue-100 text-blue-800 border border-blue-200';
                          case 'ended':
                            return 'bg-gray-100 text-gray-800 border border-gray-200';
                          default:
                            return 'bg-gray-100 text-gray-800 border border-gray-200';
                        }
                      })()}`}
                    >
                      {currentPeriodInfo.enrollmentStatus
                        ? currentPeriodInfo.enrollmentStatus.charAt(0).toUpperCase() + currentPeriodInfo.enrollmentStatus.slice(1)
                        : 'N/A'}
                    </span>
                    {(currentPeriodInfo.enrollmentStatus === 'closed' || currentPeriodInfo.enrollmentStatus === 'ended') && (
                      <p className="text-xs text-red-600 mt-1">
                        No new enrollments accepted
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Active Periods Warning */}
          {currentPeriodInfo && activePeriods.length === 0 &&
            ((currentPeriodInfo.enrollmentStatus &&
              (currentPeriodInfo.enrollmentStatus.toLowerCase() === 'ended' ||
               currentPeriodInfo.enrollmentStatus.toLowerCase() === 'closed')) ||
              currentPeriodInfo.isEnrollmentClosed) && (
            <div className="mb-6 md:mb-8">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      No Active Enrollment Period
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      There is currently no ongoing enrollment period. No new enrollment requests will be accepted until a new period begins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {activePeriods.length === 1 &&
                  !activePeriods[0].isEnrollmentClosed &&
                  new Date(activePeriods[0].enrollmentOpenAt) <= new Date() &&
                  new Date(activePeriods[0].enrollmentCloseAt) >= new Date() ? (
                  <ThinRedButton onClick={handleEndEnrollment}>
                    End Enrollment
                  </ThinRedButton>
                ) : (
                  <div className="text-sm text-gray-500 py-2 px-4 bg-gray-100 rounded-lg">
                    {currentPeriodInfo?.enrollmentStatus &&
                      (currentPeriodInfo.enrollmentStatus.toLowerCase() === 'ended' ||
                        currentPeriodInfo.enrollmentStatus.toLowerCase() === 'closed')
                      ? 'Enrollment Already Ended'
                      : 'No Active Enrollment Period'}
                  </div>
                )}
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
                            Status
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
                                title={request.coursesToEnroll || 'N/A'}
                              >
                                {request.coursesToEnroll || 'N/A'}
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
                                title={request.contactNumber || 'N/A'}
                              >
                                {request.contactNumber || 'N/A'}
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
                                title={request.enrollmentStatus || 'N/A'}
                              >
                                {request.enrollmentStatus || 'N/A'}
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