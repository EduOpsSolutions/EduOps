import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";
import { getCookieItem } from "../../../utils/jwt";

function EditCourseModal({
  edit_course_modal,
  setEditCourseModal,
  selectedCourse,
  fetchCourses,
  isLocked = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    visibility: "hidden",
    price: "",
    adviser: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalData, setOriginalData] = useState({});

  // Requisites state
  const [allCourses, setAllCourses] = useState([]);
  const [requisites, setRequisites] = useState([]);
  const [newRequisite, setNewRequisite] = useState({
    type: "prerequisite",
    requisiteCourseId: "",
    ruleName: "",
  });
  const [loadingRequisites, setLoadingRequisites] = useState(false);
  const [addError, setAddError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (selectedCourse && edit_course_modal) {
      const courseData = {
        name: selectedCourse.name || "",
        visibility: selectedCourse.visibility || "hidden",
        price: selectedCourse.price || "",
        adviser: selectedCourse.adviserId || "",
      };
      setFormData(courseData);
      setOriginalData(courseData);
    }
  }, [selectedCourse, edit_course_modal]);

  useEffect(() => {
    if (!edit_course_modal) {
      setFormData({
        name: "",
        visibility: "hidden",
        price: "",
        adviser: "",
      });
      setOriginalData({});
      setError("");
    }
  }, [edit_course_modal]);

  // Fetch all courses for dropdown
  useEffect(() => {
    async function fetchAllCourses() {
      try {
        const token = getCookieItem("token") || "";
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllCourses(data);
      } catch (err) {
        setAllCourses([]);
      }
    }
    fetchAllCourses();
  }, []);

  // Fetch requisites for this course
  useEffect(() => {
    async function fetchRequisites() {
      if (!selectedCourse) return;
      setLoadingRequisites(true);
      try {
        const token = getCookieItem("token") || "";
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/course-requisites?courseId=${selectedCourse.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setRequisites(data);
      } catch (err) {
        setRequisites([]);
      } finally {
        setLoadingRequisites(false);
      }
    }
    fetchRequisites();
  }, [selectedCourse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Course name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError("Valid price is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const changed = hasChanges();
    if (changed) {
      const result = await Swal.fire({
        title: "Save Changes?",
        text: "Do you want to save your edits to this course?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#890E07",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, save",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });
      if (!result.isConfirmed) return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        visibility: formData.visibility,
        price: parseFloat(formData.price),
      };

      const response = await axiosInstance.put(
        `/courses/${selectedCourse.id}`,
        payload
      );
      console.log("Course updated:", response.data);

      await fetchCourses();
      if (changed) {
        Swal.fire({
          title: "Saved!",
          text: "Your changes have been saved successfully.",
          icon: "success",
          confirmButtonColor: "#890E07",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setEditCourseModal(false);
    } catch (error) {
      console.error(
        "Failed to update course: ",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          "Failed to update course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return Object.entries(formData).some(([key, value]) => {
      return JSON.stringify(value) !== JSON.stringify(originalData[key]);
    });
  };

  const handleClose = () => {
    if (hasChanges()) {
      Swal.fire({
        title: "Discard Changes?",
        text: "You have unsaved changes. Do you want to discard them?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, discard",
        cancelButtonText: "No, keep editing",
        confirmButtonColor: "#992525",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setEditCourseModal(false);
        }
      });
    } else {
      setEditCourseModal(false);
    }
  };

  // Add new requisite
  const handleAddRequisite = async () => {
    setAddError("");
    if (!selectedCourse || !newRequisite.requisiteCourseId) {
      setAddError("Please select a course.");
      return;
    }
    if (newRequisite.requisiteCourseId === selectedCourse.id) {
      setAddError("A course cannot be its own requisite.");
      return;
    }
    if (requisites.some((r) => r.requisiteCourseId === newRequisite.requisiteCourseId)) {
      setAddError("This course is already a requisite.");
      return;
    }
    try {
      const token = getCookieItem("token") || "";
      const res = await fetch(`${process.env.REACT_APP_API_URL}/course-requisites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          requisiteCourseId: newRequisite.requisiteCourseId,
          type: newRequisite.type,
          ruleName: newRequisite.ruleName,
        }),
      });
      if (res.ok) {
        setNewRequisite({
          type: "prerequisite",
          requisiteCourseId: "",
          ruleName: "",
        });
        // Fetch the full course object for the requisite so the name appears immediately
        const data = await res.json();
        const courseObj = allCourses.find((c) => c.id === data.requisiteCourseId);
        setRequisites((prev) => [
          ...prev,
          {
            ...data,
            requisiteCourse: courseObj || { id: data.requisiteCourseId, name: data.requisiteCourseId },
          },
        ]);
      } else {
        const errData = await res.json();
        setAddError(errData.error || "Failed to add requisite.");
      }
    } catch (err) {
      setAddError("Failed to add requisite.");
    }
  };

  // Delete requisite
  const handleDeleteRequisite = async (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const token = getCookieItem("token") || "";
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/course-requisites/${confirmDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setRequisites((prev) => prev.filter((r) => r.id !== confirmDeleteId));
      }
    } catch (err) {}
    setConfirmDeleteId(null);
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  if (!edit_course_modal) return null;

  const visibilityOptions = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Course</h2>
            <button
              className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
              onClick={handleClose}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <ModalTextField
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
            />

            <div className="flex flex-row justify-center items-center gap-4">
              {!isLocked && (
                <ModalSelectField
                  label="Visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  options={visibilityOptions}
                  className="w-1/2"
                />
              )}

              <ModalTextField
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                required
                className={isLocked ? "w-full" : "w-1/2"}
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>

          {/* Course Requisites */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Course Requisites</h3>
            {loadingRequisites ? (
              <div className="text-gray-500">Loading requisites...</div>
            ) : (
              <>
                <table className="min-w-full mb-4 border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2 font-medium text-sm">
                        Type
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-sm">
                        Course
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-sm">
                        Rule Name
                      </th>
                      <th className="text-center px-3 py-2 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisites.map((req) => (
                      <tr key={req.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 capitalize text-xs sm:text-sm">
                          {req.type}
                        </td>
                        <td className="px-3 py-2 text-xs sm:text-sm">
                          {req.requisiteCourse?.name || req.requisiteCourseId}
                        </td>
                        <td className="px-3 py-2 text-xs sm:text-sm">
                          {req.ruleName}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleDeleteRequisite(req.id)}
                            className="text-red-600 hover:underline text-xs sm:text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {requisites.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-gray-500 text-center py-3">
                          No requisites set.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Delete confirmation dialog */}
                {confirmDeleteId && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs border border-gray-300">
                      <p className="mb-4 text-center text-sm">
                        Are you sure you want to delete this requisite?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={confirmDelete}
                          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="bg-gray-200 text-gray-800 px-4 py-1 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 items-center p-3 rounded shadow border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <select
                      value={newRequisite.type}
                      onChange={(e) =>
                        setNewRequisite((n) => ({ ...n, type: e.target.value }))
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="prerequisite">Prerequisite</option>
                      <option value="corequisite">Corequisite</option>
                    </select>
                    <select
                      value={newRequisite.requisiteCourseId}
                      onChange={(e) =>
                        setNewRequisite((n) => ({
                          ...n,
                          requisiteCourseId: e.target.value,
                        }))
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Select Course</option>
                      {allCourses
                        .filter(
                          (c) =>
                            c.id !== selectedCourse?.id &&
                            !requisites.some((r) => r.requisiteCourseId === c.id)
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Rule Name (optional)"
                      value={newRequisite.ruleName}
                      onChange={(e) =>
                        setNewRequisite((n) => ({ ...n, ruleName: e.target.value }))
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddRequisite}
                    className="bg-dark-red-2 text-white px-4 py-1 rounded hover:bg-dark-red-5 text-sm font-semibold mt-2 sm:mt-0"
                    disabled={!newRequisite.requisiteCourseId}
                  >
                    Add Requisite
                  </button>
                </div>
                {addError && (
                  <div className="text-red-600 text-xs mt-2">{addError}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EditCourseModal;
