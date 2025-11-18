import React, { useRef } from 'react';
import ThinRedButton from "../../buttons/ThinRedButton";
import Swal from 'sweetalert2';

function GradeModalFooter({
  isVisible,
  handleVisibilityToggle,
  handleSaveGrades,
  saving,
  setLocalGrades,
  setChangesMade
}) {
  const csvFileInputRef = useRef(null);

  const handleCSVUpload = (file) => {
  console.log('handleCSVUpload called with file:', file);
    if (!file) return;

    Swal.fire({
      title: 'Processing CSV...',
      text: 'Please wait while we process the CSV file.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reader = new FileReader();
    reader.onload = (event) => {
  console.log('reader.onload triggered');
  console.log('Raw CSV text:', event.target.result);
      try {
        const csvText = event.target.result;
        const rows = csvText.split('\n');
        const gradesData = [];
        const startRow = rows[0].includes('ID') || rows[0].includes('StudentId') ? 1 : 0;

        const validGrades = ['PASS', 'FAIL', 'NOGRADE'];
        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;

          const [studentId, grade] = row.split(',');
          if (studentId && grade) {
            // Ensure studentId matches API response exactly
            const cleanStudentId = studentId.trim().toUpperCase();
            const gradeValue = grade.trim().toUpperCase();
            if (validGrades.includes(gradeValue)) {
              gradesData.push({
                studentId: cleanStudentId,
                grade: gradeValue
              });
            }
          }
        }

        if (gradesData.length > 0) {
          // Merge grades with previous if needed
          // For now, just use the new grades from CSV
          setLocalGrades(gradesData);

          // Log the parsed grades array for verification
          console.log('Parsed gradesData:', gradesData);

          setChangesMade(true);
          Swal.fire({
            title: 'Success!',
            text: `Successfully processed ${gradesData.length} student grades from CSV`,
            icon: 'success',
            confirmButtonColor: '#992525',
          });
        } else {
          Swal.fire({
            title: 'Warning',
            text: 'No valid data found in CSV file',
            icon: 'warning',
            confirmButtonColor: '#992525',
          });
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Error parsing CSV file: ' + error.message,
          icon: 'error',
          confirmButtonColor: '#992525',
        });
      }
    };

    reader.onerror = () => {
      Swal.fire({
        title: 'Error!',
        text: 'Error reading the CSV file',
        icon: 'error',
        confirmButtonColor: '#992525',
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between -mt-4 w-full gap-4 sm:gap-2">
      <div className="flex flex-col xs:flex-row sm:flex-row items-center w-full sm:w-auto gap-1 sm:gap-2">
        <div className="flex items-center">
          <label htmlFor="inline-checkbox" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-300">
            Visibility:
          </label>
          <input
            id="inline-checkbox"
            type="checkbox"
            checked={isVisible === 'visible'}
            onChange={(e) => handleVisibilityToggle(e.target.checked ? 'visible' : 'hidden')}
            className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-dark-red-2 bg-gray-100 border-gray-300 rounded focus:ring-dark-red-2 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="w-full sm:w-auto">
          <div className="cursor-pointer">
            <ThinRedButton
              color="bg-grey"
              hoverColor="bg-grey-2"
              onClick={() => csvFileInputRef.current.click()}
              className="w-full sm:w-auto text-xs sm:text-sm px-3 py-1"
            >
              Upload CSV
            </ThinRedButton>
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleCSVUpload(file);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
      <div className="w-full sm:w-auto">
        <ThinRedButton
          onClick={handleSaveGrades}
          color="bg-dark-red-2"
          hoverColor="bg-dark-red-5"
          disabled={saving}
          className="w-full sm:w-auto text-xs sm:text-sm px-3 py-1"
        >
          {saving ? 'Saving...' : 'Save'}
        </ThinRedButton>
      </div>
    </div>
  );
}

export default GradeModalFooter;