import React, { useState, useEffect } from "react";
import DiscardChangesModal from "../common/DiscardChangesModal";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import { getCookieItem } from '../../../utils/jwt';

const AddFeesModal = ({ isOpen, onClose, onSubmit, studentName, course, studentId, courseId, batchId }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDate: "",
    type: "",
  });

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDiscardModal(false);
      setFormData({
        description: "",
        amount: "",
        dueDate: "",
        type: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare payload for store
      const payload = {
        name: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        type: formData.type,
      };
      if (onSubmit && typeof onSubmit === "function") {
        await onSubmit(payload);
      }
      onClose();
    } catch (error) {
      console.error("Failed to add fee:", error);
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Add Fees</h2>
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

          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {studentName || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Course:</span> {course || "N/A"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <ModalTextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              required
            >
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                ₱
              </span>
            </ModalTextField>

            {/* Type Fees dropdown*/}
            <ModalSelectField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              options={[
                { value: '', label: 'Select Type' },
                { value: 'fee', label: 'Fee' },
                { value: 'discount', label: 'Discount' }
              ]}
            />

            {/* Due Date */}
            <ModalTextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
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
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Fees'
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

export default AddFeesModal;