import { create } from 'zustand';
import { guestUploadFile } from '../utils/files';
import Swal from 'sweetalert2';

const useEnrollmentStore = create((set, get) => ({
  enrollmentId: null,
  enrollmentStatus: 'Pending',
  remarkMsg: 'Please track your enrollment to view progress.',
  paymentProof: null,
  isUploadingPaymentProof: false,
  fullName: '',
  email: '',
  coursesToEnroll: '',
  createdAt: null,

  // Step tracking
  currentStep: 1,
  completedSteps: [],

  // Helper functions
  isStepCompleted: (stepNumber) => get().completedSteps.includes(stepNumber),
  isStepCurrent: (stepNumber) => stepNumber === get().currentStep,
  isStepPending: (stepNumber) =>
    !get().completedSteps.includes(stepNumber) &&
    stepNumber !== get().currentStep,

  // Set enrollment data from tracking
  setEnrollmentData: (data) => {
    set({
      enrollmentId: data.enrollmentId,
      enrollmentStatus: data.status,
      currentStep: data.currentStep,
      completedSteps: data.completedSteps,
      remarkMsg: data.remarkMsg,
      fullName: data.fullName,
      email: data.email,
      coursesToEnroll: data.coursesToEnroll,
      createdAt: data.createdAt,
    });
  },

  // Clear enrollment data
  clearEnrollmentData: () => {
    set({
      enrollmentId: null,
      enrollmentStatus: 'Pending',
      remarkMsg: 'Please track your enrollment to view progress.',
      fullName: '',
      email: '',
      coursesToEnroll: '',
      createdAt: null,
      currentStep: 1,
      completedSteps: [],
      paymentProof: null,
    });
  },

  advanceToNextStep: () => {
    const { currentStep } = get();

    if (currentStep >= 5) return;

    if (currentStep === 3 && !get().paymentProof) {
      alert('Please upload your proof of payment before proceeding.');
      return;
    }

    set((state) => ({
      completedSteps: [...state.completedSteps, currentStep],
      currentStep: currentStep + 1,

      ...(currentStep === 2
        ? {
            enrollmentStatus: 'VERIFIED',
            remarkMsg:
              'Your form has been verified by the administrator. Please proceed to payment.',
          }
        : {}),

      ...(currentStep === 3
        ? {
            enrollmentStatus: 'PAYMENT_PENDING',
            remarkMsg:
              'Your payment is being verified. This may take 1-2 business days.',
          }
        : {}),

      ...(currentStep === 4
        ? {
            enrollmentStatus: 'COMPLETED',
            remarkMsg: 'Congratulations! Your enrollment is complete.',
          }
        : {}),
    }));
  },

  // Fetch enrollment data - now using real data if available
  fetchEnrollmentData: async () => {
    const { enrollmentId } = get();
    
    // If no enrollment ID, don't fetch
    if (!enrollmentId) {
      console.log('No enrollment ID available for fetching data');
      return;
    }

    try {
      // This could be enhanced to re-fetch from API if needed
      console.log('Enrollment data already available in store');
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
    }
  },

  setPaymentProof: (file) => set({ paymentProof: file }),

  uploadPaymentProof: async () => {
    const { paymentProof, enrollmentId } = get();

    if (!paymentProof) return null;

    set({ isUploadingPaymentProof: true });

    try {
      const formData = new FormData();
      formData.append('category', 'PaymentProof');
      formData.append('enrollmentId', enrollmentId);

      const response = await guestUploadFile(paymentProof, 'payment-proofs');
      const url = response?.data?.downloadURL;
      formData.append('file', url);
      if (response.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to upload payment proof',
        });
        set({ isUploadingPaymentProof: false });
        return null;
      }

      set({ isUploadingPaymentProof: false });
      return url;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
      set({ isUploadingPaymentProof: false });
      return null;
    }
  },
}));

export default useEnrollmentStore;
