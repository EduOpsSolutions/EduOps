import React, { useState, useEffect } from 'react';
import SearchField from '../../components/textFields/SearchField';
import ThinRedButton from '../../components/buttons/ThinRedButton';
import axiosInstance from '../../utils/axios.js';
import EnrollmentDetailsModal from '../../components/modals/enrollment/EnrollmentDetailsModal';
import { getCookieItem } from '../../utils/jwt';
function EnrollmentRequests() {
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollmentRequest, setSelectedEnrollmentRequest] =
    useState(null);
  const [showEnrollmentDetailsModal, setShowEnrollmentDetailsModal] =
    useState(false);
  useEffect(() => {
    fetchEnrollmentRequests();
  }, []);

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
                <ThinRedButton onClick={() => {}}>End Enrollment</ThinRedButton>
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
                                title={request.enrollmentId}
                              >
                                {request.enrollmentId}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-24 sm:max-w-32 md:max-w-none"
                                title={'Full Name'}
                              >
                                {request.firstName} {request.middleName}{' '}
                                {request.lastName}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={'Course To Enroll'}
                              >
                                {request.coursesToEnroll || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-28 md:max-w-none"
                                title={'Amount Balance'}
                              >
                                {request.amountBalance || Number(0).toFixed(2)}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div
                                className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                                title={'Amount Paid'}
                              >
                                {request.amountPaid || Number(0).toFixed(2)}
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
                            {/* <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="flex space-x-2">
                                <button
                                  className="text-dark-red-2 hover:text-dark-red-5 transition-colors duration-150"
                                  title="View"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="text-dark-red-2 hover:text-dark-red-5 transition-colors duration-150"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="text-dark-red-2 hover:text-dark-red-5 transition-colors duration-150"
                                  title="Info"
                                >
                                  <i className="fas fa-info-circle"></i>
                                </button>
                              </div>
                            </td> */}
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
