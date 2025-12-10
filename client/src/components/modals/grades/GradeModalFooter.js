import React, { useRef } from "react";
import ThinRedButton from "../../buttons/ThinRedButton";
import Swal from "sweetalert2";

function GradeModalFooter({
  isVisible,
  handleVisibilityToggle,
  handleSaveGrades,
  saving,
  setLocalGrades,
  setChangesMade,
  isPeriodLocked = false,
}) {
  const csvFileInputRef = useRef(null);

  const handleCSVUpload = (file) => {
    console.log("handleCSVUpload called with file:", file);
    if (!file) return;

    Swal.fire({
      title: "Processing CSV...",
      text: "Please wait while we process the CSV file.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("reader.onload triggered");
      console.log("Raw CSV text:", event.target.result);
      try {
        const csvText = event.target.result;
        const rows = csvText.split("\n");
        const gradesData = [];
        const startRow =
          rows[0].includes("ID") || rows[0].includes("StudentId") ? 1 : 0;

        const validGrades = ["PASS", "FAIL", "NOGRADE"];
        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;

          const [studentId, grade] = row.split(",");
          if (studentId && grade) {
            // Ensure studentId matches API response exactly
            const cleanStudentId = studentId.trim().toUpperCase();
            const gradeValue = grade.trim().toUpperCase();
            if (validGrades.includes(gradeValue)) {
              gradesData.push({
                studentId: cleanStudentId,
                grade: gradeValue,
              });
            }
          }
        }

        if (gradesData.length > 0) {
          // Merge grades with previous if needed
          // For now, just use the new grades from CSV
          setLocalGrades(gradesData);

          // Log the parsed grades array for verification
          console.log("Parsed gradesData:", gradesData);

          setChangesMade(true);
          Swal.fire({
            title: "Success!",
            text: `Successfully processed ${gradesData.length} student grades from CSV`,
            icon: "success",
            confirmButtonColor: "#992525",
          });
        } else {
          Swal.fire({
            title: "Warning",
            text: "No valid data found in CSV file",
            icon: "warning",
            confirmButtonColor: "#992525",
          });
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        Swal.fire({
          title: "Error!",
          text: "Error parsing CSV file: " + error.message,
          icon: "error",
          confirmButtonColor: "#992525",
        });
      }
    };

    reader.onerror = () => {
      Swal.fire({
        title: "Error!",
        text: "Error reading the CSV file",
        icon: "error",
        confirmButtonColor: "#992525",
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between -mt-4 w-full gap-4 sm:gap-2">
      <div className="flex flex-col xs:flex-row sm:flex-row items-center w-full sm:w-auto gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          {isPeriodLocked && (
            <svg
              className="w-3 h-3 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <label
            htmlFor="inline-checkbox"
            className={`text-xs sm:text-sm font-medium ${
              isPeriodLocked ? "text-gray-400" : "text-gray-900"
            } dark:text-gray-300`}
          >
            Visibility:
          </label>
          <input
            id="inline-checkbox"
            type="checkbox"
            checked={isVisible === "visible"}
            onChange={(e) =>
              !isPeriodLocked &&
              handleVisibilityToggle(e.target.checked ? "visible" : "hidden")
            }
            disabled={isPeriodLocked}
            title={
              isPeriodLocked ? "Period locked - cannot change visibility" : ""
            }
            className={`w-3 h-3 sm:w-4 sm:h-4 ml-2 text-dark-red-2 bg-gray-100 border-gray-300 rounded focus:ring-dark-red-2 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${
              isPeriodLocked ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
        </div>
        <div className="w-full sm:w-auto">
          <div
            className={isPeriodLocked ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <ThinRedButton
              color={isPeriodLocked ? "bg-gray-300" : "bg-grey"}
              hoverColor={isPeriodLocked ? "bg-gray-300" : "bg-grey-2"}
              onClick={() => !isPeriodLocked && csvFileInputRef.current.click()}
              disabled={isPeriodLocked}
              className={`w-full sm:w-auto text-xs sm:text-sm px-3 py-1 flex items-center gap-1 justify-center ${
                isPeriodLocked ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                {isPeriodLocked && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Upload CSV
              </div>
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
          color={isPeriodLocked ? "bg-gray-300" : "bg-dark-red-2"}
          hoverColor={isPeriodLocked ? "bg-gray-300" : "bg-dark-red-5"}
          disabled={saving || isPeriodLocked}
          className={`w-full sm:w-auto text-xs sm:text-sm px-3 py-1 flex items-center gap-1 justify-center ${
            isPeriodLocked ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isPeriodLocked && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>

              {saving ? "Saving..." : "Save"}
            </div>
          )}
        </ThinRedButton>
      </div>
    </div>
  );
}

export default GradeModalFooter;
