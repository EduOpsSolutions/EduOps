import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SmallButton from "../../components/buttons/SmallButton";
import UserNavbar from "../../components/navbars/UserNav";
import LabelledInputField from "../../components/textFields/LabelledInputField";
import SelectField from "../../components/textFields/SelectField";
import usePaymentStore from "../../stores/paymentStore";
import useAuthStore from "../../stores/authStore";
import Swal from "sweetalert2";

function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [showIdCopied, setShowIdCopied] = useState(false);
  const {
    formData,
    loading,
    phoneError,
    nameError,
    feesOptions,
    updateFormField,
    validateAndFetchStudentByID,
    validateAndFetchTeacherByID,
    validateRequiredFields,
    validatePhoneNumber,
    preparePaymentData,
    showDialog,
    resetForm,
    sendPaymentLinkEmail
  } = usePaymentStore();

  // Filtered fee options based on user role
  const getFilteredFeeOptions = () => {
    if (isAuthenticated && user?.role === 'teacher') {
      return feesOptions.filter(option => option.value === 'document_fee');
    }
    return feesOptions;
  };

  // Auto-fill authenticated user details
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      updateFormField('student_id', user.userId);

      if (user.role === 'teacher') {
        validateAndFetchTeacherByID(user.userId);
      } else if (user.role === 'student') {
        validateAndFetchStudentByID(user.userId);
      }

      if (user?.email) {
        updateFormField('email_address', user.email);
      }
    }
  }, [isAuthenticated, user, validateAndFetchStudentByID, validateAndFetchTeacherByID, updateFormField]);

  // Auto-fill document fee from location state (when navigating from document request)
  useEffect(() => {
    if (location.state?.documentFee) {
      const { feeType, amount } = location.state.documentFee;
      if (feeType) {
        updateFormField('fee', feeType);
      }
      if (amount) {
        updateFormField('amount', amount.toString());
      }
    }
  }, [location.state, updateFormField]);

  // Helper function to get proper fee type label
  const getFeeTypeLabel = (feeType) => {
    const feeTypeMap = {
      'down_payment': 'Down Payment',
      'tuition_fee': 'Tuition Fee',
      'document_fee': 'Document Fee',
      'book_fee': 'Book Fee',
    };
    
    if (!feeType) {
      return 'Payment';
    }
    
    return feeTypeMap[feeType] || feeType.replace('_', ' ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormField(name, value);
  };

  const handleStudentIdBlur = async (e) => {
    const studentId = e.target.value;
    // Only validate for guests (non-authenticated users)
    // Authenticated users already have auto-filled data
    if (studentId && !isAuthenticated) {
      await validateAndFetchStudentByID(studentId);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      await showDialog({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please fill in all required fields before submitting.",
        confirmButtonColor: "#b71c1c",
      });
      return;
    }

    if (!validatePhoneNumber()) return;

    const feeLabel = getFeeTypeLabel(formData.fee);


    const confirmResult = await Swal.fire({
      title: 'Confirm Payment',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 15px; font-size: 1.1rem; color: #333;">Are you sure you want to pay <strong>₱${formData.amount}</strong> for <strong>${feeLabel}</strong>?</p>
          <p style="margin: 0; font-size: 0.9rem; color: #6B7280;">
            Payment link will be sent to: <strong>${formData.email_address}</strong>
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, I\'m sure',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) {
      return; 
    }

    try {
      const paymentData = preparePaymentData();
      const feeLabel = getFeeTypeLabel(paymentData.feeType);
      const description = `${feeLabel} - Payment for ${paymentData.firstName} ${paymentData.lastName}`;
      const emailData = {
        email: paymentData.email,
        firstName: paymentData.firstName,
        lastName: paymentData.lastName,
        amount: paymentData.amount,
        description: description,
        feeType: paymentData.feeType,
        userId: paymentData.userId
      };

      Swal.fire({
        title: 'Processing...',
        text: 'Sending payment link to your email...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const result = await sendPaymentLinkEmail(emailData);

      if (result.success) {
        const successResult = await Swal.fire({
          title: 'Email Sent Successfully!',
          html: `
            <div style="text-align: center;">
              <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p style="margin: 0; color: #155724; font-weight: 500;">
                  <i class="fas fa-envelope mr-2"></i>
                  A payment link has been sent to <strong>${paymentData.email}</strong>
                </p>
              </div>
              <p style="margin: 15px 0; color: #6B7280;">
                You can complete your payment using the link in your email, or click "Pay Now" to proceed immediately.
              </p>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-credit-card mr-2"></i>Pay Now',
          cancelButtonText: '<i class="fas fa-times mr-2"></i>Close',
          confirmButtonColor: '#890E07',
          cancelButtonColor: '#6B7280',
          reverseButtons: true
        });

        if (successResult.isConfirmed) {
          const paymentId = result?.data?.data?.paymentId;
          if (paymentId) {
            const checkoutUrl = `${window.location.origin}/payment?paymentId=${paymentId}`;
            window.open(checkoutUrl, '_blank');
          } else {
  
            const paymentData = preparePaymentData();
            const feeLabel = getFeeTypeLabel(paymentData.feeType);
            const description = `${feeLabel} - Payment for ${paymentData.firstName} ${paymentData.lastName}`;
            localStorage.setItem("totalPayment", paymentData.amount.toString());
            navigate("/payment", {
              state: {
                amount: paymentData.amount,
                description: description,
                studentInfo: {
                  firstName: paymentData.firstName,
                  lastName: paymentData.lastName,
                  email: paymentData.email,
                  phone: paymentData.phoneNumber,
                  studentId: paymentData.studentId
                }
              }
            });
          }
        }
        
        resetForm();
      } else {
        await Swal.fire({
          title: 'Error',
          text: result.error || 'Failed to send payment link. Please try again.',
          icon: 'error',
          confirmButtonColor: '#890E07'
        });
      }
    } catch (error) {
      console.error('Error sending payment link:', error);
      await Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonColor: '#890E07'
      });
    }
  };

  // Handle copy ID
  const handleCopyId = () => {
    if (user?.userId) {
      navigator.clipboard.writeText(user.userId);
      setShowIdCopied(true);
      setTimeout(() => setShowIdCopied(false), 2000);
    }
  };

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <UserNavbar role={isAuthenticated && user?.role ? user.role : "public"} />

      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-3xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold">Payment Form</h1>
            <p className="italic mt-2 font-semibold">
              Fields marked with (*) are required. Please enter the correct student
              information.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            {/* Personal Information */}
            {isAuthenticated && user?.userId && user?.role === 'student' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Your ID:</span>{" "}
                      <span className="font-mono text-blue-700">{user.userId}</span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        {showIdCopied ? "Copied!" : "Copy"}
                      </button>
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Note:</span> Your details have been automatically filled. You can only process payments for yourself. For guest payments, you can share your ID to allow others to pay without logging in.
                  </p>
                </div>
              </div>
            )}

            {isAuthenticated && user?.role === 'teacher' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Your ID:</span>{" "}
                      <span className="font-mono text-blue-700">{user.userId}</span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        {showIdCopied ? "Copied!" : "Copy"}
                      </button>
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Note:</span> Your details have been automatically filled. You can only process payments for yourself. For guest payments, you can share your ID to allow others to pay without logging in.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <LabelledInputField
                name="student_id"
                id="student_id"
                label={isAuthenticated && user?.role === 'teacher' ? "Teacher ID*" : "Student ID*"}
                type="text"
                required={true}
                placeholder={isAuthenticated && user?.role === 'teacher' ? "Teacher ID" : "Enter Student ID"}
                value={formData.student_id || ""}
                onChange={handleInputChange}
                onBlur={handleStudentIdBlur}
                readOnly={isAuthenticated && (user?.role === 'teacher' || user?.role === 'student')}
                className={isAuthenticated && (user?.role === 'teacher' || user?.role === 'student') ? "bg-gray-100" : ""}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <LabelledInputField
                  name="first_name"
                  id="first_name"
                  label="First Name"
                  type="text"
                  required={true}
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  readOnly={true}
                  className={
                    nameError ? "border-red-500 focus:border-red-500 bg-gray-100" : "bg-gray-100"
                  }
                />
                {loading && !formData.first_name && (
                  <div className="absolute right-3 top-9 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-red"></div>
                  </div>
                )}
              </div>
              <div className="relative">
                <LabelledInputField
                  name="middle_name"
                  id="middle_name"
                  label="Middle Name"
                  type="text"
                  placeholder="Middle Name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  readOnly={true}
                  className="bg-gray-100"
                />
                {loading && !formData.middle_name && (
                  <div className="absolute right-3 top-9 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-red"></div>
                  </div>
                )}
              </div>

              <div className="relative">
                <LabelledInputField
                  name="last_name"
                  id="last_name"
                  label="Last Name"
                  type="text"
                  required={true}
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  readOnly={true}
                  className={
                    nameError ? "border-red-500 focus:border-red-500 bg-gray-100" : "bg-gray-100"
                  }
                />
                {loading && !formData.last_name && (
                  <div className="absolute right-3 top-9 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-red"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Name Validation Error */}
            {nameError && (
              <div className="mb-6 -mt-2">
                <p className="text-red-500 text-sm">{nameError}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <LabelledInputField
                name="email_address"
                id="email_address"
                label="Email Address*"
                type="email"
                required={true}
                placeholder="johndoe@gmail.com"
                value={formData.email_address}
                onChange={handleInputChange}
              />
              <div>
                <LabelledInputField
                  name="phone_number"
                  id="phone_number"
                  label="Phone Number"
                  type="tel"
                  required={false}
                  placeholder="09xxxxxxxxx"
                  minLength="11"
                  maxLength="15"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={
                    phoneError ? "border-red-500 focus:border-red-500" : ""
                  }
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <hr className="my-6 border-dark-red" />
            <p className="mb-5 font-semibold">Payment Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <SelectField
                name="fee"
                id="fee"
                label="Type of Fee*"
                required={true}
                options={getFilteredFeeOptions()}
                value={formData.fee}
                onChange={handleInputChange}
              />
              <LabelledInputField
                name="amount"
                id="amount"
                label="Amount (PHP)*"
                type="number"
                required={true}
                placeholder="0.00"
                min="1"
                max="100000"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                readOnly={isAuthenticated && (user?.role === 'teacher' || user?.role === 'student')}
                className={`[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isAuthenticated && (user?.role === 'teacher' || user?.role === 'student') ? 'bg-gray-100' : ''}`}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <SmallButton type="submit" disabled={loading || nameError}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Checkout"
                )}
              </SmallButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;