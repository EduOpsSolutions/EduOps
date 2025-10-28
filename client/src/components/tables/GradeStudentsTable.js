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
      fileInputRefs.current[studentGradeId].value = null;
      fileInputRefs.current[studentGradeId].click();
    }
  };

  const onFileChange = (studentGradeId, e) => {
    const file = e.target.files[0];
    if (file) {
      // Find the student to get the readable user ID
      const student = students.find(s => s.studentGradeId === studentGradeId);
      const userId = student?.user?.userId || student?.userId || 'student';
      handleDocumentUpload(studentGradeId, file, userId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table class="table-fixed text-base text-left rtl:text-right text-black mx-auto w-full min-w-[600px]">
        <thead class="text-base text-black text-center border-b-dark-red-2 border-b-2">
          <tr>
            <th scope="col" className="p-2 font-normal w-[12%] sm:w-[15%] text-left"> ID </th>
            <th scope="col" className="p-2 font-normal w-[20%] sm:w-[25%] text-left"> Name </th>
            <th scope="col" className="p-2 font-normal w-[38%] sm:w-[35%]"> Document </th>
            <th scope="col" className="p-2 font-normal w-[30%] sm:w-[25%]"> Status </th>
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
                return (
                <tr key={student.user ? student.user.userId : gradeId}>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-left font-medium text-base"> {student.user ? student.user.userId : student.userId || gradeId} </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-left font-medium text-base"> {student.user
                    ? `${student.user.firstName || ''} ${student.user.middleName || ''} ${student.user.lastName || ''}`.trim()
                    : ''} </td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center">
                    <div className="flex flex-row gap-1 justify-center items-center">
                      {/* View button always shown; disables if no file */}
                      <button
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded border text-base ${student.hasDoc ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300' : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}`}
                        onClick={() => student.hasDoc && handleViewDocument(gradeId)}
                        title={student.hasDoc ? 'View Document' : 'No file uploaded'}
                        disabled={!student.hasDoc}
                      >
                        View
                      </button>
                      {/* Upload/Replace button */}
                      <button
                        className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 text-base"
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
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center">
                    {(() => {
                      const grade = getStudentGrade(gradeId, student.user?.id || student.userId);
                      let mappedGrade = 'ng';
                      if (grade === 'Pass') mappedGrade = 'pass';
                      else if (grade === 'Fail') mappedGrade = 'fail';
                      else if (grade === 'NoGrade' || grade === null || grade === undefined) mappedGrade = 'ng';
                      else if (grade === 'pass' || grade === 'fail' || grade === 'ng') mappedGrade = grade;
                      return (
                        <GradeStatusModalButton
                          name={`status-${gradeId}`}
                          id={`status-${gradeId}`}
                          status={mappedGrade}
                          options={gradeStatusOptions}
                          defaultValue={mappedGrade}
                          onChange={(e) => handleGradeChange(gradeId, e.target.value, student.user?.id || student.userId)}
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