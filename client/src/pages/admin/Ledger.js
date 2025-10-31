import React, { useEffect, useRef, useState } from "react";
import UpdateLedgerModal from "../../components/modals/transactions/UpdateLedger";
import { useLedgerSearchStore, useLedgerStore } from "../../stores/ledgerStore";
import SearchForm from "../../components/common/SearchFormHorizontal";
import SearchResults from "../../components/common/SearchResults";
import axios from "axios";
import axiosInstance from "../../utils/axios";
import LedgerDetails from "../../components/tables/LedgerDetailsTable";
import { getCookieItem } from "../../utils/jwt";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function Ledger() {

  // Search store
  const searchStore = useLedgerSearchStore();
  const { initializeSearch, handleSearch: performSearch } = searchStore;

  // Ledger store
  const {
    // State
    selectedStudent,
    showLedger,
    isModalOpen,
    ledgerEntries,

    // Actions
    handleStudentClick,
    handleBackToResults,
    openAddTransactionModal,
    closeAddTransactionModal,
    handleModalSubmit
  } = useLedgerStore();

  // Fetch students for search (from ledger endpoint)
  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = getCookieItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/ledger/students/ongoing`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        useLedgerSearchStore.getState().setData(res.data || []);
        useLedgerSearchStore.getState().performSearch();
      } catch (err) {
        console.error('Failed to fetch students for ledger:', err);
      }
    }
    fetchStudents();
    // eslint-disable-next-line
  }, [initializeSearch, performSearch]);

  // Search form config
  const searchFormConfig = {
    title: "SEARCH STUDENT LEDGER",
    formFields: [
      {
        name: "studentName",
        label: "Name",
        placeholder: "Student Name",
        type: "text"
      },
      {
        name: "course",
        label: "Course",
        type: "select",
        options: [
          { value: "", label: "All Courses" },
          { value: "A1 German Basic Course", label: "A1 German Basic Course" },
          { value: "A2 German Intermediate Course", label: "A2 German Intermediate Course" },
          { value: "B1 German Advanced Course", label: "B1 German Advanced Course" }
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

  const searchResultsColumns = [
    { key: "name", header: "Name" },
    { key: "course", header: "Course" },
    { key: "batch", header: "Batch" },
    { key: "year", header: "Year" }
  ];

  // Event handlers
  const handleSearch = () => {
    performSearch();
    handleBackToResults();
  };

  const handleStudentClickWrapper = (student) => {
    handleStudentClick(student);
    const studentId = student.studentId || student.id;
    fetchLedger(studentId);
  };

  const fetchLedger = async (studentId) => {
    try {
      const token = getCookieItem("token");
      const res = await fetch(`${API_BASE_URL}/ledger/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      useLedgerStore.getState().setLedgerEntries(data);
    } catch (error) {
      console.error("Error fetching ledger:", error);
    }
  };

  // Wrap modal submit to refresh ledger after submit
  const handleModalSubmitAndRefresh = async (transactionData) => {
    await handleModalSubmit(transactionData);
    if (selectedStudent) {
      const studentId = selectedStudent.studentId
      await fetchLedger(studentId);
    }
  };

  // Pagination config
  const paginationConfig = {
    currentPage: searchStore.currentPage,
    totalPages: searchStore.totalPages,
    onPageChange: searchStore.handlePageChange,
    itemsPerPage: searchStore.itemsPerPage,
    onItemsPerPageChange: searchStore.handleItemsPerPageChange,
    totalItems: searchStore.totalItems,
    itemName: "students",
    showItemsPerPageSelector: true
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">

      {/* Search Form */}
      <SearchForm
        searchLogic={searchStore}
        fields={searchFormConfig}
        onSearch={handleSearch}
      />

      {/* Search Results */}
      <SearchResults
        visible={searchStore.showResults && !showLedger}
        items={searchStore.currentItems}
        columns={searchResultsColumns}
        onItemClick={handleStudentClickWrapper}
        pagination={paginationConfig}
      />

      {/* Ledger Details */}
      {showLedger && selectedStudent && (
        <LedgerDetails
          student={selectedStudent}
          onBackClick={handleBackToResults}
          onAddTransaction={openAddTransactionModal}
          ledgerEntries={ledgerEntries}
        />
      )}

      {/* Modal */}
      <UpdateLedgerModal
        isOpen={isModalOpen}
        onClose={closeAddTransactionModal}
        onSubmit={handleModalSubmitAndRefresh}
        student={selectedStudent}
      />
    </div>
  );
}

export default Ledger;