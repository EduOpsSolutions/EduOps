import React, { useEffect } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddFeeModal from "../../components/modals/transactions/GenAddFeesModal";
import DiscardChangesModal from "../../components/modals/common/DiscardChangesModal";
import SaveChangesModal from "../../components/modals/common/SaveChangesModal";
import SaveNotifyModal from "../../components/modals/common/SaveNotif";
import { useFeesSearchStore, useFeesStore } from "../../stores/feesStore";
import SearchForm from "../../components/common/SearchFormHorizontal";
import SearchResults from "../../components/common/SearchResults";
import FeesTable from "../../components/tables/EditFeesDetailsTable";
import { getCookieItem } from "../../utils/jwt";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function ManageFees() {
  // Search store
  const searchStore = useFeesSearchStore();
  // Destructure search actions for useEffect dependencies
  const { initializeSearch, handleSearch: performSearch, resetSearch } = searchStore;
  
  // Fees store
  const {
    // State
    fees,
    isEditMode,
    editedFees,
    showAddFeeModal,
    showDiscardModal,
    showSaveModal,
    showSaveNotifyModal,
    showDeleteModal,
    feeToDelete,
    // Actions
    handleEditFees,
    handleAddFees,
    handleCloseAddFeeModal,
    handleAddFee,
    handleInputChange,
    handleConfirm,
    handleConfirmSave,
    handleCancelSave,
    handleCloseSaveNotify,
    handleDiscard,
    handleConfirmDiscard,
    handleCancelDiscard,
    handleFieldUndo,
    hasFieldChanged,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteFee,
    handleDeleteFee,
    handleCancelEdit,
    resetStore
  } = useFeesStore();

  useEffect(() => {
    async function fetchCourseBatches() {
      const token = getCookieItem('token'); // Always get latest token
      const res = await fetch(`${API_BASE_URL}/fees/course-batches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        // Handle error response (e.g., unauthorized or server error)
        console.error('Error fetching course-batches:', data.error || data);
        searchStore.setData([]); // Set empty data to avoid .filter error
        return;
      }
      searchStore.setData(data);
      initializeSearch();
      performSearch();
    }
    fetchCourseBatches();
    return () => {
      resetStore();
      resetSearch();
    };
  }, [initializeSearch, performSearch, resetStore, resetSearch]);

  // Search form config
  const searchFormConfig = {
    title: "SEARCH GENERAL COURSE FEES",
    formFields: [
      {
        name: "courseName",
        label: "Course",
        placeholder: "Course Name",
        type: "text"
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

  const searchResultsColumns = [
    { key: "courseName", header: "Course" },
    { key: "batchName", header: "Batch" },
    { key: "year", header: "Year" }
  ];

  // Pagination config
  const paginationConfig = {
    currentPage: searchStore.currentPage,
    totalPages: searchStore.totalPages,
    onPageChange: searchStore.handlePageChange,
    itemsPerPage: searchStore.itemsPerPage,
    onItemsPerPageChange: searchStore.handleItemsPerPageChange,
    totalItems: searchStore.totalItems,
    itemName: "courses",
    showItemsPerPageSelector: true
  };

  // Event handlers
  const handleSearch = () => performSearch();
  const feesStore = useFeesStore();
  const [baseFee, setBaseFee] = React.useState(null);
  const [selectedCourseId, setSelectedCourseId] = React.useState(null);
  const [selectedBatchId, setSelectedBatchId] = React.useState(null);
  const handleCourseClick = async (course) => {
    searchStore.handleSelectItem(course);
    setSelectedCourseId(course.courseId || null);
    setSelectedBatchId(course.batchId || null);
    const token = getCookieItem('token'); // Always get latest token
    // Fetch base fee for selected course
    if (course.courseId) {
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${course.courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const courseData = await res.json();
        setBaseFee(courseData.baseFee || courseData.price || null);
      } catch (err) {
        setBaseFee(null);
      }
    } else {
      setBaseFee(null);
    }
    // Fetch additional fees for selected course-batch
    if (course.courseId && course.batchId) {
      await feesStore.fetchFees(course.courseId, course.batchId);
    }
  };
  const handleBackToResults = () => {
    if (isEditMode) {
      handleCancelEdit(); 
    }
    searchStore.handleBackToResults();
  };
  
  return (
    <>
      <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Search Form */}
        <SearchForm 
          searchLogic={searchStore} 
          fields={searchFormConfig}
          onSearch={handleSearch}
        />

        {/* Search Results */}
        <SearchResults
          visible={searchStore.showResults && !searchStore.showDetails}
          items={searchStore.currentItems}
          columns={searchResultsColumns}
          onItemClick={handleCourseClick}
          pagination={paginationConfig}
        />

        {/* Fees Details Section */}
        {searchStore.showDetails && searchStore.selectedItem && (
          <div className="bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-2">
                List of General Fees
              </p>
              <p className="text-center text-sm sm:text-base">{searchStore.selectedItem.name}</p>
            </div>

            {/* Fees Table with Base Fee as First Row */}
            <div className="mb-6 sm:mb-8">
              <FeesTable
                fees={(() => {
                  const baseFeeRow = baseFee !== null ? [{
                    description: 'Course Fee',
                    price: baseFee,
                    dueDate: '',
                    isBaseFee: true
                  }] : [];
                  // Map backend fee data to table property names
                  const feeRows = (isEditMode ? editedFees : fees).map(fee => ({
                    ...fee,
                    description: fee.name || fee.description || '',
                    amount: fee.price || fee.amount || '',
                    dueDate: isEditMode 
                        ? fee.dueDate 
                        : (fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '')
                  }));
                  return [...baseFeeRow, ...feeRows];
                })()}
                isEditMode={isEditMode}
                onInputChange={handleInputChange}
                onFieldUndo={handleFieldUndo}
                hasFieldChanged={hasFieldChanged}
                onDelete={openDeleteModal}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              <div className="order-2 sm:order-1">
                <ThinRedButton onClick={handleBackToResults}>
                  Back to Results
                </ThinRedButton>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleDiscard}
                      className="bg-grey-1 rounded-md hover:bg-grey-2 focus:outline-none text-black font-semibold text-sm sm:text-md px-4 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-sm sm:text-md px-4 sm:px-6 py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
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

  {/* Modals */}
      {showDeleteModal && (
        <SaveChangesModal
          show={showDeleteModal}
          onConfirm={confirmDeleteFee}
          onCancel={closeDeleteModal}
        />
      )}
      {showAddFeeModal && (
        <AddFeeModal
          isOpen={showAddFeeModal}
          onClose={handleCloseAddFeeModal}
          onAddFee={handleAddFee}
          courseId={selectedCourseId}
          batchId={selectedBatchId}
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