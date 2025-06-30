import React, { useEffect } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import TransactionHistoryModal from "../../components/modals/common/TransactionHistoryModal";
import AddFeesModal from "../../components/modals/transactions/AddFeesModal";
import Pagination from "../../components/common/Pagination";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import { useNavigate } from "react-router-dom";
import { useAssessmentSearchStore, useAssessmentStore } from "../../stores/assessmentStore";

function Assessment() {
  const navigate = useNavigate();

  // Search store
  const searchStore = useAssessmentSearchStore();
  
  // Assessment store
  const {
    // State
    selectedStudent,
    transactionHistoryModal,
    addFeesModal,
    
    // Actions
    handleStudentSelect,
    handleBackToResults,
    openTransactionHistoryModal,
    closeTransactionHistoryModal,
    openAddFeesModal,
    closeAddFeesModal,
    handleAddFee,
    calculateNetAssessment,
    resetStore
  } = useAssessmentStore();

  useEffect(() => {
    searchStore.initializeSearch();
    searchStore.handleSearch();
    
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []);

  // Search form config
  const searchFormConfig = {
    title: "SEARCH",
    formFields: [
      {
        name: "name",
        label: "Name",
        type: "text",
        placeholder: "Student Name"
      },
      {
        name: "course",
        label: "Course",
        type: "select",
        options: [
          { value: "", label: "All Courses" },
          { value: "A1", label: "A1 German Basic Course" },
          { value: "A2", label: "A2 German Basic Course" },
          { value: "A3", label: "A3 German Basic Course" }
        ]
      },
      {
        name: "batch",
        label: "Batch",
        type: "select",
        options: [
          { value: "", label: "All Batches" },
          { value: "Batch 1", label: "Batch 1" },
          { value: "Batch 2", label: "Batch 2" },
          { value: "Batch 3", label: "Batch 3" }
        ]
      },
      {
        name: "year",
        label: "Year",
        type: "select",
        options: [
          { value: "", label: "All Years" },
          { value: "2024", label: "2024" },
          { value: "2023", label: "2023" },
          { value: "2022", label: "2022" }
        ]
      }
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStore.handleSearch();
    handleBackToResults();
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-16 lg:items-start">
        <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-start">
          <SearchFormVertical
            searchLogic={searchStore}
            fields={searchFormConfig}
            onSearch={handleSearch}
          />
        </div>

        <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
          <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-3 sm:mb-5">
            Tuition Fee Assessment
          </p>

          {/* Search Results */}
          {searchStore.currentItems.length > 0 && !selectedStudent && (
            <div>
              <p className="font-semibold mb-3 text-sm sm:text-base">
                {searchStore.hasSearched ? `Search Results (${searchStore.totalItems})` : `All Students (${searchStore.totalItems})`}
              </p>
              <div className="space-y-2 mb-5">
                {searchStore.currentItems.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{student.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {student.course}: {student.batch} | {student.year}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-600">Balance:</p>
                        <p className="font-semibold text-sm sm:text-base">{student.remainingBalance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Component */}
              {searchStore.totalItems > 0 && (
                <Pagination
                  currentPage={searchStore.currentPage}
                  totalPages={searchStore.totalPages}
                  onPageChange={searchStore.handlePageChange}
                  itemsPerPage={searchStore.itemsPerPage}
                  onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                  totalItems={searchStore.totalItems}
                  itemName="students"
                  itemsPerPageOptions={[5, 10, 15, 20]}
                  showItemsPerPageSelector={true}
                />
              )}
            </div>
          )}

          {/* Selected Student Details */}
          {selectedStudent && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-5 gap-2 sm:gap-0">
                <p className="font-bold text-base sm:text-lg text-center sm:text-left">
                  {selectedStudent.course}: {selectedStudent.batch} | {selectedStudent.year}
                </p>
                <button
                  onClick={handleBackToResults}
                  className="text-dark-red-2 hover:text-dark-red-5 font-semibold text-sm sm:text-base w-full sm:w-auto text-left sm:text-right"
                >
                  Back to Results
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-end pb-3 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
                <p className="uppercase grow text-base sm:text-lg font-semibold text-left">{selectedStudent.name}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <ThinRedButton onClick={openTransactionHistoryModal}>
                    Transaction History
                  </ThinRedButton>
                  <span className="hidden sm:inline mx-2"></span>
                  <ThinRedButton onClick={() => navigate("/admin/ledger")}>
                    Ledger
                  </ThinRedButton>
                </div>
              </div>

              <p className="font-bold text-base sm:text-lg text-center mt-6 sm:mt-9 mb-1">FEES</p>
              
              {/* Table */}
              <div className="overflow-x-auto mb-5">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-dark-red-2">
                      <th className="py-2 font-bold text-start text-xs sm:text-sm lg:text-base">
                        Description
                      </th>
                      <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Amount</th>
                      <th className="py-2 font-bold text-center text-xs sm:text-sm lg:text-base">Due date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.fees.map((fee, index) => (
                      <tr key={index} className="border-b-2 border-[rgb(137,14,7,.49)]">
                        <td className="uppercase py-2 text-xs sm:text-sm lg:text-base">
                          {fee.description}
                        </td>
                        <td className="py-2 text-center text-xs sm:text-sm lg:text-base">
                          {fee.amount}
                        </td>
                        <td className="py-2 text-center text-xs sm:text-sm lg:text-base">
                          {fee.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center sm:justify-end mb-3 sm:mb-5">
                <button
                  onClick={openAddFeesModal}
                  type="button"
                  className="text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-sm sm:text-md px-6 sm:px-8 py-1.5 text-center shadow-sm shadow-black ease-in duration-150 w-full sm:w-auto"
                >
                  Add Fees
                </button>
              </div>

              {/* Summary Section */}
              <div className="w-full pt-3 border-t-2 border-dark-red-2">
                <div className="flex flex-col gap-2 text-xs sm:text-sm lg:text-base">
                  <div className="flex justify-between">
                    <p className="font-bold">Net Assessment</p>
                    <p>{calculateNetAssessment(selectedStudent.fees)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-bold">Total Payments</p>
                    <p>{selectedStudent.totalPayments}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-bold">Remaining Balance</p>
                    <p>{selectedStudent.remainingBalance}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {!searchStore.hasSearched && searchStore.totalItems === 0 && (
            <div className="text-center py-6 sm:py-10">
              <p className="text-gray-500 text-sm sm:text-base">Loading students...</p>
            </div>
          )}
        </div>
      </div>
      
      <TransactionHistoryModal
        transaction_history_modal={transactionHistoryModal}
        setTransactionHistoryModal={closeTransactionHistoryModal}
      />

      <AddFeesModal
        isOpen={addFeesModal}
        onClose={closeAddFeesModal}
        onSubmit={handleAddFee}
        studentName={selectedStudent?.name || ""}
        course={selectedStudent?.course || ""}
      />
    </div>
  );
}

export default Assessment;