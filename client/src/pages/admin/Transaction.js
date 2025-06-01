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
                <img
                  src="https://img.icons8.com/ios/50/000000/search--v1.png"
                  alt="search"
                  className="w-6 h-6"
                />
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
