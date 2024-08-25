import { Modal } from "flowbite-react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import SmallButton from "../buttons/SmallButton";

// DELETE THIS FILE AFTER BACKEND LOGIC FOR
// LOGGING IN IS DONE

function DevLoginModal(props) {
    const navigate = useNavigate();

    const navigateToStudent = () => {
        navigate("/student");
    };

    const navigateToTeacher = () => {
        navigate("/teacher");
    };

    const navigateToAdmin = () => {
        navigate("/admin");
    };

    return (
        <Modal
            dismissible
            show={props.dev_login_modal}
            size="md"
            onClose={() => props.setDevLoginModal(false)}
            popup
            className="transition duration-150 ease-out -p-16"
        >
            <div className="py-4 flex flex-col bg-white-yellow-tone transition duration-150 ease-out">
                <Modal.Header className="z-10 transition ease-in-out duration-300" />
                <p className="font-bold -mt-10 mb-4 text-center text-2xl transition ease-in-out duration-300">
                    Development Mode
                </p>
                <Modal.Body>
                    <p className="text-center mb-5">Select role to login</p>
                    <div className="flex flex-col gap-5 justify-center items-center">
                        <div className="w-full flex">
                            <SmallButton onClick={navigateToStudent}>
                                Student
                            </SmallButton>
                            <SmallButton onClick={navigateToTeacher}>
                                Teacher
                            </SmallButton>
                        </div>
                        <div className="w-full flex">
                            <SmallButton onClick={navigateToAdmin}>
                                Admin
                            </SmallButton>
                        </div>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    )
}

export default DevLoginModal