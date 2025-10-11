import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/Payment.module.css";
import UserNavbar from "../../components/navbars/UserNav";
import CreditCard from "../../components/payments/CreditCard";
import GCash from "../../components/payments/GCash";
import Maya from "../../components/payments/Maya";
import Swal from "sweetalert2";

const PaymentPage = () => {
  const [paymentOption, setPaymentOption] = useState(0);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    description: "",
    checkoutID: "",
    studentInfo: null
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Payment method configurations
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
    // Get payment data from various sources
    const urlParams = new URLSearchParams(location.search);
    const stateData = location.state;
    
    // Try to get data from URL params, state, or localStorage
    const amount = urlParams.get('amount') || 
                  stateData?.amount || 
                  localStorage.getItem("totalPayment");
    
    const description = urlParams.get('description') || 
                       stateData?.description || 
                       "EduOps Payment";
    
    const checkoutID = urlParams.get('checkoutID') || 
                      stateData?.checkoutID || 
                      localStorage.getItem("checkoutID") ||
                      `${Date.now()}-EduOps`;

    const studentInfo = stateData?.studentInfo || 
                       JSON.parse(localStorage.getItem("studentInfo") || "null");

    if (!amount || amount === "0") {
      Swal.fire({
        icon: "error",
        title: "Invalid Payment",
        text: "No payment amount specified. Redirecting to payment form.",
        confirmButtonColor: "#890E07"
      }).then(() => {
        navigate("/paymentForm");
      });
      return;
    }

    setPaymentData({
      amount: parseFloat(amount),
      description,
      checkoutID,
      studentInfo
    });

    // Store data in localStorage for persistence
    localStorage.setItem("totalPayment", amount);
    localStorage.setItem("checkoutID", checkoutID);
    if (studentInfo) {
      localStorage.setItem("studentInfo", JSON.stringify(studentInfo));
    }
  }, [location, navigate]);

  const handlePaymentSuccess = async (paymentResult) => {
    // Clear stored payment data
    localStorage.removeItem("totalPayment");
    localStorage.removeItem("checkoutID");
    localStorage.removeItem("cartItems");

    const result = await Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      html: `
        <div class="text-left">
          <p class="mb-3">Your payment has been processed successfully!</p>
          <div class="bg-gray-50 p-3 rounded text-sm">
            <div class="flex justify-between mb-2">
              <span class="font-medium">Transaction ID:</span>
              <span>${paymentData.checkoutID}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-medium">Amount:</span>
              <span class="text-green-600 font-semibold">₱${paymentData.amount.toFixed(2)}</span>
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
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      navigate("/");
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      navigate("/student/payments");
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
      cancelButtonColor: "#DC2626",
      confirmButtonText: '<i class="fas fa-redo mr-2"></i>Try Again',
      cancelButtonText: '<i class="fas fa-phone mr-2"></i>Contact Support',
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      // Retry payment - user can try again with same form
      window.location.reload();
    } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
      // Contact support
      window.open('mailto:support@eduops.com?subject=Payment Issue&body=Transaction ID: ' + paymentData.checkoutID);
    }
  };

  const displayPaymentForm = (optionId) => {
    const method = paymentMethods.find(m => m.id === optionId);
    if (!method) return null;

    const PaymentComponent = method.component;
    
    return (
      <PaymentComponent
        amount={paymentData.amount}
        description={`${paymentData.description} - ${paymentData.checkoutID}`}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    );
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!paymentData.amount) {
    return (
      <div className="bg-white-yellow-tone min-h-screen">
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
    <div className="bg-white-yellow-tone min-h-screen">
      <UserNavbar role="public" />
      
      <div className="container mx-auto px-4 py-8">
        <main className="main">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              Choose your preferred payment method to proceed
            </p>
          </div>

          <section className={styles.payment}>
            <div className={styles.paymentHeader}>
              <h2 className="text-2xl font-semibold">Select Payment Option</h2>
              <button
                onClick={handleBackClick}
                className="text-sm"
              >
                ← Back
              </button>
            </div>

            {/* Payment Method Selection */}
            <form
              onChange={(event) => {
                setPaymentOption(parseInt(event.target.value));
              }}
              className={styles.paymentSelection}
            >
              {paymentMethods.map((method) => (
                <label key={method.id} className={styles.option}>
                  <input
                    className={styles.radio}
                    name="paymentOption"
                    type="radio"
                    value={method.id}
                    defaultChecked={method.id === 0}
                  />
                  <span className={styles.optionDetails}>
                    <span className={styles.optionText}>{method.name}</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.description}
                    </p>
                  </span>
                </label>
              ))}
            </form>

            {/* Payment Form Container */}
            <div className={styles.paymentFormsContainer}>
              <div className={styles.paymentInfo}>
                <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Order ID:</span>
                      <span className="text-gray-600">{paymentData.checkoutID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Description:</span>
                      <span className="text-gray-600">{paymentData.description}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-dark-red">₱{paymentData.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {paymentData.studentInfo && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-medium mb-2">Student Information:</h3>
                      <p className="text-sm text-gray-600">
                        {paymentData.studentInfo.firstName} {paymentData.studentInfo.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {paymentData.studentInfo.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.paymentForm}>
                {displayPaymentForm(paymentOption)}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;