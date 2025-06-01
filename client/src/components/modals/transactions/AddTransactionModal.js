import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";

function AddTransactionModal({
  addTransactionModal,
  setAddTransactionModal,
  selectedStudent,
}) {
  const [formData, setFormData] = useState({
    purpose: "",
    paymentMethod: "",
    amountPaid: "",
    referenceNumber: "",
    remarks: "",
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    if (!addTransactionModal) {
      setShowDiscardModal(false);
      setFormData({
        purpose: "",
        paymentMethod: "",
        amountPaid: "",
        referenceNumber: "",
        remarks: "",
      });
    }
  }, [addTransactionModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New transaction data:", formData);
    console.log("For student:", selectedStudent);
    setAddTransactionModal(false);
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Add Transaction</h2>
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

          {/* Shows selected student info */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter transaction purpose"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select payment method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    className="w-full border-2 border-red-900 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  OR / Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleInputChange}
                  className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reference num"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="4"
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Enter remarks (optional)"
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150"
              >
                Add Transaction
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
