import { Flowbite, Modal } from "flowbite-react";
import React, { useState } from 'react';
import SmallButton from "../buttons/SmallButton";
import LabelledInputField from "../textFields/LabelledInputField";

// To customize measurements of header
const customModalTheme = {
    modal: {
        "root": {
            "base": "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity",
            "show": {
            "on": "flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in",
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

function EditPasswordModal(props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handlePasswordChange = () => {
        // Add logic to handle password change
        console.log("Password changed");
        props.setEditPasswordModal(false);
    };

    const handleCancel = () => {
        // Logic to handle cancel action
        props.setEditPasswordModal(false);
    };

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.edit_password_modal}
                size="md"
                onClose={() => props.setEditPasswordModal(false)}
                popup
                className="transition duration-150 ease-out -p-16"
            >
                <div className="py-4 flex flex-col bg-white-yellow-tone transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300" />
                    <p className="font-bold -mt-10 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Change Password
                    </p>
                    <Modal.Body>
                        <LabelledInputField name="currentPassword" id="currentPassword" label="Current Password" type="password" required={true} placeholder="" onChange={(e) => setCurrentPassword(e.target.value)} />
                        <LabelledInputField name="newPassword" id="newPassword" label="New Password" type="password" required={true} placeholder="" onChange={(e) => setNewPassword(e.target.value)} />
                        <LabelledInputField name="confirmNewPassword" id="confirmNewPassword" label="Confirm New Password" type="password" required={true} placeholder="" onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </Modal.Body>
                    <Modal.Footer>
                        <SmallButton onClick={handleCancel} className="ml-2">
                            Cancel
                        </SmallButton>
                        <SmallButton onClick={handlePasswordChange} className="ml-2">
                            Change Password
                        </SmallButton>
                    </Modal.Footer>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default EditPasswordModal;