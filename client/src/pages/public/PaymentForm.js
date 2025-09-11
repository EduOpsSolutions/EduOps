import React, { useState } from 'react';
import SmallButton from '../../components/buttons/SmallButton';
import UserNavbar from '../../components/navbars/UserNav';
import LabelledInputField from '../../components/textFields/LabelledInputField';
import SelectField from '../../components/textFields/SelectField';
import axiosInstance from '../../utils/axios';
import Swal from 'sweetalert2';

function PaymentForm() {
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email_address: '',
        phone_number: '',
        fee: '',
        amount: ''
    });

    // Fee options for the dropdown
    const feesOptions = [
        { value: 'course_fee', label: 'Course Fee' },
        { value: 'book_fee', label: 'Book Fee' },
        { value: 'document_fee', label: 'Document Fee' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Handle phone number validation - only allow digits
        if (name === 'phone_number') {
            const digitsOnly = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }));

            if (phoneError) {
                setPhoneError('');
            }

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateRequiredFields = () => {
        return formData.first_name &&
            formData.last_name &&
            formData.email_address &&
            formData.fee &&
            formData.amount;
    };

    const validatePhoneNumber = () => {
        if (formData.phone_number && formData.phone_number.length < 11) {
            setPhoneError('Phone number must be at least 11 digits long.');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const showMissingFieldsError = async () => {
        await Swal.fire({
            title: 'Missing Information',
            text: 'Please fill in all required fields (marked with *).',
            icon: 'warning',
            confirmButtonColor: '#890E07'
        });
    };

    const showConfirmationDialog = async () => {
        const result = await Swal.fire({
            title: 'Confirm Payment',
            html: `
                <p>Are you sure you want to pay the amount of <strong>₱${formData.amount}</strong>?</p>
                <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.5rem;">A payment link will be sent to: <strong>${formData.email_address}</strong></p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#890E07',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, I\'m sure',
            cancelButtonText: 'Cancel'
        });
        return result.isConfirmed;
    };

    const preparePaymentData = () => {
        const selectedFee = feesOptions.find(option => option.value === formData.fee);
        const feeLabel = selectedFee ? selectedFee.label : formData.fee;

        const paymentData = {
            firstName: formData.first_name,
            lastName: formData.last_name,
            email: formData.email_address.trim(),
            amount: parseFloat(formData.amount),
            description: `${feeLabel} - ${formData.first_name} ${formData.last_name}`,
            remarks: `Payment for ${feeLabel} by ${formData.first_name} ${formData.last_name}`
        };

        return paymentData;
    };

    const showSuccessAndOpenPayment = async (responseData) => {
        await Swal.fire({
            title: 'Payment Link Created!',
            html: `
                <p><strong>Payment ID:</strong> ${responseData.paymentId}</p>
                <p><strong>Amount:</strong> ₱${responseData.amount}</p>
                <p><strong>Status:</strong> ${responseData.status}</p>
                <p style="font-size: 0.875rem; color: #6B7280; margin-top: 0.75rem;"> A payment link has been sent to your email address or you can click Pay Now to proceed.</p>
            `,
            icon: 'success',
            confirmButtonColor: '#890E07',
            confirmButtonText: 'Pay Now'
        });

        window.open(responseData.checkoutUrl, '_blank');
    };

    const showErrorMessage = async (error) => {
        let errorMessage = error.response?.data?.message || 'Failed to create payment link. Please try again.';

        if (error.response?.data?.errors?.length > 0) {
            errorMessage += '\n\nDetails:\n' + error.response.data.errors.join('\n');
        }

        await Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#890E07'
        });
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            middle_name: '',
            last_name: '',
            email_address: '',
            phone_number: '',
            fee: '',
            amount: ''
        });
        setPhoneError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateRequiredFields()) {
            await showMissingFieldsError();
            return;
        }

        if (!validatePhoneNumber()) {
            return;
        }

        // Show confirmation dialog
        const confirmed = await showConfirmationDialog();
        if (!confirmed) return;

        setLoading(true);

        try {
            const paymentData = preparePaymentData();
            console.log('Creating payment with data:', paymentData);

            const response = await axiosInstance.post('/payments', paymentData);

            if (response.data.success) {
                await showSuccessAndOpenPayment(response.data.data);
                resetForm();
            }
        } catch (error) {
            console.error('Payment creation failed:', error);
            await showErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg_custom bg-white-yellow-tone">
            <UserNavbar role="public" />

            <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
                <div className="w-full max-w-3xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">

                    {/* Header */}
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-3xl font-bold">Payment Form</h1>
                        <p className="italic mt-2 font-semibold">
                            Fields marked with (*) are required. Please enter the correct information.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <LabelledInputField
                                name="first_name"
                                id="first_name"
                                label="First Name*"
                                type="text"
                                required={true}
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                            />
                            <LabelledInputField
                                name="middle_name"
                                id="middle_name"
                                label="Middle Name"
                                type="text"
                                placeholder="Middle Name"
                                value={formData.middle_name}
                                onChange={handleInputChange}
                            />
                            <LabelledInputField
                                name="last_name"
                                id="last_name"
                                label="Last Name*"
                                type="text"
                                required={true}
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <LabelledInputField
                                name="email_address"
                                id="email_address"
                                label="Email Address*"
                                type="email"
                                required={true}
                                placeholder="johndoe@gmail.com"
                                value={formData.email_address}
                                onChange={handleInputChange}
                            />
                            <div>
                                <LabelledInputField
                                    name="phone_number"
                                    id="phone_number"
                                    label="Phone Number"
                                    type="tel"
                                    required={false}
                                    placeholder="09xxxxxxxxx"
                                    minLength="11"
                                    maxLength="15"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className={phoneError ? 'border-red-500 focus:border-red-500' : ''}
                                />
                                {phoneError && (
                                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <hr className="my-6 border-dark-red" />
                        <p className="mb-5 font-semibold">Payment Details</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <SelectField
                                name="fee"
                                id="fee"
                                label="Type of Fee*"
                                required={true}
                                options={feesOptions}
                                value={formData.fee}
                                onChange={handleInputChange}
                            />
                            <LabelledInputField
                                name="amount"
                                id="amount"
                                label="Amount (PHP)*"
                                type="number"
                                required={true}
                                placeholder="0.00"
                                min="1"
                                max="100000"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <SmallButton
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    'Checkout'
                                )}
                            </SmallButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PaymentForm;