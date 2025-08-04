import { Flowbite, Modal } from "flowbite-react";
import React, { useEffect } from 'react';
import GradeStudentsTable from "../../tables/GradeStudentsTable";
import GradeModalFooter from "./GradeModalFooter";
import useGradeStore from "../../../stores/gradeStore";
import Swal from 'sweetalert2';

// To customize measurements of header 
const customModalTheme = {
    modal: {
        "root": {
            "base": "fixed inset-0 z-50 h-screen w-screen overflow-y-auto overflow-x-hidden transition-opacity",
            "show": {
                "on": "flex justify-center items-center bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in",
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
    const {
        students,
        gradesVisible,
        saving,
        changesMade,
        gradeStatusOptions,
        getStudentGrade,
        handleGradeChange,
        setGradeVisibility,
        saveGradeChanges,
        resetGradeChanges,
        setChangesMade,
        setLocalGrades
    } = useGradeStore();

    const courseInfo = {
        courseName: props.course ? props.course.name : '',
        courseSchedule: props.course ? props.course.schedule : '',
        courseTime: props.course ? props.course.time : '',
        courseRoom: props.course ? props.course.room : ''
    };

    const handleDocumentUpload = (studentId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                Swal.fire({
                    title: 'Uploading...',
                    text: `Uploading "${file.name}" for student ID: ${studentId}`,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                setTimeout(() => {
                    Swal.fire({
                        title: 'Success!',
                        text: `Document "${file.name}" uploaded successfully for student ID: ${studentId}`,
                        icon: 'success',
                        confirmButtonColor: '#992525',
                    });

                    setChangesMade(true);
                }, 1000);
            }
        };

        fileInput.click();
    };

    const handleVisibilityToggle = (visible) => {
        setGradeVisibility(visible);
    };

    const handleSaveGrades = async () => {
        try {
            const result = await Swal.fire({
                title: 'Save Grades',
                text: 'Are you sure you want to save the grades?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#992525',
                cancelButtonColor: '#6b7280',
            });

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Saving...',
                    text: 'Please wait while we save the grades.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await saveGradeChanges();

                Swal.fire({
                    title: 'Success!',
                    text: 'Grades saved successfully',
                    icon: 'success',
                    confirmButtonColor: '#992525',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save grades: ' + error.message,
                icon: 'error',
                confirmButtonColor: '#992525',
            });
        }
    };

    const handleModalClose = async () => {
        if (changesMade) {
            const result = await Swal.fire({
                title: 'Discard Changes?',
                text: 'Any unsaved changes will be lost. Are you sure you want to close?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Discard',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#992525',
                cancelButtonColor: '#6b7280',
            });

            if (result.isConfirmed) {
                resetGradeChanges();
                props.setStudentsGradeModal(false);
            }
        } else {
            props.setStudentsGradeModal(false);
        }
    };

    useEffect(() => {
        if (props.students_grade_modal) {
            setChangesMade(false);
        }
    }, [props.students_grade_modal, students, gradesVisible, setChangesMade]);

    return (
        <Flowbite theme={{ theme: customModalTheme }}>
            <Modal
                dismissible
                show={props.students_grade_modal}
                size="7xl"
                onClose={() => handleModalClose()}
                popup
                className="transition duration-150 ease-out"
                theme={{
                    root: {
                        base: "fixed inset-0 z-50 h-screen w-screen overflow-y-auto overflow-x-hidden transition-opacity",
                        show: {
                            on: "flex justify-center items-center bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in",
                            off: "hidden ease-out"
                        }
                    },
                    content: {
                        base: "relative w-full p-4 h-auto",
                        inner: "bg-transparent relative rounded-lg max-h-[90vh] overflow-y-auto"
                    }
                }}
            >
                <div className="py-4 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300" />

                    <p className="font-bold -mt-8 sm:-mt-10 mx-4 sm:ml-6 mb-2 sm:mb-4 text-left text-lg sm:text-xl md:text-2xl transition ease-in-out duration-300 break-words">
                        <span className="block md:inline">{courseInfo.courseName}</span>
                        <span className="hidden md:inline"> | </span>
                        <span className="block md:inline">{courseInfo.courseSchedule} {courseInfo.courseTime}</span>
                        {courseInfo.courseRoom && (
                            <>
                                <span className="hidden md:inline"> | </span>
                                <span className="block md:inline">{courseInfo.courseRoom}</span>
                            </>
                        )}
                    </p>

                    <Modal.Body>
                        <div className="h-[400px] sm:h-[450px] md:h-[500px] max-h-[65vh]">
                            <div className="h-[85%] sm:h-[90%] border-y-dark-red-2 border-y-2 overflow-y-auto">
                                <GradeStudentsTable
                                    students={students}
                                    gradeStatusOptions={gradeStatusOptions}
                                    getStudentGrade={getStudentGrade}
                                    handleGradeChange={handleGradeChange}
                                    handleDocumentUpload={handleDocumentUpload}
                                />
                            </div>

                            <GradeModalFooter
                                isVisible={gradesVisible}
                                handleVisibilityToggle={handleVisibilityToggle}
                                handleSaveGrades={handleSaveGrades}
                                saving={saving}
                                setLocalGrades={setLocalGrades}
                                setChangesMade={setChangesMade}
                            />
                        </div>
                    </Modal.Body>
                </div>
            </Modal>
        </Flowbite>
    );
}

export default StudentsGradeModal;