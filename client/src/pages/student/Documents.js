import React, { useState, useEffect } from "react";
import DownloadButton from "../../components/buttons/DownloadButton";
import RequestButton from "../../components/buttons/RequestButton";
import DocRequestsModal from "../../components/modals/documents/DocumentRequestsModal";
import RequestDocumentModal from "../../components/modals/documents/RequestDocumentModal";
import RequestSentModal from "../../components/modals/documents/RequestDocumentSentModal";
import SearchField from "../../components/textFields/SearchField";
import Pagination from "../../components/common/Pagination";
import Spinner from "../../components/common/Spinner";
import ViewRequestDetailsModal from "../../components/modals/documents/ViewRequestDetailsModal";
import { useManageDocumentsSearchStore, useManageDocumentsStore } from "../../stores/manageDocumentsStore";
import useAuthStore from "../../stores/authStore";
import documentApi from "../../utils/documentApi";

function Documents() {
  const [request_document_modal, setRequestDocumentModal] = useState(false);
  const [request_sent_modal, setRequestSentModal] = useState(false);
  const [doc_requests_modal, setDocRequestsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const searchStore = useManageDocumentsSearchStore();
  const { fetchDocuments, loading, error } = useManageDocumentsStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Fetch documents available to students
    fetchDocuments(false);
  }, [fetchDocuments]);

  const handleDownload = async (document) => {
    try {
      if (document.uploadFile) {
        const success = await documentApi.helpers.downloadFile(
          document.uploadFile, 
          document.documentName
        );
        if (!success) {
          throw new Error('Download failed');
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      // You could show a toast notification here
    }
  };

  const handleRequestDocument = (document) => {
    setSelectedDocument(document);
    setRequestDocumentModal(true);
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex justify-center items-start py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      <div className="w-full bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <p className="text-3xl font-semibold ml-2">Documents</p>
          </div>
          <button
            onClick={() => setDocRequestsModal(true)}
            type="button"
            className="text-white bg-dark-red-2 hover:bg-dark-red-5 font-semibold rounded-md text-sm sm:text-md px-6 sm:px-8 py-2 transition"
          >
            See Requests
          </button>
        </div>

        <div className="mb-6 w-full sm:w-1/3 lg:w-1/4">
          <SearchField
            name="documentName"
            id="search-documents"
            placeholder="Search Documents"
            value={searchStore.searchParams.documentName || ''}
            onChange={searchStore.handleInputChange}
            onClick={searchStore.handleSearch}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
            <button
              onClick={() => fetchDocuments(false)}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" color="text-dark-red-2" message="Loading documents..." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mb-6">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b-2 border-dark-red-2">
                      <th className="py-4 px-4 font-bold text-left w-[15%]">Fee</th>
                      <th className="py-4 px-4 font-bold text-left w-[30%]">Name</th>
                      <th className="py-4 px-4 font-bold text-center w-[15%]">Actions</th>
                      <th className="py-4 px-4 font-bold text-left w-[40%]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchStore.currentItems && searchStore.currentItems.length > 0 ? (
                      searchStore.currentItems
                        .filter(row => documentApi.helpers.canAccessDocument(row, user?.role || 'student'))
                        .map((row, idx) => (
                          <tr key={row.id || idx} className="border-b-2 hover:bg-gray-100">
                            <td className="py-4 px-4">
                              {row.price === 'free' ? 'FREE' : 
                               row.price === 'paid' && row.amount ? `₱${parseFloat(row.amount).toFixed(2)}` : 
                               row.displayPrice || 'FREE'}
                            </td>
                            <td className="py-4 px-4">{row.documentName}</td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                {row.downloadable && row.uploadFile && (
                                  <DownloadButton onClick={() => handleDownload(row)} />
                                )}
                                {row.requestBasis && (
                                  <RequestButton
                                    onClick={() => handleRequestDocument(row)}
                                  />
                                )}
                                {!row.downloadable && !row.requestBasis && (
                                  <span className="text-gray-500 text-sm">Not Available</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">{row.description || 'No description'}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          No documents available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Pagination */}
        <div className="mt-4 sm:mt-6">
          <Pagination
            currentPage={searchStore.currentPage}
            totalPages={searchStore.totalPages}
            onPageChange={searchStore.handlePageChange}
            itemsPerPage={searchStore.itemsPerPage}
            onItemsPerPageChange={searchStore.handleItemsPerPageChange}
            totalItems={searchStore.totalItems}
            itemName="documents"
            itemsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
        {/* Modals */}
        <RequestDocumentModal
          request_document_modal={request_document_modal}
          setRequestDocumentModal={setRequestDocumentModal}
          request_sent_modal={request_sent_modal}
          setRequestSentModal={setRequestSentModal}
          selectedDocument={selectedDocument}
        />

        <RequestSentModal
          request_sent_modal={request_sent_modal}
          setRequestSentModal={setRequestSentModal}
        />

        <DocRequestsModal
          doc_requests_modal={doc_requests_modal}
          setDocRequestsModal={setDocRequestsModal}
        />

        <ViewRequestDetailsModal />
      </div>
    </div>
  );
}

export default Documents;