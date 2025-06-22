import { Flowbite, Modal } from 'flowbite-react';
import React, { useState } from 'react';
import GrayButton from '../../buttons/GrayButton';
import SmallButton from '../../buttons/SmallButton';
import LabelledInputField from '../../textFields/LabelledInputField';
import Swal from 'sweetalert2';
import { getCookieItem } from '../../../utils/jwt';
import axiosInstance from '../../../utils/axios';
import useAuthStore from '../../../stores/authStore';

// To customize measurements of header
const customModalTheme = {
  modal: {
    root: {
      base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity',
      show: {
        on: 'flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in',
        off: 'hidden ease-out',
      },
    },
    content: {
      base: 'relative h-full w-full p-4 md:h-auto',
      inner:
        'relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700',
    },
    body: {
      base: 'flex-1 overflow-auto px-6 pt-6 pb-2',
      popup: 'pt-0',
    },
    header: {
      base: 'flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600',
      popup: 'border-b-0 p-2',
      title: 'text-xl font-medium text-gray-900 dark:text-white',
      close: {
        base: 'ml-auto inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white',
        icon: 'h-5 w-5',
      },
    },
    footer: {
      base: 'flex items-center rounded-b',
    },
  },
};

function EditPasswordModal(props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const changePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all password fields',
        icon: 'error',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Swal.fire({
        title: 'Error',
        text: 'New password and confirm password do not match',
        icon: 'error',
      });
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
        `${process.env.REACT_APP_API_URL}/auth/change-password`,
        {
          email: user.email,
          oldPassword: currentPassword,
          newPassword: newPassword,
        },
        config
      );
      if (response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Password changed successfully!',
          icon: 'success',
        });
        // Clear the form and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        props.setEditPasswordModal(false);
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message || 'Something went wrong!',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Something went wrong!', error);
      Swal.fire({
        title: 'Error',
        text:
          error.response?.data?.message ||
          error.message ||
          'Something went wrong!',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Logic to handle cancel action
    props.setEditPasswordModal(false);
  };

  return (
    <Flowbite theme={{ theme: customModalTheme }}>
      <Modal
        dismissible
        show={props.edit_password_modal}
        size="md"
        onClose={() => props.setEditPasswordModal(false)}
        popup
        className="transition duration-150 ease-out -p-16"
      >
        <div className="py-4 flex flex-col bg-white-yellow-tone transition duration-150 ease-out">
          <Modal.Header className="z-10 transition ease-in-out duration-300" />
          <p className="font-bold -mt-10 mb-4 text-center text-2xl transition ease-in-out duration-300">
            Change Password
          </p>
          <Modal.Body>
            <LabelledInputField
              name="currentPassword"
              id="currentPassword"
              label="Old Password:"
              type="password"
              required={true}
              placeholder=""
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <LabelledInputField
              name="newPassword"
              id="newPassword"
              label="New Password:"
              type="password"
              required={true}
              placeholder=""
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <LabelledInputField
              name="confirmNewPassword"
              id="confirmNewPassword"
              label="Confirm Password:"
              type="password"
              required={true}
              placeholder=""
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <GrayButton className="w-1/2 md:w-auto" onClick={handleCancel}>
                Cancel
              </GrayButton>
              <SmallButton
                className="!w-1/2 md:w-auto"
                onClick={changePassword}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Confirm'}
              </SmallButton>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </Flowbite>
  );
}

export default EditPasswordModal;
