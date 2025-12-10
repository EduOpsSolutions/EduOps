import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import ModalTextField from "../../form/ModalTextField";

function EditAcademicPeriodModal({
  editAcademicPeriodModal,
  setEditAcademicPeriodModal,
  selectedPeriod,
  fetchPeriods,
  enrollmentStatus,
}) {
  const [formData, setFormData] = useState({
    batchName: "",
    startAt: "",
    endAt: "",
    enrollmentOpenAt: "",
    enrollmentCloseAt: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEnrollmentClosed =
    enrollmentStatus === "Closed" || enrollmentStatus === "closed";

  // Initialize form data when modal opens or selectedPeriod changes
  useEffect(() => {
    if (editAcademicPeriodModal && selectedPeriod) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const initialData = {
        batchName: selectedPeriod.batchName || "",
        startAt: formatDateForInput(selectedPeriod.startAt),
        endAt: formatDateForInput(selectedPeriod.endAt),
        enrollmentOpenAt: formatDateForInput(selectedPeriod.enrollmentOpenAt),
        enrollmentCloseAt: formatDateForInput(selectedPeriod.enrollmentCloseAt),
      };

      setFormData(initialData);
      setOriginalData(initialData);
      setError("");
    }
  }, [editAcademicPeriodModal, selectedPeriod]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const hasChanges = () => {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
  };

  const validateForm = () => {
    if (!formData.batchName.trim()) {
      setError("Batch name is required");
      return false;
    }
    if (!formData.startAt) {
      setError("Start date is required");
      return false;
    }
    if (!formData.endAt) {
      setError("End date is required");
      return false;
    }
    if (!formData.enrollmentOpenAt) {
      setError("Enrollment open date is required");
      return false;
    }
    if (!formData.enrollmentCloseAt) {
      setError("Enrollment close date is required");
      return false;
    }
    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      setError("End date must be after start date");
      return false;
    }
    if (
      new Date(formData.enrollmentOpenAt) >=
      new Date(formData.enrollmentCloseAt)
    ) {
      setError("Enrollment close date must be after enrollment open date");
      return false;
    }
    if (new Date(formData.enrollmentOpenAt) > new Date(formData.startAt)) {
      setError(
        "Enrollment open date must be on or before the academic period start date"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await Swal.fire({
      title: "Update Batch?",
      text: "Do you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#890E07",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      setError("");

      // Prepare only changed fields for update
      const updatePayload = {};

      if (formData.batchName !== originalData.batchName) {
        updatePayload.batchName = formData.batchName.trim();
      }

      if (formData.startAt !== originalData.startAt) {
        const startDateTime = new Date(formData.startAt);
        startDateTime.setHours(0, 0, 0, 0);
        updatePayload.startAt = startDateTime.toISOString();
      }

      if (formData.endAt !== originalData.endAt) {
        const endDateTime = new Date(formData.endAt);
        endDateTime.setHours(23, 59, 59, 999);
        updatePayload.endAt = endDateTime.toISOString();
      }

      if (formData.enrollmentOpenAt !== originalData.enrollmentOpenAt) {
        const enrollmentOpenDateTime = new Date(formData.enrollmentOpenAt);
        enrollmentOpenDateTime.setHours(0, 0, 0, 0);
        updatePayload.enrollmentOpenAt = enrollmentOpenDateTime.toISOString();
      }

      if (formData.enrollmentCloseAt !== originalData.enrollmentCloseAt) {
        const enrollmentCloseDateTime = new Date(formData.enrollmentCloseAt);
        enrollmentCloseDateTime.setHours(23, 59, 59, 999);
        updatePayload.enrollmentCloseAt = enrollmentCloseDateTime.toISOString();
      }

      console.log("Payload for updating academic period:", updatePayload);

      const response = await axiosInstance.put(
        `/academic-periods/${selectedPeriod.id}`,
        updatePayload
      );

      console.log("Academic Period updated:", response.data);

      await fetchPeriods();
      await Swal.fire({
        title: "Updated!",
        text: "The batch has been updated successfully.",
        icon: "success",
        confirmButtonColor: "#890E07",
        timer: 2000,
        showConfirmButton: false,
      });
      setEditAcademicPeriodModal(false);
      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to update academic period:",
        error.response?.data || error.message
      );

      // Display backend error message
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update academic period. Please try again.";

      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: "Discard Changes?",
        text: "You have unsaved changes. Do you want to discard them?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, discard",
        cancelButtonText: "No, keep editing",
        confirmButtonColor: "#992525",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setEditAcademicPeriodModal(false);
        }
      });
    } else {
      setEditAcademicPeriodModal(false);
    }
  };

  if (!editAcademicPeriodModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Edit Batch</h2>
              {isEnrollmentClosed && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                  Enrollment Closed - Limited editing available
                </span>
              )}
            </div>
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
            {/* Batch Name - Always Editable */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Basic Information
              </h3>
              <ModalTextField
                label="Batch Name"
                name="batchName"
                value={formData.batchName}
                onChange={handleInputChange}
                placeholder="Enter batch name"
                required
              />
            </div>

            {/* Enrollment Dates - Locked if enrollment is closed */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Enrollment Dates
              </h3>
              <div className="flex flex-row justify-center items-start gap-4">
                <div className="w-1/2 relative">
                  <ModalTextField
                    label="Enrollment Open Date"
                    name="enrollmentOpenAt"
                    type="date"
                    value={formData.enrollmentOpenAt}
                    onChange={handleInputChange}
                    disabled={isEnrollmentClosed}
                    required
                  />
                  {isEnrollmentClosed && (
                    <div
                      className="absolute top-0 right-0 mt-1 mr-1"
                      title="This field is locked because enrollment has been closed"
                    >
                      <svg
                        className="w-4 h-4 text-dark-red-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="w-1/2 relative">
                  <ModalTextField
                    label="Enrollment Close Date"
                    name="enrollmentCloseAt"
                    type="date"
                    value={formData.enrollmentCloseAt}
                    onChange={handleInputChange}
                    disabled={isEnrollmentClosed}
                    required
                  />
                  {isEnrollmentClosed && (
                    <div
                      className="absolute top-0 right-0 mt-1 mr-1"
                      title="This field is locked because enrollment has been closed"
                    >
                      <svg
                        className="w-4 h-4 text-dark-red-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {isEnrollmentClosed && (
                <p className="mt-1 text-xs text-gray-600">
                  Cannot modify enrollment dates after enrollment is closed
                </p>
              )}
            </div>

            {/* Academic Period Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Academic Period Dates
              </h3>
              <div className="flex flex-row justify-center items-start gap-4">
                <div className="w-1/2 relative">
                  <ModalTextField
                    label="Start Date"
                    name="startAt"
                    type="date"
                    value={formData.startAt}
                    onChange={handleInputChange}
                    disabled={isEnrollmentClosed}
                    required
                  />
                  {isEnrollmentClosed && (
                    <div
                      className="absolute top-0 right-0 mt-1 mr-1"
                      title="Cannot modify start date after enrollment closes"
                    >
                      <svg
                        className="w-4 h-4 text-dark-red-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="w-1/2">
                  <ModalTextField
                    label="End Date"
                    name="endAt"
                    type="date"
                    value={formData.endAt}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              {isEnrollmentClosed && (
                <p className="mt-1 text-xs text-gray-600">
                  Only end date can be edited after enrollment closes
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading || !hasChanges()}
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditAcademicPeriodModal;
