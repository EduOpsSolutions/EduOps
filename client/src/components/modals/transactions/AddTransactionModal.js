import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";

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
    } else if (selectedStudent) {
      // Pre-fill student info if student is selected
      setFormData(prev => ({
        ...prev,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); 
      await onSubmit(formData); 
      setAddTransactionModal(false); 
    } catch (error) {
      setError(error.message || "Failed to add transaction. Please try again.");
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
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Check", label: "Check" },
    { value: "Online Payment", label: "Online Payment" },
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
                <ModalTextField
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <ModalTextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                  <ModalTextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
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