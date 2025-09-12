import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import Swal from 'sweetalert2';

const initialFormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  enrollment_id: '',
  email_address: '',
  phone_number: '',
  fee: '',
  amount: ''
};

const feesOptions = [
  { value: 'course_fee', label: 'Course Fee' },
  { value: 'book_fee', label: 'Book Fee' },
  { value: 'document_fee', label: 'Document Fee' }
];

const usePaymentStore = create((set, get) => ({
  formData: { ...initialFormData },
  loading: false,
  phoneError: '',
  error: null,
  feesOptions,

  updateFormField: (name, value) => {
    const { formData } = get();

    if (name === 'phone_number') {
      value = value.replace(/\D/g, '');
      set({ phoneError: '' });
    }

    set({
      formData: { ...formData, [name]: value }
    });
  },

  resetForm: () => {
    set({
      formData: { ...initialFormData },
      phoneError: '',
      error: null
    });
  },

  validateRequiredFields: () => {
    const { formData } = get();
    return formData.first_name && formData.last_name && formData.email_address && formData.fee && formData.amount;
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
    const { formData } = get();
    const selectedFee = feesOptions.find(option => option.value === formData.fee);
    const feeLabel = selectedFee ? selectedFee.label : formData.fee;

    return {
      firstName: formData.first_name,
      middleName: formData.middle_name || null,
      lastName: formData.last_name,
      email: formData.email_address.trim(),
      phoneNumber: formData.phone_number || null,
      amount: parseFloat(formData.amount),
      enrollmentId: formData.enrollment_id || undefined,
      feeType: feeLabel
    };
  },

  showMissingFieldsError: async () => {
    await Swal.fire({
      title: 'Missing Information',
      text: 'Please fill in all required fields (marked with *).',
      icon: 'warning',
      confirmButtonColor: '#890E07'
    });
  },

  showConfirmationDialog: async () => {
    const { formData } = get();
    const result = await Swal.fire({
      title: 'Confirm Payment',
      html: `
        <p>Are you sure you want to pay the amount of <strong>₱${formData.amount}</strong>?</p>
        <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.5rem;">A payment link will be sent to: <strong>${formData.email_address}</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, I\'m sure',
      cancelButtonText: 'Cancel'
    });
    return result.isConfirmed;
  },

  showSuccessAndOpenPayment: async (responseData) => {
    await Swal.fire({
      title: 'Payment Link Created!',
      html: `
        <p><strong>Payment ID:</strong> ${responseData.paymentId}</p>
        <p><strong>Amount:</strong> ₱${responseData.amount}</p>
        <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.75rem;">A payment link has been sent to your email address or you can click Pay Now to proceed.</p>
      `,
      icon: 'success',
      confirmButtonColor: '#890E07',
      confirmButtonText: 'Pay Now'
    });
    window.open(responseData.checkoutUrl, '_blank');
  },

  showErrorMessage: async (error) => {
    let errorMessage = error.response?.data?.message || 'Failed to create payment link. Please try again.';

    await Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#890E07'
    });
  },

  handleSubmit: async () => {
    const state = get();

    if (!state.validateRequiredFields()) {
      await state.showMissingFieldsError();
      return;
    }

    if (!state.validatePhoneNumber()) {
      return;
    }

    const confirmed = await state.showConfirmationDialog();
    if (!confirmed) return;

    set({ loading: true, error: null });

    try {
      const paymentData = state.preparePaymentData();
      const response = await axiosInstance.post('/payments', paymentData);

      if (response.data.success) {
        await state.showSuccessAndOpenPayment(response.data.data);
        state.resetForm();
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      await state.showErrorMessage(error);
      set({ error: error.message || 'Payment creation failed' });
    } finally {
      set({ loading: false });
    }
  }
}));

export default usePaymentStore;