import React, { useEffect } from "react";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import Pagination from "../../components/common/Pagination";
import UpdateDocumentRequestModal from "../../components/modals/documents/UpdateRequestModal";
import { useDocumentRequestSearchStore, useDocumentRequestStore } from "../../stores/documentRequestStore";

function DocumentRequests() {
  const searchStore = useDocumentRequestSearchStore();

  const {
    selectedRequest,
    updateModal,
    updateStatus,
    updateRemarks,
    handleRequestSelect,
    closeUpdateModal,
    setUpdateStatus,
    setUpdateRemarks,
    handleSubmitStatusUpdate,
    resetStore
  } = useDocumentRequestStore();

  useEffect(() => {
    searchStore.initializeSearch();
    searchStore.handleSearch();
    
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []); 

  const searchFormConfig = {
    title: "SEARCH",
    formFields: [
      {
        name: "name",
        label: "Name",
        type: "text",
        placeholder: "Student Name"
      },
      {
        name: "document",
        label: "Document",
        type: "select",
        options: [
          { value: "", label: "All" },
          { value: "Certificate of Good Moral", label: "Certificate of Good Moral" },
          { value: "Form 138", label: "Form 138" },
          { value: "Certificate of Enrollment", label: "Certificate of Enrollment" },
          { value: "Transcript of Records", label: "Transcript of Records" }
        ]
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "", label: "All" },
          { value: "In Transit", label: "In Transit" },
          { value: "Delivered", label: "Delivered" },
          { value: "In Process", label: "In Process" },
          { value: "Failed", label: "Failed" },
          { value: "Fulfilled", label: "Fulfilled" }
        ]
      },
      {
        name: "sortBy",
        label: "Sort by Date",
        type: "select",
        defaultValue: "descending",
        options: [
          { value: "ascending", label: "Oldest First" },
          { value: "descending", label: "Newest First" }
        ]
      }
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStore.handleSearch();
  };

  const handleStatusChange = (e) => {
    setUpdateStatus(e.target.value);
  };

  const handleRemarksChange = (e) => {
    setUpdateRemarks(e.target.value);
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-16 lg:items-start">
        <div className="w-full lg:w-80 lg:flex-shrink-0 lg:self-start">
          <SearchFormVertical
            searchLogic={{
              searchParams: searchStore.searchParams,
              handleInputChange: searchStore.handleInputChange,
            }}
            fields={searchFormConfig}
            onSearch={handleSearch}
          />
        </div>

        <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
          <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-3 sm:mb-5">
            Document Requests
          </p>

          <div className="pt-2">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Date
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Name
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Document
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Status
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchStore.currentItems.map((request) => (
                      <tr
                        key={request.id}
                        className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                        onClick={() => handleRequestSelect(request)}
                      >
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-24 md:max-w-none" 
                            title={request.displayDate}
                          >
                            {request.displayDate}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" 
                            title={request.name}
                          >
                            {request.name}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-28 md:max-w-36 lg:max-w-none" 
                            title={request.document}
                          >
                            {request.document}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" 
                            title={request.status}
                          >
                            {request.status}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                          <div 
                            className="truncate max-w-20 sm:max-w-24 md:max-w-28 lg:max-w-none" 
                            title={request.remarks}
                          >
                            {request.remarks}
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
                          No document requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={searchStore.currentPage}
                totalPages={searchStore.totalPages}
                onPageChange={searchStore.handlePageChange}
                itemsPerPage={searchStore.itemsPerPage}
                onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                totalItems={searchStore.totalItems}
                itemName="requests"
                showItemsPerPageSelector={true}
              />
            </div>
          </div>
        </div>
      </div>

      <UpdateDocumentRequestModal
        isOpen={updateModal}
        onClose={closeUpdateModal}
        selectedRequest={selectedRequest}
        updateStatus={updateStatus}
        updateRemarks={updateRemarks}
        onStatusChange={handleStatusChange}
        onRemarksChange={handleRemarksChange}
        onSubmit={handleSubmitStatusUpdate}
      />
    </div>
  );
}

export default DocumentRequests;