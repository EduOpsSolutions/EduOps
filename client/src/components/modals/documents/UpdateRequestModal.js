import React, { useState, useEffect } from "react";
import ModalSelectField from "../../form/ModalSelectField";
import Swal from 'sweetalert2';

function UpdateDocumentRequestModal({ 
  isOpen, 
  onClose, 
  selectedRequest, 
  updateStatus, 
  updateRemarks, 
  onStatusChange, 
  onRemarksChange, 
  onSubmit
}) {
  const [error, setError] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [initialRemarks, setInitialRemarks] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setError("");
    } else if (selectedRequest) {
      setInitialStatus(selectedRequest.status);
      setInitialRemarks(selectedRequest.remarks || "");
    }
  }, [isOpen, selectedRequest]);

  if (!isOpen || !selectedRequest) return null;

  const hasChanges = () => {
    return updateStatus !== initialStatus || updateRemarks !== initialRemarks;
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes that will be lost. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'No, keep editing.',
        cancelButtonText: 'Yes, discard changes.',
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6B7280',
      }).then((result) => {
        if (result.isDismissed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError("");
      await onSubmit();
    } catch (error) {
      const errorMessage = error.message || "Failed to update document request. Please try again.";
      setError(errorMessage);
    }
  };

  const statusOptions = [
    { value: "Fulfilled", label: "Fulfilled" },
    { value: "In Transit", label: "In Transit" },
    { value: "Delivered", label: "Delivered" },
    { value: "In Process", label: "In Process" },
    { value: "Failed", label: "Failed" }
  ];

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
          <h2 className="text-xl sm:text-2xl font-bold pr-4">Update Document Request</h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={handleClose}
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Student:</span> {selectedRequest.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Document:</span> {selectedRequest.documentName || selectedRequest.document?.documentName || 'Unknown Document'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date Requested:</span> {selectedRequest.displayDate}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ModalSelectField
            label="Status"
            name="status"
            value={updateStatus}
            onChange={onStatusChange}
            options={statusOptions}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Remarks
            </label>
            <textarea
              value={updateRemarks}
              onChange={onRemarksChange}
              className="w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
              rows="3"
              placeholder="Enter remarks or additional notes..."
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateDocumentRequestModal;