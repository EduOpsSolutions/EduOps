import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Add your password reset logic here
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match!',
        icon: 'error',
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        {
          token: window.location.pathname.split('/').pop(),
          password: formData.password,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Password reset successful!',
          icon: 'success',
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Password reset failed!',
          icon: 'error',
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
      });
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
          className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"
        />

        <p className="self-start mt-3">Confirm Password:</p>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="border border-black pl-2 pr-4 py-1 h-10 mt-1 focus:outline-none w-full"
        />

        <button
          type="submit"
          className="text-white mt-5 w-32 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150"
        >
          Confirm
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
