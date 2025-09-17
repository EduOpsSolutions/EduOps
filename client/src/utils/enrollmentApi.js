import axiosInstance from './axios';

// Track enrollment by ID and/or email
export const trackEnrollment = async (enrollmentId, email) => {
  try {
    const response = await axiosInstance.post('/enrollment/track', {
      enrollmentId: enrollmentId || null,
      email: email || null,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error', error: true };
  }
};

// Create enrollment request
export const createEnrollmentRequest = async (enrollmentData) => {
  try {
    const response = await axiosInstance.post('/enrollment/enroll', enrollmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error', error: true };
  }
};
