import axios from "axios";
import useAuthStore from "../stores/authStore";
import { getCookieItem, isTokenExpired } from "./jwt";
import Swal from "sweetalert2";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "NOT SET",
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("AXIOS INSTANCE", process.env.REACT_APP_API_URL);

// Add request interceptor to set Authorization header dynamically and check token validity
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("loggingin");
    const token = getCookieItem("token");

    // Check if token exists and is valid
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, logout user without auto-redirect
        const { logout } = useAuthStore.getState();
        logout(false);

        // Show expiration message
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          icon: "warning",
          timer: 5000,
          allowOutsideClick: false,
          showConfirmButton: false,
        }).then((res) => {
          // Navigate to login page
          window.location.href = "/login";
        });

        // Reject the request
        return Promise.reject(new Error("Token expired"));
      }

      // Token is valid, add to headers
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
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
    // Handle 401 unauthorized or 403 forbidden errors (expired/invalid token)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const errorMessage = error.response.data?.message || "";

      // Check if it's a token-related error
      const isTokenError =
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("login");

      // Only logout and show alert for token-related errors
      // This prevents logout for other 403 errors (like insufficient permissions)
      if (isTokenError || error.response.status === 401) {
        const { logout, isAuthenticated } = useAuthStore.getState();

        // Only show alert and logout if user was authenticated
        if (isAuthenticated) {
          logout();
          Swal.fire({
            title: "Session Expired",
            text: "Your session has expired. Please login again.",
            icon: "warning",
            confirmButtonColor: "#992525",
          }).then(() => {
            // Redirect to login page
            window.location.href = "/login";
          });
        }
      }
    }
    // Return the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);

export default axiosInstance;
