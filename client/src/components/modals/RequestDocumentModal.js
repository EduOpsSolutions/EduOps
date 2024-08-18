import { Modal } from "flowbite-react";
import React from 'react';
import SmallButton from "../buttons/SmallButton";
import LargeInputField from "../textFields/LargeInputField";
import NotLabelledInputField from "../textFields/NotLabelledInputField";
import SelectField from "../textFields/SelectField";

function RequestDocumentModal(props) {

    // Insert other payment options
    const paymentOptions = [
        { value: 'maya', label: 'Maya' },
        { value: 'gCash', label: 'GCash' },
        { value: 'debit', label: 'Debit' },
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
                    <h1 className='text-3xl font-bold'>Transcript of Records</h1>
                </Modal.Header>
                <Modal.Body>
                    {/* Document Form */}
                    <form>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div class="flex flex-col col-span-2">
                                <SelectField name="payment_method" id="payment_method" label="Select Payment Method" required={true} options={paymentOptions} />
                                <SelectField name="mode" id="mode" label="Mode" required={true} options={pickupOptions} />
                            </div>
                            <div className="col-span-2">
                                <LargeInputField name="notes" id="notes" label="Notes" type="text" required={true} placeholder="You can leave it at the guard house."/>
                            </div>
                        </div>
                        <h1 className="mb-4 font-bold">For Delivery:</h1>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <NotLabelledInputField name="country" id="country" label="Country" type="text" required={false} />
                            <NotLabelledInputField name="zip_code" id="zip_code" label="Zip Code" type="text" required={false} />
                            <div className="grid md:grid-cols-2 md:gap-6 col-span-2">
                                <NotLabelledInputField name="contact_number" id="contact_number" label="Contact Number" type="tel" required={false} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <NotLabelledInputField name="state" id="state" label="State" type="text" required={false}/>
                            <NotLabelledInputField name="city" id="city" label="City" type="text" required={false}/>
                        </div>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="col-span-2">
                                <NotLabelledInputField name="add_1" id="add_1" label="Address Line 1" type="text" required={true}/>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="col-span-2">
                                <NotLabelledInputField name="add_2" id="add_2" label="Address Line 2" type="text" required={true}/>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-5 md:gap-6">
                            <div className="col-span-4">
                                <p className="text-xs italic">By submitting, you confirm that the information above is true and any false information may void your document request.</p>
                                <p className="text-xs italic">For further questions please contact: +63 923 0321 023</p>
                            </div>
                            <SmallButton onClick={() => {
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
