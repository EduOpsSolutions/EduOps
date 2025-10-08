import React, { useEffect } from 'react';
import ThinRedButton from '../../components/buttons/ThinRedButton';
import AddCourseModal from '../../components/modals/enrollment/AddCourseModal';
import AcademicPeriodModal from '../../components/modals/enrollment/AddAcademicPeriodModal';
import PeriodDetailsTable from '../../components/tables/PeriodDetailsTable';
import SearchForm from '../../components/common/SearchFormHorizontal';
import SearchResults from '../../components/common/SearchResults';
import {
  useEnrollmentPeriodSearchStore,
  useEnrollmentPeriodStore,
} from '../../stores/enrollmentPeriodStore';

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
    resetStore,
  } = useEnrollmentPeriodStore();

  useEffect(() => {
    fetchPeriods();
    searchStore.initializeSearch();

    return () => {
      resetStore();
      searchStore.resetSearch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPeriodCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const searchFormConfig = {
    title: 'SEARCH ENROLLMENT BATCH',
    formFields: [
      // {
      //   name: 'periodName',
      //   label: 'Period',
      //   placeholder: 'Search Period...',
      //   type: 'text',
      //   fullWidth: true,
      // },
      {
        name: 'batch',
        label: 'Batch',
        placeholder: 'Search Batch...',
        type: 'text',
      },
      {
        name: 'year',
        label: 'Year',
        placeholder: 'Search Year...',
        defaultValue: new Date().getFullYear(),
        type: 'number',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: '', label: 'All Statuses' },
          { value: 'Ongoing', label: 'Ongoing' },
          { value: 'Ended', label: 'Ended' },
          { value: 'Upcoming', label: 'Upcoming' },
        ],
      },
    ],
  };

  const searchResultsColumns = [
    { key: 'batchName', header: 'Batch', className: 'text-center flex-1' },
    { key: 'year', header: 'Year', className: 'text-center flex-1' },
    { key: 'status', header: 'Status', className: 'text-center flex-1' },
  ];

  const paginationConfig = {
    currentPage: searchStore.currentPage,
    totalPages: searchStore.totalPages,
    onPageChange: searchStore.handlePageChange,
    itemsPerPage: searchStore.itemsPerPage,
    onItemsPerPageChange: searchStore.handleItemsPerPageChange,
    totalItems: searchStore.totalItems,
    itemName: 'periods',
    showItemsPerPageSelector: true,
  };

  const handleSearch = () => searchStore.handleSearch();

  const handlePeriodClick = (period) => {
    handlePeriodSelect(period);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Ongoing (Enrollment Closed)':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Ended':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Upcoming (Enrollment Closed)':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
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
        columnRenderers={{
          status: (status) => (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                status
              )}`}
            >
              {status}
            </span>
          ),
        }}
        actionButton={
          <ThinRedButton
            onClick={() =>
              useEnrollmentPeriodStore.setState({
                addAcademicPeriodModal: true,
              })
            }
          >
            Create Batch
          </ThinRedButton>
        }
      />

      {/* Period Details */}
      {showCourses && selectedPeriod && (
        <PeriodDetailsTable
          periodCourses={periodCourses}
          onDeleteCourse={deleteCourse}
          selectedPeriod={selectedPeriod}
          onAddCourse={() =>
            useEnrollmentPeriodStore.setState({ addCourseModal: true })
          }
          onBack={handleBackToResults}
        />
      )}

      {/* Modals */}
      <AddCourseModal
        add_course_modal={addCourseModal}
        setAddCourseModal={(show) =>
          useEnrollmentPeriodStore.setState({ addCourseModal: show })
        }
        selectedPeriod={selectedPeriod}
        fetchPeriodCourses={fetchPeriodCourses}
      />
      <AcademicPeriodModal
        addAcademicPeriodModal={addAcademicPeriodModal}
        setAddAcademicPeriodModal={(show) =>
          useEnrollmentPeriodStore.setState({ addAcademicPeriodModal: show })
        }
        fetchPeriods={fetchPeriods}
      />
    </div>
  );
}

export default EnrollmentPeriod;
