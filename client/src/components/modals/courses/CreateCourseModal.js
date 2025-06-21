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

function CreateCourseModal({setCreateCourseModal, create_course_modal, fetchCourses}) {
    const [name, setName] = useState('');
    const [maxNumber, setMaxNumber] = useState(30);
    const [visibility, setVisibility] = useState('hidden');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [price, setPrice] = useState('');
    const [schedule, setSchedule] = useState('');

    const handleSubmit = async () => {
        try {
            const payload = {
                name,
                maxNumber: parseInt(maxNumber),
                visibility,
                description,
                logo,
                price: parseFloat(price),
                schedule: schedule ? JSON.parse(schedule) : null,
            };

            const response = await axiosInstance.post('/courses/create', payload);
            console.log('Course created:', response.data);
            fetchCourses();
            setCreateCourseModal(false);
        } catch (error) {
            console.error('Failed to create course: ', error.response?.data || error.message);
        }
    };

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={create_course_modal}
                size="2xl"
                onClose={() => setCreateCourseModal(false)}
                popup
                className="transition duration-150 ease-out">
                <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                    {/* Replace with backend logic for getting the course name and pass it into this thingy */}
                    <p className="font-bold -mt-10 ml-6 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Course Creation
                    </p>
                    <Modal.Body>
                        <div>
                            <div class="mt-5">
                                <p>Course Name</p>
                                <input type="text" class="w-full border-red-900" value={name} onChange={(e) => setName(e.target.value)}></input>
                            </div>
                            <div className="flex flex-row justify-center items-center pt-5">
                                <div class="w-1/2 mr-5">
                                    <p># of Students</p>
                                    <input type="number" class="w-full border-red-900" value={maxNumber} onChange={(e) => setMaxNumber(e.target.value)}></input>
                                </div>
                                <div class="w-1/2 mr-5">
                                    <p>Visibility</p>
                                    <select class="w-full border-red-900" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                                        <option value="visible">Visible</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                                <div class="w-1/2">
                                    <p>Price</p>
                                    <input type="number" class="w-full border-red-900" value={price} onChange={(e) => setPrice(e.target.value)}></input>
                                </div>
                            </div>

                            <div class="mt-5">
                                <p>Description</p>
                                <input type="text" class="w-full border-red-900" value={description} onChange={(e) => setDescription(e.target.value)}></input>
                            </div>

                            <div class="mt-5">
                                <p>Logo (URL)</p>
                                <input type="text" class="w-full border-red-900" value={logo} onChange={(e) => setLogo(e.target.value)}></input>
                            </div>

                            <div class="mt-5">
                                <p>Schedule</p>
                                <input type="text" class="w-full border-red-900" value={schedule} onChange={(e) => setSchedule(e.target.value)}></input>
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

export default CreateCourseModal;
