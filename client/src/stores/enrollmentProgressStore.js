import { create } from "zustand";
import { guestUploadFile } from "../utils/files";
import Swal from "sweetalert2";

const useEnrollmentStore = create((set, get) => ({
  enrollmentId: null,
  studentId: null,
  enrollmentStatus: "Pending",
  remarkMsg: "Please track your enrollment to view progress.",
  fullName: "",
  email: "",
  coursesToEnroll: "",
  courseName: null,
  coursePrice: null,
  createdAt: null,
  currentStep: 2,
  completedSteps: [1],
  paymentProof: null,
  hasPaymentProof: false,
  isUploadingPaymentProof: false,

  isStepCompleted: (stepNumber) => get().completedSteps.includes(stepNumber),
  isStepCurrent: (stepNumber) => stepNumber === get().currentStep,
  isStepPending: (stepNumber) =>
    !get().completedSteps.includes(stepNumber) &&
    stepNumber !== get().currentStep,

  setEnrollmentData: (data) => {
    const currentStep = data.currentStep || 2;
    const completedSteps =
      currentStep >= 2 && !data.completedSteps?.includes(1)
        ? [1, ...(data.completedSteps || [])]
        : data.completedSteps || [1];

    set({
      enrollmentId: data.enrollmentId,
      studentId: data.studentId,
      enrollmentStatus: data.status,
      currentStep,
      completedSteps,
      remarkMsg: data.remarkMsg,
      fullName: data.fullName,
      email: data.email,
      coursesToEnroll: data.coursesToEnroll,
      courseName: data.courseName,
      coursePrice: data.coursePrice,
      createdAt: data.createdAt,
      paymentProof: null,
      hasPaymentProof: !!data.paymentProofPath,
    });
  },

  clearEnrollmentData: () => {
    set({
      enrollmentId: null,
      studentId: null,
      enrollmentStatus: "Pending",
      remarkMsg: "Please track your enrollment to view progress.",
      fullName: "",
      email: "",
      coursesToEnroll: "",
      courseName: null,
      coursePrice: null,
      createdAt: null,
      currentStep: 2,
      completedSteps: [1],
      paymentProof: null,
      hasPaymentProof: false,
    });
  },

  fetchEnrollmentData: async () => {
    const { enrollmentId } = get();
    if (!enrollmentId) {
      console.log('No enrollment ID available for fetching data');
      return;
    }
    // Data is already available in store from tracking
    console.log('Enrollment data already available in store');
  },

  advanceToNextStep: () => {
    const { currentStep, paymentProof, hasPaymentProof, coursePrice } = get();

    if (currentStep >= 5) return;

    if (currentStep === 3 && !paymentProof && !hasPaymentProof) {
      alert('Please upload your proof of payment before proceeding.');
      return;
    }

    const statusUpdates = {
      2: {
        enrollmentStatus: 'Enrollment Form Verified',
        remarkMsg: `Please pay the Downpayment of ₱3000 or the full amount of ₱${coursePrice || 'TBA'} to proceed with your enrollment.`,
      },
      3: {
        enrollmentStatus: 'Payment Pending',
        remarkMsg: 'Your payment is being verified. This may take 1-2 business days.',
      },
      4: {
        enrollmentStatus: 'Completed',
        remarkMsg: 'Congratulations! Your enrollment is complete.',
      },
    };

    set((state) => ({
      completedSteps: [...state.completedSteps, currentStep],
      currentStep: currentStep + 1,
      ...statusUpdates[currentStep],
    }));
  },

  setPaymentProof: (file) => set({ paymentProof: file }),

  uploadPaymentProof: async () => {
    const { paymentProof, enrollmentId } = get();
    if (!paymentProof) return null;
    set({ isUploadingPaymentProof: true });

    try {
      const uploadResponse = await guestUploadFile(
        paymentProof,
        "payment-proofs"
      );
      const downloadURL = uploadResponse?.data?.downloadURL;

      if (uploadResponse.error || !downloadURL) {
        throw new Error("Failed to upload file to storage");
      }

      const apiUrl = process.env.REACT_APP_API_URL;
      const apiResponse = await fetch(
        `${apiUrl}/enrollment/payment-proof`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId, paymentProofPath: downloadURL }),
        }
      );

      const result = await apiResponse.json();
      if (!apiResponse.ok || result.error) {
        throw new Error(result.message || "Failed to update enrollment record");
      }

      set({ isUploadingPaymentProof: false, hasPaymentProof: true });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Payment proof uploaded successfully",
      });

      return downloadURL;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message || "Failed to upload payment proof",
      });
      set({ isUploadingPaymentProof: false });
      return null;
    }
  },
}));

export default useEnrollmentStore;
