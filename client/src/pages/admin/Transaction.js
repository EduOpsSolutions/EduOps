import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import AddTransactionModal from "../../components/modals/transactions/AddTransactionModal";
import Pagination from "../../components/common/Pagination";

function Transaction() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [addTransactionModal, setAddTransactionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/students");
      if (!response.data.error) {
        setStudents(response.data.data);
      } else {
        console.error("Error fetching students:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setAddTransactionModal(true);
  };

  // Sample data no backend yet
  const sampleStudents = [
    {
      id: 1,
      studentId: "3213562",
      studentName: "Polano Dolor",
      course: "A1 German Basic",
      email: "polanodolor@gmail.com",
      phoneNumber: "09123456789",
    },
    {
      id: 2,
      studentId: "3213563",
      studentName: "Juan Dela Cruz",
      course: "A2 German Intermediate",
      email: "juan.delacruz@gmail.com",
      phoneNumber: "09987654321",
    },
    {
      id: 3,
      studentId: "3213564",
      studentName: "Maria Santos",
      course: "B1 German Advanced",
      email: "maria.santos@gmail.com",
      phoneNumber: "09111222333",
    },
    // Testing pagination with dummy data
    ...Array.from({ length: 25 }, (_, i) => ({
      id: i + 4,
      studentId: `321356${i + 5}`,
      studentName: `Test Student ${i + 1}`,
      course: `${["A1", "A2", "B1", "B2", "C1"][i % 5]} German ${
        ["Basic", "Intermediate", "Advanced"][i % 3]
      }`,
      email: `student${i + 1}@example.com`,
      phoneNumber: `091234567${String(i % 100).padStart(2, "0")}`,
    })),
  ];

  const displayStudents = students.length > 0 ? students : sampleStudents;

  const filteredStudents = displayStudents.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm)
  );

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
    setCurrentPage(1);
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-20 py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold">Manage Transaction</h1>
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
                <h2 className="text-lg font-bold">SEARCH STUDENT</h2>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  className="w-80 border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter student name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-2 rounded font-semibold transition-colors duration-150"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-lg">Loading Students...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Student ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Course
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-red-900">
                          Phone Number
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudents.map((student, index) => (
                        <tr
                          key={student.id || index}
                          className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                          onClick={() => handleStudentClick(student)}
                        >
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {student.studentId}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {student.studentName}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {student.course}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {student.email}
                          </td>
                          <td className="py-3 px-4 border-t border-b border-red-900">
                            {student.phoneNumber}
                          </td>
                        </tr>
                      ))}
                      {currentStudents.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-8 text-gray-500 border-t border-b border-red-900"
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
              </>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        addTransactionModal={addTransactionModal}
        setAddTransactionModal={setAddTransactionModal}
        selectedStudent={selectedStudent}
      />
    </div>
  );
}

export default Transaction;
