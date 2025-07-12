import React from 'react';
import GradeDocumentModalButton from "../buttons/GradeDocumentModalButton";
import GradeStatusModalButton from "../buttons/GradeStatusModalButton";

function GradeStudentsTable({
  students,
  gradeStatusOptions,
  getStudentGrade,
  handleGradeChange,
  handleDocumentUpload
}) {
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
            students.map((student) => (
              <tr key={student.id}>
                <td className="px-1 sm:px-2 py-1 text-sm sm:text-base">{student.id}</td>
                <td className="px-1 sm:px-2 py-1 text-sm sm:text-base whitespace-normal break-words">{student.name}</td>
                <td className="px-1 sm:px-2 py-1 min-w-[130px]">
                  <GradeDocumentModalButton
                    hasDoc={student.hasDoc}
                    onClick={() => handleDocumentUpload(student.id)}
                  />
                </td>
                <td className="px-1 sm:px-2 py-1 min-w-[80px]">
                  <GradeStatusModalButton
                    name={`status-${student.id}`}
                    id={`status-${student.id}`}
                    status={getStudentGrade(student.id)}
                    options={gradeStatusOptions}
                    defaultValue={getStudentGrade(student.id)}
                    onChange={(e) => handleGradeChange(student.id, e.target.value)}
                  />
                </td>
              </tr>
            ))
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