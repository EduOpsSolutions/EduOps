import React from 'react';
import useCreateUserStore from '../../stores/createUserStore';
import ModalTextField from '../../components/form/ModalTextField';
import ModalSelectField from '../../components/form/ModalSelectField';
import SmallButton from '../../components/buttons/SmallButton';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function CreateUser() {
  const {
    formData,
    loading,
    error,
    handleInputChange,
    createUser,
    clearError,
  } = useCreateUserStore();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Confirm Registration',
      html: 'Are you sure all the information is accurate?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#890E07',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, register',
      cancelButtonText: 'No, review again',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const success = await createUser();
      if (success) {
        await Swal.fire({
          title: 'Success!',
          text: 'User has been registered successfully.',
          icon: 'success',
          confirmButtonColor: '#890E07',
        });
        // Redirect to the user management page
        navigate('/admin/account-management');
      }
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="bg_custom bg-white-yellow-tone">
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
        <div className="w-full max-w-3xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="italic mt-2 font-semibold">
              Items with asterisk (*) are required fields
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ModalTextField
                label="First Name*"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <ModalTextField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ModalTextField
                label="Last Name*"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />

              <ModalTextField
                label="Birthdate*"
                name="birthdate"
                type="date"
                value={formData.birthdate || ''}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <ModalSelectField
                label="Role*"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={roleOptions}
              />
              <ModalTextField
                label="Phone Number*"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+63 9xxxxxxxxxx"
                required
              />
            </div>

            <div className="mb-6">
              <ModalTextField
                label="E-mail*"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="johndoe@example.com"
                required
              />
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A default password will be automatically
                generated and sent to the user's email address upon account
                creation. The user will be required to change their password on
                first login.
              </p>
            </div>

            <div className="flex justify-center">
              <SmallButton type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Register'
                )}
              </SmallButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
