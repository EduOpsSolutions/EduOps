import React, { useRef } from 'react';
import GradeStatusModalButton from "../buttons/GradeStatusModalButton";

function GradeStudentsTable({
  students,
  gradeStatusOptions,
  getStudentGrade,
  handleGradeChange,
  handleDocumentUpload,
  handleViewDocument
}) {
  // Use a ref to keep track of file inputs for each student
  const fileInputRefs = useRef({});

  // Use student.studentGradeId for file actions
  const triggerFileInput = (studentGradeId) => {
    if (fileInputRefs.current[studentGradeId]) {
      fileInputRefs.current[studentGradeId].value = null; // reset
      fileInputRefs.current[studentGradeId].click();
    }
  };

  const onFileChange = (studentGradeId, e) => {
    const file = e.target.files[0];
    if (file) {
      handleDocumentUpload(studentGradeId, file);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-sm sm:text-base md:text-lg text-left rtl:text-right text-black mx-auto w-full">
        <thead className="text-sm sm:text-base md:text-lg text-black text-center border-b-dark-red-2 border-b-2 p-0">
          <tr>
            <th scope="col" className="px-1 sm:px-2 py-1 whitespace-nowrap w-[10%]">
              ID
            </th>
            <th scope="col" className="px-1 sm:px-2 py-1 w-[30%]">
              Name
            </th>
            <th scope="col" className="px-1 sm:px-2 py-1 whitespace-nowrap w-[35%]">
              Document
            </th>
            <th scope="col" className="pr-1 sm:pr-2 py-1 w-[25%]">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="text-center">
          {students.length > 0 ? (
            students.map((student) => {
              // Use student.studentGradeId for file actions
              const gradeId = student.studentGradeId;
              return (
                <tr key={student.user ? student.user.userId : gradeId}>
                  <td className="px-1 sm:px-2 py-1 text-sm sm:text-base">{student.user ? student.user.userId : student.userId || gradeId}</td>
                  <td className="px-1 sm:px-2 py-1 text-sm sm:text-base whitespace-normal break-words">{student.user
                    ? `${student.user.firstName || ''} ${student.user.middleName || ''} ${student.user.lastName || ''}`.trim()
                    : ''}</td>
                  <td className="px-1 sm:px-2 py-1 min-w-[180px]">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      {/* View button always shown; disables if no file */}
                      <button
                        className={`px-2 py-1 rounded border text-xs sm:text-sm ${student.hasDoc ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300' : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}`}
                        onClick={() => student.hasDoc && handleViewDocument(gradeId)}
                        title={student.hasDoc ? 'View Document' : 'No file uploaded'}
                        disabled={!student.hasDoc}
                      >
                        View
                      </button>
                      {/* Upload/Replace button */}
                      <button
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 text-xs sm:text-sm"
                        onClick={() => triggerFileInput(gradeId)}
                        title={student.hasDoc ? "Replace Document" : "Upload Document"}
                      >
                        {student.hasDoc ? "Replace" : "Upload"}
                      </button>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        style={{ display: 'none' }}
                        ref={el => fileInputRefs.current[gradeId] = el}
                        onChange={e => onFileChange(gradeId, e)}
                      />
                    </div>
                  </td>
                  <td className="px-1 sm:px-2 py-1 min-w-[80px]">
                    {(() => {
                      const grade = getStudentGrade(gradeId);
                      let mappedGrade = 'ng';
                      if (grade === 'Pass') mappedGrade = 'pass';
                      else if (grade === 'Fail') mappedGrade = 'fail';
                      else if (grade === 'NoGrade' || grade === null || grade === undefined) mappedGrade = 'ng';
                      else if (grade === 'pass' || grade === 'fail' || grade === 'ng') mappedGrade = grade; // fallback for local edits
                      return (
                        <GradeStatusModalButton
                          name={`status-${gradeId}`}
                          id={`status-${gradeId}`}
                          status={mappedGrade}
                          options={gradeStatusOptions}
                          defaultValue={mappedGrade}
                          onChange={(e) => handleGradeChange(gradeId, e.target.value)}
                        />
                      );
                    })()}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="py-2 sm:py-4 text-center text-gray-500 text-sm sm:text-base">
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