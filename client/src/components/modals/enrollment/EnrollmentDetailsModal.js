import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import { getCookieItem } from "../../../utils/jwt";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import PrimaryButton from "../../buttons/PrimaryButton";
import { FaEye } from "react-icons/fa";
import CommonModal from "../common/CommonModal";
import { trackEnrollment } from "../../../utils/enrollmentApi";
import useEnrollmentStore from "../../../stores/enrollmentProgressStore";

export default function EnrollmentDetailsModal({
  data,
  show,
  handleClose,
  handleSave,
  onEnrollmentUpdate = null, 
}) {
  const [formData, setFormData] = useState(data);
  const [originalData, setOriginalData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState({ url: null, title: "" });
  const [emailCheckLoading, setEmailCheckLoading] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const debounceRef = useRef();
  const { setEnrollmentData } = useEnrollmentStore();
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Set form data only when modal is opened or new data is passed
  useEffect(() => {
    if (show && data) {
      setFormData(data);
      setOriginalData(data);
      setHasChanges(false);
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
    
    // Check if there are changes
    const newData = { ...formData, [name]: value };
    const hasFormChanges = JSON.stringify(newData) !== JSON.stringify(originalData);
    setHasChanges(hasFormChanges);
  };

  const handleCreateAccount = () => {
    Swal.fire({
      title: "Create Account",
      text: "Are you sure you want to create an account for this enrollment request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, create account",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#992525",
      cancelButtonColor: "#6b7280",
      reverseButtons: true
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
          
          // Update form data to reflect account creation
          setFormData(prev => ({ ...prev, userId: response.data.userId }));
          
          // Update email exists state immediately
          setEmailExists(true);
          
          if (onEnrollmentUpdate) {
            onEnrollmentUpdate();
          }
          
          try {
            const enrollmentResponse = await trackEnrollment(formData.enrollmentId, formData.preferredEmail);
            if (!enrollmentResponse.error) {
              setEnrollmentData(enrollmentResponse.data);
            }
          } catch (refreshError) {
            console.error('Failed to refresh enrollment data:', refreshError);
          }
          
          Swal.fire({
            title: "Account Created Successfully!",
            text: "Student account has been created successfully.",
            icon: "success",
            confirmButtonColor: "#992525"
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Account Creation Failed",
            text: error.response?.data?.message || "Failed to create account. Please try again.",
            icon: "error",
            confirmButtonColor: "#992525"
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
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "verified":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "payment_pending":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "approved":
        return "bg-violet-50 text-violet-700 border border-violet-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "archived":
      case "cancelled":
        return "bg-slate-50 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  if (!show) return null;

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile({ url: null, title: "" });
  };

  const handlePreviewFile = (fileUrl, title) => {
    setPreviewFile({ url: fileUrl, title: title });
    setShowPreview(true);
  };

  const handleVerifyPayment = async () => {
    const result = await Swal.fire({
      title: 'Verify Payment?',
      text: 'Are you sure you want to verify this payment and approve the enrollment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, verify payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#992525',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        container: 'swal-z-index-fix'
      }
    });

    if (!result.isConfirmed) return;

    setIsVerifyingPayment(true);
    try {
      // Update enrollment status to approved
      const updatedFormData = { ...formData, enrollmentStatus: 'approved' };
      
      await axiosInstance.put(
        `/enrollment/enroll/${formData.enrollmentId}`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${getCookieItem("token")}`,
          },
        }
      );
      
      // Update local form data
      setFormData(updatedFormData);
      
      // Notify parent component to refresh table data
      if (onEnrollmentUpdate) {
        onEnrollmentUpdate();
      }
      
      // Refresh enrollment data
      try {
        const enrollmentResponse = await trackEnrollment(formData.enrollmentId, formData.preferredEmail);
        if (!enrollmentResponse.error) {
          setEnrollmentData(enrollmentResponse.data);
        }
      } catch (refreshError) {
        console.error('Failed to refresh enrollment data:', refreshError);
      }
      
      // Close preview modal
      setShowPreview(false);
      setPreviewFile({ url: null, title: "" });
      
      Swal.fire({
        title: 'Payment Verified!',
        text: 'Payment has been verified and enrollment status updated to Approved.',
        icon: 'success',
        confirmButtonColor: '#992525',
        customClass: {
          container: 'swal-z-index-fix'
        }
      });
      
    } catch (error) {
      console.error("Error verifying payment:", error);
      Swal.fire({
        title: 'Verification Failed',
        text: error.response?.data?.message || 'Failed to verify payment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#992525',
        customClass: {
          container: 'swal-z-index-fix'
        }
      });
    } finally {
      setIsVerifyingPayment(false);
    }
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

  const handleCloseModal = async () => {
    if (!hasChanges) {
      handleClose();
      return;
    }

    const result = await Swal.fire({
      title: 'Discard Changes?',
      text: 'You have unsaved changes. Do you want to discard them?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, discard',
      cancelButtonText: 'No, keep editing',
      confirmButtonColor: '#992525',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      handleClose();
    }
  };

  const handleFormSave = async () => {
    if (!hasChanges) {
      Swal.fire({
        title: 'No Changes',
        text: 'No changes have been made to save.',
        icon: 'info',
        confirmButtonColor: '#992525'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to save the changes made to this enrollment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#992525',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

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
        
        // Notify parent component to refresh table data
        if (onEnrollmentUpdate) {
          onEnrollmentUpdate();
        }
        
        // Show success message
        Swal.fire({
          title: 'Changes Saved!',
          text: 'Enrollment details have been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#992525'
        });
        
        // Reset change tracking
        setOriginalData(formData);
        setHasChanges(false);
    } catch (error) {
      console.error("Error saving form data:", error);
      Swal.fire({
        title: 'Save Failed',
        text: 'Failed to save changes. Please try again.',
        icon: 'error',
        confirmButtonColor: '#992525'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <CommonModal
        title={previewFile.title}
        handleClose={handleClosePreview}
        show={showPreview}
        fileUrl={previewFile.url}
        className="w-full h-[90%]"
        showVerifyPayment={previewFile.title === "Proof of Payment Preview"}
        onVerifyPayment={handleVerifyPayment}
        isVerifying={isVerifyingPayment}
      />
      <div className="bg-white-yellow-tone rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-start justify-between mb-4 sm:mb-6 p-6 sticky top-0 bg-white-yellow-tone z-10 border-b ">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">
            Enrollment Details
          </h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={handleCloseModal}
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
                      { value: "pending", label: "1. Pending Admin Review" },
                      { value: "verified", label: "2. Verified (Account Created)" },
                      { value: "payment_pending", label: "3. Payment Pending" },
                      { value: "approved", label: "4. Payment Verified" },
                      { value: "completed", label: "5. Enrollment Complete" },
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
            disabled={loading || !hasChanges}
            className={`px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasChanges 
                ? 'bg-dark-red-2 hover:bg-dark-red-5 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              hasChanges ? "Save Changes" : "No Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
