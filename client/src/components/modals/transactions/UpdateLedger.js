import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";

const UpdateLedgerModal = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    typeOfFee: "",
    orNumber: "",
    debitAmount: "",
    creditAmount: "",
    balance: "",
    remarks: "",
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (!isOpen) {
      setShowDiscardModal(false);
      setFormData({
        typeOfFee: "",
        orNumber: "",
        debitAmount: "",
        creditAmount: "",
        balance: "",
        remarks: "",
      });
      setError("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); 
      await onSubmit(formData);
      onClose(); 
    } catch (error) {
      setError(error.message || "Failed to update ledger. Please try again.");
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
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  if (!isOpen) return null;

  const feeTypeOptions = [
    { value: "", label: "Select type" },
    { value: "Assessment", label: "Assessment" },
    { value: "Payment", label: "Payment" },
    { value: "Books", label: "Books" },
    { value: "Adjustment", label: "Adjustment" },
    { value: "Other", label: "Other" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Update Ledger</h2>
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
          {student && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span> {student.name}
              </p>
              {student.id && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {student.id}
                </p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type of Fee */}
            <ModalSelectField
              label="Type of Fee"
              name="typeOfFee"
              value={formData.typeOfFee}
              onChange={handleChange}
              options={feeTypeOptions}
              required
            />

            {/* O.R. Number */}
            <ModalTextField
              label="O.R. Number"
              name="orNumber"
              value={formData.orNumber}
              onChange={handleChange}
              placeholder="Enter O.R. Number"
            />

            {/* Debit and Credit Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Debit Amount */}
              <ModalTextField
                label="Debit Amount"
                name="debitAmount"
                type="number"
                step="0.01"
                value={formData.debitAmount}
                onChange={handleChange}
                placeholder="0.00"
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>

              {/* Credit Amount */}
              <ModalTextField
                label="Credit Amount"
                name="creditAmount"
                type="number"
                step="0.01"
                value={formData.creditAmount}
                onChange={handleChange}
                placeholder="0.00"
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Submit"
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
};

export default UpdateLedgerModal;