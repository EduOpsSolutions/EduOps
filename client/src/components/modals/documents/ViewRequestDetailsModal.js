import React, { useState, useRef } from "react";
import { useDocumentRequestStore } from "../../../stores/documentRequestStore";
import useAuthStore from "../../../stores/authStore";
import documentApi from "../../../utils/documentApi";
import Swal from "sweetalert2";

function ViewRequestDetailsModal() {
  const { viewDetailsModal, closeViewDetailsModal, selectedRequest, fetchDocumentRequests, refreshSelectedRequest } = useDocumentRequestStore();
  const user = useAuthStore((state) => state.user);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!viewDetailsModal || !selectedRequest) return null;

  const isOwnRequest = user && selectedRequest.userId === user.id;
  const canUploadProof = isOwnRequest && (user.role === 'student' || user.role === 'teacher');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'Error!',
        text: 'File size must be less than 5MB',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Error!',
        text: 'Only images (JPG, PNG, GIF) and PDF files are allowed',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    try {
      setUploading(true);
      
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we upload your proof of payment.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await documentApi.requests.uploadProofOfPayment(selectedRequest.id, file);
      
      // Refresh both the list and the selected request
      await Promise.all([
        fetchDocumentRequests(),
        refreshSelectedRequest()
      ]);

      Swal.fire({
        title: 'Success!',
        text: 'Proof of payment uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to upload proof of payment',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProof = async () => {
    const result = await Swal.fire({
      title: 'Remove Proof of Payment?',
      text: 'Are you sure you want to remove this proof of payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#992525',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setUploading(true);
        
        Swal.fire({
          title: 'Removing...',
          text: 'Please wait...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await documentApi.requests.removeProofOfPayment(selectedRequest.id);
        
        // Refresh both the list and the selected request
        await Promise.all([
          fetchDocumentRequests(),
          refreshSelectedRequest()
        ]);

        Swal.fire({
          title: 'Removed!',
          text: 'Proof of payment has been removed',
          icon: 'success',
          confirmButtonColor: '#992525',
        });
      } catch (error) {
        console.error('Remove error:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to remove proof of payment',
          icon: 'error',
          confirmButtonColor: '#992525',
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleViewProof = () => {
    if (selectedRequest.proofOfPayment) {
      window.open(selectedRequest.proofOfPayment, '_blank', 'noopener,noreferrer');
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-dark-red-2 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold">Request Details</h2>
          <button
            className="hover:bg-dark-red-5 rounded-lg p-1.5 transition-colors duration-150"
            onClick={closeViewDetailsModal}
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

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Student Name and Status - Centered */}
          <div className="flex flex-col items-center justify-center bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 text-center">
              {selectedRequest.name || 'Unknown Student'}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusBadgeColor(selectedRequest.status)}`}>
              {selectedRequest.status}
            </span>
          </div>

          {/* Document Information and Contact & Delivery Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Document Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-dark-red-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Document Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Document Type: </span>
                  <span className="text-gray-900">{selectedRequest.documentName || selectedRequest.document?.documentName || 'Unknown Document'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date Requested: </span>
                  <span className="text-gray-900">{selectedRequest.displayDate}</span>
                </div>
                {selectedRequest.purpose && (
                  <div>
                    <span className="font-medium text-gray-700">Purpose: </span>
                    <span className="text-gray-900">{selectedRequest.purpose}</span>
                  </div>
                )}
                {selectedRequest.mode && (
                  <div>
                    <span className="font-medium text-gray-700">Mode: </span>
                    <span className="text-gray-900 capitalize">{selectedRequest.mode}</span>
                  </div>
                )}
                {selectedRequest.remarks && selectedRequest.remarks !== '-' && (
                  <div>
                    <span className="font-medium text-gray-700">Remarks: </span>
                    <span className="text-gray-900">{selectedRequest.remarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Delivery Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-dark-red-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact & Delivery Information
              </h4>
              <div className="space-y-2 text-sm">
                {selectedRequest.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email: </span>
                    <span className="text-gray-900">{selectedRequest.email}</span>
                  </div>
                )}
                {selectedRequest.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Phone: </span>
                    <span className="text-gray-900">{selectedRequest.phone}</span>
                  </div>
                )}
                {selectedRequest.mode === 'delivery' && selectedRequest.address && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Delivery Address: </span>
                      <span className="text-gray-900">{selectedRequest.address}</span>
                    </div>
                    {selectedRequest.city && (
                      <div>
                        <span className="font-medium text-gray-700">City: </span>
                        <span className="text-gray-900">{selectedRequest.city}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {selectedRequest.additionalNotes && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Additional Notes</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.additionalNotes}</p>
            </div>
          )}

          {/* Payment and Proof of Payment Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Payment Section - Show if document has amount and payment method is online */}
            {selectedRequest.document?.amount && selectedRequest.document?.price === 'paid' && selectedRequest.paymentMethod === 'online' && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 md:col-span-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-dark-red-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment
                </h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <span className="text-sm text-blue-700">
                        Amount: ₱{parseFloat(selectedRequest.document.amount).toFixed(2)}
                      </span>
                    </div>

                    {selectedRequest.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700">Payment completed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => window.open('/paymentForm', '_blank')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay Now
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* Proof of Payment Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:col-span-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-dark-red-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Proof of Payment
            </h4>
              
              {selectedRequest.proofOfPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">Proof of payment uploaded</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleViewProof}
                        className="bg-dark-red-2 hover:bg-dark-red-5 text-white p-2 rounded transition-colors duration-150"
                        title="View proof of payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {canUploadProof && (
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          disabled={uploading}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove proof of payment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {canUploadProof ? (
                    <>
                      <div className="flex items-center justify-between gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm text-yellow-700">No proof of payment uploaded</span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                          id="proof-upload"
                        />
                        <label
                          htmlFor="proof-upload"
                          className={`bg-dark-red-2 hover:bg-dark-red-5 text-white p-2 rounded cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Upload proof of payment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Accepted: JPG, PNG, GIF, PDF (Max 5MB)
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-500">No proof of payment uploaded</span>
                    </div>
                  )}
              </div>
            )}
            </div>
          </div>

          {/* Fulfilled Document Section - Only for Students/Teachers to download their document */}
          {selectedRequest.fulfilledDocumentUrl && user?.role !== 'admin' && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-dark-red-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Document
              </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-700">Your document is ready!</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(selectedRequest.fulfilledDocumentUrl, '_blank')}
                  className="bg-dark-red-2 hover:bg-dark-red-5 text-white p-2 rounded transition-colors duration-150"
                  title="Download document"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-4 py-3 rounded-b-lg border-t border-gray-200 flex justify-end">
          <button
            type="button"
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
            onClick={closeViewDetailsModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewRequestDetailsModal;