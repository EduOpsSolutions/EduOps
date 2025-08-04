import React, { useEffect } from "react";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import AddCourseModal from "../../components/modals/enrollment/AddCourseModal";
import AcademicPeriodModal from "../../components/modals/enrollment/AddAcademicPeriodModal";
import PeriodDetailsTable from "../../components/tables/PeriodDetailsTable";
import SearchForm from "../../components/common/SearchFormHorizontal";
import SearchResults from "../../components/common/SearchResults";
import { useEnrollmentPeriodSearchStore, useEnrollmentPeriodStore } from "../../stores/enrollmentPeriodStore";

function EnrollmentPeriod() {
  // Search store
  const searchStore = useEnrollmentPeriodSearchStore();
  
  // Main store
  const {
    selectedPeriod,
    periodCourses,
    error,
    showCourses,
    addCourseModal,
    addAcademicPeriodModal,
    fetchPeriods,
    fetchPeriodCourses,
    handlePeriodSelect,
    handleBackToResults,
    deleteCourse,
    resetStore
  } = useEnrollmentPeriodStore();

  useEffect(() => {
    fetchPeriods();
    searchStore.initializeSearch();
    
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPeriodCourses();
    }
  }, [selectedPeriod]);

  const searchFormConfig = {
    title: "SEARCH ENROLLMENT PERIOD",
    formFields: [
      {
        name: "periodName",
        label: "Period",
        placeholder: "Search Period...",
        type: "text",
        fullWidth: true
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
    { key: "periodName", header: "Period" },
    { key: "batchName", header: "Batch" },
    { key: "year", header: "Year" }
  ];

  const paginationConfig = {
    currentPage: searchStore.currentPage,
    totalPages: searchStore.totalPages,
    onPageChange: searchStore.handlePageChange,
    itemsPerPage: searchStore.itemsPerPage,
    onItemsPerPageChange: searchStore.handleItemsPerPageChange,
    totalItems: searchStore.totalItems,
    itemName: "periods",
    showItemsPerPageSelector: true
  };

  const handleSearch = () => searchStore.handleSearch();
  
  const handlePeriodClick = (period) => {
    handlePeriodSelect(period);
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 px-4 sm:py-6 sm:px-6 lg:px-20">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => useEnrollmentPeriodStore.setState({ error: '' })}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search Form */}
      <SearchForm 
        searchLogic={searchStore}
        fields={searchFormConfig}
        onSearch={handleSearch}
      />

      {/* Search Results */}
      <SearchResults
        visible={searchStore.showResults && !showCourses}
        items={searchStore.currentItems}
        columns={searchResultsColumns}
        onItemClick={handlePeriodClick}
        pagination={paginationConfig}
        actionButton={
          <ThinRedButton onClick={() => useEnrollmentPeriodStore.setState({ addAcademicPeriodModal: true })}>
            Create Period
          </ThinRedButton>
        }
      />

      {/* Period Details */}
      {showCourses && selectedPeriod && (
        <PeriodDetailsTable
          periodCourses={periodCourses}
          onDeleteCourse={deleteCourse}
          selectedPeriod={selectedPeriod}
          onAddCourse={() => useEnrollmentPeriodStore.setState({ addCourseModal: true })}
          onBack={handleBackToResults}
        />
      )}

      {/* Modals */}
      <AddCourseModal
        add_course_modal={addCourseModal}
        setAddCourseModal={(show) => useEnrollmentPeriodStore.setState({ addCourseModal: show })}
        selectedPeriod={selectedPeriod}
        fetchPeriodCourses={fetchPeriodCourses}
      />
      <AcademicPeriodModal
        addAcademicPeriodModal={addAcademicPeriodModal}
        setAddAcademicPeriodModal={(show) => useEnrollmentPeriodStore.setState({ addAcademicPeriodModal: show })}
        fetchPeriods={fetchPeriods}
      />
    </div>
  );
}

export default EnrollmentPeriod;