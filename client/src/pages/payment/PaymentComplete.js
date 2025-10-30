import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNav';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const reactAppApiUrl = process.env.REACT_APP_API_URL;
  const checkPaymentStatus = useCallback(
    async (paymentIntentId) => {
      try {
        setLoading(true);
        console.log('Checking payment status for:', paymentIntentId);

        const response = await fetch(
          `${reactAppApiUrl}/payments/check-status/${paymentIntentId}`
        );
        const data = await response.json();

        console.log('Payment status response:', data);

        if (
          data.success &&
          (data.data.status === 'succeeded' || data.data.dbStatus === 'paid')
        ) {
          setPaymentData(data.data);
        } else if (response.status === 404 && retryCount < 3) {
          console.log(
            `Retry ${retryCount + 1}/3 for payment: ${paymentIntentId}`
          );
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            checkPaymentStatus(paymentIntentId);
          }, 2000 * (retryCount + 1));
          return;
        } else if (response.status === 404) {
          setError(
            'Payment is being processed. Please wait a moment and refresh the page, or contact support if the issue persists.'
          );
        } else {
          setError(data.message || 'Payment was not completed');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setError('Unable to verify payment status. Please contact support.');
      } finally {
        setLoading(false);
      }
    },
    [retryCount]
  );

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent_id');

    // Validate payment intent ID format for security
    const isValidPaymentIntentId = (id) => {
      return (
        id && typeof id === 'string' && id.startsWith('pi_') && id.length > 10
      );
    };

    if (paymentIntentId && isValidPaymentIntentId(paymentIntentId)) {
      checkPaymentStatus(paymentIntentId);
    } else {
      setError(
        'Invalid payment information. Please contact support if you believe this is an error.'
      );
      setLoading(false);
    }
  }, [searchParams, checkPaymentStatus]);

  // Loading state
  if (loading) {
    return (
      <div className="bg_custom bg-white-yellow-tone">
        <UserNavbar role="public" />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-dark-red mx-auto mb-4"></div>
            <p className="text-xl text-gray-700 font-medium">
              Verifying your payment...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {retryCount > 0
                ? `Retry ${retryCount}/3 - Please wait a moment`
                : 'Please wait a moment'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentData && !error) {
    return (
      <div className="bg_custom bg-white-yellow-tone">
        <UserNavbar role="public" />
        <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-2xl bg-white border-2 border-dark-red rounded-lg p-6 sm:p-8 md:p-10 shadow-lg">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                Your payment has been processed successfully. The receipt has
                been sent to your email address.
              </p>
            </div>

            {/* Payment Details Card */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                Transaction Details
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    Transaction ID:
                  </span>
                  <span className="text-gray-900 font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">
                    {paymentData.transactionId}
                  </span>
                </div>

                {paymentData.referenceNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      Reference Number:
                    </span>
                    <span className="text-gray-900 font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">
                      {paymentData.referenceNumber}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    Payment Method:
                  </span>
                  <span className="text-green-600 font-semibold">
                    {paymentData.paymentMethod || 'Online Payment'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Amount Paid:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₱{parseFloat(paymentData.amount || 0).toFixed(2)}
                  </span>
                </div>

                {paymentData.paidAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="text-gray-700">
                      {new Date(paymentData.paidAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Home Button */}
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-dark-red hover:bg-dark-red-5 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="bg_custom bg-white-yellow-tone">
      <UserNavbar role="public" />
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-2xl bg-white border-2 border-dark-red rounded-lg p-6 sm:p-8 md:p-10 shadow-lg">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-red-600"
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
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Issue
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Common Reasons:</h3>
            <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
              <li>Insufficient funds in account</li>
              <li>Network connectivity issues</li>
              <li>Payment is still being processed</li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Need Help?</strong> If you believe this is an error or if
              the amount was deducted from your account, please contact support.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const paymentIntentId = searchParams.get('payment_intent_id');
                if (paymentIntentId) {
                  setError(null);
                  setLoading(true);
                  setRetryCount(0);
                  setTimeout(() => {
                    checkPaymentStatus(paymentIntentId);
                  }, 1000);
                } else {
                  navigate('/paymentForm');
                }
              }}
              className="flex-1 px-6 py-3 bg-dark-red hover:bg-dark-red-5 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-dark-red border-2 border-dark-red font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;
