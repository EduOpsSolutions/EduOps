import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";

const UpdateLedgerModal = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    typeOfFee: "",
    orNumber: "",
    debitAmount: "",
    creditAmount: "",
    balance: "",
    remarks: "",
    courseId: "",
    academicPeriodId: "",
  });

  const [enrollments, setEnrollments] = useState([]);
  useEffect(() => {
    if (isOpen && student) {
      const tryFetch = async (sid, label) => {
        if (!sid) return false;
        try {
          const res = await axiosInstance.get(`/enrollment/${sid}/enrollments`);
          const data = res.data || [];
          setEnrollments(data);
          if (data.length === 1) {
            const e = data[0];
            setFormData(prev => ({
              ...prev,
              courseId: e.courseId || e.course_id || e.id || "",
              academicPeriodId: e.batchId || e.batch_id || e.periodId || e.period_id || "",
            }));
          } else {
            setFormData(prev => ({ ...prev, courseId: "", academicPeriodId: "" }));
          }
          return true;
        } catch (err) {
          console.error(`[UpdateLedgerModal] Error fetching enrollments for ${label}:`, err);
          return false;
        }
      };
      (async () => {
        let found = false;
        if (student.id) found = await tryFetch(student.id, 'student.id');
        if (!found && student.studentId) found = await tryFetch(student.studentId, 'student.studentId');
        if (!found) {
          setEnrollments([]);
          setFormData(prev => ({ ...prev, courseId: "", academicPeriodId: "" }));
        }
      })();
    } else if (!isOpen) {
      setEnrollments([]);
      setFormData(prev => ({ ...prev, courseId: "", academicPeriodId: "" }));
    }
  }, [isOpen, student]);

  useEffect(() => {
    if (isOpen) {
      // console.log('[UpdateLedgerModal] enrollments state:', enrollments);
      // console.log('[UpdateLedgerModal] formData:', formData);
      //console.log('[UpdateLedgerModal] Modal opened. Student:', student);
    }
  }, [isOpen, enrollments, formData, student]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        typeOfFee: "",
        orNumber: "",
        debitAmount: "",
        creditAmount: "",
        balance: "",
        remarks: "",
        courseId: "",
        academicPeriodId: "",
      });
      setError("");
    }
  }, [isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "courseBatch") {
      const [courseId, academicPeriodId] = value.split("|");
      setFormData((prev) => ({
        ...prev,
        courseId: courseId || "",
        academicPeriodId: academicPeriodId || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        ...formData,
        studentId: student.userId,
        userId: student.studentId,
        isDebitDisabled,
        isCreditDisabled
      });
      await Swal.fire({
        icon: 'success',
        title: 'Ledger Updated',
        text: 'The ledger was updated successfully!',
        confirmButtonColor: '#992525'
      });
      onClose();
    } catch (error) {
      let errorMsg = error.message || "Failed to update ledger. Please try again.";
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMsg,
        confirmButtonColor: '#992525'
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.values(formData).some((value) => value.trim() !== "");
  };

  const handleClose = async () => {
    if (hasChanges()) {
      const result = await Swal.fire({
        title: 'Discard Changes?',
        text: 'You have unsaved changes. Are you sure you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Discard',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });
      if (result.isConfirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const feeTypeOptions = [
    { value: "", label: "Select fee type" },
    { value: "down_payment", label: "Down Payment" },
    { value: "tuition_fee", label: "Tuition Fee" },
    { value: "document_fee", label: "Document Fee" },
    { value: "book_fee", label: "Book Fee" },
    { value: "fee", label: "Additional Fee" },
    { value: "discount", label: "Discount" },
  ];

  const disableDebitForTypes = ["down_payment", "tuition_fee", "document_fee", "book_fee"];
  const isDebitDisabled = disableDebitForTypes.includes(formData.typeOfFee);
  const disableCreditForTypes = ["fee", "discount"];
  const isCreditDisabled = disableCreditForTypes.includes(formData.typeOfFee);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
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

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Student Info */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Course-Batch Dropdown */}
            <ModalSelectField
              label="Course & Batch"
              name="courseBatch"
              value={formData.courseId && formData.academicPeriodId ? `${formData.courseId}|${formData.academicPeriodId}` : ""}
              onChange={handleChange}
              options={[
                { value: '', label: enrollments.length === 0 ? 'No enrollments found' : 'Select course & batch' },
                ...enrollments.map(e => ({
                  value: `${e.courseId || e.course_id || e.id}|${e.batchId || e.batch_id || e.periodId || e.period_id}`,
                  label: `${e.course || e.courseName || e.name} - ${e.batch || e.batchName}${e.year ? ` (${e.year})` : ''}`
                }))
              ]}
              required
            />

            {/* Type of Fee */}
            <ModalSelectField
              label="Type of Fee"
              name="typeOfFee"
              value={formData.typeOfFee}
              onChange={handleChange}
              options={feeTypeOptions}
              required
            />

            {/* O.R. Number */}
            <ModalTextField
              label="O.R. Number"
              name="orNumber"
              value={formData.orNumber}
              onChange={handleChange}
              placeholder="Enter O.R. Number"
              disabled={isCreditDisabled}
            />

            {/* Debit and Credit Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Debit Amount */}
              <ModalTextField
                label="Debit Amount"
                name="debitAmount"
                type="number"
                step="0.01"
                value={formData.debitAmount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={isDebitDisabled}
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>

              {/* Credit Amount */}
              <ModalTextField
                label="Credit Amount"
                name="creditAmount"
                type="number"
                step="0.01"
                value={formData.creditAmount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={isCreditDisabled}
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>
            </div>

            {/* Remarks */}
            <ModalTextField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks (optional)"
              isTextArea={true}
              rows={4}
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

    </>
  );
};

export default UpdateLedgerModal;