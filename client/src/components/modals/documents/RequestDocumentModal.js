import { Modal } from "flowbite-react";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentRequestStore } from "../../../stores/documentRequestStore";
import useAuthStore from "../../../stores/authStore";
import Spinner from "../../common/Spinner";
import Swal from 'sweetalert2';

function RequestDocumentModal(props) {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState('pickup');
    const { createDocumentRequest, loading } = useDocumentRequestStore();
    const user = useAuthStore((state) => state.user);
    
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        paymentMethod: 'online',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        purpose: '',
        additionalNotes: ''
    });
    
    const [errors, setErrors] = useState({});

    // Initialize form with user data when modal opens
    useEffect(() => {
        if (props.request_document_modal && user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                phone: user.phoneNumber || ''
            }));
        }
    }, [props.request_document_modal, user]);

    // Payment options
    const paymentOptions = [
        { value: 'cash', label: 'Cash (Pickup Only)' },
        { value: 'online', label: 'Pay Online' },
    ];

    // Mode options
    const pickupOptions = [
        { value: 'pickup', label: 'Pickup' },
        { value: 'delivery', label: 'Delivery' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // If payment method is changed to cash, lock mode to pickup
        if (name === 'paymentMethod' && value === 'cash') {
            setSelectedMode('pickup');
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!props.selectedDocument?.id) {
            console.error('No document selected');
            return;
        }

        try {
            const requestData = {
                documentId: props.selectedDocument.id,
                email: formData.email,
                phone: formData.phone,
                mode: selectedMode,
                paymentMethod: formData.paymentMethod,
                purpose: formData.purpose,
                additionalNotes: formData.additionalNotes,
                ...(selectedMode === 'delivery' && {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
                })
            };

            // Check if document is free or paid
            const isFreeDocument = props.selectedDocument?.price === 'free';
            const isOnlinePayment = formData.paymentMethod === 'online' && !isFreeDocument;
            
            await createDocumentRequest(requestData, {
                skipSuccessDialog: isOnlinePayment,  // Skip default success dialog if online payment
                skipLoadingDialog: false
            });
            
            // Reset form
            setFormData({
                email: user?.email || '',
                phone: user?.phoneNumber || '',
                paymentMethod: 'online',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                purpose: '',
                additionalNotes: ''
            });
            setSelectedMode('pickup');
            setErrors({});
            
            props.setRequestDocumentModal(false);

            if (isOnlinePayment && props.selectedDocument) {
                const result = await Swal.fire({
                    title: 'Request Submitted!',
                    html: `
                        <div style="text-align: center;">
                            <p style="margin-bottom: 15px; color: #333;">Your document request has been submitted successfully.</p>
                            <p style="margin: 0; font-size: 0.95rem; color: #6B7280;">
                                You will now be redirected to the payment form to complete your payment.
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Proceed to Payment',
                    cancelButtonText: 'Pay Later',
                    confirmButtonColor: '#890E07',
                    cancelButtonColor: '#6B7280',
                    reverseButtons: true,
                    allowOutsideClick: false
                });

                if (result.isConfirmed) {
                    // Pass document fee information to payment form
                    navigate('/paymentForm', {
                        state: {
                            documentFee: {
                                feeType: 'document_fee',
                                amount: props.selectedDocument.amount
                            }
                        }
                    });
                }
            } else if (isFreeDocument) {
                await Swal.fire({
                    title: 'Request Submitted!',
                    html: `
                        <div style="text-align: center;">
                            <p style="margin-bottom: 10px; color: #333;">Your document request has been submitted successfully.</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#890E07',
                    allowOutsideClick: false
                });
            }
            
        } catch (error) {
            console.error('Request submission failed:', error);
        }
    };

    return (
        <Modal
            dismissible
            show={props.request_document_modal}
            size="5xl"
            onClose={() => props.setRequestDocumentModal(false)}
            popup
            className="transition duration-150 ease-out"
        >
            <div className="pt-4 flex flex-col justify-center bg-white-yellow-tone transition duration-150 ease-out rounded-2xl">
                {/* Document Header */}
                <Modal.Header className="ml-4 mr-2 mb-4">
                    <h1 className='text-3xl font-bold'>Request {props.documentName}</h1>
                </Modal.Header>
                <Modal.Body>
                    {/* Document Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="flex flex-col col-span-2">
                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="paymentMethod" className="block mb-2 text-sm font-medium text-gray-900">
                                        Payment Method *
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        id="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="mt-2 py-2.5 px-3 bg-white border-2 border-gray-300 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full"
                                        required
                                    >
                                        {paymentOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="mode" className="block mb-2 text-sm font-medium text-gray-900">
                                        Mode *
                                    </label>
                                    <select
                                        name="mode"
                                        id="mode"
                                        className={`mt-2 py-2.5 px-3 bg-white border-2 border-gray-300 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${formData.paymentMethod === 'cash' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        required
                                        value={selectedMode}
                                        onChange={(e) => setSelectedMode(e.target.value)}
                                        disabled={formData.paymentMethod === 'cash'}
                                    >
                                        {pickupOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.paymentMethod === 'cash' && (
                                        <p className="text-xs text-gray-500 mt-1">Cash payment is only available for pickup</p>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="purpose" className="block mb-2 text-sm font-medium text-gray-900">
                                        Purpose *
                                    </label>
                                    <input
                                        type="text"
                                        name="purpose"
                                        id="purpose"
                                        value={formData.purpose}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Employment, School Transfer, Scholarship Application"
                                        className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                                </div>

                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="additionalNotes" className="block mb-2 text-sm font-medium text-gray-900">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        name="additionalNotes"
                                        id="additionalNotes"
                                        rows="4"
                                        value={formData.additionalNotes}
                                        onChange={handleInputChange}
                                        placeholder="Any special instructions or notes..."
                                        className="mt-2 py-2.5 px-3 bg-white border-2 border-gray-300 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery section */}
                        {selectedMode === 'delivery' && (
                            <>
                                <h1 className="mb-4 font-bold text-lg">Delivery Information:</h1>
                                <div className="grid md:grid-cols-2 md:gap-6 mb-4">
                                    <div className="relative z-0 w-full group mb-5">
                                        <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-900">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            id="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                                            required={selectedMode === 'delivery'}
                                        />
                                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                    </div>
                                    
                                    <div className="relative z-0 w-full group mb-5">
                                        <label htmlFor="zipCode" className="block mb-2 text-sm font-medium text-gray-900">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            id="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                                            required={selectedMode === 'delivery'}
                                        />
                                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 md:gap-6 mb-4">
                                    <div className="relative z-0 w-full group mb-5">
                                        <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-900">
                                            State/Province *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            id="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                            required={selectedMode === 'delivery'}
                                        />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    
                                    <div className="relative z-0 w-full group mb-5">
                                        <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            id="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                            required={selectedMode === 'delivery'}
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                </div>
                                
                                <div className="relative z-0 w-full group mb-5">
                                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">
                                        Complete Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        id="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street address, building name, unit number, etc."
                                        className={`mt-2 py-2.5 px-3 bg-white border-2 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red-2 block w-full ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                        required={selectedMode === 'delivery'}
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                            </>
                        )}
                        <div className="grid md:grid-cols-5 md:gap-6 mt-6">
                            <div className="col-span-4">
                                <p className="text-xs italic text-gray-600 mb-2">
                                    By submitting, you confirm that the information above is true and any false information may void your document request.
                                </p>
                                <p className="text-xs italic text-gray-600">
                                    For further questions please contact: +63 923 0321 023
                                </p>
                                {Object.keys(errors).length > 0 && (
                                    <p className="text-red-500 text-sm mt-2">
                                        Please correct the errors above before submitting.
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => props.setRequestDocumentModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-dark-red-2 rounded-md hover:bg-dark-red-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && <Spinner size="small" />}
                                    {loading ? 'Submitting...' : 'Confirm Request'}
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </div>
        </Modal>
    );
}

export default RequestDocumentModal;