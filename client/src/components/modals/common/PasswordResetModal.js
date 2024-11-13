import { Modal } from "flowbite-react";
import React from 'react';
import GrayButton from "../../buttons/GrayButton";

function PasswordResetModal(props) {
    return (
        <Modal
            dismissible
            show={props.password_reset_modal}
            size="lg"
            onClose={() => props.setPasswordResetModal(false)}
            popup
            className="transition duration-150 ease-out"
        >
            <div className="pt-2 flex flex-col justify-center items-center bg-white-yellow-tone transition duration-150 ease-out">
                <Modal.Body>
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-20 m-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <p className="font-bold text-2xl">
                            Password Reset Email Sent
                        </p>
                        <p className="text-center text-sm my-2">
                            An email has been sent to your email address. Follow the directions in the email to reset your password.
                        </p>
                        <div className="flex justify-center mt-4">
                            <GrayButton color="gray" onClick={() => props.setPasswordResetModal(false)}>
                                Close
                            </GrayButton>
                        </div>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
}

export default PasswordResetModal;
