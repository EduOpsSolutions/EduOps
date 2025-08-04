import React, { useEffect } from "react";
import AddTransactionModal from "../../components/modals/transactions/AddTransactionModal";
import Pagination from "../../components/common/Pagination";
import SearchField from "../../components/textFields/SearchField";
import { useTransactionSearchStore, useTransactionStore } from "../../stores/transactionStore";

function Transaction() {
  // Search store
  const searchStore = useTransactionSearchStore();
  
  // Transaction store
  const {
    selectedStudent,
    addTransactionModal,
    handleStudentClick,
    closeAddTransactionModal,
    handleModalSubmit,
    resetStore
  } = useTransactionStore();

  useEffect(() => {
    searchStore.initializeSearch();
    searchStore.handleSearch();
    
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []);

  const handleSearch = () => {
    searchStore.handleSearch();
  };

  return (
    <div className="bg_custom bg-white-yellow-tone min-h-screen">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold break-words">
              Manage Transaction
            </h1>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4 mb-4">
              {/* Search Field */}
              <div>
                <SearchField
                  name="searchTerm"
                  placeholder="Search Student"
                  value={searchStore.searchParams.searchTerm || ""}
                  onChange={searchStore.handleInputChange}
                  onClick={handleSearch}
                  className="w-full sm:w-80"
                />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="pt-2">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Student ID
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Name
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Course
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Email
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Phone
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchStore.currentItems.map((student, index) => (
                      <tr
                        key={student.id || index}
                        className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                        onClick={() => handleStudentClick(student)}
                      >
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-24 md:max-w-none" 
                            title={student.studentId}
                          >
                            {student.studentId}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" 
                            title={student.studentName}
                          >
                            {student.studentName}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-28 md:max-w-36 lg:max-w-none" 
                            title={student.course}
                          >
                            {student.course}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" 
                            title={student.email}
                          >
                            {student.email}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-24 md:max-w-28 lg:max-w-none" 
                            title={student.phoneNumber}
                          >
                            {student.phoneNumber}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {searchStore.currentItems.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                        >
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={searchStore.currentPage}
                totalPages={searchStore.totalPages}
                onPageChange={searchStore.handlePageChange}
                itemsPerPage={searchStore.itemsPerPage}
                onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                totalItems={searchStore.totalItems}
                itemName="students"
                showItemsPerPageSelector={true}
              />
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        addTransactionModal={addTransactionModal}
        setAddTransactionModal={closeAddTransactionModal}
        selectedStudent={selectedStudent}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default Transaction;