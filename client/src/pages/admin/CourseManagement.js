import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import CreateCourseModal from '../../components/modals/courses/CreateCourseModal';
import EditCourseModal from '../../components/modals/courses/EditCourseModal';
import Pagination from "../../components/common/Pagination";
import axiosInstance from '../../utils/axios';


function CourseManagement() {
  const [create_course_modal, setCreateCourseModal] = useState(false);
  const [edit_course_modal, setEditCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(5);

  const fetchCourses = async () => {
    try {
        setLoading(true);
        const response = await axiosInstance.get("/courses");
        setCourses(response.data);
    } catch (error) {
        console.error("Failed to fetch courses: ", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRowClick = (course) => {
    setSelectedCourse(course);
    setEditCourseModal(true);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.id.toString().includes(searchTerm)
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCoursesPerPageChange = (newPerPage) => {
    setCoursesPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-20 py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold">Courses</h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 50 50"
                >
                  <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
                </svg>
                <h2 className="text-lg font-bold">SEARCH COURSE</h2>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-4 justify-between items-center">
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    className="w-80 border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter course name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-2.5 text-center shadow-sm shadow-black ease-in duration-150"
                  >
                    Search
                  </button>
                </div>
                <button
                  onClick={() => {setCreateCourseModal(true)}}
                  className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-2.5 text-center shadow-sm shadow-black ease-in duration-150"
                >
                  Create Course
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-lg">Loading Courses...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Course ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Course Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          # of Students
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Schedule
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Adviser
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Price
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCourses.map((course, index) => (
                        <tr
                          key={course.id || index}
                          className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                          onClick={() => handleRowClick(course)}
                        >
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.id}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.name}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.maxNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.schedule || 'N/A'}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.category || 'N/A'}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.price || 'N/A'}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {course.visibility === 'visible' ? 'Visible' : 'Hidden'}
                          </td>
                        </tr>
                      ))}
                      {currentCourses.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-8 text-gray-500 border-t border-b border-red-900"
                          >
                            No courses found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={coursesPerPage}
                  onItemsPerPageChange={handleCoursesPerPageChange}
                  totalItems={filteredCourses.length}
                  itemName="courses"
                  showItemsPerPageSelector={true}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <CreateCourseModal
        create_course_modal={create_course_modal}
        setCreateCourseModal={setCreateCourseModal}
        fetchCourses={fetchCourses}
      />
      <EditCourseModal 
        edit_course_modal={edit_course_modal} 
        setEditCourseModal={setEditCourseModal} 
        selectedCourse={selectedCourse}
        fetchCourses={fetchCourses}
      />
    </div>
  );
}

export defalt CourseManagement
