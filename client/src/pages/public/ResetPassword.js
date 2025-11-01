import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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
        confirmButtonColor: '#890E07',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Passwords do not match!',
        icon: 'error',
        confirmButtonColor: '#890E07',
      });
      return;
    }

    if (formData.password.length < 6) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Password must be at least 6 characters long',
        icon: 'error',
        confirmButtonColor: '#890E07',
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
          confirmButtonColor: '#890E07',
        });
        redirectToLogin();
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Password reset failed!',
          icon: 'error',
          confirmButtonColor: '#890E07',
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
        confirmButtonColor: '#890E07',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-8 h-screen flex flex-col items-center justify-start bg-white-yellow md:min-w-[50vh] min-w-[30%] bg-white-yellow-tone">
      <p className="text-2xl font-bold">Reset Password</p>

      <form
        className="flex flex-col items-center w-5/6 my-2 md:w-[50%] lg:w-[30%]"
        onSubmit={handleSubmit}
      >
        <p className="self-start mt-5">New Password:</p>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <p className="self-start mt-3">Confirm Password:</p>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isLoading}
          className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="text-white mt-5 w-auto px-6 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dark-red-2 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Resetting...</span>
            </>
          ) : (
            'Confirm'
          )}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;