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
      <div className="bg-white-yellow-tone rounded-lg p-5 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
          <button
            className="bg-dark-red-2 rounded-lg p-1.5 text-white hover:bg-dark-red-5 transition-colors duration-150"
            onClick={closeViewDetailsModal}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - User & Contact Info */}
          <div className="space-y-3">
            {/* User Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">{selectedRequest.name || 'Unknown Student'}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-2">
                {selectedRequest.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 truncate">{selectedRequest.email}</span>
                  </div>
                )}
                {selectedRequest.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{selectedRequest.phone}</span>
                  </div>
                )}
                {selectedRequest.mode === 'delivery' && selectedRequest.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{selectedRequest.address}{selectedRequest.city && `, ${selectedRequest.city}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Information */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Document Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.documentName || selectedRequest.document?.documentName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">{selectedRequest.displayDate}</span>
                </div>
                {selectedRequest.purpose && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.purpose}</span>
                  </div>
                )}
                {selectedRequest.mode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedRequest.mode}</span>
                  </div>
                )}
                {selectedRequest.remarks && selectedRequest.remarks !== '-' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Remarks:</span>
                    <p className="text-gray-900 mt-1">{selectedRequest.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest.additionalNotes && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <h4 className="text-xs font-semibold text-amber-900 uppercase mb-1.5">Notes</h4>
                <p className="text-sm text-gray-700">{selectedRequest.additionalNotes}</p>
              </div>
            )}

          </div>

          {/* Right Column - Documents & Files */}
          <div className="space-y-3">
            {/* Proof of Payment */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Proof of Payment</h4>
              
              {selectedRequest.proofOfPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700 flex-1">Uploaded</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleViewProof}
                      className="flex-1 bg-dark-red-2 hover:bg-dark-red-5 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-150"
                    >
                      View
                    </button>
                    {canUploadProof && (
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        disabled={uploading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {canUploadProof ? (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-yellow-700 flex-1">Not uploaded</span>
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
                        className={`block w-full bg-dark-red-2 hover:bg-dark-red-5 text-white px-3 py-2 rounded text-sm font-medium text-center cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? 'Uploading...' : 'Upload Proof'}
                      </label>
                      <p className="text-xs text-gray-500 text-center">JPG, PNG, PDF (Max 5MB)</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-500 flex-1">Not available</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Completed Document */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Completed Document</h4>
              
              {selectedRequest.fulfilledDocumentUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-blue-700 flex-1">Ready</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(selectedRequest.fulfilledDocumentUrl, '_blank')}
                      className="flex-1 bg-dark-red-2 hover:bg-dark-red-5 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-150"
                    >
                      Download
                    </button>
                    {user && user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={handleRemoveCompletedDocument}
                        disabled={uploading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {user && user.role === 'admin' ? (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-purple-700 flex-1">Not uploaded</span>
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
                        className={`block w-full bg-dark-red-2 hover:bg-dark-red-5 text-white px-3 py-2 rounded text-sm font-medium text-center cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                      </label>
                      <p className="text-xs text-gray-500 text-center">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-500 flex-1">Processing</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
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