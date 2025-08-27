import { create } from 'zustand';

const useEnrollmentStore = create((set, get) => ({
  enrollmentId: "E2024082002",
  enrollmentStatus: "Pending",
  remarkMsg: "Your enrollment form has been submitted and is pending verification by an administrator.",
  paymentProof: null,

  // Step tracking
  currentStep: 2,
  completedSteps: [1],

  // Helper functions
  isStepCompleted: (stepNumber) => get().completedSteps.includes(stepNumber),
  isStepCurrent: (stepNumber) => stepNumber === get().currentStep,
  isStepPending: (stepNumber) => !get().completedSteps.includes(stepNumber) && stepNumber !== get().currentStep,

  advanceToNextStep: () => {
    const { currentStep } = get();

    if (currentStep >= 5) return;

    if (currentStep === 3 && !get().paymentProof) {
      alert("Please upload your proof of payment before proceeding.");
      return;
    }

    set(state => ({
      completedSteps: [...state.completedSteps, currentStep],
      currentStep: currentStep + 1,

      ...(currentStep === 2 ? {
        enrollmentStatus: "Pending",
        remarkMsg: "Your form has been verified by the administrator. Please proceed to payment."
      } : {}),

      ...(currentStep === 3 ? {
        enrollmentStatus: "Pending",
        remarkMsg: "Your payment is being verified. This may take 1-2 business days."
      } : {}),

      ...(currentStep === 4 ? {
        enrollmentStatus: "Completed",
        remarkMsg: "Congratulations! Your enrollment is complete."
      } : {})
    }));
  },

  // Fetch enrollment data 
  fetchEnrollmentData: async () => {
    try {
      // Simulate API response
      const data = {
        enrollment_id: get().enrollmentId,
        status: "Pending",
        current_step: 2,
        completed_steps: [1],
        remarks: "Your enrollment form has been submitted and is pending verification by an administrator."
      };

      set({
        enrollmentId: data.enrollment_id,
        enrollmentStatus: data.status,
        currentStep: data.current_step,
        completedSteps: data.completed_steps,
        remarkMsg: data.remarks
      });

    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    }
  },

  setPaymentProof: (file) => set({ paymentProof: file }),

  uploadPaymentProof: async () => {
    const { paymentProof, enrollmentId } = get();

    if (!paymentProof) return false;

    try {
      const formData = new FormData();
      formData.append('file', paymentProof);
      formData.append('category', 'PaymentProof');
      formData.append('enrollmentId', enrollmentId);

      console.log("Uploading payment proof:", paymentProof.name);

      return true;

    } catch (error) {
      console.error("Error uploading payment proof:", error);
      return false;
    }
  }
}));

export default useEnrollmentStore;