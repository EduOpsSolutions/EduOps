import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axios';
import DiscardChangesModal from '../common/DiscardChangesModal';
import SearchField from '../../textFields/SearchField';

function AddCourseModal({ setAddCourseModal, add_course_modal, selectedPeriod, fetchPeriodCourses }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [showDiscardModal, setShowDiscardModal] = useState(false);

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

            // Close the modal after successful addition
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

    const handleSearchClick = () => {
        // Optional: Add any search click logic here
        console.log('Search clicked with term:', searchTerm);
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasChanges = () => {
        return searchTerm.trim() !== "";
    };

    const handleClose = () => {
        if (hasChanges()) {
            setShowDiscardModal(true);
        } else {
            setAddCourseModal(false);
        }
    };

    const handleDiscardChanges = () => {
        setShowDiscardModal(false);
        setAddCourseModal(false);
        setSearchTerm('');
    };

    const handleCancelDiscard = () => {
        setShowDiscardModal(false);
    };

    useEffect(() => {
        if (add_course_modal) {
            fetchCourses();
        } else {
            setSearchTerm('');
            setError('');
        }
    }, [add_course_modal]);

    if (!add_course_modal) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-2xl font-bold">Add Course</h2>
                        <button
                            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
                            onClick={handleClose}
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Search Field - Made Shorter */}
                    <div className="mb-6">
                        <SearchField
                            name="courseSearch"
                            id="courseSearch"
                            placeholder="Search Here"
                            value={searchTerm}
                            onChange={handleSearch}
                            onClick={handleSearchClick}
                            className="w-80 max-w-md"
                        />
                    </div>

                    {/* Courses Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-dark-red-2">
                                    <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Course ID
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Course Name
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Population
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Schedule
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Adviser
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold border-t-2 border-b-2 border-dark-red-2">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 border-t border-b border-dark-red-2">
                                            Loading courses...
                                        </td>
                                    </tr>
                                ) : filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 border-t border-b border-dark-red-2">
                                            No courses found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <tr
                                            key={course.id}
                                            className="hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <td className="py-3 px-4 border-t border-b border-dark-red-2 max-w-[150px] truncate">
                                                {course.id}
                                            </td>
                                            <td className="py-3 px-4 border-t border-b border-dark-red-2">
                                                {course.name}
                                            </td>
                                            <td className="py-3 px-4 text-center border-t border-b border-dark-red-2">
                                                {course.maxNumber}/10
                                            </td>
                                            <td className="py-3 px-4 border-t border-b border-dark-red-2">
                                                {course.schedule ? `${course.schedule.days || ''} ${course.schedule.time || ''}`.trim() || 'N/A' : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 border-t border-b border-dark-red-2">
                                                {course.adviser ? `${course.adviser.firstName} ${course.adviser.middleName ? course.adviser.middleName + ' ' : ''}${course.adviser.lastName}` : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-center border-t border-b border-dark-red-2">
                                                <button
                                                    onClick={() => handleAddCourse(course.id)}
                                                    disabled={loading}
                                                    className="text-dark-red-2 hover:text-dark-red-5 focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Add course"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 32 32"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M 16 3 C 8.832031 3 3 8.832031 3 16 C 3 23.167969 8.832031 29 16 29 C 23.167969 29 29 23.167969 29 16 C 29 8.832031 23.167969 3 16 3 Z M 16 5 C 22.085938 5 27 9.914063 27 16 C 27 22.085938 22.085938 27 16 27 C 9.914063 27 5 22.085938 5 16 C 5 9.914063 9.914063 5 16 5 Z M 15 10 L 15 15 L 10 15 L 10 17 L 15 17 L 15 22 L 17 22 L 17 17 L 22 17 L 22 15 L 17 15 L 17 10 Z"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DiscardChangesModal
                show={showDiscardModal}
                onConfirm={handleDiscardChanges}
                onCancel={handleCancelDiscard}
            />
        </>
    );
}

export default AddCourseModal;