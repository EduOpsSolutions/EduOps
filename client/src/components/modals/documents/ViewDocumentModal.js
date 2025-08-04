import React from "react";

const DocumentViewerModal = ({ isOpen, onClose, document }) => {
  if (!isOpen || !document) return null;

   const renderDocumentContent = () => {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-300 min-h-[400px] max-w-2xl mx-auto shadow-sm">
        <div className="text-center">
          <svg 
            className="w-16 h-16 text-gray-400 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preview Available</h3>
          <p className="text-gray-500 mb-6">
            Document preview is not available at this time.
          </p>
          
          {/* Document info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Document:</span> {document.documentName}</p>
              <p><span className="font-medium">File Signature:</span> {document.fileSignature}</p>
              <p><span className="font-medium">Created:</span> {document.createdAt}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        <div className="bg-white border-b border-gray-300 p-4 sm:p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg sm:text-xl">{document.documentName}</h3>
            <p className="text-sm text-gray-600 mt-1">File Signature: {document.fileSignature}</p>
            <p className="text-sm text-gray-600">Created: {document.createdAt}</p>
          </div>
      
          <button
            onClick={onClose}
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-100 flex justify-center">
          {renderDocumentContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal; 