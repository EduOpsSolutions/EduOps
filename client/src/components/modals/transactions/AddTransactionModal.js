import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import axiosInstance from "../../../utils/axios";

function AddTransactionModal({
  addTransactionModal,
  setAddTransactionModal,
  selectedStudent,
  onSubmit, 
}) {
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    purpose: "",
    paymentMethod: "",
    amountPaid: "",
    referenceNumber: "",
    remarks: "",
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!addTransactionModal) {
      setShowDiscardModal(false);
      setFormData({
        studentId: "",
        firstName: "",
        lastName: "",
        purpose: "",
        paymentMethod: "",
        amountPaid: "",
        referenceNumber: "",
        remarks: "",
      });
      setError("");
      setNameError("");
    } else if (selectedStudent) {
      setFormData(prev => ({
        ...prev,
        studentDbId: selectedStudent.id || "",
        studentId: selectedStudent.studentId || "",
        firstName: selectedStudent.firstName || "",
        lastName: selectedStudent.lastName || "",
      }));
    }
  }, [addTransactionModal, selectedStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (name === 'studentId') {
      setNameError("");
    }
  };

  const handleStudentIdBlur = async (e) => {
    const studentId = e.target.value;
    if (studentId) {
      await validateAndFetchStudentByID(studentId);
    }
  };

  const validateAndFetchStudentByID = async (studentId) => {
    if (!studentId) {
      setNameError('Student ID is required');
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: ''
      }));
      return false;
    }

    try {
      const response = await axiosInstance.get(`/users/get-student-by-id/${studentId}`);
      const data = response.data;

      if (data.error || !data.success) {
        setNameError(data.message || 'Student ID not found. Please verify the Student ID.');
        setFormData(prev => ({
          ...prev,
          firstName: '',
          lastName: ''
        }));
        return false;
      }

      if (data.data) {
        setFormData(prev => ({
          ...prev,
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
        }));
        setNameError('');
      }

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to find student. Please verify the Student ID.';
      setNameError(errorMessage);
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: ''
      }));
      return false;
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting form data:', formData);
      await onSubmit(formData);
      setAddTransactionModal(false);
    } catch (error) {
      let errorMsg = "Failed to add transaction. Please try again.";
      if (error.response && error.response.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join("\n");
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.values(formData).some((value) => value.trim() !== "");
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowDiscardModal(true);
    } else {
      setAddTransactionModal(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    setAddTransactionModal(false);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  if (!addTransactionModal) return null;

  const paymentMethodOptions = [
    { value: "", label: "Select payment method" },
    { value: "cash", label: "Cash" },
    { value: "cheque", label: "Cheque" },
  ];

  const feeTypeOptions = [
    { value: "", label: "Select fee type" },
    { value: "down_payment", label: "Down Payment" },
    { value: "tuition_fee", label: "Tuition Fee" },
    { value: "document_fee", label: "Document Fee" },
    { value: "book_fee", label: "Book Fee" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedStudent ? "Add Transaction" : "Add Transaction"}
            </h2>
            <button
              className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
              onClick={handleClose}
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

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Name Error Display */}
          {nameError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {nameError}
            </div>
          )}

          {/* Student Info */}
          {selectedStudent && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span>{" "}
                {selectedStudent.studentName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span>{" "}
                {selectedStudent.studentId}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedStudent && (
              <>
                <div className="relative">
                  <ModalTextField
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    onBlur={handleStudentIdBlur}
                    placeholder="Enter student ID"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ModalTextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    readOnly={true}
                    inputClassName={nameError ? "bg-gray-100 border-red-500 focus:border-red-500" : "bg-gray-100"}
                  />
                  <ModalTextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    readOnly={true}
                    inputClassName={nameError ? "bg-gray-100 border-red-500 focus:border-red-500" : "bg-gray-100"}
                  />
                </div>
              </>
            )}

            {/* Fee Type */}
            <ModalSelectField
              label="Fee Type"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              options={feeTypeOptions}
              required
            />

            {/* Payment Method */}
            <ModalSelectField
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              options={paymentMethodOptions}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Amount Paid */}
              <ModalTextField
                label="Amount Paid"
                name="amountPaid"
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="0.00"
                required
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>

              {/* Reference Number */}
              <ModalTextField
                label="OR / Reference Number"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Enter reference num"
                required
              />
            </div>

            {/* Remarks */}
            <ModalTextField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks (optional)"
              isTextArea={true}
              rows={4}
            />

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading} 
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DiscardChangesModal
        show={showDiscardModal}
        onConfirm={handleDiscardChanges}
        onCancel={handleCancelDiscard}
      />
    </>
  );
}

export default AddTransactionModal;