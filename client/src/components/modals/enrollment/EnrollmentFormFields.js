import React, { useRef } from "react";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import PrimaryButton from "../../buttons/PrimaryButton";
import { FaEye, FaUpload } from "react-icons/fa";

export default function EnrollmentFormFields({
  formData,
  originalData,
  emailExists,
  onInputChange,
  onPreviewFile,
  onPreviewPaymentProof,
  onUploadValidId,
  onUploadIdPhoto,
  onUploadPaymentProof,
  uploadingValidId,
  uploadingIdPhoto,
  uploadingPaymentProof,
}) {
  const validIdInputRef = useRef(null);
  const idPhotoInputRef = useRef(null);
  const paymentProofInputRef = useRef(null);
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Edit Information Form */}
      <div className="xl:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="First Name"
              name="firstName"
              value={formData?.firstName || ""}
              onChange={onInputChange}
              required
            />
            <ModalTextField
              label="Middle Name"
              name="middleName"
              value={formData?.middleName || ""}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Last Name"
              name="lastName"
              value={formData?.lastName || ""}
              onChange={onInputChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Preferred Email Address"
              name="preferredEmail"
              type="email"
              value={formData?.preferredEmail || ""}
              onChange={onInputChange}
              required
            />
            <ModalTextField
              label="Alternative Email Address"
              name="altEmail"
              type="email"
              value={formData?.altEmail || ""}
              onChange={onInputChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Preferred Contact Number"
              name="contactNumber"
              type="string"
              value={formData?.contactNumber || ""}
              onChange={onInputChange}
              required
            />
            <ModalTextField
              label="Alternative Contact Number"
              name="altContactNumber"
              type="string"
              value={formData?.altContactNumber || ""}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Address"
              name="address"
              type="text"
              value={formData?.address || ""}
              onChange={onInputChange}
            />
            <ModalTextField
              label="Birthday"
              name="birthday"
              type="date"
              value={
                formData?.birthDate &&
                !isNaN(new Date(formData.birthDate).getTime())
                  ? new Date(formData.birthDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={onInputChange}
            />
            <ModalTextField
              label="Gender"
              name="gender"
              type="option"
              value={formData?.gender || ""}
              onChange={onInputChange}
              required
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
            <ModalSelectField
              label="Enrollment Status"
              name="enrollmentStatus"
              value={(() => {
                let statusValue = (
                  formData?.enrollmentStatus ||
                  originalData?.enrollmentStatus ||
                  originalData?.status ||
                  "pending"
                ).toLowerCase();

                return statusValue;
              })()}
              onChange={onInputChange}
              options={(() => {
                // Use original data for validation to prevent UI issues when validation fails
                let currentStatus = (
                  originalData?.enrollmentStatus ||
                  originalData?.status ||
                  "pending"
                ).toLowerCase();

                // If current status is rejected, treat it as pending for validation purposes
                // This allows any forward movement or another rejection
                if (currentStatus === "rejected") {
                  const hasPaymentProof =
                    formData?.paymentProofPath ||
                    originalData?.paymentProofPath;
                  // Determine what step they were at when rejected
                  currentStatus = hasPaymentProof
                    ? "payment_pending"
                    : "pending";
                }

                // Check for account existence in multiple ways
                const hasAccount = !!(
                  formData?.userId ||
                  formData?.studentId ||
                  emailExists
                );

                const statusOptions = [
                  { value: "pending", label: "1. Pending Admin Review" },
                  { value: "verified", label: "2. Verified (Account Created)" },
                  { value: "payment_pending", label: "3. Payment Pending" },
                  { value: "approved", label: "4. Payment Verified" },
                  { value: "completed", label: "5. Enrollment Completed" },
                  { value: "rejected", label: "Rejected" },
                ];

                // Define step progression order
                const statusOrder = [
                  "pending",
                  "verified",
                  "payment_pending",
                  "approved",
                  "completed",
                ];
                const currentIndex = statusOrder.indexOf(currentStatus);

                return statusOptions.map((option) => {
                  const optionIndex = statusOrder.indexOf(option.value);
                  let disabled = false;
                  let colorClass = "";

                  // Rejected should always be available at any step
                  if (option.value === "rejected") {
                    return {
                      ...option,
                      disabled: false,
                      label: option.label,
                      className: "",
                    };
                  }

                  // Check if trying to advance to step 2 onwards without account
                  if (optionIndex >= 1 && !hasAccount) {
                    disabled = true;
                    colorClass = "text-gray-400";
                  }

                  // Check if trying to skip steps forward
                  if (optionIndex > currentIndex + 1) {
                    disabled = true;
                    colorClass = "text-gray-400";
                  }

                  return {
                    ...option,
                    disabled,
                    label: option.label,
                    className: colorClass,
                  };
                });
              })()}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Father's Name"
              name="fatherName"
              type="string"
              value={formData?.fatherName || ""}
              onChange={onInputChange}
              required
            />
            <ModalTextField
              label="Father's Contact Number"
              name="fatherContact"
              type="string"
              value={formData?.fatherContact || ""}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalTextField
              label="Mother's Maiden Name"
              name="motherName"
              type="string"
              value={formData?.motherName || ""}
              onChange={onInputChange}
              required
            />
            <ModalTextField
              label="Mother's Contact Number"
              name="motherContact"
              type="string"
              value={formData?.motherContact || ""}
              onChange={onInputChange}
              required
            />
          </div>

          {/* Courses Selected Section */}
          <div className="mt-6">
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courses Selected
              </label>
              <ul className="list-disc ml-6">
                {formData?.coursesToEnroll &&
                  formData?.coursesToEnroll?.split(",").map((course, idx) => {
                    return (
                      <li key={idx} className="break-all">
                        {course}
                      </li>
                    );
                  })}
              </ul>
              <p className="text-xs text-gray-500 mt-1">
                These courses will be visible to the student on their enrollment
                tracking page.
              </p>
            </div>
          </div>

          {/* Admin Remarks Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-dark-red">
              Admin Remarks
            </h3>
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks for Student
                {formData?.enrollmentStatus?.toLowerCase() === "rejected" && (
                  <span className="text-red-600 ml-1">
                    * Required for rejected status
                  </span>
                )}
              </label>
              <textarea
                name="remarks"
                value={formData?.remarks || ""}
                onChange={onInputChange}
                placeholder={
                  formData?.enrollmentStatus?.toLowerCase() === "rejected"
                    ? "Enter reason for rejection (required)"
                    : "Enter optional remarks for the student"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red focus:border-transparent text-sm resize-y min-h-[100px]"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">
                These remarks will be visible to the student on their enrollment
                tracking page.
                {formData?.enrollmentStatus?.toLowerCase() !== "rejected" && (
                  <span className="font-medium">
                    {" "}
                    Optional for all statuses except rejected.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="xl:col-span-1">
        <h3 className="text-lg font-semibold mb-4">Enrollment Information</h3>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-600">
              Enrollment ID
            </label>
            <p className="text-xs sm:text-sm font-mono break-all">
              {formData?.enrollmentId}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-600">Created</label>
            <p className="text-xs sm:text-sm break-words">
              {formatDate(formData?.createdAt)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-600">Updated</label>
            <p className="text-xs sm:text-sm break-words">
              {formatDate(formData?.updatedAt)}
            </p>
          </div>
          {formData?.deletedAt && (
            <div className="bg-red-50 rounded p-3 border border-red-200">
              <label className="text-sm font-medium text-red-600">
                Deleted
              </label>
              <p className="text-xs sm:text-sm text-red-700 break-words">
                {formatDate(formData?.deletedAt)}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Documents
            </label>

            {/* Valid ID */}
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-dark-red-2 hover:bg-dark-red-5 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() =>
                  onPreviewFile(formData?.validIdPath, "Valid ID Preview")
                }
                disabled={!formData?.validIdPath}
                title="View Valid ID"
              >
                <FaEye className="w-4 h-4" />
              </button>

              <input
                ref={validIdInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={onUploadValidId}
                className="hidden"
                disabled={uploadingValidId}
              />
              <button
                type="button"
                onClick={() => validIdInputRef.current?.click()}
                disabled={uploadingValidId}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                  uploadingValidId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-dark-red-2 hover:bg-dark-red-5"
                } text-white disabled:opacity-50`}
                title="Upload Valid ID"
              >
                {uploadingValidId ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <FaUpload className="w-4 h-4" />
                )}
              </button>

              <span className="text-sm text-gray-700 leading-10">Valid ID</span>
            </div>

            {/* ID Photo */}
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-dark-red-2 hover:bg-dark-red-5 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() =>
                  onPreviewFile(formData?.idPhotoPath, "ID Photo Preview")
                }
                disabled={!formData?.idPhotoPath}
                title="View ID Photo"
              >
                <FaEye className="w-4 h-4" />
              </button>

              <input
                ref={idPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={onUploadIdPhoto}
                className="hidden"
                disabled={uploadingIdPhoto}
              />
              <button
                type="button"
                onClick={() => idPhotoInputRef.current?.click()}
                disabled={uploadingIdPhoto}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                  uploadingIdPhoto
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-dark-red-2 hover:bg-dark-red-5"
                } text-white disabled:opacity-50`}
                title="Upload ID Photo"
              >
                {uploadingIdPhoto ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <FaUpload className="w-4 h-4" />
                )}
              </button>

              <span className="text-sm text-gray-700 leading-10">ID Photo</span>
            </div>

            {/* Proof of Payment */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-dark-red-2 hover:bg-dark-red-5 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onPreviewPaymentProof}
                disabled={!formData?.paymentProofPath}
                title="View Payment Proof"
              >
                <FaEye className="w-4 h-4" />
              </button>

              <input
                ref={paymentProofInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={onUploadPaymentProof}
                className="hidden"
                disabled={uploadingPaymentProof}
              />
              <button
                type="button"
                onClick={() => paymentProofInputRef.current?.click()}
                disabled={uploadingPaymentProof}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                  uploadingPaymentProof
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-dark-red-2 hover:bg-dark-red-5"
                } text-white disabled:opacity-50`}
                title="Upload Payment Proof"
              >
                {uploadingPaymentProof ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <FaUpload className="w-4 h-4" />
                )}
              </button>

              <span className="text-sm text-gray-700 leading-10">
                Proof of Payment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
