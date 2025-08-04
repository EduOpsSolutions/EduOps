import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios';
import Swal from 'sweetalert2';
import { getCookieItem } from '../../../utils/jwt';
import ModalTextField from '../../form/ModalTextField';
import ModalSelectField from '../../form/ModalSelectField';

export default function UserAccountDetailsModal({
  data,
  show,
  handleClose,
  handleSave,
  loadingSave,
}) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status' && value === 'deleted') {
      setFormData({
        ...formData,
        [name]: value,
        deletedAt: new Date(),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleResetPassword = () => {
    Swal.fire({
      title: 'Reset Account Password',
      text: 'Are you sure you want to reset the account password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance.post(
            `/auth/admin-reset-password`,
            {
              id: formData.id,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookieItem('token')}`,
              },
            }
          );
          Swal.fire({
            title: 'Password Reset',
            text: response.message,
            icon: 'success',
            confirmButtonColor: '#dc2626',
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error',
            text: error.response.data.message || 'An error occurred',
            icon: 'error',
            confirmButtonColor: '#dc2626',
          });
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'student':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white-yellow-tone rounded-lg p-4 sm:p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">User Account Details</h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={handleClose}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-dark-red-2 flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-lg font-bold text-white">
                {getUserInitials(formData?.firstName, formData?.lastName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {formData?.firstName}{formData?.middleName ? ` ${formData.middleName}` : ''} {formData?.lastName}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 truncate">{formData?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(formData?.role)}`}>
                  {formData?.role?.charAt(0).toUpperCase() + formData?.role?.slice(1)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(formData?.status)}`}>
                  {formData?.status?.charAt(0).toUpperCase() + formData?.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Edit Information Form */}
          <div className="xl:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Edit Information</h3>
            <div className="space-y-4">
          
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalTextField
                  label="First Name"
                  name="firstName"
                  value={formData?.firstName || ''}
                  onChange={handleInputChange}
                  required
                />
                <ModalTextField
                  label="Last Name"
                  name="lastName"
                  value={formData?.lastName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalTextField
                  label="Middle Name"
                  name="middleName"
                  value={formData?.middleName || ''}
                  onChange={handleInputChange}
                />
                <ModalTextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalSelectField
                  label="Account Status"
                  name="status"
                  value={formData?.status || 'active'}
                  onChange={handleInputChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'disabled', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'deleted', label: 'Deleted' }
                  ]}
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="w-full bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded border border-dark-red-2 ease-in duration-150 text-sm sm:text-base"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
           <div className="xl:col-span-1">
             <h3 className="text-lg font-semibold mb-4">Account Information</h3>
             <div className="space-y-3">
               <div className="bg-gray-50 rounded p-3 border border-gray-200">
                 <label className="text-sm font-medium text-gray-600">User ID</label>
                 <p className="text-xs sm:text-sm font-mono break-all">{formData?.id}</p>
               </div>
               <div className="bg-gray-50 rounded p-3 border border-gray-200">
                 <label className="text-sm font-medium text-gray-600">Created</label>
                 <p className="text-xs sm:text-sm break-words">{formatDate(formData?.createdAt)}</p>
               </div>
               <div className="bg-gray-50 rounded p-3 border border-gray-200">
                 <label className="text-sm font-medium text-gray-600">Updated</label>
                 <p className="text-xs sm:text-sm break-words">{formatDate(formData?.updatedAt)}</p>
               </div>
               {formData?.deletedAt && (
                 <div className="bg-red-50 rounded p-3 border border-red-200">
                   <label className="text-sm font-medium text-red-600">Deleted</label>
                   <p className="text-xs sm:text-sm text-red-700 break-words">{formatDate(formData?.deletedAt)}</p>
                 </div>
               )}
             </div>
           </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => handleSave(formData)}
            disabled={loadingSave}
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSave ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}