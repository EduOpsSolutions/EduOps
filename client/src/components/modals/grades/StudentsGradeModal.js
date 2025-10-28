import { Flowbite, Modal } from "flowbite-react";
import React, { useEffect, useState } from 'react';
import { getCookieItem } from '../../../utils/jwt';
import GradeStudentsTable from "../../tables/GradeStudentsTable";
import GradeModalFooter from "./GradeModalFooter";
import useGradeStore from "../../../stores/gradeStore";
import Swal from 'sweetalert2';
import CommonModal from '../common/CommonModal';

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
                "base": "ml-auto mr-2 inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150",
                "icon": "h-5 w-5"
            }
        },
    }  
};

function StudentsGradeModal(props) {
    // File preview modal state
    const [showPreview, setShowPreview] = useState(false);
    const [previewFile, setPreviewFile] = useState({ url: null, title: '' });
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
        setLocalGrades,
        handleGradeStudents,
        selectedSchedule
    } = useGradeStore();

    const courseInfo = {
        courseName: props.course ? props.course.name : '',
        courseSchedule: props.course ? props.course.schedule : '',
        courseTime: props.course ? props.course.time : '',
        courseRoom: props.course ? props.course.room : ''
    };

    // Upload handler: sends file to backend
    const handleDocumentUpload = async (studentId, file, userId) => {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = getCookieItem('token');
        const formData = new FormData();
        formData.append('file', file);

        Swal.fire({
            title: 'Uploading...',
            text: `Uploading "${file.name}" for ${userId || 'student'}`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await fetch(`${apiUrl}/grades/${studentId}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Do NOT set Content-Type for FormData
                },
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            Swal.fire({
                title: 'Success!',
                text: `Document "${file.name}" uploaded successfully for ${userId || 'student'}`,
                icon: 'success',
                confirmButtonColor: '#992525',
            });
            setChangesMade(true);
            // Optionally: refresh students list or update state here
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: 'File upload failed: ' + (err.message || 'Unknown error'),
                icon: 'error',
                confirmButtonColor: '#992525',
            });
        }
    };

    const handleViewDocument = async (studentGradeId) => {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = getCookieItem('token');
        try {
            const res = await fetch(`${apiUrl}/grades/${studentGradeId}/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch file(s)');
            let files = await res.json();
            if (files && files.length > 0) {
                // Sort files by uploadedAt descending (latest first)
                files = files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                if (files[0].url) {
                    setPreviewFile({ url: files[0].url, title: 'Uploaded File Preview' });
                    setShowPreview(true);
                } else {
                    Swal.fire('No File', 'No file has been uploaded for this student.', 'info');
                }
            } else {
                Swal.fire('No File', 'No file has been uploaded for this student.', 'info');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch or open file: ' + (err.message || 'Unknown error'), 'error');
        }
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
                reverseButtons: true,
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

                // Immediately refresh students list after saving
                if (selectedSchedule && handleGradeStudents) {
                    await handleGradeStudents(selectedSchedule);
                }

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
                reverseButtons: true,
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
        <>
            <Flowbite theme={{ theme: customModalTheme }}>
                <Modal
                    dismissible
                    show={props.students_grade_modal}
                    size="7xl"
                    onClose={() => handleModalClose()}
                    popup
                    className="transition duration-150 ease-out"
                >
                <div className="pt-6 flex flex-col bg-white-yellow-tone rounded-lg transition duration-150 ease-out">
                    <Modal.Header className="z-10 transition ease-in-out duration-300 " />
                        <p className="font-bold -mt-10 ml-6 mb-4 text-left text-2xl transition ease-in-out duration-300 break-words">
                            <span className="block md:inline">{courseInfo.courseName}</span>
                            <span className="block md:inline">{props.schedule?.teacherName ? ` | ${props.schedule.teacherName}` : ''}</span>
                            <span className="block md:inline">{courseInfo.courseSchedule} {courseInfo.courseTime}</span>
                            {courseInfo.courseRoom && (
                                <>
                                    <span className="block md:inline"> | </span>
                                    <span className="block md:inline">{courseInfo.courseRoom}</span>
                                </>
                            )}
                        </p>
                        <Modal.Body>
                            <div class="h-[450px]"> 
                                <div className="h-[85%] border-y-dark-red-2 border-y-2 overflow-y-auto">
                                    <GradeStudentsTable
                                        students={students}
                                        gradeStatusOptions={gradeStatusOptions}
                                        getStudentGrade={getStudentGrade}
                                        handleGradeChange={handleGradeChange}
                                        handleDocumentUpload={handleDocumentUpload}
                                        handleViewDocument={handleViewDocument}
                                        teacherName={props.schedule?.teacherName}
                                    />
                                </div>
                            </div>
                            
                            <GradeModalFooter
                                isVisible={gradesVisible}
                                handleVisibilityToggle={handleVisibilityToggle}
                                handleSaveGrades={handleSaveGrades}
                                saving={saving}
                                setLocalGrades={setLocalGrades}
                                setChangesMade={setChangesMade}
                            />
                        </Modal.Body>
                    </div>
                </Modal>
            </Flowbite>
            <CommonModal
                title={previewFile.title}
                handleClose={() => {
                    setShowPreview(false);
                    setPreviewFile({ url: null, title: '' });
                }}
                show={showPreview}
                fileUrl={previewFile.url}
            />
        </>
    );
}

export default StudentsGradeModal;