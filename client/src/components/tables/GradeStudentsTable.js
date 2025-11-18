import React, { useRef } from 'react';
import GradeStatusModalButton from "../buttons/GradeStatusModalButton";

function GradeStudentsTable({
  students,
  gradeStatusOptions,
  getStudentGrade,
  handleGradeChange,
  handleDocumentUpload,
  handleViewDocument,
  hasPendingFile,
  getPendingFile,
  localGrades
}) {
  // Debug: print localGrades prop on every render
  // Use a ref to keep track of file inputs for each student
  const fileInputRefs = useRef({});

  const triggerFileInput = (uniqueStudentKey) => {
    if (fileInputRefs.current[uniqueStudentKey]) {
      fileInputRefs.current[uniqueStudentKey].value = null;
      fileInputRefs.current[uniqueStudentKey].click();
    }
  };

  const onFileChange = (uniqueStudentKey, studentGradeId, e) => {
    const file = e.target.files[0];
    if (file) {
      // Find the student to get the readable user ID
      const student = students.find(s => {
        const studentKey = s.user?.id || s.userId || s.studentGradeId;
        return studentKey === uniqueStudentKey;
      });
      const userId = student?.user?.userId || student?.userId || 'student';
      handleDocumentUpload(studentGradeId, file, userId);
    }
  };

  return (
    <div className="overflow-x-auto">
  <table class="table-auto text-base text-left rtl:text-right text-black mx-auto w-full min-w-0">
        <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2">
          <tr>
            <th scope="col" className="p-2 font-normal min-w-0 text-left"> ID </th>
            <th scope="col" className="p-2 font-normal min-w-0 text-left"> Name </th>
            <th scope="col" className="p-2 font-normal min-w-0"> Document </th>
            <th scope="col" className="p-2 font-normal min-w-0"> Status </th>
          </tr>
        </thead>
        <tbody className="text-center">
          {students.length > 0 ? (
            students
              .sort((a, b) => {
                const aId = a.user?.userId || a.userId || '';
                const bId = b.user?.userId || b.userId || '';
                return aId.localeCompare(bId);
              })
              .map((student) => {
                const gradeId = student.studentGradeId;
                const uniqueStudentKey = student.user?.id || student.userId || student.studentGradeId;
                const studentId = student.user?.id || student.userId;
                const hasPendingUpload = hasPendingFile ? hasPendingFile(studentId) : false;
                const hasFile = student.hasDoc || hasPendingUpload;
                
                return (
                <tr key={uniqueStudentKey}>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-left font-medium text-base truncate max-w-[120px]" title={student.user ? student.user.userId : student.userId || gradeId}> {student.user ? student.user.userId : student.userId || gradeId} </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-left font-medium text-base truncate max-w-[140px]" title={student.user ? `${student.user.firstName || ''} ${student.user.middleName || ''} ${student.user.lastName || ''}`.trim() : ''}> {student.user
                    ? `${student.user.firstName || ''} ${student.user.middleName || ''} ${student.user.lastName || ''}`.trim()
                    : ''} </td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center">
                    <div className="flex flex-row gap-1 justify-center items-center">
                      <button
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded border text-base ${
                          hasFile 
                            ? hasPendingUpload 
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300' 
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300'
                            : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        }`}
                        onClick={() => hasFile && handleViewDocument(gradeId, studentId)}
                        title={hasPendingUpload ? 'View Pending File (Not Saved)' : hasFile ? 'View Document' : 'No file uploaded'}
                        disabled={!hasFile}
                      >
                        View
                      </button>
                      {/* Upload/Replace button */}
                      <button
                        className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 text-base"
                        onClick={() => triggerFileInput(uniqueStudentKey)}
                        title={hasFile ? "Replace Document" : "Upload Document"}
                      >
                        {hasFile ? "Replace" : "Upload"}
                      </button>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        style={{ display: 'none' }}
                        ref={el => fileInputRefs.current[uniqueStudentKey] = el}
                        onChange={e => onFileChange(uniqueStudentKey, gradeId, e)}
                      />
                    </div>
                  </td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center">
                    {(() => {
                      // Match CSV studentId to student.user.userId for instant UI update
                      let grade = null;
                      if (localGrades && Array.isArray(localGrades)) {
                        const localGrade = localGrades.find(item =>
                          item.studentId === student.user?.userId || item.studentId === student.userId
                        );
                        if (localGrade) {
                          // Map CSV values to UI values
                          if (localGrade.grade === 'PASS') grade = 'pass';
                          else if (localGrade.grade === 'FAIL') grade = 'fail';
                          else if (localGrade.grade === 'NOGRADE') grade = 'ng';
                          else grade = localGrade.grade.toLowerCase();
                        }
                      }
                      // Fallback to getStudentGrade if not found in localGrades
                      if (grade === null || grade === undefined) {
                        grade = getStudentGrade(gradeId, student.user?.id || student.userId);
                        // Map backend values to UI values
                        if (grade === 'Pass') grade = 'pass';
                        else if (grade === 'Fail') grade = 'fail';
                        else if (grade === 'NoGrade' || grade === null || grade === undefined) grade = 'ng';
                        else if (grade === 'pass' || grade === 'fail' || grade === 'ng') grade = grade;
                      }
                      return (
                        <GradeStatusModalButton
                          name={`status-${gradeId}`}
                          id={`status-${gradeId}`}
                          status={grade}
                          options={gradeStatusOptions}
                          defaultValue={grade}
                          onChange={value => handleGradeChange(gradeId, value, student.user?.id || student.userId)}
                        />
                      );
                    })()}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="px-2 sm:px-3 py-3 sm:py-4 text-center text-gray-500 text-base">
                No students found for this course.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GradeStudentsTable;