import { Modal } from "flowbite-react";
import React from 'react';
import SmallButton from "../buttons/SmallButton";
function RequestSentModal(props) {
    return (
        <Modal
            dismissible
            show={props.request_sent_modal}
            size="lg"
            onClose={() => props.setRequestSentModal(false)}
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
                            Your Request has been sent!
                        </p>
                        <p className="text-center text-sm my-2 italic">
                            For further questions please contact: +63 923 0321 023
                        </p>
                        <div className="flex justify-center mt-4">
                            <SmallButton color="gray" onClick={() => props.setRequestSentModal(false)}>
                                Confirm
                            </SmallButton>
                        </div>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
}

export default RequestSentModal;
