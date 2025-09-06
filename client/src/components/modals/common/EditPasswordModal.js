import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getCookieItem } from '../../../utils/jwt';
import axiosInstance from '../../../utils/axios';
import useAuthStore from '../../../stores/authStore';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const EditPasswordModal = ({
  edit_password_modal,
  setEditPasswordModal
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePassword = async () => {
    setError('');

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/auth/change-password`,
        {
          email: user.email,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }
      );
      if (response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Password changed successfully!',
          icon: 'success',
          confirmButtonColor: '#890E07',
        });
        // Clear the form and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setError('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setEditPasswordModal(false);
      } else {
        setError(response.data.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Something went wrong!', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        'Something went wrong!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return currentPassword || newPassword || confirmNewPassword;
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes that will be lost. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'No, Keep Editing',
        cancelButtonText: 'Yes, Discard Changes',
        confirmButtonColor: '#6b7280',
        cancelButtonColor: '#992525',
      }).then((result) => {
        if (result.isDismissed || result.dismiss === Swal.DismissReason.cancel) {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setError('');
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
          setEditPasswordModal(false);
        }
      });
    } else {
      setEditPasswordModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await changePassword();
  };

  if (!edit_password_modal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center">Change Password</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter current password"
                  required
                  className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <BsEye size={18} /> : <BsEyeSlash size={18} />}
                </button>
              </div>
            </div>

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
                  className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <BsEye size={18} /> : <BsEyeSlash size={18} />}
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
                  className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <BsEye size={18} /> : <BsEyeSlash size={18} />}
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
                    <span>Changing...</span>
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditPasswordModal;