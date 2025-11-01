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
  const completedDocInputRef = useRef(null);

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

  const handleCompletedDocUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB max for completed documents)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: 'Error!',
        text: 'File size must be less than 10MB',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Error!',
        text: 'Only PDF, DOC, DOCX, JPG, and PNG files are allowed',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    try {
      setUploading(true);
      
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we upload the completed document.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await documentApi.requests.uploadCompletedDocument(selectedRequest.id, file);
      
      // Refresh both the list and the selected request
      await Promise.all([
        fetchDocumentRequests(),
        refreshSelectedRequest()
      ]);

      Swal.fire({
        title: 'Success!',
        text: 'Completed document uploaded successfully',
        icon: 'success',
        confirmButtonColor: '#992525',
      });

      // Reset file input
      if (completedDocInputRef.current) {
        completedDocInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to upload completed document',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCompletedDocument = async () => {
    const result = await Swal.fire({
      title: 'Remove Completed Document?',
      text: 'Are you sure you want to remove this completed document?',
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

        await documentApi.requests.removeCompletedDocument(selectedRequest.id);
        
        // Refresh both the list and the selected request
        await Promise.all([
          fetchDocumentRequests(),
          refreshSelectedRequest()
        ]);

        Swal.fire({
          title: 'Removed!',
          text: 'Completed document has been removed',
          icon: 'success',
          confirmButtonColor: '#992525',
        });
      } catch (error) {
        console.error('Remove error:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to remove completed document',
          icon: 'error',
          confirmButtonColor: '#992525',
        });
      } finally {
        setUploading(false);
      }
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
      <div className="bg-white-yellow-tone rounded-lg p-4 sm:p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">Request Details</h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
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

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="space-y-4">
            {/* Header with name, status, and contact info side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Name and Status */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {selectedRequest.name || 'Unknown Student'}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>

              {/* Right: Contact & Delivery Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact & Delivery</h4>
                <div className="space-y-1 text-sm">
                  {selectedRequest.email && (
                    <div className="flex items-start gap-1">
                      <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900 break-all">{selectedRequest.email}</span>
                    </div>
                  )}
                  {selectedRequest.phone && (
                    <div className="flex items-start gap-1">
                      <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-900">{selectedRequest.phone}</span>
                    </div>
                  )}
                  {selectedRequest.mode === 'delivery' && selectedRequest.address && (
                    <div className="flex items-start gap-1">
                      <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-900">{selectedRequest.address}{selectedRequest.city && `, ${selectedRequest.city}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Document Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Remarks: </span>
                    <span className="text-gray-900">{selectedRequest.remarks}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest.additionalNotes && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-sm text-gray-700">{selectedRequest.additionalNotes}</p>
              </div>
            )}

            {/* Proof of Payment Section */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Proof of Payment</h4>
              
              {selectedRequest.proofOfPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">Proof of payment uploaded</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleViewProof}
                        className="bg-dark-red-2 hover:bg-dark-red-5 text-white p-1.5 rounded transition-colors duration-150"
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
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="flex items-center gap-2 flex-1">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className={`bg-dark-red-2 hover:bg-dark-red-5 text-white p-1.5 rounded cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={uploading ? 'Uploading...' : 'Upload proof of payment'}
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
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-500">No proof of payment uploaded</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Completed Document Section - Visible to all, but admin can upload */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Completed Document</h4>
              
              {selectedRequest.fulfilledDocumentUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">Your document is ready!</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => window.open(selectedRequest.fulfilledDocumentUrl, '_blank')}
                        className="bg-dark-red-2 hover:bg-dark-red-5 text-white p-1.5 rounded transition-colors duration-150"
                        title="Download document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      {user && user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={handleRemoveCompletedDocument}
                          disabled={uploading}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove completed document"
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
                  {user && user.role === 'admin' ? (
                    <>
                      <div className="flex items-center justify-between gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 flex-1">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm text-yellow-700">No completed document uploaded</span>
                        </div>
                        <input
                          ref={completedDocInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleCompletedDocUpload}
                          disabled={uploading}
                          className="hidden"
                          id="completed-doc-upload"
                        />
                        <label
                          htmlFor="completed-doc-upload"
                          className={`bg-dark-red-2 hover:bg-dark-red-5 text-white p-1.5 rounded cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={uploading ? 'Uploading...' : 'Upload completed document'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-500">Document is being processed</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-2 rounded font-semibold transition-colors duration-150"
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