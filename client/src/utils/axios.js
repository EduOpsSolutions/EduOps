import axios from 'axios';
import useAuthStore from '../stores/authStore';
import { getCookieItem } from './jwt';
import Swal from 'sweetalert2';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5555/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to set Authorization header dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookieItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500 &&
      error.response.data.message.includes('Please login again.')
    ) {
      const { logout } = useAuthStore.getState();
      logout();
      Swal.fire({
        title: "You've been logged out",
        text: 'Please login again.',
        icon: 'error',
      });
    }
    // Return the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);

export default axiosInstance;
