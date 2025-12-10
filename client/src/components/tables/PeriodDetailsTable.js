import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ThinRedButton from "../buttons/ThinRedButton";
import CreateEditScheduleModal from "../modals/schedule/CreateEditScheduleModal";
import axiosInstance from "../../utils/axios";
import { useEnrollmentPeriodStore } from "../../stores/enrollmentPeriodStore";

//Table after clicking a result from enrollment period
function PeriodDetailsTable({
  periodCourses,
  onDeleteCourse,
  selectedPeriod,
  onAddCourse,
  onBack,
}) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [isLoadingAcademicPeriods, setIsLoadingAcademicPeriods] =
    useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const resp = await axiosInstance.get(
          "/users?role=teacher&status=active"
        );
        setTeachers(resp.data?.data || resp.data || []);
      } catch (e) {
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const resp = await axiosInstance.get("/courses");
        setCourses(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    const fetchPeriods = async () => {
      setIsLoadingAcademicPeriods(true);
      try {
        const resp = await axiosInstance.get("/academic-periods");
        const visible = (resp.data || [])
          .filter((p) => p && !p.deletedAt)
          .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
        setAcademicPeriods(visible);
      } catch (e) {
        setAcademicPeriods([]);
      } finally {
        setIsLoadingAcademicPeriods(false);
      }
    };

    fetchTeachers();
    fetchCourses();
    fetchPeriods();
  }, []);

  const handleOpenManage = (s) => {
    const toYmd = (val) => {
      if (!val) return "";
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val))
        return val;
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    };
    const toHm = (val) => {
      if (!val) return "";
      if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) return val;
      if (typeof val === "string" && /^\d{2}:\d{2}:\d{2}/.test(val))
        return val.slice(0, 5);
      return String(val).slice(0, 5);
    };
    const event = {
      id: s.id,
      courseId: s.course?.id || "",
      courseName: s.course?.name || "",
      academicPeriodId: selectedPeriod?.id || "",
      academicPeriodName: `${selectedPeriod?.periodName || ""}${
        selectedPeriod?.batchName ? ` - ${selectedPeriod.batchName}` : ""
      }`,
      teacherId: s.teacher?.id || "",
      teacherName: s.teacher
        ? `${s.teacher.firstName} ${s.teacher.lastName}`
        : "",
      location: s.location || "",
      time_start: toHm(s.time_start),
      time_end: toHm(s.time_end),
      days: s.days || "",
      periodStart: toYmd(s.periodStart),
      periodEnd: toYmd(s.periodEnd),
      notes: s.notes || "",
      color: s.color || "#FFCF00",
    };
    setSelectedEvent(event);
    setShowScheduleModal(true);
  };

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent?.id) {
        await axiosInstance.put(`/schedules/${selectedEvent.id}`, eventData);
      } else {
        await axiosInstance.post("/schedules", eventData);
      }
      const { fetchPeriodCourses } = useEnrollmentPeriodStore.getState();
      await fetchPeriodCourses();
      handleCloseModal();
    } catch (e) {}
  };

  const handleDeleteEvent = async (event) => {
    try {
      await axiosInstance.delete(`/schedules/${event.id}`);
      const { fetchPeriodCourses } = useEnrollmentPeriodStore.getState();
      await fetchPeriodCourses();
      handleCloseModal();
    } catch (e) {}
  };
  return (
    <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-5">
      <div className="flex justify-between items-center pb-4 border-b-2 border-dark-red-2">
        <h2 className="text-base sm:text-lg font-bold">Course Offered</h2>
        <button
          className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-1.5 px-2 flex items-center justify-center text-sm sm:text-base font-semibold"
          onClick={onAddCourse}
          aria-label="Add course"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 sm:w-5 sm:h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
          <p className="text-lg sm:text-xl uppercase text-center sm:text-left flex-grow">
            {selectedPeriod.batchName} (
            {new Date(selectedPeriod.startAt).getFullYear()})
          </p>

          <div className="flex gap-2">
            {/* Edit Period button - always visible */}
            <button
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-2 px-4 text-sm font-semibold whitespace-nowrap"
              onClick={() => {
                useEnrollmentPeriodStore.setState({
                  editAcademicPeriodModal: true,
                  selectedPeriodForEdit: selectedPeriod
                });
              }}
              aria-label="Edit period"
            >
              Edit Period
            </button>

            {/* Show End Enrollment button only if enrollment is open */}
            {selectedPeriod.enrollmentStatus === "Open" && (
            <button
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-2 px-4 text-sm font-semibold whitespace-nowrap"
              onClick={async () => {
                const result = await Swal.fire({
                  title: "End Enrollment?",
                  html: `Are you sure you want to end enrollment for <strong>${selectedPeriod.batchName}</strong>?<br><br>This will:<br>• Set enrollment status to Closed<br>• Set enrollment close date to now<br>• Prevent new enrollment requests`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, end enrollment",
                  cancelButtonText: "Cancel",
                  confirmButtonColor: "#ff0000",
                  cancelButtonColor: "#6b7280",
                  reverseButtons: true,
                });
                if (result.isConfirmed) {
                  const { endEnrollment, fetchPeriods, handleBackToResults } =
                    useEnrollmentPeriodStore.getState();
                  const response = await endEnrollment(selectedPeriod.id);
                  if (response.success) {
                    await Swal.fire({
                      title: "Enrollment Ended!",
                      text: "The enrollment period has been closed successfully.",
                      icon: "success",
                      confirmButtonColor: "#ff0000",
                      timer: 2000,
                      showConfirmButton: false,
                    });
                    await fetchPeriods();
                    // Go back to results to show updated enrollment status
                    handleBackToResults();
                  } else {
                    await Swal.fire({
                      title: "Error!",
                      text:
                        response.error ||
                        "Failed to end enrollment. Please try again.",
                      icon: "error",
                      confirmButtonColor: "#ff0000",
                    });
                  }
                }
              }}
              aria-label="End enrollment"
            >
              End Enrollment
            </button>
          )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-dark-red-2">
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Course
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Schedules
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Capacity
                </th>
                <th className="py-2 sm:py-3 font-semibold text-center text-sm sm:text-base">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {periodCourses.length > 0 ? (
                periodCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[rgb(137,14,7,.49)] hover:bg-gray-50 align-top"
                  >
                    <td className="py-2 sm:py-3 text-center text-sm sm:text-base">
                      {course.course}
                    </td>
                    <td className="py-2 sm:py-3 text-left text-sm sm:text-base">
                      {Array.isArray(course.schedules) &&
                      course.schedules.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {course.schedules.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-2 p-2 rounded border border-gray-200"
                            >
                              <div className="text-xs sm:text-sm">
                                <div className="font-medium">
                                  {s.days} • {s.time_start} - {s.time_end}
                                </div>
                                <div className="text-gray-500">
                                  {s.teacher?.firstName && s.teacher?.lastName
                                    ? `${s.teacher.firstName} ${s.teacher.lastName}`
                                    : ""}
                                  {s.location
                                    ? (s.teacher ? " • " : "") + s.location
                                    : ""}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenManage(s)}
                                className="text-dark-red-2 hover:underline text-xs sm:text-sm whitespace-nowrap"
                                title="Manage schedule"
                              >
                                Manage
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No schedules</span>
                      )}
                    </td>
                    <td className="py-2 sm:py-3 text-center text-sm sm:text-base">
                      {course.enrolledStudents}
                    </td>
                    <td className="py-2 sm:py-3 text-center">
                      <button
                        className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 text-center shadow-sm shadow-black ease-in duration-150"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Delete Course?",
                            text: "Are you sure you want to remove this course from the period?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete",
                            cancelButtonText: "Cancel",
                            confirmButtonColor: "#992525",
                            cancelButtonColor: "#6b7280",
                            reverseButtons: true,
                          });
                          if (result.isConfirmed) {
                            await onDeleteCourse(course.id);
                            await Swal.fire({
                              title: "Deleted!",
                              text: "The course has been removed from the period.",
                              icon: "success",
                              confirmButtonColor: "#890E07",
                              timer: 2000,
                              showConfirmButton: false,
                            });
                          }
                        }}
                        aria-label="Delete course"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base"
                  >
                    No courses found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <ThinRedButton onClick={onBack}>Back to Results</ThinRedButton>
      </div>

      <CreateEditScheduleModal
        isOpen={showScheduleModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        selectedDate={null}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teachers={teachers}
        isLoadingTeachers={isLoadingTeachers}
        courses={courses}
        isLoadingCourses={isLoadingCourses}
        academicPeriods={academicPeriods}
        isLoadingAcademicPeriods={isLoadingAcademicPeriods}
      />
    </div>
  );
}

export default PeriodDetailsTable;
