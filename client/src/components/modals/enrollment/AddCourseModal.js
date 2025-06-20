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

function AddCourseModal({setAddCourseModal, add_course_modal, selectedPeriod, fetchPeriodCourses}){
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/courses");
            const visibleCourses = response.data.filter(course => course.visibility === 'visible');
            setCourses(visibleCourses);
            setError('');
        } catch (error) {
            console.error("Failed to fetch courses: ", error);
            setError('Failed to load courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };    
    
    const handleAddCourse = async (courseId) => {
        try {
            if (!selectedPeriod) {
                setError('No academic period selected. Please select a period first.');
                return;
            }

            if (!courseId) {
                setError('Course ID is required.');
                return;
            }
            
            setLoading(true);
            setError('');

            if (!selectedPeriod.id) {
                throw new Error('Invalid academic period ID');
            }

            const response = await axiosInstance.post(`/academic-period-courses/${selectedPeriod.id}/courses`, {
                courseId: courseId
            });
            
            if (!response.data) {
                throw new Error('No response data received');
            }
            
            await fetchPeriodCourses();
            setAddCourseModal(false);
        } catch (error) {
            console.error("Failed to add course to period: ", error);
            if (!selectedPeriod.id) {
                setError('Invalid period ID. Please try selecting the period again.');
            } else if (error.response?.status === 404) {
                setError('The selected academic period was not found. Please try again.');
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to add course. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCourses = courses.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    useEffect(() => {
        if (add_course_modal) {
            fetchCourses();
        }
    }, [add_course_modal]);
    
    return (
        <Flowbite theme={{ modal: customModalTheme }}>
            <Modal 
                dismissible
                show={add_course_modal}
                size="3xl"
                onClose={() => setAddCourseModal(false)}
                popup
                className="transition duration-150 ease-out"
            >
                <Modal.Header className="flex items-center justify-between">
                    <div className="flex items-center">
                        <p className="font-bold m-2 text-2xl">Add Course</p>
                    </div>
                </Modal.Header>
                <hr className="border-t-2 border-black mx-4 pb-2" />
                <Modal.Body>
                    <div className="mb-3 mt-1">
                        <SearchField 
                            name="courses" 
                            id="courses" 
                            placeholder="Search Course" 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {error && (
                        <div className="mb-3 text-red-600">
                            {error}
                        </div>
                    )}

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
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center">
                                                Loading courses...
                                            </td>
                                        </tr>
                                    ) : filteredCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center">
                                                No courses found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCourses.map((course) => (
                                            <tr key={course.id}>
                                                <td className="px-4 py-2 border-b max-w-[150px] truncate">{course.id}</td>
                                                <td className="px-4 py-2 border-b">{course.name}</td>
                                                <td className="px-4 py-2 text-center border-b">{course.maxNumber}</td>
                                                <td className="px-4 py-2 border-b">{course.schedule || 'N/A'}</td>
                                                <td className="px-4 py-2 border-b">{course.adviserId || 'N/A'}</td>
                                                <td className="px-2 py-2 text-center border-b">
                                                    <button 
                                                        onClick={() => handleAddCourse(course.id)}
                                                        disabled={loading}
                                                        className="bg-dark-red-2 text-white px-2 py-1 rounded hover:bg-dark-red-5 disabled:opacity-50"
                                                    >
                                                        Add
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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