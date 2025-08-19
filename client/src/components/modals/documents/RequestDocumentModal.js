import { Modal } from "flowbite-react";
import React, { useState } from 'react';
import SmallButton from "../../buttons/SmallButton";
import LargeInputField from "../../textFields/LargeInputField";
import NotLabelledInputField from "../../textFields/NotLabelledInputField";
import SelectField from "../../textFields/SelectField";

function RequestDocumentModal(props) {
    const [selectedMode, setSelectedMode] = useState('pickup');

    // Insert other payment options
    const paymentOptions = [
        { value: 'online', label: 'Online (Maya)' },
        { value: 'cod', label: 'Cash on Delivery' },
        { value: 'cashPickup', label: 'Cash (Pay upon Pickup)' },
    ];

    // Insert other mode options
    const pickupOptions = [
        { value: 'pickup', label: 'Pickup' },
        { value: 'delivery', label: 'Delivery' }
    ];

    // Editor's Note:
    // Add parameters to this function wherein it would receive a string for the document name

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
                    {/* Replace with backend logic to display name of Document*/}
                    <h1 className='text-3xl font-bold'>Request {props.documentName}</h1>
                </Modal.Header>
                <Modal.Body>
                    {/* Document Form */}
                    <form>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="flex flex-col col-span-2">
                                <SelectField name="payment_method" id="payment_method" label="Select Payment Method" required={true} options={paymentOptions} />

                                <div className="relative z-0 w-full group mb-5 group">
                                    <label htmlFor="mode" className="block mb-2 text-sm font-medium dark:text-gray-400">
                                        Mode
                                    </label>
                                    <select
                                        name="mode"
                                        id="mode"
                                        className="mt-2 py-2.5 bg-white border-2 border-gray-300 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red block w-full dark:bg-dark-red-5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-dark-red-2 dark:focus:border-dark-red-2"
                                        required={true}
                                        value={selectedMode}
                                        onChange={(e) => setSelectedMode(e.target.value)}
                                    >
                                        {pickupOptions.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <LargeInputField name="notes" id="notes" label="Notes" type="text" required={true} placeholder="You can leave it at the guard house." />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="grid md:grid-cols-2 md:gap-6 col-span-2">
                                <NotLabelledInputField name="contact_number" id="contact_number" label="Contact Number" type="tel" required={true} />
                            </div>
                        </div>

                        {/* The delivery section is rendered based on selectedMode */}

                        {selectedMode === 'delivery' && (
                            <>
                                <h1 className="mb-4 font-bold">For Delivery:</h1>
                                <div className="grid md:grid-cols-5 md:gap-6">
                                    <NotLabelledInputField name="country" id="country" label="Country" type="text" required={selectedMode === 'delivery'} />
                                    <NotLabelledInputField name="zip_code" id="zip_code" label="Zip Code" type="text" required={selectedMode === 'delivery'} />
                                </div>
                                <div className="grid md:grid-cols-5 md:gap-6">
                                    <NotLabelledInputField name="state" id="state" label="State" type="text" required={selectedMode === 'delivery'} />
                                    <NotLabelledInputField name="city" id="city" label="City" type="text" required={selectedMode === 'delivery'} />
                                </div>
                                <div className="grid md:grid-cols-5 md:gap-6">
                                    <div className="col-span-2">
                                        <NotLabelledInputField name="add_1" id="add_1" label="Address Line 1" type="text" required={selectedMode === 'delivery'} />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-5 md:gap-6">
                                    <div className="col-span-2">
                                        <NotLabelledInputField name="add_2" id="add_2" label="Address Line 2" type="text" required={selectedMode === 'delivery'} />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="col-span-4">
                                <p className="text-xs italic">By submitting, you confirm that the information above is true and any false information may void your document request.</p>
                                <p className="text-xs italic">For further questions please contact: +63 923 0321 023</p>
                            </div>
                            <SmallButton onClick={() => {
                                const formData = {
                                    documentName: props.documentName,
                                    mode: selectedMode,
                                    paymentMethod: document.getElementById('payment_method').value,
                                    notes: document.getElementById('notes').value,
                                    contactNumber: document.getElementById('contact_number').value
                                };

                                if (selectedMode === 'delivery') {
                                    formData.deliveryDetails = {
                                        country: document.getElementById('country')?.value,
                                        zipCode: document.getElementById('zip_code')?.value,
                                        state: document.getElementById('state')?.value,
                                        city: document.getElementById('city')?.value,
                                        addressLine1: document.getElementById('add_1')?.value,
                                        addressLine2: document.getElementById('add_2')?.value
                                    };
                                }

                                console.log('Document request data:', formData);

                                props.setRequestDocumentModal(false);
                                props.setRequestSentModal(true);
                            }}>
                                Confirm
                            </SmallButton>
                        </div>
                    </form>
                </Modal.Body>
            </div>
        </Modal>
    );
}

export default RequestDocumentModal;