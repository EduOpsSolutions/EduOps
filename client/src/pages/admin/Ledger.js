import React, { useState } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import UpdateLedgerModal from "../../components/modals/transactions/UpdateLedger";
import Pagination from "../../components/common/Pagination";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";

function Ledger() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(5);

  const sampleStudents = [
    {
      id: 1,
      name: "Polano Dolor",
      course: "A1 German Basic Course",
      batch: "Batch 1",
      year: "2024",
    },
    {
      id: 2,
      name: "Juan Dela Cruz",
      course: "A2 German Intermediate Course",
      batch: "Batch 2",
      year: "2023",
    },
    {
      id: 3,
      name: "Maria Santos",
      course: "B1 German Advanced Course",
      batch: "Batch 3",
      year: "2022",
    },

    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      name: `Student ${i + 4}`,
      course: `${["A1", "A2", "B1", "B2"][i % 4]} German ${
        ["Basic", "Intermediate", "Advanced"][i % 3]
      } Course`,
      batch: `Batch ${(i % 3) + 1}`,
      year: `${2024 - (i % 3)}`,
    })),
  ];

  const filteredStudents = sampleStudents.filter((student) => {
    return (
      (studentName === "" ||
        student.name.toLowerCase().includes(studentName.toLowerCase())) &&
      (selectedCourse === "" || student.course.includes(selectedCourse)) &&
      (selectedBatch === "" || student.batch.includes(selectedBatch)) &&
      (selectedYear === "" || student.year.includes(selectedYear))
    );
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStudentsPerPageChange = (newPerPage) => {
    setStudentsPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setShowStudentResults(true);
    setShowLedger(false);
    setCurrentPage(1);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowLedger(true);
  };

  const handleModalSubmit = (data) => {
    console.log("Transaction data:", data);
    setIsModalOpen(false);
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-6 px-20 relative">
      <BackButton
        onClick={handleBack}
        className="left-6 top-6 z-10"
      />

      <div className="bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6">
        <div className="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-2"
            viewBox="0 0 50 50"
          >
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
          </svg>
          <span className="text-lg font-bold">SEARCH STUDENT LEDGER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="mb-1">Name</p>
            <input
              type="text"
              className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1">Course</p>
            <select
              className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="A1 German Basic Course">A1 German Basic Course</option>
              <option value="A2 German Intermediate Course">A2 German Intermediate Course</option>
              <option value="B1 German Advanced Course">B1 German Advanced Course</option>
            </select>
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

      <div className={`bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6 ${showStudentResults && !showLedger ? 'opacity-100' : 'hidden'}`}>
        <div className="flex items-center mb-4">
          <span className="text-lg font-bold">SEARCH RESULTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-dark-red-2">
                <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                  Course
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
              {currentStudents.map((student) => (
                <tr
                  key={student.id}
                  className="cursor-pointer transition-colors duration-200 hover:bg-dark-red-2 hover:text-white"
                  onClick={() => handleStudentClick(student)}
                >
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {student.course}
                  </td>
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {student.batch}
                  </td>
                  <td className="py-3 px-4 border-t border-b border-dark-red-2">
                    {student.year}
                  </td>
                </tr>
              ))}
              {currentStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-8 text-gray-500 border-t border-b border-dark-red-2"
                  >
                    No students found
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
          itemsPerPage={studentsPerPage}
          onItemsPerPageChange={handleStudentsPerPageChange}
          totalItems={filteredStudents.length}
          itemName="students"
          showItemsPerPageSelector={true}
        />
      </div>

      {/* Ledger Section */}
      {showLedger && selectedStudent && (
        <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-5">
          <div className="flex flex-row justify-between items-center pb-4 border-b-2 border-dark-red-2">
            <p className="text-xl uppercase">{selectedStudent.name}</p>
            <div className="flex space-x-2">
              <ThinRedButton>Print Ledger</ThinRedButton>
              <button
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-1.5 px-2 flex items-center justify-center"
                onClick={() => setIsModalOpen(true)}
                aria-label="Add transaction"
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

          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-dark-red-2">
                <th className="py-3 font-normal">Date</th>
                <th className="py-3 font-normal">Time</th>
                <th className="py-3 font-normal">O.R. Number</th>
                <th className="py-3 font-normal">Debit Amount</th>
                <th className="py-3 font-normal">Credit Amount</th>
                <th className="py-3 font-normal">Balance</th>
                <th className="py-3 font-normal">Type</th>
                <th className="py-3 font-normal">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[rgb(137,14,7,.49)]">
                <td className="py-3 text-center">4/3/24</td>
                <td className="py-3 text-center">6:29:23AM</td>
                <td className="py-3 text-center">100000058</td>
                <td className="py-3 text-center">28,650.00</td>
                <td className="py-3 text-center">0</td>
                <td className="py-3 text-center">28,650.00</td>
                <td className="py-3 text-center">Assessment</td>
                <td className="py-3 text-center">Assessment Computation</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <button
              className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
              onClick={() => setShowLedger(false)}
            >
              Back to Results
            </button>
          </div>
        </div>
      )}

      <UpdateLedgerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        student={selectedStudent}
      />
    </div>
  );
}

export default Ledger;
