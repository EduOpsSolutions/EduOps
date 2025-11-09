import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { getCookieItem } from '../utils/jwt';
import Swal from 'sweetalert2';

const useUserAccountStore = create((set, get) => ({
  data: [],
  loading: true,
  loadingSave: false,
  error: null,
  search: '',
  role: '',
  page: 1,
  itemsPerPage: 10,
  selectedUser: null,
  showUserAccountDetailsModal: false,
  stats: {
    total: 0,
    admins: 0,
    teachers: 0,
    students: 0,
    active: 0,
    inactive: 0,
  },

  setSearch: (search) => set({ search }),
  setRole: (role) => set({ role }),
  setPage: (page) => set({ page }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setShowUserAccountDetailsModal: (show) =>
    set({ showUserAccountDetailsModal: show }),
  clearError: () => set({ error: null }),

  fetchData: async () => {
    const token = getCookieItem('token');
    const { search, role, page, itemsPerPage } = get();

    set({ error: null, loading: true });

    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: search || undefined,
            role: role || undefined,
            page,
            take: itemsPerPage,
          },
        }
      );

      const users = response.data.data || [];
      const stats = {
        total: response.data.max_result || 0,
        admins: users.filter((user) => user.role === 'admin').length,
        teachers: users.filter((user) => user.role === 'teacher').length,
        students: users.filter((user) => user.role === 'student').length,
        active: users.filter((user) => user.status === 'active').length,
        inactive: users.filter((user) => user.status !== 'active').length,
      };

      set({ data: response.data, stats });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load user data',
      });
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text:
          error.response?.data?.message ||
          `Something went wrong! ${error.message}`,
      });
    } finally {
      set({ loading: false });
    }
  },

  handleSave: async (selectedUser) => {
    const token = getCookieItem('token');
    set({ error: null, loadingSave: true });

    try {
      // build payload excluding password-related fields
      const {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        birthyear,
        birthmonth,
        birthdate,
        status,
        deletedAt,
        profilePicLink,
        role,
      } = selectedUser || {};
      const payload = {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        birthyear,
        birthmonth,
        birthdate,
        status,
        deletedAt,
        profilePicLink,
        role,
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });
      console.log('selecteduser', selectedUser);
      console.log('payload', payload);

      const response = await axiosInstance.put(
        `${process.env.REACT_APP_API_URL}/users/${selectedUser.id}`,
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
        text: response.data.message,
      });

      get().fetchData();
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          'An error occurred while saving user data',
      });
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text:
          error.response?.data?.message ||
          `Something went wrong! ${error.message}`,
      });
    } finally {
      set({ loadingSave: false });
    }
  },

  uploadProfilePicture: async (userId, imageFile) => {
    const token = getCookieItem('token');

    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      formData.append('userId', userId);

      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/users/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  handleSearch: () => {
    set({ page: 1 });
    get().fetchData();
  },

  openUserModal: (user) => {
    set({ selectedUser: user, showUserAccountDetailsModal: true });
  },

  closeUserModal: () => {
    set({ showUserAccountDetailsModal: false });
  },
}));

export default useUserAccountStore;
