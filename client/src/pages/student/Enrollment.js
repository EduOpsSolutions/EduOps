import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNav";
import useEnrollmentStore from "../../stores/enrollmentProgressStore";
import EnrollmentProgressBar from "../../components/enrollment/ProgressBar";
import Swal from "sweetalert2";

function Enrollment() {
  const navigate = useNavigate();
  const {
    enrollmentId,
    studentId,
    enrollmentStatus,
    remarkMsg,
    currentStep,
    paymentProof,
    hasPaymentProof,
    isUploadingPaymentProof,
    isStepCompleted,
    isStepCurrent,
    fetchEnrollmentData,
    setPaymentProof,
    uploadPaymentProof,
    fullName,
    coursesToEnroll,
    createdAt,
    completedSteps,
    courseName,
    coursePrice,
  } = useEnrollmentStore();

  useEffect(() => {
    fetchEnrollmentData();
  }, [fetchEnrollmentData]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPaymentProof(file);
    try {
      await uploadPaymentProof();
    } catch (error) {
      console.error("Error uploading payment proof:", error);
    }
  };

  // Helper component for status indicators
  const StatusIndicator = ({ type, children }) => {
    const colors = {
      uploading: "bg-blue-50 border-blue-200 text-blue-800",
      success: "bg-green-50 border-green-200 text-green-800",
    };
    
    return (
      <div className={`mt-2 p-2 rounded-md ${colors[type]}`}>
        <p className="text-sm flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            {type === "uploading" ? (
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            )}
          </svg>
          {children}
        </p>
      </div>
    );
  };

  // Handle Pay Now - redirect to payment form to create PayMongo link
  const handlePayNow = () => {
    navigate("/paymentForm");
  };

  // Copy Student ID to clipboard
  const copyToClipboard = async (studentId) => {
    try {
      await navigator.clipboard.writeText(studentId);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Student ID copied to clipboard',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      Swal.fire({
        icon: 'error',
        title: 'Copy Failed',
        text: 'Please copy manually',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Payment proof status logic
  const getPaymentProofStatus = () => {
    if (isUploadingPaymentProof) {
      return <StatusIndicator type="uploading">Uploading your proof of payment...</StatusIndicator>;
    }
    if (paymentProof && !isUploadingPaymentProof) {
      return <StatusIndicator type="success">File uploaded successfully: {paymentProof.name}</StatusIndicator>;
    }
    if (hasPaymentProof && !paymentProof && !isUploadingPaymentProof) {
      return <StatusIndicator type="success">Payment proof already uploaded and being processed</StatusIndicator>;
    }
    return null;
  };

  // Show payment note when no proof is uploaded
  const shouldShowPaymentNote = currentStep === 3 && !paymentProof && !hasPaymentProof && !isUploadingPaymentProof;
  
  // Show payment button when user needs to pay
  const shouldShowPaymentButton = currentStep === 3 && !paymentProof && !hasPaymentProof && !isUploadingPaymentProof;

  // No enrollment data state
  if (!enrollmentId) {
    return (
      <>
        <UserNavbar role="public" />
        <div className="bg_custom bg-white-yellow-tone">
          <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
            <div className="w-full max-w-7xl bg-white shadow-lg border border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
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
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  No Enrollment Data Found
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Please use the "Track Enrollment" feature to search for your
                  enrollment using your Enrollment ID or email address.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-2 rounded font-semibold transition-colors duration-150"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar role="public" />
      <div className="bg_custom bg-white-yellow-tone">
        <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
          <div className="w-full max-w-7xl bg-white shadow-lg border border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
            <div className="text-center mb-6 md:mb-8"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 px-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">
                    Enrollee ID:
                  </span>
                  <span className="font-bold text-dark-red">
                    {enrollmentId}
                  </span>
                  {enrollmentId && (
                    <button
                      onClick={() => copyToClipboard(enrollmentId)}
                      className="inline-flex items-center justify-center w-7 h-7 bg-red-50 hover:bg-red-100 text-dark-red rounded transition-colors duration-150 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Copy Enrollee ID"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  )}
                </div>
                {fullName && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="font-semibold text-gray-800">
                      {fullName}
                    </span>
                  </div>
                )}
                {(courseName || coursesToEnroll) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Course:</span>
                    <span className="text-gray-800">
                      {courseName || coursesToEnroll}
                    </span>
                  </div>
                )}
                {coursePrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">
                      Course Fee:
                    </span>
                    <span className="font-semibold text-green-700">
                      ₱{coursePrice}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      enrollmentStatus?.toLowerCase() === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : enrollmentStatus?.toLowerCase() === "verified"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : enrollmentStatus?.toLowerCase() === "payment_pending"
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : enrollmentStatus?.toLowerCase() === "approved"
                        ? "bg-violet-50 text-violet-700 border border-violet-200"
                        : enrollmentStatus?.toLowerCase() === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : enrollmentStatus?.toLowerCase() === "rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {enrollmentStatus?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {createdAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Applied:</span>
                    <span className="text-gray-800">
                      {new Date(createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Progress Section */}
            <div className="bg-white shadow-md border border-dark-red rounded-lg p-4 md:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-dark-red">
                Enrollment Progress
              </h2>
              <EnrollmentProgressBar
                currentStep={currentStep}
                completedSteps={completedSteps}
                isStepCompleted={isStepCompleted}
                isStepCurrent={isStepCurrent}
              />
            </div>

            {/* Remarks Section */}
            <div className="bg-white shadow-md border border-dark-red rounded-lg p-4 md:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2 text-dark-red">
                Remarks
              </h2>
              <p className="text-gray-700">{remarkMsg}</p>

              {/* Payment Proof Upload */}
              {currentStep === 3 && (
                <div className="mt-4">
                  <div className="mb-5 group">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900"
                      htmlFor="paymentProof"
                    >
                      Upload Proof of Payment*
                    </label>
                    <div className="flex items-center space-x-2">
                      <label
                        className={`inline-block text-sm border py-1 px-3 rounded text-center whitespace-nowrap transition-colors ${
                          isUploadingPaymentProof
                            ? "border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "border-dark-red bg-german-red text-white hover:bg-dark-red cursor-pointer"
                        }`}
                        htmlFor="paymentProof"
                      >
                        {isUploadingPaymentProof
                          ? "Uploading..."
                          : "Choose File"}
                      </label>
                      <input
                        className="hidden"
                        aria-describedby="payment_proof_help"
                        id="paymentProof"
                        name="paymentProofPath"
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        disabled={isUploadingPaymentProof}
                      />
                      <div className="text-sm text-black bg-white py-1 px-3 rounded border border-gray-300 truncate flex-1">
                        {isUploadingPaymentProof
                          ? "Uploading file..."
                          : paymentProof
                          ? paymentProof.name
                          : "No file chosen"}
                      </div>
                    </div>
                  </div>
                  <p
                    id="payment_proof_help"
                    className="mt-1 text-sm text-gray-500"
                  >
                    Please upload a clear image or PDF of your payment receipt
                  </p>
                  {getPaymentProofStatus()}
                </div>
              )}
            </div>

            {/* Note */}
            {shouldShowPaymentNote && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Note:
                    </h3>

                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Student ID:&nbsp;</span>
                        <strong className="mr-2">{studentId || 'Pending...'}</strong>
                        {studentId && (
                          <button
                            onClick={() => copyToClipboard(studentId)}
                            className="inline-flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors duration-150"
                            title="Copy Student ID"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy
                          </button>
                        )}
                      </div>
                      <p className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Use this Student ID in the payment form
                      </p>
                      <p className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Upload payment receipt after payment
                      </p>
                      <p className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Payment verification takes 1-2 business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center my-6">
              {shouldShowPaymentButton && (
                  <button
                    onClick={handlePayNow}
                    className="px-8 py-3 bg-gradient-to-r from-german-red to-dark-red hover:from-dark-red hover:to-german-red text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-3"
                  >
                    <span>
                      {coursePrice
                        ? `Pay Now`
                        : "Proceed to Payment"}
                    </span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}

              {/* Temporary Next Button for Demo
              <button
                onClick={() => {
                  advanceToNextStep();
                }}
                className="fixed bottom-4 right-4 px-4 py-2 bg-german-red text-white rounded shadow-md hover:bg-dark-red"
              >
                Next
              </button> */}
            </div>

            {/* Contact Information Footer */}
            <div className="mt-8 text-sm text-gray-600 pt-4 text-center">
              <p>
                For enrollment concerns please contact:{" "}
                <span className="font-medium">(+63) 97239232223</span>
              </p>
              <p>
                Email:{" "}
                <span className="font-medium">
                  info@sprachinstitut-cebu.inc
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Enrollment;