import { Flowbite, Modal } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { getCookieItem } from '../../../utils/jwt';
import GradeStudentsTable from '../../tables/GradeStudentsTable';
import GradeModalFooter from './GradeModalFooter';
import useGradeStore from '../../../stores/gradeStore';
import Swal from 'sweetalert2';
import CommonModal from '../common/CommonModal';

// To customize measurements of header
const customModalTheme = {
  modal: {
    root: {
      base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full transition-opacity',
      show: {
        on: 'flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ease-in',
        off: 'hidden ease-out',
      },
    },
    header: {
      base: 'flex items-start justify-between rounded-t border-b p-5 dark:border-gray-600',
      popup: 'border-b-0 p-2',
      title: 'text-xl font-medium text-gray-900 dark:text-white text-center',
      close: {
        base: 'ml-auto mr-2 inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150',
        icon: 'h-5 w-5',
      },
    },
  },
};

function StudentsGradeModal(props) {
  // File preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState({ url: null, title: '' });
  // Use Zustand selector for localGrades to guarantee reactivity
  const localGrades = useGradeStore(state => state.localGrades);
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
    selectedSchedule,
    addPendingFile,
    getPendingFile,
    hasPendingFile,
    pendingFiles,
    isPeriodLocked,
    academicPeriod,
  } = useGradeStore();

  // Defensive: ensure localGrades is always an array
  // Sync localGrades with students after backend refetch
  useEffect(() => {
    if (props.students_grade_modal && students && Array.isArray(students)) {
      setLocalGrades(students.map(s => ({
        studentId: s.user?.userId || s.userId, // use readable ID for UI/CSV
        grade: s.grade === 'Pass' ? 'PASS' : s.grade === 'Fail' ? 'FAIL' : 'NOGRADE',
        studentGradeId: s.studentGradeId
      })));
    }
  }, [students, props.students_grade_modal]);

  const courseInfo = {
    courseName: props.course ? props.course.name : '',
    courseSchedule: props.course ? props.course.schedule : '',
    courseTime: props.course ? props.course.time : '',
    courseRoom: props.course ? props.course.room : '',
  };

  // Stage file locally 
  const handleDocumentUpload = (studentGradeId, file, userId) => {
    const student = students.find(
      (s) =>
        (s.user?.userId || s.userId) === userId ||
        s.user?.id === userId ||
        s.userId === userId
    );
    const studentId = student?.user?.id || student?.userId;
    const schedule = selectedSchedule || props.schedule;
    const courseId = schedule?.courseId || schedule?.course?.id;
    const periodId =
      schedule?.periodId ||
      schedule?.academicPeriodId ||
      schedule?.period?.id;

    if (!studentId || !courseId) {
      Swal.fire({
        title: 'Error!',
        text: 'Missing required information. Please ensure the student and course are properly selected.',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
      return;
    }

    addPendingFile(studentId, {
      file,
      fileName: file.name,
      studentGradeId,
      studentId,
      courseId,
      periodId,
      userId,
    });
  };

  const handleViewDocument = async (studentGradeId, studentId) => {
    const pendingFile = getPendingFile(studentId);
    if (pendingFile) {
      // Use the preview URL that was already created in the store
      setPreviewFile({
        url: pendingFile.previewUrl,
        title: `${pendingFile.fileName} (Not Saved Yet)`,
        isImage: pendingFile.file.type.startsWith('image/'),
      });
      setShowPreview(true);
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = getCookieItem('token');
    try {
      const res = await fetch(`${apiUrl}/grades/${studentGradeId}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch file(s)');
      let files = await res.json();
      if (files && files.length > 0) {
        // Sort files by uploadedAt descending (latest first)
        files = files.sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        if (files[0].url) {
          setPreviewFile({ url: files[0].url, title: 'Uploaded File Preview' });
          setShowPreview(true);
        } else {
          Swal.fire(
            'No File',
            'No file has been uploaded for this student.',
            'info'
          );
        }
      } else {
        Swal.fire(
          'No File',
          'No file has been uploaded for this student.',
          'info'
        );
      }
    } catch (err) {
      Swal.fire(
        'Error',
        'Failed to fetch or open file: ' + (err.message || 'Unknown error'),
        'error'
      );
    }
  };

  const handleVisibilityToggle = (visible) => {
    setGradeVisibility(visible);
  };

  const handleSaveGrades = async () => {
    try {
      const pendingCount = Object.keys(pendingFiles).length;
      const hasPendingFiles = pendingCount > 0;

      const result = await Swal.fire({
        title: 'Save Grades',
        text: hasPendingFiles
          ? `Are you sure you want to save the grades? ${pendingCount} file(s) will be uploaded.`
          : 'Are you sure you want to save the grades?',
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
          text: hasPendingFiles
            ? 'Uploading files and saving grades...'
            : 'Please wait while we save the grades.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Save grades and get backend response
        const saveResult = await saveGradeChanges();

        // Refresh students list after saving; localGrades will sync via useEffect when students updates
        if (selectedSchedule && handleGradeStudents) {
          await handleGradeStudents(selectedSchedule);
        }

        Swal.fire({
          title: 'Success!',
          text: hasPendingFiles
            ? 'Files uploaded and grades saved successfully'
            : 'Grades saved successfully',
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
    const hasPendingFiles = Object.keys(pendingFiles).length > 0;

    if (changesMade || hasPendingFiles) {
      const pendingCount = Object.keys(pendingFiles).length;
      const message = hasPendingFiles
        ? `You have ${pendingCount} pending file upload(s) and unsaved changes. All will be lost. Are you sure you want to close?`
        : 'Any unsaved changes will be lost. Are you sure you want to close?';

      const result = await Swal.fire({
        title: 'Discard Changes?',
        text: message,
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
              <span className="block md:inline">
                {props.schedule?.teacherName
                  ? ` | ${props.schedule.teacherName}`
                  : ''}
              </span>
              <span className="block md:inline">
                {courseInfo.courseSchedule} {courseInfo.courseTime}
              </span>
              {courseInfo.courseRoom && (
                <>
                  <span className="block md:inline"> | </span>
                  <span className="block md:inline">
                    {courseInfo.courseRoom}
                  </span>
                </>
              )}
            </p>
            <Modal.Body>
              {isPeriodLocked && academicPeriod && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold">Academic Period Locked</p>
                      <p className="text-sm">The academic period "{academicPeriod.batchName}" has ended. Grades cannot be modified.</p>
                    </div>
                  </div>
                </div>
              )}
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
                    hasPendingFile={hasPendingFile}
                    getPendingFile={getPendingFile}
                    localGrades={localGrades}
                    isPeriodLocked={isPeriodLocked}
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
                isPeriodLocked={isPeriodLocked}
              />
            </Modal.Body>
          </div>
        </Modal>
      </Flowbite>
      <CommonModal
        title={previewFile.title}
        handleClose={() => {
          setShowPreview(false);
          setPreviewFile({ url: null, title: '', isImage: false });
        }}
        show={showPreview}
        fileUrl={previewFile.url}
        fileType={previewFile.isImage ? 'image' : undefined}
      />
    </>
  );
}

export default StudentsGradeModal;
