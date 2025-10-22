import React from "react";
import ModalTextField from "./ModalTextField";

// Document form component for add and edit document modals
const DocumentForm = ({
  formData,
  handleChange,
  handleFileChange,
  loading,
  isEditing = false,
  uploadedFile = null
}) => {
  const fileInputId = isEditing ? "fileUploadEdit" : "fileUploadAddNew";

  return (
    <div className="space-y-4">
      <ModalTextField
        label="Document Name"
        name="documentName"
        value={formData.documentName}
        onChange={handleChange}
        placeholder="Enter document name"
        required
      />

      <ModalTextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter description (optional)"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Privacy
        </label>
        <select
          name="privacy"
          value={formData.privacy}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2"
          required
        >
          <option value="teacher_only">Teacher's Only</option>
          <option value="student_only">Student's Only</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Request Basis
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="requestBasis"
                checked={formData.requestBasis}
                onChange={handleChange}
                className="mr-2"
              />
              Requires request to obtain
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Downloadable
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="downloadable"
                checked={formData.downloadable}
                onChange={handleChange}
                className="mr-2"
              />
              Allow direct download
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Price
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="free"
                checked={formData.price === "free"}
                onChange={handleChange}
                className="mr-2"
              />
              Free
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="paid"
                checked={formData.price === "paid"}
                onChange={handleChange}
                className="mr-2"
              />
              Paid
            </label>
          </div>

          {formData.price === "paid" && (
            <div className="mt-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Amount
                </label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Upload file
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              id={fileInputId}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId).click()}
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-1 rounded text-sm font-medium transition-colors duration-150 whitespace-nowrap"
            >
              Upload
            </button>
            <div className="flex-1 text-sm text-black bg-white py-2 px-3 rounded-md border border-gray-300 truncate flex items-center justify-between gap-2">
              <span className="truncate">
                {(isEditing ? formData.uploadFile : uploadedFile?.name) || "No file chosen"}
              </span>
              {isEditing && formData.uploadFile && (
                <a
                  href={formData.uploadFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-dark-red-2 hover:text-dark-red-5 underline whitespace-nowrap flex-shrink-0"
                  title="Download current file"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{isEditing ? "Updating..." : "Adding..."}</span>
            </div>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentForm;