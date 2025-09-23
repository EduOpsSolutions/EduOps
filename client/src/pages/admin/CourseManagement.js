import React, { useEffect } from 'react';
import CreateCourseModal from '../../components/modals/courses/CreateCourseModal';
import EditCourseModal from '../../components/modals/courses/EditCourseModal';
import Pagination from "../../components/common/Pagination";
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from '../../components/buttons/ThinRedButton';
import { useCourseSearchStore, useCourseStore } from '../../stores/courseStore';

function CourseManagement() {
  const searchStore = useCourseSearchStore();
  
  const {
    // State
    selectedCourse,
    loading,
    error,
    createCourseModal,
    editCourseModal,
    
    // Actions
    fetchCourses,
    handleRowClick,
    openCreateCourseModal,
    closeCreateCourseModal,
    closeEditCourseModal,
    clearError,
    resetStore
  } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    searchStore.handleSearch();
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Courses</h1>
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
              <div className="order-1 sm:order-1">
                <SearchField
                  name="searchTerm"
                  placeholder="Search Course"
                  value={searchStore.searchParams.searchTerm}
                  onChange={searchStore.handleInputChange}
                  onClick={handleSearch}
                  className="w-full sm:w-80"
                />
              </div>
              
              <div className="flex justify-start w-full sm:w-auto order-2 sm:order-2">
                <ThinRedButton onClick={openCreateCourseModal}>
                  Create Course
                </ThinRedButton>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                  <p className="text-lg">Loading Courses...</p>
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
                            Course ID
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Course Name
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            # of Students
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Schedule
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Adviser
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Price
                          </th>
                          <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchStore.currentItems.map((course, index) => (
                          <tr
                            key={course.id || index}
                            className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                            onClick={() => handleRowClick(course)}
                          >
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={course.id}>
                                {course.id}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-24 sm:max-w-32 md:max-w-none" title={course.name}>
                                {course.name}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={course.maxNumber || 'N/A'}>
                                {course.maxNumber || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-28 md:max-w-none" title={course.schedule ? `${course.schedule.days}, ${course.schedule.time}` : 'N/A'}>
                                {course.schedule ? `${course.schedule.days}, ${course.schedule.time}` : 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={course.adviser ? `${course.adviser.firstName} ${course.adviser.middleName ? course.adviser.middleName + ' ' : ''}${course.adviser.lastName}` : 'N/A'}>
                                {course.adviser ? `${course.adviser.firstName} ${course.adviser.middleName ? course.adviser.middleName + ' ' : ''}${course.adviser.lastName}` : 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={course.price || 'N/A'}>
                                {course.price || 'N/A'}
                              </div>
                            </td>
                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                              <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={course.visibility === 'visible' ? 'Visible' : 'Hidden'}>
                                {course.visibility === 'visible' ? 'Visible' : 'Hidden'}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {searchStore.currentItems.length === 0 && !loading && (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                            >
                              No courses found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4">
                  <Pagination
                    currentPage={searchStore.currentPage}
                    totalPages={searchStore.totalPages}
                    onPageChange={searchStore.handlePageChange}
                    itemsPerPage={searchStore.itemsPerPage}
                    onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                    totalItems={searchStore.totalItems}
                    itemName="courses"
                    showItemsPerPageSelector={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CreateCourseModal
        create_course_modal={createCourseModal}
        setCreateCourseModal={closeCreateCourseModal}
        fetchCourses={fetchCourses}
      />
      
      <EditCourseModal 
        edit_course_modal={editCourseModal} 
        setEditCourseModal={closeEditCourseModal} 
        selectedCourse={selectedCourse}
        fetchCourses={fetchCourses}
      />
    </div>
  );
}

export default CourseManagement;