import React, { useEffect } from "react";
import SearchFormVertical from "../../components/common/SearchFormVertical";
import Pagination from "../../components/common/Pagination";
import Spinner from "../../components/common/Spinner";
import UpdateDocumentRequestModal from "../../components/modals/documents/UpdateRequestModal";
import ViewRequestDetailsModal from "../../components/modals/documents/ViewRequestDetailsModal";
import { useDocumentRequestSearchStore, useDocumentRequestStore } from "../../stores/documentRequestStore";

function DocumentRequests() {
  const searchStore = useDocumentRequestSearchStore();
  const { resetSearch } = searchStore;
  const [documentTemplates, setDocumentTemplates] = React.useState([]);

  const {
    selectedRequest,
    updateModal,
    viewDetailsModal,
    updateStatus,
    updateRemarks,
    loading,
    error,
    fetchDocumentRequests,
    handleRequestSelect,
    viewRequestDetails,
    closeUpdateModal,
    closeViewDetailsModal,
    setUpdateStatus,
    setUpdateRemarks,
    handleSubmitStatusUpdate,
    resetStore
  } = useDocumentRequestStore();

  useEffect(() => {
    fetchDocumentRequests();
    fetchDocumentTemplates();
    return () => {
      resetStore();
      resetSearch();
    };
  }, [fetchDocumentRequests, resetStore, resetSearch]);

  const fetchDocumentTemplates = async () => {
    try {
      const documentApi = (await import('../../utils/documentApi')).default;
      const response = await documentApi.templates.getAll(false);
      if (!response.error) {
        setDocumentTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch document templates:', error);
    }
  };

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
          ...documentTemplates.map(template => ({
            value: template.documentName,
            label: template.documentName
          }))
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
    searchStore.performSearch();
  };

  const handleStatusChange = (e) => {
    setUpdateStatus(e.target.value);
  };

  const handleRemarksChange = (e) => {
    setUpdateRemarks(e.target.value);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Fulfilled':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Delivered':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'In Process':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
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

        <div className="w-full lg:flex-1 bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10 overflow-hidden">
          <p className="font-bold text-lg sm:text-xl lg:text-2xl text-center mb-3 sm:mb-5">
            Document Requests
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
              <button
                onClick={() => fetchDocumentRequests()}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="large" />
            </div>
          ) : (
            <div className="pt-2">
              <div className="overflow-x-auto w-full">
                <div className="w-full align-middle">
                  <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Name
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Document
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                        Remarks
                      </th>
                      <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchStore.currentItems.map((request) => (
                      <tr
                        key={request.id}
                        className="transition-colors duration-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => viewRequestDetails(request)}
                      >
                        <td
                          className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                          <div
                            className="truncate w-20 sm:w-24 md:w-auto"
                            title={request.displayDate}
                          >
                            {request.displayDate}
                          </div>
                        </td>
                        <td
                          className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base"
                        >
                          <div
                            className="truncate w-16 sm:w-24 md:w-32 lg:w-auto"
                            title={request.name}
                          >
                            {request.name}
                          </div>
                        </td>
                        <td
                          className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base"
                        >
                          <div
                            className="truncate w-20 sm:w-28 md:w-36 lg:w-auto"
                            title={request.documentName || request.document?.documentName || 'Unknown Document'}
                          >
                            {request.documentName || request.document?.documentName || 'Unknown Document'}
                          </div>
                        </td>
                        <td
                          className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base"
                        >
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </td>
                        <td
                          className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base"
                        >
                          <div
                            className="truncate w-20 sm:w-24 md:w-28 lg:w-auto"
                            title={request.remarks}
                          >
                            {request.remarks}
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base whitespace-nowrap">
                          <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestSelect(request);
                              }}
                              className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                              title="Update Status"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="hidden sm:inline">Update</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {searchStore.currentItems.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
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
                itemsPerPageOptions={[5, 10, 25, 50]}
                showItemsPerPageSelector={true}
              />
            </div>
          </div>
          )}
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

      <ViewRequestDetailsModal
        isOpen={viewDetailsModal}
        onClose={closeViewDetailsModal}
        requestDetails={selectedRequest}
        onUpdate={handleRequestSelect}
      />
    </div>
  );
}

export default DocumentRequests;