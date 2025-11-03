import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getCookieItem } from '../../../utils/jwt';
import axiosInstance from '../../../utils/axios';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const ResetPasswordModal = ({
  reset_password_modal,
  setResetPasswordModal,
  userId,
  userName,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPassword = async () => {
    setError('');

    // Validation
    if (!newPassword || !confirmNewPassword) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all password fields',
        icon: 'error',
        confirmButtonColor: '#890E07',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'New password and confirm password do not match',
        icon: 'error',
        confirmButtonColor: '#890E07',
      });
      return;
    }

    if (newPassword.length < 6) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'New password must be at least 6 characters long',
        icon: 'error',
        confirmButtonColor: '#890E07',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Reset Password',
      text: "Are you sure you want to reset this user's password?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsLoading(true);
      const token = getCookieItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/auth/admin-reset-password`,
        {
          id: userId,
          newPassword: newPassword,
        },
        config
      );

      if (response.status === 200) {
        await Swal.fire({
          title: 'Success!',
          text: 'Password has been reset successfully!',
          icon: 'success',
          confirmButtonColor: '#890E07',
        });
        setNewPassword('');
        setConfirmNewPassword('');
        setError('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setResetPasswordModal(false);
      } else {
        await Swal.fire({
          title: 'Error',
          text: response.data.message || 'Something went wrong!',
          icon: 'error',
          confirmButtonColor: '#890E07',
        });
      }
    } catch (error) {
      console.error('Something went wrong!', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong!';
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

  const hasChanges = () => {
    return newPassword || confirmNewPassword;
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes that will be lost. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'No, keep editing',
        cancelButtonText: 'Yes, discard changes',
        confirmButtonColor: '#992525',
        cancelButtonColor: '#6B7280',
      }).then((result) => {
        if (
          result.isDismissed ||
          result.dismiss === Swal.DismissReason.cancel
        ) {
          setNewPassword('');
          setConfirmNewPassword('');
          setError('');
          setShowNewPassword(false);
          setShowConfirmPassword(false);
          setResetPasswordModal(false);
        }
      });
    } else {
      setResetPasswordModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword();
  };

  if (!reset_password_modal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <button
                type="button"
                disabled={isLoading}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <BsEye size={18} />
                ) : (
                  <BsEyeSlash size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              <button
                type="button"
                disabled={isLoading}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <BsEye size={18} />
                ) : (
                  <BsEyeSlash size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
