import { create } from "zustand";
import axiosInstance from "../utils/axios";
import Swal from "sweetalert2";

const initialFormData = {
  student_id: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  email_address: '',
  phone_number: '',
  fee: '',
  amount: '',
};

const usePaymentStore = create((set, get) => ({
  formData: { ...initialFormData },
  loading: false,
  phoneError: '',
  nameError: '',
  studentData: null,
  feesOptions: [
    { value: 'down_payment', label: 'Down Payment' },
    { value: 'tuition_fee', label: 'Tuition Fee' },
    { value: 'document_fee', label: 'Document Fee' },
    { value: 'book_fee', label: 'Book Fee' },
  ],

  updateFormField: (name, value) => {
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    }));
    
    if (name === 'first_name' || name === 'last_name' || name === 'student_id') {
      set({ nameError: '' });
    }
  },

  validateAndFetchStudentByID: async (studentId) => {
    if (!studentId) {
      set({ 
        nameError: 'Student ID is required',
        formData: { ...get().formData, first_name: '', middle_name: '', last_name: '' }
      });
      return false;
    }

    try {
      const response = await axiosInstance.get(`/users/get-student-by-id/${studentId}`);
      const data = response.data;

      if (data.error || !data.success) {
        set({ 
          nameError: data.message || 'Student ID not found. Please verify the Student ID.',
          formData: { ...get().formData, first_name: '', middle_name: '', last_name: '' }
        });
        return false;
      }

      if (data.data) {
        set((state) => ({
          formData: {
            ...state.formData,
            first_name: data.data.firstName || '',
            middle_name: data.data.middleName || '',
            last_name: data.data.lastName || '',
          },
          nameError: '',
          studentData: data.data, 
        }));
      }

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to find student. Please verify the Student ID.';
      set({ 
        nameError: errorMessage,
        formData: { ...get().formData, first_name: '', middle_name: '', last_name: '' }
      });
      return false;
    }
  },

  resetForm: () => {
    set({
      formData: { ...initialFormData },
      phoneError: '',
      nameError: '',
      studentData: null,
    });
  },

  validateRequiredFields: () => {
    const { formData } = get();
    return formData.student_id && formData.first_name && formData.last_name && 
           formData.email_address && formData.fee && formData.amount;
  },

  validatePhoneNumber: () => {
    const { formData } = get();
    if (formData.phone_number && formData.phone_number.length < 11) {
      set({ phoneError: 'Phone number must be at least 11 digits long.' });
      return false;
    }
    set({ phoneError: '' });
    return true;
  },

  preparePaymentData: () => {
    const { formData, studentData } = get();
    return {
      userId: studentData?.id || null,
      studentId: studentData?.userId || null, 
      firstName: formData.first_name,
      middleName: formData.middle_name || null,
      lastName: formData.last_name,
      email: formData.email_address,
      phoneNumber: formData.phone_number || null,
      amount: parseFloat(formData.amount),
      feeType: formData.fee,
    };
  },

  showDialog: async (config) => {
    return await Swal.fire(config);
  },

  handleSubmit: async () => {
    const store = get();

    // Validate required fields
    if (!store.validateRequiredFields()) {
      await store.showDialog({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please fill in all required fields before submitting.",
        confirmButtonColor: "#b71c1c",
      });
      return;
    }

    // Validate phone number
    if (!store.validatePhoneNumber()) return;

    // Show confirmation
    const result = await store.showDialog({
      title: 'Confirm Payment',
      html: `
        <p>Are you sure you want to pay <strong>₱${store.formData.amount}</strong>?</p>
        <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.5rem;">
          Payment link will be sent to: <strong>${store.formData.email_address}</strong>
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, I\'m sure',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    set({ loading: true });

    try {
      const paymentData = store.preparePaymentData();
      const response = await axiosInstance.post('/payments/send-email', paymentData);
      const { paymentId } = response.data.data;

      const checkoutUrl = `${window.location.origin}/payment?paymentId=${paymentId}`;

      await store.showDialog({
        title: 'Payment Link Created!',
        html: `
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Amount:</strong> ₱${paymentData.amount}</p>
          <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.75rem;">
            Payment link sent to your email or click Pay Now to proceed.
          </p>
        `,
        icon: 'success',
        confirmButtonColor: '#890E07',
        confirmButtonText: 'Pay Now'
      });

      if (checkoutUrl) window.open(checkoutUrl, "_blank");
      store.resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
      await store.showDialog({
        icon: "error",
        title: "Payment Failed",
        text: errorMessage,
        confirmButtonColor: "#b71c1c",
      });
    } finally {
      set({ loading: false });
    }
  },

  sendPaymentLinkEmail: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments/send-email', paymentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send payment link email'
      };
    }
  },
}));

export default usePaymentStore;