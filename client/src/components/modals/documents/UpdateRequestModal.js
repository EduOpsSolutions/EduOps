import React, { useState, useEffect, useRef } from "react";
import ModalSelectField from "../../form/ModalSelectField";
import Swal from 'sweetalert2';
import documentApi from '../../../utils/documentApi';
import { useDocumentRequestStore } from '../../../stores/documentRequestStore';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { fetchDocumentRequests } = useDocumentRequestStore();

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
  confirmButtonText: 'No, Keep Editing.',
  cancelButtonText: 'Yes, Discard Changes!',
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (PDF only for official documents)
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Invalid File Type',
        text: 'Please upload a PDF file only.',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Swal.fire({
        title: 'File Too Large',
        text: 'File size must be less than 10MB.',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      
      Swal.fire({
        title: 'Uploading Document...',
        text: 'Please wait while we upload the fulfilled document.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await documentApi.requests.uploadFulfilledDocument(selectedRequest.id, file);
      await fetchDocumentRequests();

      Swal.fire({
        title: 'Success!',
        text: 'Fulfilled document uploaded successfully.',
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to upload fulfilled document.',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = async () => {
    try {
      const result = await Swal.fire({
        title: 'Remove Document?',
        text: 'Are you sure you want to remove this fulfilled document?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6B7280',
      });

      if (result.isConfirmed) {
        setUploading(true);

        Swal.fire({
          title: 'Removing Document...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await documentApi.requests.removeFulfilledDocument(selectedRequest.id);
        await fetchDocumentRequests();

        Swal.fire({
          title: 'Removed!',
          text: 'Fulfilled document has been removed.',
          icon: 'success',
          confirmButtonColor: '#992525',
        });
      }
    } catch (error) {
      console.error('Remove error:', error);
      Swal.fire({
        title: 'Remove Failed',
        text: error.response?.data?.message || 'Failed to remove fulfilled document.',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = () => {
    if (selectedRequest.fulfilledDocumentUrl) {
      window.open(selectedRequest.fulfilledDocumentUrl, '_blank');
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

        {/* Fulfilled Document Section */}
        <div className="mb-6 p-4 border-2 border-dark-red-2 rounded-lg bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Personalized Document</h3>
          <p className="text-xs text-gray-600 mb-4">
            Upload the specific document for this student (e.g., their personal Transcript of Records). Only PDF files are accepted.
          </p>
          
          {selectedRequest.fulfilledDocumentUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700 flex-1">Document uploaded</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleViewDocument}
                  className="flex-1 bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded font-medium transition-colors duration-150"
                >
                  View Document
                </button>
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  disabled={uploading}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove document"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-gray-600">No document uploaded yet</span>
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Document (PDF)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
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