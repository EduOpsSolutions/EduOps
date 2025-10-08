import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { getCookieItem } from '../utils/jwt';
import Swal from 'sweetalert2';

const useCreateUserStore = create((set, get) => ({
  formData: {
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    role: 'student',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  loading: false,
  error: null,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () =>
    set({
      formData: {
        firstName: '',
        middleName: '',
        lastName: '',
        birthdate: '',
        role: 'student',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      error: null,
    }),

  clearError: () => set({ error: null }),

  validateForm: () => {
    const { formData } = get();

    if (!formData.firstName) return 'First Name is required';
    if (!formData.lastName) return 'Last Name is required';
    if (!formData.email) return 'Email is required';
    if (!formData.phoneNumber) return 'Phone Number is required';
    if (!formData.password) return 'Password is required';
    if (formData.password !== formData.confirmPassword)
      return 'Passwords do not match';
    if (!formData.birthdate) return 'Birthdate is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return 'Please enter a valid email address';

    if (formData.password.length < 8)
      return 'Password must be at least 8 characters long';

    return null;
  },

  createUser: async () => {
    const { formData } = get();
    const validationError = get().validateForm();

    if (validationError) {
      set({ error: validationError });
      return;
    }

    const token = getCookieItem('token');

    set({ error: null, loading: true });

    try {
      const { confirmPassword, birthdate, ...userData } = formData;

      // Parse birthdate and extract month, date, year
      let birthmonth, birthdateNum, birthyear;
      if (birthdate) {
        const date = new Date(birthdate);
        birthmonth = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
        birthdateNum = date.getDate();
        birthyear = date.getFullYear();
      }

      const payload = {
        ...userData,
        birthmonth,
        birthdate: birthdateNum,
        birthyear,
      };

      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/users/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'User created successfully!',
      });

      get().resetForm();

      return response.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          'Failed to create user. Please try again.',
      });

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text:
          error.response?.data?.message ||
          `Something went wrong! ${error.message}`,
      });

      return null;
    } finally {
      set({ loading: false });
    }
  },

  handleInputChange: (e) => {
    const { name, value } = e.target;
    get().setFormData({ [name]: value });
  },
}));

export default useCreateUserStore;
