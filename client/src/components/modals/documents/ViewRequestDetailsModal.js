import React from "react";

function ViewRequestDetailsModal({
  isOpen,
  onClose,
  requestDetails,
  onUpdate
}) {
  if (!isOpen || !requestDetails) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white-yellow-tone rounded-lg p-4 sm:p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">Request Details</h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={onClose}
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

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {requestDetails.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(requestDetails.status)}`}>
                  {requestDetails.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Document Information</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Document Type: </span>
                  <span className="text-gray-900">{requestDetails.document}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date Requested: </span>
                  <span className="text-gray-900">{requestDetails.displayDate}</span>
                </div>
                {requestDetails.purpose && (
                  <div>
                    <span className="font-medium text-gray-700">Purpose: </span>
                    <span className="text-gray-900">{requestDetails.purpose}</span>
                  </div>
                )}
                {requestDetails.remarks && (
                  <div>
                    <span className="font-medium text-gray-700">Remarks: </span>
                    <span className="text-gray-900">{requestDetails.remarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Contact & Delivery Information</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                {requestDetails.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email: </span>
                    <span className="text-gray-900">{requestDetails.email}</span>
                  </div>
                )}
                {requestDetails.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Phone: </span>
                    <span className="text-gray-900">{requestDetails.phone}</span>
                  </div>
                )}
                {requestDetails.address && (
                  <div>
                    <span className="font-medium text-gray-700">Delivery Address: </span>
                    <span className="text-gray-900">{requestDetails.address}</span>
                  </div>
                )}
              </div>
            </div>

            {requestDetails.additionalNotes && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-sm text-gray-700">{requestDetails.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-2 rounded font-semibold transition-colors duration-150"
            onClick={() => {
              onClose();
              setTimeout(() => {
                if (requestDetails && typeof onUpdate === 'function') {
                  onUpdate(requestDetails);
                }
              }, 100);
            }}
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewRequestDetailsModal;