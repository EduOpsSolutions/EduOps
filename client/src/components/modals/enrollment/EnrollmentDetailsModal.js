import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import { getCookieItem } from "../../../utils/jwt";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import PrimaryButton from "../../buttons/PrimaryButton";
import { FaEye } from "react-icons/fa";
import CommonModal from "../common/CommonModal";

export default function EnrollmentDetailsModal({
  data,
  show,
  handleClose,
  handleSave,
}) {
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState({ url: null, title: "" });
  const [emailCheckLoading, setEmailCheckLoading] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const debounceRef = useRef();

  // Set form data only when modal is opened or new data is passed
  useEffect(() => {
    if (show && data) {
      setFormData(data);
    }
  }, [data, show]);

  // Debounce email existence check only when email fields change
  useEffect(() => {
    setEmailCheckLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (formData?.preferredEmail || formData?.altEmail) {
      debounceRef.current = setTimeout(() => {
        checkEmailExists(formData?.preferredEmail, formData?.altEmail);
      }, 500);
    } else {
      setEmailCheckLoading(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData?.preferredEmail, formData?.altEmail]);

  const checkEmailExists = async (email, altEmail) => {
    try {
      setEmailCheckLoading(true);
      const response = await axiosInstance.get(
        `/users/inspect-email-exists?email=${email}&altEmail=${altEmail}`,
        {
          headers: {
            Authorization: `Bearer ${getCookieItem("token")}`,
          },
        }
      );
      setEmailCheckLoading(false);
      setEmailExists(response.data.data);
    } catch (error) {
      console.error("Error checking email exists:", error);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "status" && value === "deleted") {
      setFormData({
        ...formData,
        [name]: value,
        deletedAt: new Date(),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreateAccount = () => {
    Swal.fire({
      title: "Create Account",
      text: "Are you sure you want to create an account for this enrollment request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Create Account",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.post(
            `/users/create-student-account`,
            {
              userId: formData.userId,
              firstName: formData.firstName,
              middleName: formData.middleName,
              lastName: formData.lastName,
              email: formData.preferredEmail,
              birthyear: formData.birthDate,
              enrollmentId: formData.enrollmentId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookieItem("token")}`,
              },
            }
          );
          Swal.fire({
            title: "Account Created",
            text: response.message,
            icon: "success",
            confirmButtonColor: "#dc2626",
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error",
            text: error.response.data.message || "An error occurred",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      }
    });
  };

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

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "archived":
      case "cancelled":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (!show) return null;

  const handleCloseModal = () => {
    setShowPreview(false);
    setPreviewFile({ url: null, title: "" });
  };

  const handlePreviewFile = (fileUrl, title) => {
    setPreviewFile({ url: fileUrl, title: title });
    setShowPreview(true);
  };

  const handlePreviewPaymentProof = () => {
    if (!formData?.paymentProofPath) {
      Swal.fire({
        title: "Payment Proof Not Available",
        text: "Proof of payment has not been uploaded yet.",
        icon: "info",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    handlePreviewFile(formData.paymentProofPath, "Proof of Payment Preview");
  };

  const handleFormSave = async () => {
    setLoading(true);
    try {
      // Send all form data to the new backend endpoint
      await axiosInstance.put(
        `/enrollment/enroll/${formData.enrollmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getCookieItem("token")}`,
          },
        }
      );
      await handleSave(formData);
    } catch (error) {
      console.error("Error saving form data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <CommonModal
        title={previewFile.title}
        handleClose={handleCloseModal}
        show={showPreview}
        fileUrl={previewFile.url}
        className="w-full h-[90%]"
      />
      <div className="bg-white-yellow-tone rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-start justify-between mb-4 sm:mb-6 p-6 sticky top-0 bg-white-yellow-tone z-10 border-b ">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">
            Enrollment Details
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

        {/* User Profile Summary */}
        <div className="flex flex-col p-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-dark-red-2 flex items-center justify-center flex-shrink-0">
                <span className="text-sm sm:text-lg font-bold text-white">
                  {getUserInitials(formData?.firstName, formData?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {formData?.firstName}
                  {formData?.middleName ? ` ${formData.middleName}` : ""}{" "}
                  {formData?.lastName}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {formData?.preferredEmail || formData?.altEmail || "N/A"}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                    formData?.role
                  )}`}
                >
                  {formData?.role?.charAt(0).toUpperCase() +
                    formData?.role?.slice(1)}
                </span> */}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                      formData?.enrollmentStatus
                    )}`}
                  >
                    {formData?.enrollmentStatus?.charAt(0).toUpperCase() +
                      formData?.enrollmentStatus?.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={emailExists || emailCheckLoading}
                  className={`w-full bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded border border-dark-red-2 ease-in duration-150 text-sm sm:text-base ${
                    emailExists
                      ? "opacity-50 cursor-not-allowed"
                      : "opacity-100 cursor-pointer"
                  }`}
                >
                  {emailExists ? "Account Exists" : "Create Account"}
                </button>
              </div>
            </div>
          </div>

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
                    onChange={handleInputChange}
                    required
                  />
                  <ModalTextField
                    label="Middle Name"
                    name="middleName"
                    value={formData?.middleName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Last Name"
                    name="lastName"
                    value={formData?.lastName || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Preferred Email Address"
                    name="preferredEmail"
                    type="email"
                    value={formData?.preferredEmail || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <ModalTextField
                    label="Alternative Email Address"
                    name="altEmail"
                    type="email"
                    value={formData?.altEmail || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Preferred Contact Number"
                    name="contactNumber"
                    type="string"
                    value={formData?.contactNumber || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <ModalTextField
                    label="Alternative Contact Number"
                    name="altContactNumber"
                    type="string"
                    value={formData?.altContactNumber || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Address"
                    name="address"
                    type="text"
                    value={formData?.address || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                  <ModalTextField
                    label="Gender"
                    name="gender"
                    type="option"
                    value={formData?.gender || ""}
                    onChange={handleInputChange}
                    required
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                  />
                  <ModalSelectField
                    label="Enrollment Status"
                    name="enrollmentStatus"
                    value={formData?.enrollmentStatus || "Pending"}
                    onChange={handleInputChange}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "verified", label: "Verified" },
                      { value: "payment_pending", label: "Payment Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "completed", label: "Completed" },
                      { value: "rejected", label: "Rejected" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Father's Name"
                    name="fatherName"
                    type="string"
                    value={formData?.fatherName || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <ModalTextField
                    label="Father's Contact Number"
                    name="fatherContact"
                    type="string"
                    value={formData?.fatherContact || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModalTextField
                    label="Mother's Maiden Name"
                    name="motherName"
                    type="string"
                    value={formData?.motherName || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <ModalTextField
                    label="Mother's Contact Number"
                    name="motherContact"
                    type="string"
                    value={formData?.motherContact || ""}
                    onChange={handleInputChange}
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
                        handlePreviewFile(
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
                        handlePreviewFile(
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
                      onClick={handlePreviewPaymentProof}
                    >
                      <FaEye />
                    </PrimaryButton>
                    <p>Proof of Payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 sticky bottom-0 bg-white-yellow-tone p-4 border-t">
          <button
            onClick={handleFormSave}
            disabled={loading}
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
