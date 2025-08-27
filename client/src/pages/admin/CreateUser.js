import React, { useState } from 'react';
import useCreateUserStore from '../../stores/createUserStore';
import ModalTextField from '../../components/form/ModalTextField';
import ModalSelectField from '../../components/form/ModalSelectField';
import SmallButton from '../../components/buttons/SmallButton';
import { useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Swal from 'sweetalert2';

export default function CreateUser() {
    const {
        formData,
        loading,
        error,
        handleInputChange,
        createUser,
        clearError
    } = useCreateUserStore();

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            reverseButtons: true 
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
        { value: 'admin', label: 'Admin' }
    ];

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="bg_custom bg-white-yellow-tone">
            <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
                <div className="w-full max-w-3xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">

                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-3xl font-bold">Create Account</h1>
                        <p className="italic mt-2 font-semibold">Items with asterisk (*) are required fields</p>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Password*</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter password"
                                        required
                                        className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none"
                                        onClick={() => togglePasswordVisibility('password')}
                                    >
                                        {showPassword ? <BsEye size={18} /> : <BsEyeSlash size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Confirm Password*</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm password"
                                        required
                                        className="w-full border border-dark-red-2 rounded px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-dark-red-2 transition-colors duration-150 focus:outline-none"
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                    >
                                        {showConfirmPassword ? <BsEye size={18} /> : <BsEyeSlash size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <SmallButton
                                type="submit"
                                disabled={loading}
                            >
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