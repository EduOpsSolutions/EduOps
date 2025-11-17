import React, { useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdClose, MdUpload } from 'react-icons/md';
import axiosInstance from '../../../utils/axios';
import Swal from 'sweetalert2';
import CSVPreviewModal from './CSVPreviewModal';

function ViewStudentsModal({
  isOpen,
  onClose,
  courseId,
  periodId,
  days,
  time_start,
  time_end,
  onStudentSelected,
  refreshToken,
  scheduleId,
  capacity,
}) {
  const [query, setQuery] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [checkingId, setCheckingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);

  // CSV Import states
  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const [csvValidationData, setCsvValidationData] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef(null);

  const disabled = useMemo(() => !courseId || !periodId, [courseId, periodId]);

  // Reset all state when modal opens or scheduleId changes
  useEffect(() => {
    if (!isOpen) return;

    // Reset all search and selection state
    setQuery('');
    setEnrolledStudents([]);
    setSuggestions([]);
    setSelectedIds([]);

    // Reset all CSV-related state
    setShowCSVPreview(false);
    setCsvValidationData(null);
    setCsvLoading(false);
  }, [isOpen, scheduleId]);

  // Load enrolled students list (main list)
  useEffect(() => {
    if (!isOpen || disabled) return;
    const controller = new AbortController();
    (async () => {
      try {
        setEnrolledLoading(true);

        // If we have a scheduleId, get students directly from the schedule
        if (scheduleId) {
          const resp = await axiosInstance.get(
            `/schedules/${scheduleId}/students`,
            {
              signal: controller.signal,
            }
          );
          const students = Array.isArray(resp.data) ? resp.data : [];
          setEnrolledStudents(students);
          setEnrolledCount(students.length);
          setSelectedIds([]);
        } else {
          // Otherwise, search for enrolled students by course and period
          const resp = await axiosInstance.get(`/users/search-students`, {
            params: {
              courseId,
              periodId,
              enrolledOnly: true,
              take: 50,
            },
            signal: controller.signal,
          });
          const students = Array.isArray(resp.data) ? resp.data : [];
          setEnrolledStudents(students);
          setEnrolledCount(students.length);
          setSelectedIds([]);
        }
      } catch (e) {
        if (e.name !== 'CanceledError') {
          setEnrolledStudents([]);
          setEnrolledCount(0);
        }
      } finally {
        setEnrolledLoading(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen, courseId, periodId, disabled, refreshToken, scheduleId]);

  // Autocomplete suggestions as user types
  useEffect(() => {
    if (!isOpen || disabled) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        setSuggestionsLoading(true);
        const resp = await axiosInstance.get(`/users/search-students`, {
          params: {
            q: query,
            courseId,
            periodId,
            take: 10,
          },
          signal: controller.signal,
        });
        setSuggestions(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        if (e.name !== 'CanceledError') {
          setSuggestions([]);
        }
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [isOpen, query, courseId, periodId, disabled]);

  const handleSelect = async (student) => {
    if (!days || !time_start || !time_end) {
      onStudentSelected?.({ student, conflict: null });
      return;
    }
    try {
      setCheckingId(student.id);
      const resp = await axiosInstance.post('/users/students/conflicts', {
        studentId: student.id,
        periodId,
        days,
        time_start,
        time_end,
      });
      onStudentSelected?.({ student, conflict: resp.data });
    } catch (e) {
      onStudentSelected?.({ student, conflict: { hasConflicts: false } });
    } finally {
      setCheckingId(null);
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allVisibleIds = useMemo(
    () => enrolledStudents.map((s) => s.id),
    [enrolledStudents]
  );

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === allVisibleIds.length ? [] : allVisibleIds
    );
  };

  const handleBatchDelete = async () => {
    if (!scheduleId || selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: 'Remove selected students?',
      text: 'This will detach them from this schedule.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#992525',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.post(
        `/schedules/${scheduleId}/students:batch-delete`,
        {
          userIds: selectedIds,
        }
      );
      setSelectedIds([]);
      // trigger refresh from parent via refreshToken or local reload
      const controller = new AbortController();
      setEnrolledLoading(true);

      // Refresh the list based on whether we have scheduleId
      if (scheduleId) {
        const resp = await axiosInstance.get(
          `/schedules/${scheduleId}/students`,
          {
            signal: controller.signal,
          }
        );
        const students = Array.isArray(resp.data) ? resp.data : [];
        setEnrolledStudents(students);
        setEnrolledCount(students.length);
      } else {
        const resp = await axiosInstance.get(`/users/search-students`, {
          params: { courseId, periodId, enrolledOnly: true, take: 100 },
          signal: controller.signal,
        });
        const students = Array.isArray(resp.data) ? resp.data : [];
        setEnrolledStudents(students);
        setEnrolledCount(students.length);
      }
    } catch (e) {
      // swallow
    } finally {
      setEnrolledLoading(false);
    }
  };

  const handleCSVUpload = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text, skipFirstRow = false) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const studentIds = [];

    // Skip first row if it's a header
    const startIndex = skipFirstRow ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      studentIds.push(...values);
    }

    // Filter out empty IDs and remove duplicates using Set
    const validIds = studentIds.filter((id) => id && id.length > 0);
    const uniqueIds = [...new Set(validIds)];

    // Log if duplicates were found
    if (validIds.length !== uniqueIds.length) {
      console.log(`Removed ${validIds.length - uniqueIds.length} duplicate ID(s) from CSV`);
    }

    return uniqueIds;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    try {
      setCsvLoading(true);

      // Read CSV file
      const text = await file.text();

      // Ask user if first row is a header
      const result = await Swal.fire({
        title: 'CSV Format',
        text: 'Does your CSV file have a header row?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, skip first row',
        cancelButtonText: 'No, include all rows',
        confirmButtonColor: '#992525',
        reverseButtons: true,
      });

      const skipFirstRow = result.isConfirmed;
      const studentIds = parseCSV(text, skipFirstRow);

      if (studentIds.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid CSV',
          text: 'No student IDs found in the CSV file.',
        });
        return;
      }

      // Validate with backend (backend expects 'userIds' parameter)
      const resp = await axiosInstance.post(
        `/schedules/${scheduleId}/students:validate-bulk`,
        {
          userIds: studentIds,
          days,
          time_start,
          time_end,
          periodId
        }
      );

      setCsvValidationData(resp.data);
      setShowCSVPreview(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'CSV Upload Failed',
        text: error.response?.data?.message || 'Failed to process CSV file',
      });
    } finally {
      setCsvLoading(false);
    }
  };

  const handleConfirmCSVImport = async (modifiedData) => {
    // Use modifiedData if provided (from user editing), otherwise use original validation data
    const dataToUse = modifiedData || csvValidationData;
    if (!dataToUse) return;

    try {
      setCsvLoading(true);

      // Extract approved and conflicts student IDs (dbId)
      const studentIdsToAdd = [
        ...dataToUse.approved.map((s) => s.dbId),
        ...dataToUse.conflicts.map((s) => s.dbId),
      ];

      // Remove duplicates using Set (defensive measure)
      const uniqueStudentIds = [...new Set(studentIdsToAdd)];

      if (uniqueStudentIds.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Students to Add',
          text: 'There are no valid students to add.',
        });
        return;
      }

      // Log if duplicates were found
      if (studentIdsToAdd.length !== uniqueStudentIds.length) {
        console.log(`Removed ${studentIdsToAdd.length - uniqueStudentIds.length} duplicate student(s) before adding`);
      }

      // Call bulk add endpoint
      await axiosInstance.post(`/schedules/${scheduleId}/students:bulk-add`, {
        userIds: uniqueStudentIds,
      });

      // Close CSV preview modal
      setShowCSVPreview(false);
      setCsvValidationData(null);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Students Added',
        text: `Successfully added ${uniqueStudentIds.length} student(s) to the schedule.`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh enrolled students list
      const controller = new AbortController();
      setEnrolledLoading(true);
      const resp = await axiosInstance.get(
        `/schedules/${scheduleId}/students`,
        {
          signal: controller.signal,
        }
      );
      const students = Array.isArray(resp.data) ? resp.data : [];
      setEnrolledStudents(students);
      setEnrolledCount(students.length);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text:
          error.response?.data?.message || 'Failed to add students to schedule',
      });
    } finally {
      setCsvLoading(false);
      setEnrolledLoading(false);
    }
  };

  const handleCloseCSVPreview = () => {
    setShowCSVPreview(false);
    setCsvValidationData(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold">List of Students</h3>
              {capacity && (
                <p className="text-sm text-gray-600 mt-1">
                  Enrolled: {enrolledCount} / {capacity}
                  {enrolledCount >= capacity && (
                    <span className="ml-2 text-red-600 font-medium">
                      (Full)
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <MdClose size={22} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                className="px-3 py-2 bg-dark-red-2 text-white rounded disabled:opacity-50 flex items-center gap-2"
                onClick={handleCSVUpload}
                disabled={!scheduleId || csvLoading}
              >
                {csvLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <MdUpload size={16} />
                Import CSV
              </button>
              <input
                type="text"
                placeholder="Search by ID, Name, or Email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={disabled}
              />
              {query && (
                <div className="absolute left-[160px] right-20 bottom-full mb-1 z-10 bg-white border border-gray-200 rounded shadow max-h-64 overflow-y-auto">
                  {suggestionsLoading && (
                    <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-red"></div>
                      Searching…
                    </div>
                  )}
                  {!suggestionsLoading && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No matches
                    </div>
                  )}
                  {!suggestionsLoading &&
                    suggestions.map((s) => (
                      <button
                        key={`sugg-${s.id}`}
                        type="button"
                        onClick={() => handleSelect(s)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="text-sm font-medium truncate">
                          {s.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {s.userId} • {s.email}
                        </div>
                      </button>
                    ))}
                </div>
              )}
              {/* <button
                type="button"
                className="px-3 py-2 bg-dark-red-2 text-white rounded disabled:opacity-50"
                disabled
              >
                +
              </button> */}
            </div>

            <div className="grid grid-cols-12 text-sm font-semibold border-b pb-2 items-center">
              <div className="col-span-1 px-2">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === allVisibleIds.length
                  }
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="col-span-2">Student ID</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Email</div>
              {/* <div className="col-span-1 text-right">Enrolled</div> */}
            </div>

            <div className="divide-y overflow-y-auto max-h-[50vh]">
              {enrolledLoading && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red mb-3"></div>
                  <span className="text-sm">Loading students...</span>
                </div>
              )}
              {!enrolledLoading && enrolledStudents.length === 0 && (
                <div className="py-6 text-center text-gray-500">No results</div>
              )}
              {!enrolledLoading &&
                enrolledStudents.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    // onClick={() => handleSelect(s)}
                    className="w-full grid grid-cols-12 items-center py-3 hover:bg-gray-50 text-left cursor-default"
                  >
                    <div className="col-span-1 px-2">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={selectedIds.includes(s.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelected(s.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div
                      className="col-span-2 truncate"
                      title={s.userId || String(idx + 1)}
                    >
                      {s.userId || idx + 1}
                    </div>
                    <div className="col-span-5 truncate" title={s.name}>
                      {s.name}
                    </div>
                    <div className="col-span-3 truncate" title={s.email}>
                      {s.email}
                    </div>
                    {/* <div className="col-span-1 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          s.enrolledInCourse
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.enrolledInCourse ? 'Yes' : 'No'}
                      </span>
                    </div> */}
                    {checkingId === s.id && (
                      <div className="col-span-12 text-xs text-gray-500 pl-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-dark-red"></div>
                        Checking conflicts…
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          <div className="p-4 border-t flex flex-row gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-dark-red-2 text-white rounded h-10"
              onClick={onClose}
            >
              Close
            </button>

            {selectedIds.length > 0 && (
              <div className="flex flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-dark-red-2 text-white rounded h-10"
                  disabled={!scheduleId}
                >
                  Remove Selected
                </button>
                <p className="text-xs">{selectedIds.length} selected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSV Preview Modal */}
      <CSVPreviewModal
        isOpen={showCSVPreview}
        onClose={handleCloseCSVPreview}
        validationData={csvValidationData}
        onConfirm={handleConfirmCSVImport}
        loading={csvLoading}
      />
    </>
  );
}

ViewStudentsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string,
  periodId: PropTypes.string,
  days: PropTypes.string,
  time_start: PropTypes.string,
  time_end: PropTypes.string,
  onStudentSelected: PropTypes.func,
  refreshToken: PropTypes.number,
  scheduleId: PropTypes.number,
  capacity: PropTypes.number,
};

export default ViewStudentsModal;
