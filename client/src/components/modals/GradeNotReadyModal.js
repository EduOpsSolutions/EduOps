import { Modal } from "flowbite-react";
import React from 'react';
import SmallButton from "../buttons/SmallButton";

function GradeNotReadyModal(props) {
    return (
        <Modal
            dismissible
            show={props.grade_not_ready_modal}
            size="lg"
            onClose={() => props.setGradeNotReadyModal(false)}
            popup
            className="transition duration-150 ease-out"
        >
            <div className="py-4 flex flex-col justify-center items-center bg-white-yellow-tone transition duration-150 ease-out rounded-lg">
                <Modal.Body>
                    <div className="text-center">
                        
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-20 m-auto">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>

                        <p className="font-bold text-2xl mt-2">
                            Your Grade isn't Ready Yet!
                        </p>
                        <p className="text-center text-sm my-4">
                            If you think this is a mistake please contact your instructor or administrator.
                        </p>
                        <div className="flex justify-center mt-4">
                            <SmallButton color="gray" onClick={() => props.setGradeNotReadyModal(false)}>
                                Confirm
                            </SmallButton>
                        </div>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
}

export default GradeNotReadyModal;
