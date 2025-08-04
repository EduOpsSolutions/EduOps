import React from 'react';
import ThinRedButton from '../buttons/ThinRedButton';

//Table after clicking a result from enrollment period
function PeriodDetailsTable({ 
  periodCourses, 
  onDeleteCourse, 
  selectedPeriod,
  onAddCourse,
  onBack
}) {
  return (
    <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-5">
      <div className="flex justify-between items-center pb-4 border-b-2 border-dark-red-2">
        <h2 className="text-base sm:text-lg font-bold">Course Offered</h2>
        <button
          className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-1.5 px-2 flex items-center justify-center text-sm sm:text-base font-semibold"
          onClick={onAddCourse}
          aria-label="Add course"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 sm:w-5 sm:h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-lg sm:text-xl uppercase text-center mb-4">
          {selectedPeriod.periodName} - {selectedPeriod.batchName} (
          {new Date(selectedPeriod.startAt).getFullYear()})
        </p>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-dark-red-2">
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Course
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Schedule
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  No. of Students Enrolled
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {periodCourses.length > 0 ? (
                periodCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[rgb(137,14,7,.49)] hover:bg-gray-50"
                  >
                    <td className="py-2 sm:py-3 text-center text-sm sm:text-base">
                      {course.course}
                    </td>
                    <td className="py-2 sm:py-3 text-center text-sm sm:text-base">
                      {course.schedule}
                    </td>
                    <td className="py-2 sm:py-3 text-center text-sm sm:text-base">
                      {course.enrolledStudents}
                    </td>
                    <td className="py-2 sm:py-3 text-center">
                      <button
                        className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                        onClick={() => onDeleteCourse(course.id)}
                        aria-label="Delete course"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base"
                  >
                    No courses found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <ThinRedButton onClick={onBack}>
          Back to Results
        </ThinRedButton>
      </div>
    </div>
  );
}

export default PeriodDetailsTable;