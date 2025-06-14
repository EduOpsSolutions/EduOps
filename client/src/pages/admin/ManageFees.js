import React, { useState } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddFeeModal from "../../components/modals/transactions/GenAddFeesModal";
import DiscardChangesModal from "../../components/modals/common/DiscardChangesModal";
import SaveChangesModal from "../../components/modals/common/SaveChangesModal";
import SaveNotifyModal from "../../components/modals/common/SaveNotif";
import Pagination from "../../components/common/Pagination";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";

function ManageFees() {
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFeesList, setShowFeesList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(5);

  const sampleCourses = [
    {
      id: 1,
      name: "A1 German Basic Course",
      batch: "Batch 1",
      year: "2024",
    },
    {
      id: 2,
      name: "A2 German Intermediate Course",
      batch: "Batch 2",
      year: "2023",
    },
    
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      name: `${["A1", "A2", "B1", "B2"][i % 4]} German ${["Basic", "Intermediate", "Advanced"][i % 3]
        } Course`,
      batch: `Batch ${(i % 3) + 1}`,
      year: `${2024 - (i % 3)}`,
    })),
  ];

  const [fees, setFees] = useState([
    {
      id: 1,
      description: "COURSE FEE",
      amount: "25,850.00",
      dueDate: "May 30, 2024",
    },
    {
      id: 2,
      description: "BOOKS",
      amount: "2,800.00",
      dueDate: "May 30, 2024",
    },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFees, setEditedFees] = useState([]);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveNotifyModal, setShowSaveNotifyModal] = useState(false);

  const filteredCourses = sampleCourses.filter((course) => {
    return (
      (courseName === "" ||
        course.name.toLowerCase().includes(courseName.toLowerCase())) &&
      (selectedBatch === "" || course.batch.includes(selectedBatch)) &&
      (selectedYear === "" || course.year.includes(selectedYear))
    );
  });

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
    setShowSearchResults(true);
    setShowFeesList(false);
    setCurrentPage(1);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowFeesList(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditFees = () => {
    setIsEditMode(true);
    setEditedFees([...fees]);
  };

  const handleAddFees = () => {
    setShowAddFeeModal(true);
  };

  const handleCloseAddFeeModal = () => {
    setShowAddFeeModal(false);
  };

  const handleAddFee = (newFee) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formattedFee = {
      ...newFee,
      id: Math.max(...fees.map((f) => f.id), 0) + 1,
      amount: parseFloat(newFee.amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      dueDate: formatDate(newFee.dueDate),
    };

    setFees((prev) => [...prev, formattedFee]);
    setShowAddFeeModal(false);
  };

  const handleInputChange = (id, field, value) => {
    setEditedFees((prev) =>
      prev.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee))
    );
  };

  const handleConfirm = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    setFees([...editedFees]);
    setIsEditMode(false);
    setShowSaveModal(false);
    setShowSaveNotifyModal(true);
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const handleCloseSaveNotify = () => {
    setShowSaveNotifyModal(false);
  };

  const handleDiscard = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = () => {
    setEditedFees([]);
    setIsEditMode(false);
    setShowDiscardModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleFieldUndo = (id, field) => {
    const originalFee = fees.find((fee) => fee.id === id);
    if (originalFee) {
      setEditedFees((prev) =>
        prev.map((fee) =>
          fee.id === id ? { ...fee, [field]: originalFee[field] } : fee
        )
      );
    }
  };

  const hasFieldChanged = (id, field) => {
    const originalFee = fees.find((fee) => fee.id === id);
    const editedFee = editedFees.find((fee) => fee.id === id);
    return originalFee && editedFee && originalFee[field] !== editedFee[field];
  };

  return (
    <>
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
            <span className="text-lg font-bold">
              SEARCH GENERAL COURSE FEES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <p className="mb-1">Course</p>
              <input
                type="text"
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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

        {/* Search Results Section */}
        <div
          className={`bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6 ${showSearchResults && !showFeesList ? "opacity-100" : "hidden"
            }`}
        >
          <div className="flex items-center mb-4">
            <span className="text-lg font-bold">SEARCH RESULTS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-dark-red-2">
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
                {currentCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="cursor-pointer transition-colors duration-200 hover:bg-dark-red-2 hover:text-white"
                    onClick={() => handleCourseClick(course)}
                  >
                    <td className="py-3 px-4 border-t border-b border-dark-red-2">
                      {course.name}
                    </td>
                    <td className="py-3 px-4 border-t border-b border-dark-red-2">
                      {course.batch}
                    </td>
                    <td className="py-3 px-4 border-t border-b border-dark-red-2">
                      {course.year}
                    </td>
                  </tr>
                ))}
                {currentCourses.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-8 text-gray-500 border-t border-b border-dark-red-2"
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
        </div>

        {/* Fees List Section */}
        {showFeesList && selectedCourse && (
          <div className="bg-white border-dark-red-2 border-2 rounded-lg p-10 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center mb-8">
              <p className="font-bold text-lg text-center mb-2">
                List of General Fees
              </p>
              <p className="text-center">{selectedCourse.name}</p>
            </div>

            <div className="mb-8">
              <table className="w-full mb-5">
                <thead>
                  <tr className="border-b-2 border-dark-red-2">
                    <th className="py-2 font-bold w-[70%] text-start">
                      Description
                    </th>
                    <th className="py-2 font-bold w-[15%]">Amount</th>
                    <th className="py-2 font-bold w-[15%]">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(isEditMode ? editedFees : fees).map((fee, index) => (
                    <tr
                      key={fee.id}
                      className="border-b-2 border-[rgb(137,14,7,.49)]"
                    >
                      <td className="py-2 uppercase">
                        {isEditMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={fee.description}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "description",
                                  e.target.value.toUpperCase()
                                )
                              }
                              className="w-60 px-2 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2"
                            />
                            <button
                              onClick={() =>
                                handleFieldUndo(fee.id, "description")
                              }
                              className={`p-1 rounded ${hasFieldChanged(fee.id, "description")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                                }`}
                              title="Undo changes to description"
                              disabled={!hasFieldChanged(fee.id, "description")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.description
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {isEditMode ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={fee.amount}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-24 px-1.5 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2 text-center"
                            />
                            <button
                              onClick={() => handleFieldUndo(fee.id, "amount")}
                              className={`p-1 rounded ${hasFieldChanged(fee.id, "amount")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                                }`}
                              title="Undo changes to amount"
                              disabled={!hasFieldChanged(fee.id, "amount")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.amount
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {isEditMode ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={fee.dueDate}
                              onChange={(e) =>
                                handleInputChange(
                                  fee.id,
                                  "dueDate",
                                  e.target.value
                                )
                              }
                              className="w-28 px-1.5 py-1 border border-gray-300 rounded focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-dark-red-2 text-center"
                            />
                            <button
                              onClick={() => handleFieldUndo(fee.id, "dueDate")}
                              className={`p-1 rounded ${hasFieldChanged(fee.id, "dueDate")
                                  ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2"
                                  : "text-gray-400 cursor-not-allowed"
                                }`}
                              title="Undo changes to due date"
                              disabled={!hasFieldChanged(fee.id, "dueDate")}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          fee.dueDate
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <button
                className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                onClick={() => setShowFeesList(false)}
              >
                Back to Results
              </button>

              <div className="flex gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleDiscard}
                      className="bg-grey-1 rounded-md hover:bg-grey-2 focus:outline-none text-black font-semibold text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-6 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <ThinRedButton onClick={handleEditFees}>
                      Edit Fees
                    </ThinRedButton>
                    <ThinRedButton onClick={handleAddFees}>
                      Add Fees
                    </ThinRedButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddFeeModal && (
        <AddFeeModal
          isOpen={showAddFeeModal}
          onClose={handleCloseAddFeeModal}
          onAddFee={handleAddFee}
        />
      )}

      {showDiscardModal && (
        <DiscardChangesModal
          show={showDiscardModal}
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      )}

      {showSaveModal && (
        <SaveChangesModal
          show={showSaveModal}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}

      {showSaveNotifyModal && (
        <SaveNotifyModal
          show={showSaveNotifyModal}
          onClose={handleCloseSaveNotify}
        />
      )}
    </>
  );
}

export default ManageFees;