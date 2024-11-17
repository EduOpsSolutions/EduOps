import { Flowbite, Modal } from "flowbite-react";
import React from 'react';
import GradeDocumentModalButton from "../../buttons/GradeDocumentModalButton";
import GradeStatusModalButton from "../../buttons/GradeStatusModalButton";
import ThinRedButton from "../../buttons/ThinRedButton";
import SmallGreySelectField from "../../textFields/SmallGreySelectField";


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

function EditCourseModal(props) {
    const gradeStatusOptions = [

    ];

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.edit_course_modal}
                size="2xl"
                onClose={() => props.setEditCourseModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
                <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                    {/* Replace with backend logic for getting the course name and pass it into this thingy */}
                    <p className="font-bold -mt-10 ml-6 mb-4 text-center text-2xl transition ease-in-out duration-300">
                        Edit Course
                    </p>
                    <Modal.Body>
                        <div>
                            <div class="mt-5">
                                <p>Course ID</p>
                                <input type="text" class="w-full border-red-900"></input>
                            </div>

                            <div class="mt-5">
                                <p>Course Name</p>
                                <input type="text" class="w-full border-red-900"></input>
                            </div>
                            <div className="flex flex-row justify-center items-center pt-5">
                                <div class="w-1/2 mr-5">
                                    <p># of Students</p>
                                    <input type="text" class="w-full border-red-900"></input>
                                </div>
                                <div class="w-1/2">
                                    <p>Category</p>
                                    <select class="w-full border-red-900">
                                        <option value="option1">Option 1</option>
                                        <option value="option2">Option 2</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mt-5">
                                <p>Assigned Adviser</p>
                                <input type="text" class="w-full border-red-900"></input>
                            </div>

                            <div class="mt-5">
                                <p>Schedule</p>
                                <input type="text" class="w-full border-red-900"></input>
                            </div>
                            
                        </div>
                        <div className="flex justify-center mt-10">
                            <ThinRedButton onClick={""} color="bg-dark-red-2" hoverColor="bg-dark-red-5">
                                Submit
                            </ThinRedButton>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default EditCourseModal;
