import { Flowbite, Modal } from "flowbite-react";
import React from 'react';
import ThinRedButton from "../../buttons/ThinRedButton";


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

function ViewStudentsModal(props) {
    
    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.view_students_modal}
                size="4xl"
                onClose={() => props.setViewStudentsModal(false)}
                popup
                className="transition duration-150 ease-out"
            >

            <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                    {/* Replace with backend logic for getting the course name and pass it into this thingy */}
                    <p className="font-bold -mt-10 ml-6 mb-4 text-left text-2xl transition ease-in-out duration-300">
                        A1 | TTh 6:30AM - 7:30AM
                    </p>
                    <Modal.Body>
                        {/*You can achange the height to be more dynamic pero if that is okay na then you can leave it like that*/}
                        <div class="h-[400px]"> 
                            <div className="h-[90%] border-y-dark-red-2 border-y-2 overflow-y-auto">
                                <table class="text-base text-left rtl:text-right text-black mx-auto w-full">
                                    <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2 p-0">
                                        <tr>
                                            <th scope="col" class="px-2 py-1">
                                            Student ID
                                            </th>
                                            <th scope="col" class="px-2 py-1">
                                            Name
                                            </th>
                                            <th scope="col" class="px-2 py-1">
                                            Email
                                            </th>
                                        </tr>
                                    </thead>
                                {/* Note: Replace table body data with backend logic with classnames of first tr and add Onclick logic*/}
                                {/* PS it should account na in case overflow probably hehe */}
                                {/* Also make sure to replace ang status and hasDoc based sa naa sa database*/}
                                    <tbody className="text-center">
                                        <tr>
                                            <td class="px-2 py-1">2012923</td>
                                            <td class="px-2 py-1">Juan Dela Cruz</td>
                                            <td class="px-2 py-1">juandelacruz@gmail.com</td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">2102312</td>
                                            <td class="px-2 py-1">Arthur Morgan</td>
                                            <td class="px-2 py-1">arthurdr@gmail.com</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-center mt-4">
                                {/* Insert function to download CSV */}
                                <ThinRedButton onClick={() => {}} color="bg-grey" hoverColor="bg-grey-2">
                                    Download CSV
                                </ThinRedButton>
                            </div>     
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default ViewStudentsModal;
