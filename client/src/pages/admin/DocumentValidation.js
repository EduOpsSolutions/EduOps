import React, { useEffect, useState } from "react";
import Pagination from "../../components/common/Pagination";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import UploadDocumentValidationModal from "../../components/modals/documents/UploadDocumentValidationModal";
import { useDocumentValidationSearchStore, useDocumentValidationStore } from "../../stores/documentValidationStore";

function DocumentValidation() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const searchStore = useDocumentValidationSearchStore();
  const { initializeSearch, resetSearch } = searchStore;

  const {
    loading,
    error,
    fetchDocuments,
    handleViewFile,
    createDocumentValidation,
    resetStore
  } = useDocumentValidationStore();

  useEffect(() => {
    fetchDocuments();
    initializeSearch();

    return () => {
      resetStore();
      resetSearch();
    };
  }, [fetchDocuments, initializeSearch, resetStore, resetSearch]);

  const searchFormConfig = {
    title: "SEARCH",
    formFields: [
      {
        name: "fileSignature",
        label: "File Signature",
        type: "text",
        placeholder: ""
      }
    ]
  };

  const paginationConfig = {
    currentPage: searchStore.currentPage,
    totalPages: searchStore.totalPages,
    onPageChange: searchStore.handlePageChange,
    itemsPerPage: searchStore.itemsPerPage,
    onItemsPerPageChange: searchStore.handleItemsPerPageChange,
    totalItems: searchStore.totalItems,
    itemName: "documents",
    itemsPerPageOptions: [10, 25, 50, 100],
    showItemsPerPageSelector: true
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStore.handleSearch();
  };

  return (
    <>
      <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => useDocumentValidationStore.setState({ error: '' })}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-16 lg:items-start">
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-start">
            <SearchFormVertical
              searchLogic={searchStore}
              fields={searchFormConfig}
              onSearch={handleSearch}
            />
          </div>

          <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
            <div className="flex justify-between items-center mb-6">
              <p className="font-bold text-lg sm:text-xl lg:text-2xl">
                Document Validation
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-dark-red-2 hover:bg-dark-red-5 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload Document
              </button>
            </div>

            {loading && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm sm:text-base">Loading documents...</p>
              </div>
            )}

            {/* Documents Table */}
            {!loading && searchStore.totalItems > 0 && (
              <div>
                <div className="overflow-x-auto mb-5">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-dark-red-2">
                        <th className="py-3 font-bold text-start text-xs sm:text-sm lg:text-base w-1/6">
                          File Signature
                        </th>
                        <th className="py-3 font-bold text-start text-xs sm:text-sm lg:text-base w-1/3">
                          Document Name
                        </th>
                        <th className="py-3 font-bold text-center text-xs sm:text-sm lg:text-base w-1/6">
                          Created At
                        </th>
                        <th className="py-3 font-bold text-center text-xs sm:text-sm lg:text-base w-1/3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchStore.currentItems.map((document) => (
                        <tr key={document.id} className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50">
                          <td className="py-3 text-xs sm:text-sm lg:text-base">
                            {document.fileSignature}
                          </td>
                          <td className="py-3 text-xs sm:text-sm lg:text-base">
                            {document.documentName}
                          </td>
                          <td className="py-3 text-center text-xs sm:text-sm lg:text-base">
                            {new Date(document.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                              <button
                                onClick={() => handleViewFile(document)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline transition-all duration-200"
                                title="View File"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                View File
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination {...paginationConfig} />
              </div>
            )}

            {!loading && searchStore.totalItems === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm sm:text-base">
                  No document validations found. Upload a document to get started.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <UploadDocumentValidationModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={async ({ documentName, file }) => {
          await createDocumentValidation({ documentName }, file);
        }}
      />
    </>
  );
}

export default DocumentValidation; 