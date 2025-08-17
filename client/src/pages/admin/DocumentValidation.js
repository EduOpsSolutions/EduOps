import React, { useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import DocumentViewerModal from "../../components/modals/documents/ViewDocumentModal";
import { useDocumentValidationSearchStore, useDocumentValidationStore } from "../../stores/documentValidationStore";

function DocumentValidation() {
  const searchStore = useDocumentValidationSearchStore();
  const { initializeSearch, resetSearch } = searchStore;
  
  const {
    selectedDocument,
    loading,
    error,
    isViewerModalOpen,
    fetchDocuments,
    handleViewFile,
    handleCloseViewer,
    handleDownload,
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
        placeholder: "Enter file signature"
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
          <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-6">
            Document Validation
          </p>

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
                      <th className="py-3 font-bold text-start text-xs sm:text-sm lg:text-base">
                        File Signature
                      </th>
                      <th className="py-3 font-bold text-start text-xs sm:text-sm lg:text-base">
                        Document Name
                      </th>
                      <th className="py-3 font-bold text-center text-xs sm:text-sm lg:text-base">
                        Created At
                      </th>
                      <th className="py-3 font-bold text-center text-xs sm:text-sm lg:text-base">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchStore.currentItems.map((document) => (
                      <tr key={document.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 text-xs sm:text-sm lg:text-base">
                          {document.fileSignature}
                        </td>
                        <td className="py-3 text-xs sm:text-sm lg:text-base">
                          {document.documentName}
                        </td>
                        <td className="py-3 text-center text-xs sm:text-sm lg:text-base">
                          {document.createdAt}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewFile(document)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-2 py-1"
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
                            <button
                              onClick={() => handleDownload(document)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs sm:text-sm px-2 py-1"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="w-4 h-4"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              Download
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

          {!loading && searchStore.totalItems === 0 && searchStore.hasSearched && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm sm:text-base">
                No documents found matching your search criteria.
              </p>
            </div>
          )}

          {!loading && searchStore.totalItems === 0 && !searchStore.hasSearched && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm sm:text-base">
                Search for documents using the file signature.
              </p>
            </div>
          )}
        </div>
      </div>

      </div>

      <DocumentViewerModal
        isOpen={isViewerModalOpen}
        onClose={handleCloseViewer}
        document={selectedDocument}
      />
    </>
  );
}

export default DocumentValidation; 