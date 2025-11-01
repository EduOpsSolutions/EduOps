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
          confirmButtonColor: '#992525',
          confirmButtonTextColor: '#ffffff',
        }).then((res) => res.isConfirmed && redirectToLogin());
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Password reset failed!',
          icon: 'error',
          confirmButtonColor: '#ff0000',
          confirmButtonTextColor: '#ffffff',
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          confirmButtonColor: '#ff0000',
          confirmButtonTextColor: '#ffffff',
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ff0000',
          confirmButtonTextColor: '#ffffff',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white-yellow-tone">
      <UserNavbar role="public" />
      <div className="pt-8 h-screen flex flex-col items-center justify-start bg-white-yellow md:min-w-[50vh] min-w-[30%] bg-white-yellow-tone">
        <p className="text-2xl font-bold">Reset Password</p>

      <form
        className="flex flex-col items-center w-5/6 my-2 md:w-[50%] lg:w-[30%]"
        onSubmit={handleSubmit}
      >
        <p className="self-start mt-5">New Password:</p>
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="border border-black pl-2 pr-10 py-1 h-10 mt-1 focus:outline-none w-full"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <BsEye /> : <BsEyeSlash />}
          </button>
        </div>

        <p className="self-start mt-3">Confirm Password:</p>
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="border border-black pl-2 pr-10 py-1 h-10 mt-1 focus:outline-none w-full"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
            onClick={(e) => {
              e.preventDefault();
              setShowConfirmPassword(!showConfirmPassword);
            }}
          >
            {showConfirmPassword ? <BsEye /> : <BsEyeSlash />}
          </button>
        </div>

        <button
          type="submit"
          className="text-white mt-5 w-32 h-10 self-center font-bold bg-dark-red-2 text-white-yellow hover:bg-german-red ease-in duration-150"
        >
          Confirm
        </button>
      </form>
      </div>
    </div>
  );
}

export default ResetPassword;
