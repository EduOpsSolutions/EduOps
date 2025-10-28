import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserNavbar from "../../components/navbars/UserNav";
import CreditCard from "../../components/payments/CreditCard";
import GCash from "../../components/payments/GCash";
import Maya from "../../components/payments/Maya";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axios";

const PaymentPage = () => {
  const [paymentOption, setPaymentOption] = useState(0);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    description: "",
    studentInfo: null
  });
  const [isLocked, setIsLocked] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const paymentMethods = [
    { 
      id: 0, 
      name: "Credit/Debit Card", 
      component: CreditCard,
      description: "Pay securely with your credit or debit card"
    },
    { 
      id: 1, 
      name: "GCash", 
      component: GCash,
      description: "Pay using your GCash wallet"
    },
    { 
      id: 2, 
      name: "Maya", 
      component: Maya,
      description: "Pay using your Maya wallet"
    }
  ];

  useEffect(() => {
    const persist = (amount, studentInfo) => {
      const amountStr = String(amount);
      localStorage.setItem("totalPayment", amountStr);
      sessionStorage.setItem("totalPayment", amountStr);
      if (studentInfo) {
        const infoStr = JSON.stringify(studentInfo);
        localStorage.setItem("studentInfo", infoStr);
        sessionStorage.setItem("studentInfo", infoStr);
      }
    };

    const checkPaymentStatus = async (paymentId) => {
      if (!paymentId) return;
      try {
        const resp = await axiosInstance.get(`/payments/${paymentId}/status`);
        const payment = resp?.data?.data;
        if (payment && (payment.status === 'paid' || payment.status === 'cancelled' || payment.status === 'refunded')) {
          setIsLocked(true);
        }
      } catch (_e) {
      }
    };

    const loadFromPaymentId = async (paymentId) => {
      const resp = await axiosInstance.get(`/payments/${paymentId}`);
      const payment = resp?.data?.data;
      if (!payment) throw new Error('Payment not found');

      const amount = Number(payment.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');

      const description = payment.remarks || 'EduOps Payment';
      const user = payment.users || payment.user || null;
      const studentInfo = user ? {
        userId: user.userId || user.id || null,
        id: user.id || null,
        studentId: user.studentId || user.userId || null,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || ''
      } : null;

      setPaymentData({ amount, description, studentInfo });
      persist(amount, studentInfo);
    };

    const loadFromContext = (urlParams, stateData) => {
      const amountCandidate =
        urlParams.get('amount') ??
        (stateData?.amount != null ? String(stateData.amount) : null) ??
        sessionStorage.getItem("totalPayment") ??
        localStorage.getItem("totalPayment");
      const amount = amountCandidate != null ? Number(amountCandidate) : NaN;
      const description = urlParams.get('description') || stateData?.description || "EduOps Payment";
      const studentInfo = stateData?.studentInfo || 
        JSON.parse(sessionStorage.getItem("studentInfo") || "null") ||
        JSON.parse(localStorage.getItem("studentInfo") || "null");

      if (!Number.isFinite(amount) || amount <= 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid Payment",
          text: "No payment amount specified. Redirecting to payment form.",
          confirmButtonColor: "#890E07"
        }).then(() => navigate("/paymentForm"));
        return false;
      }

      setPaymentData({ amount, description, studentInfo });
      persist(amount, studentInfo);
      return true;
    };

    const run = async () => {
      const urlParams = new URLSearchParams(location.search);
      const stateData = location.state;
      const paymentId = urlParams.get('paymentId');

      if (paymentId) {
        try {
          await loadFromPaymentId(paymentId);
          setCurrentPaymentId(paymentId);
          await checkPaymentStatus(paymentId);
          return;
        } catch (error) {
          await Swal.fire({
            icon: "error",
            title: "Invalid or expired link",
            text: error?.response?.data?.message || error.message || "Unable to load payment details.",
            confirmButtonColor: "#890E07"
          });
          navigate("/paymentForm");
          return;
        }
      }

      loadFromContext(urlParams, stateData);
    };

    run();

    const onVisibility = async () => {
      if (document.visibilityState === 'visible' && currentPaymentId) {
        await checkPaymentStatus(currentPaymentId);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    const intervalId = currentPaymentId ? setInterval(() => checkPaymentStatus(currentPaymentId), 3000) : null;

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalId) clearInterval(intervalId);
    };
  }, [location, navigate]);

  const handlePaymentSuccess = async (paymentResult) => {
    localStorage.removeItem("totalPayment");
    localStorage.removeItem("cartItems");

    const result = await Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      html: `
        <div class="text-left">
          <p class="mb-3">Your payment has been processed successfully!</p>
          <div class="bg-gray-50 p-3 rounded text-sm">
            <div class="flex justify-between mb-2">
              <span class="font-medium">Amount:</span>
              <span class="text-green-600 font-semibold">₱${paymentData.amount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Status:</span>
              <span class="text-green-600 font-semibold">Completed</span>
            </div>
          </div>
        <p class="mt-3 text-sm text-gray-600">The receipt will be sent to the email address shortly.</p>
        </div>
      `,
      showCancelButton: false,
      confirmButtonColor: "#890E07",
      confirmButtonText: '<i class="fas fa-home mr-2"></i>Go back home',
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      navigate("/");
    }
  };

  const handlePaymentError = async (error) => {
    console.error("Payment error:", error);
    
    const errorMessage = typeof error === 'string' ? error : 
                        error?.message || 
                        "There was an issue processing your payment.";

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
              <li>Incorrect card details</li>
              <li>Network connectivity issues</li>
              <li>Card blocked by bank</li>
            </ul>
          </div>
          <p class="mt-3 text-sm text-gray-600">
            Your payment information has been saved. You can try again or contact support if the issue persists.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#890E07",
      cancelButtonColor: "#6B7280",
      confirmButtonText: '<i class="fas fa-redo mr-2"></i>Try Again',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      window.location.reload();
    }
  };

  const displayPaymentForm = (optionId) => {
    const method = paymentMethods.find(m => m.id === optionId);
    if (!method) return null;

    const PaymentComponent = method.component;
    
    const userId = paymentData.studentInfo?.userId || paymentData.studentInfo?.id || 'student001';
    
    
    return (
      <PaymentComponent
        amount={paymentData.amount}
        description={paymentData.description}
        userId={userId}
        firstName={paymentData.studentInfo?.firstName || ''}
        lastName={paymentData.studentInfo?.lastName || ''}
        userEmail={paymentData.studentInfo?.email || ''}
        isLocked={isLocked}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    );
  };

  if (!paymentData.amount) {
    return (
      <div className="bg_custom bg-white-yellow-tone">
        <UserNavbar role="public" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Payment...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <UserNavbar role="public" />

      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-5xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden shadow-lg">
          {isLocked && (
            <div className="mb-4 p-4 rounded border border-green-300 bg-green-50 text-green-800">
              This payment has already been completed. Payment form is locked.
            </div>
          )}
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Complete Your Payment</h1>
            <p className="text-gray-600 mt-2">
              Choose your preferred payment method to proceed
            </p>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Description:</span>
                <span className="text-gray-900 text-right">{paymentData.description}</span>
              </div>

              {paymentData.studentInfo && (
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-gray-700 font-medium mb-2">Student Information:</p>
                  <p className="text-sm text-gray-600">
                    <strong>Name: </strong>{paymentData.studentInfo.firstName} {paymentData.studentInfo.lastName}
                  </p>
                  {paymentData.studentInfo.studentId && (
                    <p className="text-sm text-gray-600"><strong>Student ID: </strong> {paymentData.studentInfo.studentId}</p>
                  )}
                  <p className="text-sm text-gray-600"><strong>Email: </strong> {paymentData.studentInfo.email}</p>
                  
                </div>
              )}

              <div className="pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-dark-red">₱{paymentData.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Payment Method</h2>
            <form
              onChange={(event) => {
                setPaymentOption(parseInt(event.target.value));
              }}
              className="space-y-3"
            >
              {paymentMethods.map((method) => (
                <label 
                  key={method.id} 
                  className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-dark-red hover:bg-gray-50 transition-all duration-200"
                >
                  <input
                    className="mt-1 mr-3 w-4 h-4 text-dark-red focus:ring-dark-red"
                    name="paymentOption"
                    type="radio"
                    value={method.id}
                    defaultChecked={method.id === 0}
                  />
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-800">{method.name}</span>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                </label>
              ))}
            </form>
          </div>

          {/* Payment Form */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            {displayPaymentForm(paymentOption)}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Secure Payment</p>
                <p className="text-xs text-green-700 mt-1">Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>

          {/* Powered by PayMongo */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <span>Powered by</span>
              <span className="ml-1 font-semibold text-gray-700">PayMongo</span>
              <svg className="w-4 h-4 ml-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
