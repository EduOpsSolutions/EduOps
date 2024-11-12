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

function StudentsGradeModal(props) {
    const gradeStatusOptions = [
        { value: 'pass', label: 'PASS' },
        { value: 'fail', label: 'FAIL' },
        { value: 'ng', label: 'NG' },
    ];

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
                            <div className="h-[90%] border-y-dark-red-2 border-y-2 overflow-y-auto">
                                <table class="text-base text-left rtl:text-right text-black mx-auto w-full">
                                    <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2 p-0">
                                        <tr>
                                            <th scope="col" class="px-2 py-1">
                                            ID
                                            </th>
                                            <th scope="col" class="px-2 py-1">
                                            Name
                                            </th>
                                            <th scope="col" class="px-2 py-1">
                                            Grade Document
                                            </th>
                                            <th scope="col" class="pr-2 py-1">
                                                Status
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
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={false} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">2102312</td>
                                            <td class="px-2 py-1">Marsa Fe</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">092214</td>
                                            <td class="px-2 py-1">Angelou Sereño</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">2012923</td>
                                            <td class="px-2 py-1">Juan Dela Cruz</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={false} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">2102312</td>
                                            <td class="px-2 py-1">Marsa Fe</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">092214</td>
                                            <td class="px-2 py-1">Angelou Sereño</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="unlocked" /></td>
                                            <td class="px-2 py-1">
                                                <SmallGreySelectField name="status" id="status" required={true} options={gradeStatusOptions} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Calibri Sans</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={false} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="NG"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Lorem Ipsum</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="PASS"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Dios Mio</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="NG"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Kapoy Na</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="FAIL"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Calibri Sans</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={false} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="NG"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Lorem Ipsum</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="PASS"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Dios Mio</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="PASS"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="px-2 py-1">12412</td>
                                            <td class="px-2 py-1">Kapoy Na</td>
                                            <td class="px-2 py-1"><GradeDocumentModalButton hasDoc={true} status="locked" /></td>
                                            <td class="px-2 py-1">
                                                <GradeStatusModalButton status="FAIL"></GradeStatusModalButton>
                                            </td>
                                        </tr>
                                        
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-row items-center justify-between mt-6 w-full">
                                <div className="flex flex-row items-center">
                                    <div class="flex items-center me-4">
                                        <label for="inline-checkbox" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Visibility:</label>
                                        <input id="inline-checkbox" type="checkbox" value="" class="w-4 h-4 ml-4 text-dark-red-2 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div className="ml-4">
                                        <ThinRedButton onClick={""} color="bg-grey" hoverColor="bg-grey-2">
                                            Upload CSV
                                        </ThinRedButton>
                                    </div>
                                </div>
                                <div className="">
                                    <ThinRedButton onClick={""} color="bg-dark-red-2" hoverColor="bg-dark-red-5">
                                        Save Grades
                                    </ThinRedButton>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default StudentsGradeModal;
