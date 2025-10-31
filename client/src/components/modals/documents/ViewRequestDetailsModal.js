import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentRequestStore } from "../../../stores/documentRequestStore";
import useAuthStore from "../../../stores/authStore";
import documentApi from "../../../utils/documentApi";
import Swal from "sweetalert2";

function ViewRequestDetailsModal() {
  const navigate = useNavigate();
  const { viewDetailsModal, closeViewDetailsModal, selectedRequest, fetchDocumentRequests, refreshSelectedRequest } = useDocumentRequestStore();
  const user = useAuthStore((state) => state.user);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Cleanup expired payment data on mount
  React.useEffect(() => {
    const data = sessionStorage.getItem('documentPaymentData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Expire after 30 minutes (1800000 ms)
        if (!parsed.timestamp || Date.now() - parsed.timestamp > 1800000) {
          sessionStorage.removeItem('documentPaymentData');
        }
      } catch {
        sessionStorage.removeItem('documentPaymentData');
      }
    }
  }, []);

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

  const handlePayOnline = () => {
    // Store payment details in sessionStorage for the payment form, with timestamp
    const paymentData = {
      requestId: selectedRequest.id,
      documentName: selectedRequest.document?.documentName || selectedRequest.documentName,
      amount: selectedRequest.document?.amount || selectedRequest.paymentAmount,
      feeType: 'document_fee',
      userId: user?.userId,
      studentId: user?.role === 'student' ? user?.userId : null,
      email: selectedRequest.email,
      phone: selectedRequest.phone,
      firstName: user?.firstName,
      lastName: user?.lastName,
      middleName: user?.middleName,
      timestamp: Date.now()
    };

    sessionStorage.setItem('documentPaymentData', JSON.stringify(paymentData));

    // Optionally, set a timeout to remove the data after 30 minutes
    setTimeout(() => {
      const data = sessionStorage.getItem('documentPaymentData');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.timestamp === paymentData.timestamp) {
            sessionStorage.removeItem('documentPaymentData');
          }
        } catch {
          sessionStorage.removeItem('documentPaymentData');
        }
      }
    }, 1800000); // 30 minutes

    // Close modal and redirect to payment form
    closeViewDetailsModal();
    navigate('/paymentForm');
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
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedRequest.name || 'Unknown Student'}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Document Information</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
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

            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Contact & Delivery Information</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
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

            {selectedRequest.additionalNotes && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-sm text-gray-700">{selectedRequest.additionalNotes}</p>
              </div>
            )}

            {/* Payment Section - Show if document has amount and payment method is online */}
            {selectedRequest.document?.amount && selectedRequest.document?.price === 'paid' && selectedRequest.paymentMethod === 'online' && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Payment</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm text-blue-700">
                      Amount: ₱{parseFloat(selectedRequest.document.amount).toFixed(2)}
                    </span>
                  </div>
                  
                  {canUploadProof && selectedRequest.paymentStatus !== 'paid' && (
                    <button
                      type="button"
                      onClick={handlePayOnline}
                      disabled={uploading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedRequest.paymentUrl ? 'Continue Payment' : 'Pay Online'}
                    </button>
                  )}

                  {selectedRequest.paymentStatus === 'paid' && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">Payment completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proof of Payment Section */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Proof of Payment</h4>
              
              {selectedRequest.proofOfPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-700 flex-1">Proof of payment uploaded</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleViewProof}
                      className="flex-1 bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-150"
                    >
                      View Proof
                    </button>
                    {canUploadProof && (
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        disabled={uploading}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove proof of payment"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {canUploadProof ? (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-yellow-700">No proof of payment uploaded</span>
                      </div>
                      <div>
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
                          className={`block w-full text-center bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded font-medium cursor-pointer transition-colors duration-150 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploading ? 'Uploading...' : 'Upload Proof of Payment'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Accepted: JPG, PNG, GIF, PDF (Max 5MB)
                        </p>
                      </div>
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