import { Flowbite, Modal } from "flowbite-react";
import React, { useState } from 'react';
import ThinRedButton from "../../buttons/ThinRedButton";
import axiosInstance from "../../../utils/axios";

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
        "header": {
            "base": "flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
            "popup": "border-b-0 p-2",
            "title": "text-xl font-medium text-gray-900 dark:text-white text-center",
            "close": {
                "base": "ml-auto mr-2 inline-flex items-center rounded-lg p-1.5 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
                "icon": "h-5 w-5"
            }
        },
    }  
};

// To do: Make this modal accept props wherein you can pass the status of this thingy if locked sha or not.
// If ever locked, make lines 197-214 (basta sa footer area na naay visibility) hidden

function AcademicPeriodModal({ setAddAcademicPeriodModal, addAcademicPeriodModal }) {

    const [batchName, setBatchName] = useState('');
    const [periodName, setPeriodName] = useState('');
    const [startAt, setStartDate] = useState('');
    const [endAt, setEndDate] = useState('');

    const handleSubmit = async () => {
        try {
            const startDateTime = new Date(startAt);
            startDateTime.setHours(0, 0, 0, 0);

            const endDateTime = new Date(endAt);
            endDateTime.setHours(23, 59, 59, 999);

            const payload = {
                batchName,
                periodName,
                startAt: startDateTime.toISOString(),
                endAt: endDateTime.toISOString(),
            };
            console.log('Payload for creating academic period:', payload);
            const response = await axiosInstance.post('/academic-periods/create', payload);
            console.log('Academic Period created:', response.data);
            setAddAcademicPeriodModal(false);
        } catch (error) {
            console.error('Failed to create academic period: ', error.response?.data || error.message);
        }
    };


    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={addAcademicPeriodModal}
                size="2xl"
                onClose={() => setAddAcademicPeriodModal(false)}
                popup
                className="transition duration-150 ease-out">
                <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                    {/* Replace with backend logic for getting the course name and pass it into this thingy */}
                    <p className="font-bold -mt-10 ml-6 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Period Creation
                    </p>
                    <Modal.Body>
                        <div>
                            <div class="mt-5">
                                <p>Batch Name</p>
                                <input type="text" class="w-full border-red-900" value={batchName} onChange={(e) => setBatchName(e.target.value)}></input>
                            </div>
                            <div class="mt-5">
                                <p>Period Name</p>
                                <input type="text" class="w-full border-red-900" value={periodName} onChange={(e) => setPeriodName(e.target.value)}></input>
                            </div>
                            <div className="flex justify-end mt-5">
                                <div class="w-1/2 mr-5">
                                    <p>Start Date</p>
                                    <input type="date" class="w-full border-red-900" value={startAt} onChange={(e) => setStartDate(e.target.value)}></input>
                                </div>
                                <div class="w-1/2 mr-5">
                                    <p>End Date</p>
                                    <input type="date" class="w-full border-red-900" value={endAt} onChange={(e) => setEndDate(e.target.value)}></input>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-10">
                            <ThinRedButton onClick={handleSubmit} color="bg-dark-red-2" hoverColor="bg-dark-red-5">
                                Submit
                            </ThinRedButton>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default AcademicPeriodModal;
