import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";

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
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Type of Fee
              </label>
              <select
                name="typeOfFee"
                value={formData.typeOfFee}
                onChange={handleChange}
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select type</option>
                <option value="Assessment">Assessment</option>
                <option value="Payment">Book</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                O.R. Number
              </label>
              <input
                type="text"
                name="orNumber"
                value={formData.orNumber}
                onChange={handleChange}
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter O.R. number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Debit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="debitAmount"
                    value={formData.debitAmount}
                    onChange={handleChange}
                    className="w-full border-2 border-red-900 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Credit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="creditAmount"
                    value={formData.creditAmount}
                    onChange={handleChange}
                    className="w-full border-2 border-red-900 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className="w-full border-2 border-red-900 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border-2 border-red-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="4"
                placeholder="Enter remarks (optional)"
              ></textarea>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150"
              >
                Submit
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
