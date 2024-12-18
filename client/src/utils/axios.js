import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5555/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance; 