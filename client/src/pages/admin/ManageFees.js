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

function ManageFees() {
  // Search store
  const searchStore = useFeesSearchStore();
  
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
    handleDeleteFee,
    handleCancelEdit,
    resetStore
  } = useFeesStore();

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
    { key: "name", header: "Course" },
    { key: "batch", header: "Batch" },
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
  const handleSearch = () => searchStore.handleSearch();
  const handleCourseClick = (course) => searchStore.handleSelectItem(course);
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
          <div className="bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-2">
                List of General Fees
              </p>
              <p className="text-center text-sm sm:text-base">{searchStore.selectedItem.name}</p>
            </div>

            <div className="mb-6 sm:mb-8">
              <FeesTable
                fees={isEditMode ? editedFees : fees}
                isEditMode={isEditMode}
                onInputChange={handleInputChange}
                onFieldUndo={handleFieldUndo}
                hasFieldChanged={hasFieldChanged}
                onDelete={handleDeleteFee}
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