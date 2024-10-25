import { Flowbite, Modal } from "flowbite-react";
import React from 'react';
import GreyUploadButton from "../../buttons/GreyUploadButton";
import WithDocumentButton from "../../buttons/WithDocumentButton";

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

function StudentsGradeModal(props) {
    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.students_grade_modal}
                size="7xl"
                onClose={() => props.setStudentsGradeModal(false)}
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
                        <div class="h-[500px]"> 
                            <table class="text-base text-left rtl:text-right text-black mx-auto w-full border-b-dark-red-2 border-b-2">
                                <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2 p-0">
                                    <tr>
                                        <th scope="col" class="px-2 py-1">
                                        ID
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Name
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Grade Doocument
                                        </th>
                                        <th scope="col" class="px-2 py-1">
                                        Status
                                        </th>
                                    </tr>
                                </thead>
                            {/* Note: Replace table body data with backend logic with classnames of first tr and add Onclick logic*/}
                            {/* PS it should account na in case overflow probably hehe */}
                                <tbody className="text-center">
                                    <tr>
                                        <td class="px-2 py-1">2012923</td>
                                        <td class="px-2 py-1">Juan Dela Cruz</td>
                                        <td class="px-2 py-1"><GreyUploadButton onClick={() => ""}/></td>
                                        <td class="px-2 py-1">ETA 3-4 days</td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 py-1">2102312</td>
                                        <td class="px-2 py-1">Marsa Fe</td>
                                        <td class="px-2 py-1"><WithDocumentButton onClick={() => ""}/></td>
                                        <td class="px-2 py-1">Done</td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 py-1">092214</td>
                                        <td class="px-2 py-1">Angelou Sereño</td>
                                        <td class="px-2 py-1"><WithDocumentButton onClick={() => ""}/></td>
                                        <td class="px-2 py-1">Done</td>
                                    </tr>
                                    <tr>
                                        <td class="px-2 py-1">12412</td>
                                        <td class="px-2 py-1">Calibri Sans</td>
                                        <td class="px-2 py-1"><WithDocumentButton onClick={() => ""}/></td>
                                        <td class="px-2 py-1">Done</td>
                                    </tr>
                                                    
                                </tbody>
                            </table>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default StudentsGradeModal;
