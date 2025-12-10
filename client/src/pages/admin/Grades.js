import React, { useEffect } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import StudentsGradeModal from "../../components/modals/grades/StudentsGradeModal";
import SearchField from "../../components/textFields/SearchField";
import Pagination from "../../components/common/Pagination";
import useGradeStore, { useGradeSearchStore } from "../../stores/gradeStore";
import { convertTo12Hour } from "../../utils/scheduleUtils";

function Grades() {
  const {
    // State
    loading,
    error,
    studentsGradeModal,
    selectedSchedule,

    // Actions
    fetchSchedules,
    handleGradeStudents,
    resetStore,
    closeStudentsGradeModal,
  } = useGradeStore();

  const {
    searchTerm,
    currentPage,
    itemsPerPage,
    filteredSchedules,
    totalItems,
    totalPages,

    setSearchTerm,
    setCurrentPage,
    setItemsPerPage,
    resetSearch,
  } = useGradeSearchStore();

  useEffect(() => {
    fetchSchedules();

    return () => {
      resetStore();
      resetSearch();
    };
  }, [fetchSchedules, resetStore, resetSearch]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSchedules.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <div className="bg_custom bg-white-yellow-tone min-h-screen">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold break-words">
              Grades
            </h1>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4 mb-4">
              <div>
                <SearchField
                  name="schedules"
                  placeholder="Search Schedule or Course"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full sm:w-80"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-900 mb-4"></div>
                    <p>Loading schedules...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-600">
                    <p>Error loading schedules: {error}</p>
                    <button
                      onClick={fetchSchedules}
                      className="mt-4 text-red-900 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Course
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Batch Name
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Schedule & Time
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Room
                        </th>
                        <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((schedule) => (
                        <tr
                          key={schedule.id}
                          className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                          onClick={() => handleGradeStudents(schedule)}
                        >
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                              title={schedule.courseName}
                            >
                              {schedule.courseName}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                              title={schedule.academicPeriodName}
                            >
                              {schedule.academicPeriodName}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-20 sm:max-w-28 md:max-w-36 lg:max-w-none"
                              title={`${schedule.time_start} - ${schedule.time_end}`}
                            >
                              {schedule.days} <br />
                              {`${convertTo12Hour(
                                schedule.time_start
                              )} - ${convertTo12Hour(schedule.time_end)}`}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                              title={schedule.location}
                            >
                              {schedule.location}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base text-center">
                            <ThinRedButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGradeStudents(schedule);
                              }}
                            >
                              Grade Students
                            </ThinRedButton>
                          </td>
                        </tr>
                      ))}
                      {currentItems.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                          >
                            No schedules found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalItems}
                itemName="schedules"
                showItemsPerPageSelector={true}
              />
            </div>
          </div>

          <StudentsGradeModal
            students_grade_modal={studentsGradeModal}
            setStudentsGradeModal={closeStudentsGradeModal}
            schedule={selectedSchedule}
          />
        </div>
      </div>
    </div>
  );
}

export default Grades;
