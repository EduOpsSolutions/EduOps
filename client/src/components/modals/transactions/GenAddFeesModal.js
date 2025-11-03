import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DiscardChangesModal from "../common/DiscardChangesModal";
import ModalTextField from "../../form/ModalTextField";

const GenAddFeesModal = ({ isOpen, onClose, onAddFee, courseId, batchId }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "down_payment",
    dueDate: "",
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDiscardModal(false);
      setFormData({
        description: "",
        amount: "",
        batchId: "",
        courseId: "",
        dueDate: "",
      });
      setError("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const feeData = {
        courseId,
        batchId,
        name: formData.description,
        price: parseFloat(formData.amount).toFixed(2),
        type: formData.type,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      if (onAddFee && typeof onAddFee === "function") {
        await onAddFee(feeData);
      }
      await Swal.fire({
        title: 'Success!',
        text: 'The general fee has been successfully added.',
        icon: 'success',
        confirmButtonColor: '#890E07',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-popup',
          confirmButton: 'swal2-confirm',
        }
      });
      onClose();
    } catch (error) {
      setError(error.message || "Failed to add fee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    const initial = {
      description: "",
      amount: "",
      type: "down_payment",
      dueDate: "",
    };
    return Object.keys(initial).some(
      (key) => String(formData[key] || "").trim() !== String(initial[key])
    );
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: 'Discard changes?',
        text: 'Your unsaved changes will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#890E07',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No, keep editing',
        reverseButtons: true,
        customClass: {
          popup: 'swal2-popup',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
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
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Add General Fee</h2>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <ModalTextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter fee description"
              required
            />

            {/* Amount */}
            <ModalTextField
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              required
            >
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ₱
              </span>
            </ModalTextField>

            {/* Due Date */}
            <ModalTextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />

            {/* Fee Type Dropdown */}
            <div className="mb-4">
              <label htmlFor="type" className="block font-medium mb-1">Fee Type</label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2 text-sm"
                required
              >
                <option value="down_payment">Down Payment</option>
                <option value="tuition_fee">Tuition Fee</option>
                <option value="document_fee">Document Fee</option>
                <option value="book_fee">Book Fee</option>
              </select>
            </div>

            {/* Due Date */}
            {/* <ModalTextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
            /> */}

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
                    <span>Adding...</span>
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
};

export default GenAddFeesModal;