import React, { useState } from "react";
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddCourseModal from "../../components/modals/enrollment/AddCourseModal";
import Pagination from "../../components/common/Pagination";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";

function EnrollmentPeriod() {
  const navigate = useNavigate();
  const [periodName, setPeriodName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showPeriodResults, setShowPeriodResults] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [add_course_modal, setAddCourseModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [periodsPerPage, setPeriodsPerPage] = useState(5);
  const [courses, setCourses] = useState([]);

  // Sample enrollment periods data
  const samplePeriods = [
    {
      id: 1,
      period: "Period 1",
      batch: "Batch 1",
      year: "2024",
    },
    {
      id: 2,
      period: "Period 2",
      batch: "Batch 2",
      year: "2023",
    },
    {
      id: 3,
      period: "Period 3",
      batch: "Batch 1",
      year: "2022",
    },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      period: `Period ${i + 4}`,
      batch: `Batch ${(i % 3) + 1}`,
      year: `${2024 - (i % 3)}`,
    })),
  ];

  // Sample courses data
  const sampleCourses = [
    {
      id: 1,
      course: "A1",
      schedule: "TTh 6:30AM - 7:30AM",
      enrolledStudents: 20,
    },
    {
      id: 2,
      course: "B1",
      schedule: "TTh 6:30AM - 7:30AM",
      enrolledStudents: 20,
    },
    {
      id: 3,
      course: "A2",
      schedule: "MWF 8:00AM - 9:00AM",
      enrolledStudents: 15,
    },
    {
      id: 4,
      course: "B2",
      schedule: "TTh 10:00AM - 11:00AM",
      enrolledStudents: 18,
    },
  ];

  const filteredPeriods = samplePeriods.filter((period) => {
    return (
      (periodName === "" ||
        period.period.toLowerCase().includes(periodName.toLowerCase())) &&
      (selectedBatch === "" || period.batch.includes(selectedBatch)) &&
      (selectedYear === "" || period.year.includes(selectedYear))
    );
  });

  const indexOfLastPeriod = currentPage * periodsPerPage;
  const indexOfFirstPeriod = indexOfLastPeriod - periodsPerPage;
  const currentPeriods = filteredPeriods.slice(
    indexOfFirstPeriod,
    indexOfLastPeriod
  );
  const totalPages = Math.ceil(filteredPeriods.length / periodsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePeriodsPerPageChange = (newPerPage) => {
    setPeriodsPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setShowPeriodResults(true);
    setShowCourses(false);
    setCurrentPage(1);
  };

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    setShowCourses(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/courses");
      const visibleCourses = response.data.filter(
        (course) => course.visibility === "visible"
      );
      setCourses(visibleCourses);
    } catch (error) {
      console.error("Failed to fetch courses: ", error);
    }
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      console.log(`Deleting course with ID: ${courseId}`);
      // Temporary, log nlng sah since sample data
    }
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-6 px-20 relative">
      <BackButton onClick={handleBack} className="left-6 top-6 z-10" />

      <div className="bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6">
        <div className="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-2"
            viewBox="0 0 50 50"
          >
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
          </svg>
          <span className="text-lg font-bold">SEARCH ENROLLMENT PERIOD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
          <div>
            <p className="mb-1">Period</p>
            <input
              type="text"
              className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
              placeholder="Search Period..."
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="mb-1">Batch</p>
            <select
              className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              <option value="Batch 1">Batch 1</option>
              <option value="Batch 2">Batch 2</option>
              <option value="Batch 3">Batch 3</option>
            </select>
          </div>
          <div>
            <p className="mb-1">Year</p>
            <select
              className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {/* Period Results Section */}
      <div
        className={`bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6 ${
          showPeriodResults && !showCourses ? "opacity-100" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold">PERIOD RESULTS</span>
          <div className="flex justify-end">
            <ThinRedButton>Create Period</ThinRedButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-dark-red-2">
                <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                  Period
                </th>
                <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                  Batch
                </th>
                <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                  Year
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPeriods.map((period) => (
                <tr
                  key={period.id}
                  className="cursor-pointer transition-colors duration-200 hover:bg-dark-red-2 hover:text-white"
                  onClick={() => handlePeriodClick(period)}
                >
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {period.period}
                  </td>
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {period.batch}
                  </td>
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {period.year}
                  </td>
                </tr>
              ))}
              {currentPeriods.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-8 text-gray-500 border-t border-b border-dark-red-2"
                  >
                    No periods found
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
          itemsPerPage={periodsPerPage}
          onItemsPerPageChange={handlePeriodsPerPageChange}
          totalItems={filteredPeriods.length}
          itemName="periods"
          showItemsPerPageSelector={true}
        />
      </div>

      {/* Courses Section */}
      {showCourses && selectedPeriod && (
        <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5">
          <div className="flex flex-row justify-between items-center pb-4 border-b-2 border-dark-red-2">
            <h2 className="text-lg font-bold text-left">Course Offered</h2>
            <div className="flex space-x-2">
              <button
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-1.5 px-2 flex items-center justify-center"
                onClick={() => setAddCourseModal(true)}
                aria-label="Add course"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xl uppercase text-center mb-4">
              {selectedPeriod.period} - {selectedPeriod.batch} (
              {selectedPeriod.year})
            </p>

            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-dark-red-2">
                  <th className="py-3 font-semibold text-center">Course</th>
                  <th className="py-3 font-semibold text-center">Schedule</th>
                  <th className="py-3 font-semibold text-center">
                    No. of Students Enrolled
                  </th>
                  <th className="py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {sampleCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[rgb(137,14,7,.49)] hover:bg-gray-50"
                  >
                    <td className="py-3 text-center">{course.course}</td>
                    <td className="py-3 text-center">{course.schedule}</td>
                    <td className="py-3 text-center">
                      {course.enrolledStudents}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-sm px-3 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                        onClick={() => handleDeleteCourse(course.id)}
                        aria-label="Delete course"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
              onClick={() => setShowCourses(false)}
            >
              Back to Results
            </button>
          </div>
        </div>
      )}

      <AddCourseModal
        add_course_modal={add_course_modal}
        setAddCourseModal={setAddCourseModal}
        fetchCourses={fetchCourses}
      />
    </div>
  );
}

export default EnrollmentPeriod;
