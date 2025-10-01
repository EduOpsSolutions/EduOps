import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { getCookieItem, isTokenExpired } from './jwt';
import Swal from 'sweetalert2';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5555/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to set Authorization header dynamically and check token validity
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookieItem('token');

    // Check if token exists and is valid
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, logout user without auto-redirect
        const { logout } = useAuthStore.getState();
        logout(false);

        // Show expiration message
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          icon: 'warning',
          timer: 5000,
          allowOutsideClick: false,
          showConfirmButton: false,
        }).then((res) => {
          // Navigate to login page
          window.location.href = '/login';
        });

        // Reject the request
        return Promise.reject(new Error('Token expired'));
      }

      // Token is valid, add to headers
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle authentication errors (401 Unauthorized, 403 Forbidden)
    if (error.response) {
      const { status, data } = error.response;

      // Check for authentication/authorization errors
      const isAuthError = status === 401 || status === 403;
      const hasAuthMessage =
        data?.message &&
        (data.message.includes('Please login again') ||
          data.message.includes('Invalid or expired token') ||
          data.message.includes('Session expired') ||
          data.message.includes('Unauthorized') ||
          data.message.includes('Invalid token'));

      if (isAuthError || hasAuthMessage) {
        const { logout } = useAuthStore.getState();
        logout(false);

        // Show user-friendly message
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          icon: 'warning',
          timer: 5000,
          showConfirmButton: false,
          allowOutsideClick: false,
        }).then(() => {
          // Navigate to login page
          window.location.href = '/login';
        });

        // Don't return the error for auth failures to prevent further processing
        return Promise.resolve({
          data: { error: true, message: 'Session expired' },
        });
      }
    }

    // Return the error for non-auth related issues
    return Promise.reject(error);
  }
);

export default axiosInstance;
