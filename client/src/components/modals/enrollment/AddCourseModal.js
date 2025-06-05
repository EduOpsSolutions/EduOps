import ThinRedButton from "../../buttons/ThinRedButton";
import axiosInstance from '../../../utils/axios';
import { useEffect, useState } from 'react';
import { Flowbite, Modal, ModalBody } from "flowbite-react";
import SearchField from "../../textFields/SearchField";

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

function AddCourseModal({setAddCourseModal, add_course_modal}){

    const [courses, setCourses] = useState([]);

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get("/courses");
            const visibleCourses = response.data.filter(course => course.visibility === 'visible');
            setCourses(visibleCourses);
        } catch (error) {
            console.error("Failed to fetch courses: ", error);
        }
      };
    
      useEffect(() => {
        fetchCourses();
      }, []);
    
    
    return (
        <Flowbite theme={{ modal: customModalTheme }}>
            <div>
            </div>
            <Modal dismissible
                show={add_course_modal}
                size="3xl"
                onClose={() => setAddCourseModal(false)}
                popup
                className="transition duration-150 ease-out">
                <Modal.Header className="flex items-center justify-between">
                    <div className="flex items-center">
                        <p className="font-bold m-2 text-2xl">Add Course</p>
                    </div>
                </Modal.Header>
                <hr className="border-t-2 border-black mx-4 pb-2" />
                <Modal.Body>
                    <div className="mb-3 mt-1">
                        <SearchField name="courses" id="courses" placeholder="Search Course" ></SearchField>
                    </div>

                    <div className="border border-dark-red rounded-md p-4 mb-8 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr>
                                    <th className="px-4 py-2 text-left border-b">Course ID</th>
                                    <th className="px-4 py-2 text-left border-b">Course Name</th>
                                    <th className="px-4 py-2 text-center border-b">Population</th>
                                    <th className="px-4 py-2 text-left border-b">Schedule</th>
                                    <th className="px-4 py-2 text-left border-b">Adviser</th>
                                    <th className="px-4 py-2 text-center border-b"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td className="px-4 py-2 border-b">A1-2024-B1</td>
                                    <td className="px-4 py-2 border-b">A1</td>
                                    <td className="px-4 py-2 text-center border-b">0/10</td>
                                    <td className="px-4 py-2 border-b">MW (9:00 AM - 12:00 PM)</td>
                                    <td className="px-4 py-2 border-b">Sharlene Del Rosario</td>
                                    <td className="px-2 py-2 text-center border-b">
                                        <button className="p-1 rounded-full hover:bg-black">
                                        <svg className="w-5 h-5" /* your plus icon here */ />
                                        </button>
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

        </Flowbite>
    );
};

   

export default AddCourseModal;