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
        searchStore.initializeSearch();

        return () => {
            resetStore();
            searchStore.resetSearch();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center sm:text-left">
                                Manage Documents
                            </p>
                            <button
                                onClick={handleAddDocument}
                                type="button"
                                className="text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none font-semibold rounded-md text-sm sm:text-md px-6 sm:px-8 py-2 text-center shadow-sm shadow-black ease-in duration-150 w-full sm:w-auto"
                            >
                                Add Document
                            </button>
                        </div>

                        <DocumentsTable
                            documents={displayedDocuments}
                            hasSearched={searchStore.hasSearched}
                            onDocumentClick={handleDocumentClick}
                            onHideDocument={handleHideDocument}
                            onDeleteConfirmation={handleDeleteConfirmation}
                        />

                        <div>
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