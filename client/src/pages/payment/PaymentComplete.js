import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserNavbar from "../../components/navbars/UserNav";

const PaymentComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent_id');
    
    const checkPaymentStatus = async (paymentIntentId) => {
      try {
        setLoading(true);
        console.log('Checking payment status for:', paymentIntentId);
        
        // Call backend to check the payment status (only on this page)
        const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/check-status/${paymentIntentId}`);
        const data = await response.json();
        
        console.log('Payment status response:', data);
        
        if (data.success && (data.data.status === 'succeeded' || data.data.dbStatus === 'paid')) {
          setPaymentData(data.data);
        } else {
          setError(data.message || 'Payment was not completed');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setError('Unable to verify payment status. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
    
    if (paymentIntentId) {
      checkPaymentStatus(paymentIntentId);
    } else {
      setError('No payment information found');
      setLoading(false);
    }
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="bg_custom bg-white-yellow-tone">
        <UserNavbar role="public" />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-dark-red mx-auto mb-4"></div>
            <p className="text-xl text-gray-700 font-medium">Verifying your payment...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
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
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been processed successfully. You may close this page.</p>
            </div>

            {/* Payment Details Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-4">Transaction Details</h2>
              
              <div className="space-y-3">
                {paymentData.paymongoPaymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">PayMongo Payment ID:</span>
                    <span className="text-gray-900 font-mono text-sm bg-white px-3 py-1 rounded border border-green-200 font-bold">
                      {paymentData.paymongoPaymentId}
                    </span>
                  </div>
                )}

                {paymentData.referenceNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Reference Number:</span>
                    <span className="text-gray-900 font-mono text-sm bg-white px-3 py-1 rounded border border-green-200">
                      {paymentData.referenceNumber}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-gray-700 font-medium">Transaction ID:</span>
                  <span className="text-gray-900 font-mono text-xs bg-white px-3 py-1 rounded border border-green-200">
                    {paymentData.transactionId}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Payment Method:</span>
                  <span className="text-gray-900 font-semibold">
                    {paymentData.paymentMethod || 'Online Payment'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-green-200">
                  <span className="text-lg font-bold text-gray-800">Amount Paid:</span>
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
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Information */}
            {paymentData.user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Paid by:</strong> {paymentData.user.firstName} {paymentData.user.lastName}
                </p>
                <p className="text-sm text-blue-700">
                  {paymentData.user.email}
                </p>
              </div>
            )}

            {/* Info Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">📧 Receipt & Confirmation:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>An invoice/receipt will be sent to your email shortly (check spam if not received).</li>
                    <li>You can safely exit this page.</li>
                    <li>Save your <strong>PayMongo Payment ID</strong> and <strong>Transaction ID</strong> for your records</li>
                    <li>You can view this transaction in your payment history anytime.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-3 bg-dark-red hover:bg-dark-red-5 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </button>
              {/* Only one button required as per request */}
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
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Issue</h1>
            <p className="text-gray-600">{error}</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Common Reasons:</h3>
            <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
              <li>Payment was cancelled by user</li>
              <li>Insufficient funds in account</li>
              <li>Network connectivity issues</li>
              <li>Payment is still being processed</li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Need Help?</strong> If you believe this is an error or if the amount was deducted from your account, please contact support with your transaction reference.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/paymentForm")}
              className="flex-1 px-6 py-3 bg-dark-red hover:bg-dark-red-5 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => window.open('mailto:support@sprachinstitut-cebu.inc?subject=Payment Issue', '_blank')}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-dark-red border-2 border-dark-red font-semibold rounded-lg transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;
