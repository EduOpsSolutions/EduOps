import React, { useEffect } from "react";
import AddNewDocumentModal from "../../components/modals/documents/AddNewDocumentModal";
import EditDocumentModal from "../../components/modals/documents/EditDocumentModal";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import DocumentsTable from "../../components/tables/ManageDocumentsTable";
import Pagination from "../../components/common/Pagination";
import Swal from "sweetalert2";
import {
    useManageDocumentsStore,
    useManageDocumentsSearchStore,
} from "../../stores/manageDocumentsStore";

function ManageDocuments() {
    const searchStore = useManageDocumentsSearchStore();
    const { initializeSearch, resetSearch } = searchStore;

    const {
        // State
        showAddDocumentModal,
        showEditDocumentModal,
        selectedDocument,

        // Actions
        handleAddDocument,
        handleCloseAddDocumentModal,
        handleAddDocumentSubmit,
        handleDeleteDocument,
        handleHideDocument,
        handleDocumentClick,
        handleCloseEditDocumentModal,
        handleUpdateDocument,
        resetStore,
    } = useManageDocumentsStore();

    useEffect(() => {
        initializeSearch();
        return () => {
            resetStore();
            resetSearch();
        };
    }, [initializeSearch, resetStore, resetSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        searchStore.handleSearch();
    };

    const handleDeleteConfirmation = (documentId) => {
        Swal.fire({
            title: "Delete Document?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#992525",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete Document",
            cancelButtonText: "No, Keep Document",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteDocument(documentId);
            }
        });
    };

    const searchFormConfig = {
        title: "SEARCH",
        formFields: [
            {
                name: "documentName",
                label: "Document Name",
                type: "text",
                placeholder: "Enter document name",
            },
            {
                name: "privacy",
                label: "Privacy",
                type: "select",
                placeholder: "Select privacy",
                options: [
                    { value: "", label: "All" },
                    { value: "Teacher's Only", label: "Teacher's Only" },
                    { value: "Student's Only", label: "Student's Only" },
                    { value: "Public", label: "Public" },
                ],
            },
            {
                name: "price",
                label: "Price",
                type: "select",
                placeholder: "Select price type",
                options: [
                    { value: "", label: "All" },
                    { value: "Free", label: "Free" },
                    { value: "Paid", label: "Paid" },
                ],
            },
        ],
    };

    const displayedDocuments = searchStore.currentItems || [];

    return (
        <>
            <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-2 sm:px-4 md:px-6 lg:px-8 max-w-full overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 lg:items-start w-full">
                    <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-start">
                        <SearchFormVertical
                            searchLogic={searchStore}
                            fields={searchFormConfig}
                            onSearch={handleSearch}
                        />
                    </div>

                    <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-3 sm:p-4 lg:p-6 overflow-x-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center sm:text-left">
                                Manage Documents
                            </p>
                            <button
                                onClick={handleAddDocument}
                                type="button"
                                className="text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-sm sm:text-md px-4 sm:px-6 py-2 text-center shadow-sm shadow-black ease-in duration-150 w-full sm:w-auto"
                            >
                                Add Document
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <DocumentsTable
                                documents={displayedDocuments}
                                hasSearched={searchStore.hasSearched}
                                onDocumentClick={handleDocumentClick}
                                onHideDocument={handleHideDocument}
                                onDeleteConfirmation={handleDeleteConfirmation}
                            />
                        </div>

                        <div className="mt-4">
                            <Pagination
                                currentPage={searchStore.currentPage}
                                totalPages={searchStore.totalPages}
                                onPageChange={searchStore.handlePageChange}
                                itemsPerPage={searchStore.itemsPerPage}
                                onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                                totalItems={searchStore.totalItems}
                                itemName="documents"
                                showItemsPerPageSelector={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showAddDocumentModal && (
                <AddNewDocumentModal
                    isOpen={showAddDocumentModal}
                    onClose={handleCloseAddDocumentModal}
                    onAddDocument={handleAddDocumentSubmit}
                />
            )}

            {showEditDocumentModal && selectedDocument && (
                <EditDocumentModal
                    isOpen={showEditDocumentModal}
                    onClose={handleCloseEditDocumentModal}
                    selectedDocument={selectedDocument}
                    onUpdateDocument={handleUpdateDocument}
                />
            )}
        </>
    );
}

export default ManageDocuments;