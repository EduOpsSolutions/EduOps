import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getCookieItem } from '../../../utils/jwt';
import axiosInstance from '../../../utils/axios';

const ResetPasswordModal = ({
  reset_password_modal,
  setResetPasswordModal,
  userId,
  userName,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async () => {
    // Show confirmation dialog with password format information
    const result = await Swal.fire({
      title: 'Reset Password to Default',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 10px;">
            You are about to reset the password for <strong>${userName}</strong> to the default password.
          </p>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 8px 0; font-size: 0.95rem; color: #856404;">
              <strong>Password Format:</strong>
            </p>
            <p style="margin: 8px 0; font-size: 0.95rem; color: #856404;">
              &lt;Last Name (no spaces)&gt;&lt;First Name (first 2 letters)&gt;&lt;Birth Year&gt;
            </p>
            <p style="margin: 8px 0; font-size: 0.85rem; color: #856404; font-style: italic;">
              All in lowercase
            </p>
          </div>
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 0.9rem; color: #155724;">
              <strong>Note:</strong> The user will receive an email with the password format (not the actual password) and will be required to change their password upon next login.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) {
      setResetPasswordModal(false);
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
        },
        config
      );

      if (response.status === 200) {
        await Swal.fire({
          title: 'Password Reset Successfully!',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p style="margin-bottom: 10px;">
                The password for <strong>${userName}</strong> has been reset to the default password.
              </p>
              <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 15px 0; border-radius: 4px;">
                <p style="margin: 8px 0; font-size: 0.9rem; color: #155724;">
                  An email has been sent to the user with the password format instructions.
                </p>
                <p style="margin: 8px 0; font-size: 0.9rem; color: #155724;">
                  The user will be required to change their password upon next login.
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#890E07',
        });
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

  const handleClose = () => {
    setResetPasswordModal(false);
  };

  // Auto-trigger reset password on modal open
  React.useEffect(() => {
    if (reset_password_modal && !isLoading) {
      // Call resetPassword but don't chain .then() on it
      resetPassword().catch((error) => {
        console.error('Error in resetPassword:', error);
        setResetPasswordModal(false);
      });
    }
  }, [reset_password_modal]);

  // This modal doesn't render anything visible since it immediately shows SweetAlert
  return null;
};

export default ResetPasswordModal;
