import { Flowbite, Modal } from "flowbite-react";
import React from 'react';
import SmallButton from "../buttons/smolbutton";
import LabelledInputField from "../textFields/LabelledInputField";

const customModalTheme = {
    modal: {
        "root": {
            "base": "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity",
            "show": {
            "on": "flex bg-gray-900 bg-opacity-40 dark:bg-opacity-80 ease-in",
            "off": "hidden ease-out"
            },
        },
        "content": {
            "base": "relative h-full w-full p-4 md:h-auto",
            "inner": "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700"
        },
        "body": {
            "base": "flex-1 overflow-auto p-6",
            "popup": "pt-0"
        },
        "header": {
            "base": "flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
            "popup": "border-b-0 p-2",
            "title": "text-xl font-medium text-gray-900 dark:text-white",
            "close": {
                "base": "ml-auto inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
                "icon": "h-5 w-5"
            }
        },
        "footer": {
            "base": "flex items-center rounded-b",
        }
    }  
};

function ForgetPasswordModal(props) {

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.forget_pass_modal}
                size="md"
                onClose={() => props.setForgetPasswordModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
                <div className="py-4 flex flex-col bg-white-yellow-tone transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300" />
                    <p className="font-bold -mt-10 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Forgot Password?
                    </p>
                    <Modal.Body>
                        <p className="text-base text-center mb-2 transition ease-in-out duration-300">
                            Please provide the email that you used when you signed up for your
                            account.
                        </p>
                        <LabelledInputField name="email" id="email" label="Email Address" type="email" required={true} placeholder=""/>
                        <p className="text-center text-xs -my-2 transition ease-in-out duration-300">
                            We will send you an email that will allow you to reset your
                            password.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        {/* Add code logic on sending a message to the emial */}
                        <SmallButton onClick={() => {
                            props.setForgetPasswordModal(false);
                            props.setPasswordResetModal(true);
                        }}>
                            Reset Password
                        </SmallButton>
                    </Modal.Footer>
                </div>
            </Modal>
        </Flowbite>
        
    );
}

export default ForgetPasswordModal;
