import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCookieItem, setTokenCookie, removeTokenCookie } from '../utils/jwt';
import { logout as logoutUtil } from '../utils/auth';
import axios from '../utils/axios';
import { decodeToken } from '../utils/jwt';

// User interface based on the database schema and API responses
// const userInterface = {
//   id: '',
//   userId: '',
//   firstName: '',
//   middleName: '',
//   lastName: '',
//   email: '',
//   role: 'student', // default role
//   status: '',
//   profilePicLink: '',
//   birthmonth: 0,
//   birthdate: 0,
//   birthyear: 0,
//   firstLogin: true,
//   createdAt: '',
//   updatedAt: '',
// };

// Auth store interface
// const authStoreInterface = {
//   // State
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,

//   // Actions
//   login: async (email, password) => {},
//   logout: () => {},
//   register: async (userData) => {},
//   updateProfile: async (userData) => {},
//   changePassword: async (currentPassword, newPassword) => {},
//   forgotPassword: async (email) => {},
//   resetPassword: async (token, newPassword) => {},
//   refreshToken: async () => {},
//   clearError: () => {},
//   setUser: (user) => {},
//   setToken: (token) => {},
//   checkAuth: () => {},
//   getUser: () => {},
//   getUserFullName: () => {},
//   hasRole: (role) => {},
//   hasAnyRole: (roles) => {},
//   isAdmin: () => {},
//   isTeacher: () => {},
//   isStudent: () => {},
//   getToken: () => {},
// };

// Create the auth store
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/login`,
            {
              email,
              password,
            }
          );
          console.log('Login response:', response);

          if (response?.status === 200) {
            const { token: tokenData } = response.data;
            const token = tokenData.token || tokenData;

            // Store token in cookies and localStorage
            await setTokenCookie(token);

            // Update store state
            set({
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Get the updated state after setting
            const decodedToken = await decodeToken(token);
            set({ user: decodedToken.data });
            console.log('Current user from store:', get().user);

            return { success: true };
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Get token action
      getToken: () => {
        const token = get().token;
        return token;
      },

      // Get user action
      getUser: () => {
        const user = get().user;
        console.log('Current user from store:', user);
        return user;
      },

      // Logout action
      logout: () => {
        // Clear cookies and localStorage
        logoutUtil();
        removeTokenCookie('token');
        removeTokenCookie('user');

        // Clear store state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/register`,
            userData
          );

          if (response.status === 201 || response.status === 200) {
            set({ isLoading: false });
            return { success: true, message: 'Registration successful' };
          } else {
            throw new Error(response.data.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      // Update profile action
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/users/profile`,
            userData
          );

          if (response.status === 200) {
            const updatedUser = response.data.data || response.data;
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            });
            return { success: true, user: updatedUser };
          } else {
            throw new Error(response.data.message || 'Profile update failed');
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      // Change password action
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/users/change-password`,
            {
              currentPassword,
              newPassword,
            }
          );

          if (response.status === 200) {
            set({ isLoading: false });
            return { success: true, message: 'Password changed successfully' };
          } else {
            throw new Error(response.data.message || 'Password change failed');
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Password change failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      // Forgot password action
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
            { email }
          );

          if (response.status === 200) {
            set({ isLoading: false });
            return { success: true, message: 'Password reset email sent' };
          } else {
            throw new Error(
              response.data.message || 'Failed to send reset email'
            );
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to send reset email';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      // Reset password action
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/reset-password`,
            {
              token,
              newPassword,
            }
          );

          if (response.status === 200) {
            set({ isLoading: false });
            return { success: true, message: 'Password reset successful' };
          } else {
            throw new Error(response.data.message || 'Password reset failed');
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Password reset failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      // Refresh token action
      refreshToken: async () => {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh-token`
          );

          if (response.status === 200) {
            const { token: newToken } = response.data;
            await setTokenCookie(newToken);

            set({
              token: newToken,
              error: null,
            });

            return { success: true, token: newToken };
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw new Error('Token refresh failed');
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Set user action
      setUser: (user) => {
        set({ user });
      },

      // Set token action
      setToken: (token) => {
        set({ token });
      },

      // Check authentication status
      checkAuth: () => {
        const token = getCookieItem('token');
        const user = getCookieItem('user');

        if (token && user) {
          try {
            const userData = JSON.parse(user);
            set({
              user: userData,
              token,
              isAuthenticated: true,
            });
            return true;
          } catch (error) {
            console.error('Error parsing user data:', error);
            get().logout();
            return false;
          }
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // Get user full name
      getUserFullName: () => {
        const { user } = get();
        if (!user) return '';

        const { firstName, middleName, lastName } = user;
        const nameParts = [firstName];

        if (middleName) nameParts.push(middleName);
        if (lastName) nameParts.push(lastName);

        return nameParts.join(' ');
      },

      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      // Check if user is admin
      isAdmin: () => {
        return get().hasRole('admin');
      },

      // Check if user is teacher
      isTeacher: () => {
        return get().hasRole('teacher');
      },

      // Check if user is student
      isStudent: () => {
        return get().hasRole('student');
      },
    }),
    {
      name: 'eduops-auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
