import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const showSuccessAlert = useCallback(async (paymentData) => {
    const result = await Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      html: `
        <div class="text-left">
          <p class="mb-3">Your payment has been processed successfully!</p>
          <div class="bg-gray-50 p-3 rounded text-sm">
            <div class="flex justify-between mb-2">
              <span class="font-medium">Transaction ID:</span>
              <span>${paymentData.transactionId || 'N/A'}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-medium">Amount:</span>
              <span class="text-green-600 font-semibold">₱${paymentData.amount || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Status:</span>
              <span class="text-green-600 font-semibold">Completed</span>
            </div>
          </div>
          <p class="mt-3 text-sm text-gray-600">
            <i class="fas fa-info-circle mr-1"></i>
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#890E07",
      cancelButtonColor: "#6B7280",
      confirmButtonText: '<i class="fas fa-home mr-2"></i>Go to Dashboard',
      cancelButtonText: '<i class="fas fa-receipt mr-2"></i>View Payments',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      navigate("/");
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      navigate("/student/ledger");
    }
  }, [navigate]);

  const showFailureAlert = useCallback(async (errorMessage) => {
    const result = await Swal.fire({
      icon: "error",
      title: "Payment Failed",
      html: `
        <div class="text-left">
          <p class="mb-3">${errorMessage}</p>
          <div class="bg-red-50 border border-red-200 p-3 rounded text-sm">
            <h4 class="font-medium text-red-800 mb-2">Common Reasons:</h4>
            <ul class="list-disc list-inside space-y-1 text-red-700">
              <li>Insufficient funds</li>
              <li>Transaction cancelled by user</li>
              <li>Network connectivity issues</li>
              <li>Payment gateway error</li>
            </ul>
          </div>
          <p class="mt-3 text-sm text-gray-600">
            You can try again or contact support if the issue persists.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#890E07",
      cancelButtonColor: "#DC2626",
      confirmButtonText: '<i class="fas fa-redo mr-2"></i>Try Again',
      cancelButtonText: '<i class="fas fa-phone mr-2"></i>Contact Support',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      // Go back to payment page
      navigate("/payment");
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      // Contact support
      window.open('mailto:support@eduops.com?subject=Payment Issue');
    }
  }, [navigate]);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent_id');
    
    const checkPaymentStatus = async (paymentIntentId) => {
      try {
        // Call your backend to check the payment status
        const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/check-status/${paymentIntentId}`);
        const data = await response.json();
        
        if (data.success && data.status === 'succeeded') {
          await showSuccessAlert(data);
        } else {
          await showFailureAlert(data.error || 'Payment was not completed');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        await showFailureAlert('Unable to verify payment status');
      }
    };
    
    if (paymentIntentId) {
      // Check payment status and show appropriate alert
      checkPaymentStatus(paymentIntentId);
    } else {
      // No payment intent, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate, showSuccessAlert, showFailureAlert]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing payment result...</p>
      </div>
    </div>
  );
};

export default PaymentComplete;