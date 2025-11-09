import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import UserNavbar from '../../components/navbars/UserNav';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const redirectToLogin = () => {
    window.location.href = '/login';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all password fields',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Passwords do not match!',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    if (formData.password.length < 6) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Password must be at least 6 characters long',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        {
          token: window.location.pathname.split('/').pop(),
          password: formData.password,
        }
      );

      if (response.status === 200) {
        await Swal.fire({
          title: 'Success',
          text: 'Password reset successful!',
          icon: 'success',
          confirmButtonColor: '#992525',
        });
        redirectToLogin();
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Password reset failed!',
          icon: 'error',
          confirmButtonColor: '#992525',
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Password reset failed!';
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-yellow-tone">
      <UserNavbar role="public" />
      <div className="pt-20 pb-8 min-h-screen flex flex-col items-center justify-start">
        <div className="w-full max-w-md px-6">
          <h1 className="text-3xl font-bold text-center text-dark-red mb-8">Reset Password</h1>

          <form
            className="bg-white shadow-md rounded-lg border border-dark-red p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-dark-red transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <BsEyeSlash className="w-5 h-5" />
                  ) : (
                    <BsEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-dark-red transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <BsEyeSlash className="w-5 h-5" />
                  ) : (
                    <BsEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-dark-red-2 hover:bg-german-red text-white font-semibold rounded-md transition-colors duration-150 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dark-red-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Resetting...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;