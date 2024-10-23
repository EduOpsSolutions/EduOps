import { Flowbite, Modal } from "flowbite-react";
import React from 'react';

// To customize measurements of header 
const customModalTheme = {
    modal: {
        "header": {
            "base": "flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600",
            "popup": "border-b-0 p-2",
            "title": "text-xl font-medium text-gray-900 dark:text-white w-full mr-4",
            "close": {
                "base": "ml-auto inline-flex items-center rounded-lg p-1 text-sm text-black hover:bg-grey-1 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white",
                "icon": "h-5 w-5"
            }
        },
    }  
};

function GradeDetailsModal(props) {

    // Editor's Note:
    // Add parameters to this function wherein it would receive a string for the document name

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.grade_details_modal}
                size="5xl"
                onClose={() => props.setGradeDetailsModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
                <div className="pt-4 flex flex-col justify-center bg-white-yellow-tone transition duration-150 ease-out rounded-2xl">
                    {/* Document Header */}
                    <Modal.Header className="ml-4 mr-2 mb-4">
                        {/* Replace with backend logic to display course details*/}
                        <div className="flex flex-row justify-between gap-x-0 items-center">
                            <h1 className="text-xl">A2 German Basic Course</h1>
                            <h1 className="text-base">Enrollment Period: 2023 - Batch 1</h1>
                        </div>
                        <h1 className="text-base italic -mt-1 text-left">
                            Updated as of: April 1, 2023 by Sharlene Del Rosario
                        </h1>
                    </Modal.Header>
                    
                    <Modal.Body className="mr-9 flex flex-col items-center">
                        
                        <div>
                            Hi
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default GradeDetailsModal;
