import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { getCookieItem } from '../utils/jwt';
import Swal from 'sweetalert2';

const useProfileStore = create((set, get) => ({
  profileImage: null,
  profileImagePreview: null,
  uploadingImage: false,
  hasChanges: false,
  resetKey: 0,

  setProfileImage: (file, previewUrl) => {
    set({
      profileImage: file,
      profileImagePreview: previewUrl,
      hasChanges: true,
    });
  },

  removeProfileImage: () => {
    set({
      profileImage: null,
      profileImagePreview: null,
      hasChanges: true,
    });
  },

  cancelChanges: () => {
    set(state => ({
      profileImage: null,
      profileImagePreview: null,
      hasChanges: false,
      resetKey: state.resetKey + 1, // Force component re-render
    }));
  },

  saveProfilePicture: async (user, setUser) => {
    const { profileImage, profileImagePreview } = get();

    const result = await Swal.fire({
      title: 'Save Profile Picture',
      text: 'Are you sure you want to save these changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      if (profileImage) {
        await get().uploadProfilePicture(profileImage, user, setUser);
      } else if (profileImagePreview === null && user.profilePicLink) {
        await get().removeProfilePictureFromServer(user, setUser);
      }
    }
  },

  uploadProfilePicture: async (file, user, setUser) => {
    if (!file) return;

    set({ uploadingImage: true });

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/users/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getCookieItem('token')}`,
          },
        }
      );

      if (response.data && response.data.profilePicLink) {
        const updatedUser = { ...user, profilePicLink: response.data.profilePicLink };
        setUser(updatedUser);

        set({
          profileImage: null,
          profileImagePreview: null,
          hasChanges: false,
        });

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile picture has been saved successfully!',
          confirmButtonColor: '#890E07',
        });

      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || 'Something went wrong! Failed to save profile picture.',
        confirmButtonColor: '#890E07',
      });
    } finally {
      set({ uploadingImage: false });
    }
  },

  removeProfilePictureFromServer: async (user, setUser) => {
    set({ uploadingImage: true });

    try {
      await axiosInstance.delete(
        `${process.env.REACT_APP_API_URL}/users/remove-profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${getCookieItem('token')}`,
          },
        }
      );

      const updatedUser = { ...user, profilePicLink: null };
      setUser(updatedUser);

      // Clear local states
      set({
        profileImage: null,
        profileImagePreview: null,
        hasChanges: false,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile picture has been removed successfully!',
        confirmButtonColor: '#890E07',
      });

    } catch (error) {
      console.error('Error removing profile picture:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || 'Something went wrong! Failed to remove profile picture.',
        confirmButtonColor: '#890E07',
      });
    } finally {
      set({ uploadingImage: false });
    }
  },

  resetState: () => {
    set({
      profileImage: null,
      profileImagePreview: null,
      uploadingImage: false,
      hasChanges: false,
      resetKey: 0,
    });
  },
}));

export default useProfileStore;