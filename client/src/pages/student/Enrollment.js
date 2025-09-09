import React, { useEffect } from 'react';
import UserNavbar from '../../components/navbars/UserNav';
import useEnrollmentStore from '../../stores/enrollmentProgressStore';
import EnrollmentProgressBar from '../../components/enrollment/ProgressBar';

function Enrollment() {
  const {
    enrollmentId,
    enrollmentStatus,
    remarkMsg,
    currentStep,
    paymentProof,
    isUploadingPaymentProof,
    isStepCompleted,
    isStepCurrent,
    fetchEnrollmentData,
    setPaymentProof,
    uploadPaymentProof,
    advanceToNextStep,
  } = useEnrollmentStore();

  useEffect(() => {
    fetchEnrollmentData();
  }, [fetchEnrollmentData]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaymentProof(file);
      try {
        await uploadPaymentProof();
      } catch (error) {
        console.error('Error uploading payment proof:', error);
      }
    }
  };

  return (
    <>
      <UserNavbar role="public" />
      <div className="bg_custom bg-white-yellow-tone">
        <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
          <div className="w-full max-w-7xl bg-white shadow-lg border border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
            <div className="text-center mb-6 md:mb-8"></div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6 px-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Enrollee ID:</span>
                <span className="font-bold text-dark-red">{enrollmentId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    enrollmentStatus === 'Completed'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  {enrollmentStatus}
                </span>
              </div>
            </div>

            {/* Enrollment Progress Section */}
            <div className="bg-white shadow-md border border-dark-red rounded-lg p-4 md:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-dark-red">
                Enrollment Progress
              </h2>
              <EnrollmentProgressBar
                currentStep={currentStep}
                completedSteps={useEnrollmentStore(
                  (state) => state.completedSteps
                )}
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
                            ? 'border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'border-dark-red bg-german-red text-white hover:bg-dark-red cursor-pointer'
                        }`}
                        htmlFor="paymentProof"
                      >
                        {isUploadingPaymentProof
                          ? 'Uploading...'
                          : 'Choose File'}
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
                          ? 'Uploading file...'
                          : paymentProof
                          ? paymentProof.name
                          : 'No file chosen'}
                      </div>
                    </div>
                  </div>
                  <p
                    id="payment_proof_help"
                    className="mt-1 text-sm text-gray-500"
                  >
                    Please upload a clear image or PDF of your payment receipt
                  </p>
                  {isUploadingPaymentProof && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading your proof of payment...
                      </p>
                    </div>
                  )}
                  {paymentProof && !isUploadingPaymentProof && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        File uploaded successfully: {paymentProof.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center my-6">
              {currentStep === 3 && !paymentProof && !isUploadingPaymentProof && (
                <button
                  onClick={() => {
                    // Add payment link
                    console.log('Proceeding to payment...');
                  }}
                  className="px-6 py-2.5 bg-german-red hover:bg-dark-red text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap"
                >
                  <span>Proceed to Payment</span>
                </button>
              )}

              {/* Proceed to Next Step Button - Step 3 (after payment proof upload) */}
              {currentStep === 3 &&
                paymentProof &&
                !isUploadingPaymentProof && (
                  <button
                    onClick={() => {
                      advanceToNextStep();
                    }}
                    className="px-6 py-2.5 bg-german-red hover:bg-dark-red text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center whitespace-nowrap"
                  >
                    <span>Proceed to Next Step</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </button>
                )}
              {/* Temporary Next Button for Demo */}
              <button
                onClick={() => {
                  advanceToNextStep();
                }}
                className="fixed bottom-4 right-4 px-4 py-2 bg-german-red text-white rounded shadow-md hover:bg-dark-red"
              >
                Next
              </button>
            </div>

            {/* Contact Information Footer */}
            <div className="mt-8 text-sm text-gray-600 pt-4 text-center">
              <p>
                For enrollment concerns please contact:{' '}
                <span className="font-medium">(+63) 97239232223</span>
              </p>
              <p>
                Email:{' '}
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