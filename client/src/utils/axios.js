import axios from 'axios';
import useAuthStore from '../stores/authStore';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5555/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }
    // Return the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);

export default axiosInstance;
