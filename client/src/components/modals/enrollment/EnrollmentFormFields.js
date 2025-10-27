import React from "react";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import PrimaryButton from "../../buttons/PrimaryButton";
import { FaEye } from "react-icons/fa";

export default function EnrollmentFormFields({
  formData,
  originalData,
  emailExists,
  onInputChange,
  onPreviewFile,
  onPreviewPaymentProof,
}) {
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
        <h3 className="text-lg font-semibold mb-4">
          Personal Information
        </h3>
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
                  ? new Date(formData.birthDate)
                      .toISOString()
                      .split("T")[0]
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
                let statusValue = (formData?.enrollmentStatus || originalData?.enrollmentStatus || originalData?.status || "pending").toLowerCase();
                
                // If status is rejected, show the appropriate current step instead
                if (statusValue === "rejected") {
                  const hasPaymentProof = formData?.paymentProofPath || originalData?.paymentProofPath;
                  statusValue = hasPaymentProof ? "payment_pending" : "verified";
                }
                
                return statusValue;
              })()}
              onChange={onInputChange}
              options={(() => {
                // Use original data for validation to prevent UI issues when validation fails
                let currentStatus = (originalData?.enrollmentStatus || originalData?.status || "pending").toLowerCase();
                
                // If status is rejected, determine the actual current step based on payment proof
                if (currentStatus === "rejected") {
                  const hasPaymentProof = formData?.paymentProofPath || originalData?.paymentProofPath;
                  if (hasPaymentProof) {
                    // Payment was rejected, go back to step 3
                    currentStatus = "payment_pending";
                  } else {
                    // Form was rejected, go back to step 2
                    currentStatus = "verified";
                  }
                }
                
                // Check for account existence in multiple ways
                const hasAccount = !!(formData?.userId || formData?.studentId || emailExists);
                
                const statusOptions = [
                  { value: "pending", label: "1. Pending Admin Review" },
                  { value: "verified", label: "2. Verified (Account Created)" },
                  { value: "payment_pending", label: "3. Payment Pending" },
                  { value: "approved", label: "4. Payment Verified" },
                  { value: "completed", label: "5. Enrollment Complete" },
                  { value: "rejected", label: "Rejected" },
                ];
                
                // Define step progression order
                const statusOrder = ["pending", "verified", "payment_pending", "approved", "completed"];
                const currentIndex = statusOrder.indexOf(currentStatus);
                
                return statusOptions.map(option => {
                  const optionIndex = statusOrder.indexOf(option.value);
                  let disabled = false;
                  let colorClass = "";
                  
                  // Check if trying to advance to step 2 onwards without account (except rejected)
                  if (optionIndex >= 1 && !hasAccount && option.value !== "rejected") {
                    disabled = true;
                    colorClass = "text-gray-400";
                  }
                  
                  // Check if trying to skip steps forward (except rejected)
                  if (optionIndex > currentIndex + 1 && option.value !== "rejected") {
                    disabled = true;
                    colorClass = "text-gray-400";
                  }
                  
                  return {
                    ...option,
                    disabled,
                    label: option.label,
                    className: colorClass
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
        </div>
      </div>

      {/* Account Information */}
      <div className="xl:col-span-1">
        <h3 className="text-lg font-semibold mb-4">
          Enrollment Information
        </h3>
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
            <label className="text-sm font-medium text-gray-600">
              Created
            </label>
            <p className="text-xs sm:text-sm break-words">
              {formatDate(formData?.createdAt)}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <label className="text-sm font-medium text-gray-600">
              Updated
            </label>
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
            <label className="text-sm font-medium text-gray-600">
              Documents
            </label>
            <div className="flex flex-row space-x-4 items-center my-2">
              <PrimaryButton
                className="w-fit py-5 px-5 flex items-center rounded-md cursor-pointer justify-center"
                onClick={() =>
                  onPreviewFile(
                    formData?.validIdPath,
                    "Valid ID Preview"
                  )
                }
                disabled={!formData?.validIdPath}
              >
                <FaEye />
              </PrimaryButton>
              <p>Valid ID</p>
            </div>

            <div className="flex flex-row space-x-4 items-center my-2">
              <PrimaryButton
                className="w-fit py-5 px-5 flex items-center rounded-md cursor-pointer justify-center"
                onClick={() =>
                  onPreviewFile(
                    formData?.idPhotoPath,
                    "ID Photo Preview"
                  )
                }
                disabled={!formData?.idPhotoPath}
              >
                <FaEye />
              </PrimaryButton>
              <p>ID Photo</p>
            </div>

            <div className="flex flex-row space-x-4 items-center my-2">
              <PrimaryButton
                className="w-fit py-5 px-5 flex items-center rounded-md cursor-pointer justify-center"
                onClick={onPreviewPaymentProof}
              >
                <FaEye />
              </PrimaryButton>
              <p>Proof of Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}