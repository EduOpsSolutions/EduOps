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
  coursePrice: null, // coursePrice 
  // Step tracking
  currentStep: 2,
  completedSteps: [1],

  // Helper functions
  isStepCompleted: (stepNumber) => get().completedSteps.includes(stepNumber),
  isStepCurrent: (stepNumber) => stepNumber === get().currentStep,
  isStepPending: (stepNumber) =>
    !get().completedSteps.includes(stepNumber) &&
    stepNumber !== get().currentStep,

  setEnrollmentData: (data) => {
    let currentStep = data.currentStep || 2;
    let completedSteps = data.completedSteps || [1];

    if (currentStep >= 2 && !completedSteps.includes(1)) {
      completedSteps = [1, ...completedSteps];
    }

    set({
      enrollmentId: data.enrollmentId,
      enrollmentStatus: data.status,
      currentStep: currentStep,
      completedSteps: completedSteps,
      remarkMsg: data.remarkMsg,
      fullName: data.fullName,
      email: data.email,
      coursesToEnroll: data.coursesToEnroll,
      createdAt: data.createdAt,
      coursePrice: data.coursePrice, // Add course price to the store
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
      currentStep: 2,
      completedSteps: [1],
      paymentProof: null,
      coursePrice: null, 
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
            enrollmentStatus: 'Enrollment Form Verified',
            remarkMsg: `Please pay the amount of ${get().coursePrice} to proceed with your enrollment.`,
          }
        : {}),

      ...(currentStep === 3
        ? {
            enrollmentStatus: 'Pending',
            remarkMsg:
              'Your payment is being verified. This may take 1-2 business days.',
          }
        : {}),

      ...(currentStep === 4
        ? {
            enrollmentStatus: 'Completed',
            remarkMsg: 'Congratulations! Your enrollment is complete.',
          }
        : {}),
    }));
  },

  // Fetch enrollment data - now using real data if available
  fetchEnrollmentData: async () => {
    const { enrollmentId } = get();
    
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
