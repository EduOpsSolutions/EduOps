import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";
import ModalTextField from "../../form/ModalTextField";
import ModalSelectField from "../../form/ModalSelectField";

import { getCookieItem } from "../../../utils/jwt";

function CreateCourseModal({
  setCreateCourseModal,
  create_course_modal,
  fetchCourses,
  isLocked = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    visibility: "hidden",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Requisites state (mirroring EditCourseModal)
  const [allCourses, setAllCourses] = useState([]);
  const [requisites, setRequisites] = useState([]);
  const [newRequisite, setNewRequisite] = useState({
    type: "prerequisite",
    requisiteCourseId: "",
    ruleName: "",
  });
  // const [loadingRequisites, setLoadingRequisites] = useState(false); // Not used in create modal
  const [addError, setAddError] = useState("");
  const [showAddRequisite, setShowAddRequisite] = useState(false);
  // Fetch all courses for dropdown (for requisites)
  useEffect(() => {
    async function fetchAllCourses() {
      if (!create_course_modal) return;
      try {
  const token = (typeof getCookieItem === "function" ? getCookieItem("token") : "") || "";
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
  }, [create_course_modal]);

  // Helper to reset all modal state
  const resetModalState = () => {
    setFormData({ name: "", visibility: "hidden", price: "" });
    setError("");
    setRequisites([]);
    setShowAddRequisite(false);
    setAddError("");
    setNewRequisite({ type: "prerequisite", requisiteCourseId: "", ruleName: "" });
    setOriginalForm({ name: "", visibility: "hidden", price: "" });
    setOriginalRequisites([]);
  };

  useEffect(() => {
    if (!create_course_modal) {
      resetModalState();
    }
  }, [create_course_modal]);

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
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 1) {
      setError("Price must be at least ₱1.00");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (hasChanges()) {
      const result = await Swal.fire({
        title: "Create Course?",
        text: "Do you want to create this course?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#890E07",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, create",
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

      const response = await axiosInstance.post("/courses/create", payload);
      const createdCourse = response.data;
      if (requisites.length > 0 && createdCourse && createdCourse.id) {
        const token = (typeof getCookieItem === "function" ? getCookieItem("token") : "") || "";
        for (const req of requisites) {
          await fetch(`${process.env.REACT_APP_API_URL}/course-requisites`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              courseId: createdCourse.id,
              requisiteCourseId: req.requisiteCourseId,
              type: req.type,
              ruleName: req.ruleName,
            }),
          });
        }
      }

      await fetchCourses();
      Swal.fire({
        title: "Created!",
        text: "The course has been created successfully.",
        icon: "success",
        confirmButtonColor: "#890E07",
        timer: 2000,
        showConfirmButton: false,
      });
  setCreateCourseModal(false);
  resetModalState();
    } catch (error) {
      console.error(
        "Failed to create course: ",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          "Failed to create course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequisite = () => {
    setAddError("");
    if (!newRequisite.requisiteCourseId) {
      setAddError("Please select a course.");
      return;
    }
    if (requisites.some((r) => r.requisiteCourseId === newRequisite.requisiteCourseId)) {
      setAddError("This course is already a requisite.");
      return;
    }
    const courseObj = allCourses.find((c) => c.id === newRequisite.requisiteCourseId);
    setRequisites((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        requisiteCourseId: newRequisite.requisiteCourseId,
        type: newRequisite.type,
        ruleName: newRequisite.ruleName,
        requisiteCourse: courseObj || { id: newRequisite.requisiteCourseId, name: newRequisite.requisiteCourseId },
        _local: true,
      },
    ]);
    setNewRequisite({
      type: "prerequisite",
      requisiteCourseId: "",
      ruleName: "",
    });
    setShowAddRequisite(false);
  };

  const handleDeleteRequisite = async (id) => {
    const result = await Swal.fire({
      title: "Delete Requisite?",
      text: "Are you sure you want to delete this requisite? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#890E07",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    setRequisites((prev) => prev.filter((r) => r.id !== id));
  };

  const [originalForm, setOriginalForm] = useState({
    name: "",
    visibility: "hidden",
    price: "",
  });
  const [originalRequisites, setOriginalRequisites] = useState([]);

  useEffect(() => {
    if (!create_course_modal) {
      setOriginalForm({ name: "", visibility: "hidden", price: "" });
      setOriginalRequisites([]);
    } else {
      setOriginalForm(formData);
      setOriginalRequisites([]); 
    }
    // eslint-disable-next-line
  }, [create_course_modal]);

  const hasChanges = () => {
    // Form changes
    const formChanged = Object.entries(formData).some(([key, value]) => {
      return JSON.stringify(value) !== JSON.stringify(originalForm[key]);
    });
    // Requisites changes
    const serialize = (arr) => arr.map(r => ({
      requisiteCourseId: r.requisiteCourseId,
      type: r.type,
      ruleName: r.ruleName || ""
    })).sort((a, b) => a.requisiteCourseId.localeCompare(b.requisiteCourseId));
    const reqChanged = JSON.stringify(serialize(requisites)) !== JSON.stringify(serialize(originalRequisites));
    return formChanged || reqChanged;
  };

  const handleClose = () => {
    setShowAddRequisite(false);
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
          setCreateCourseModal(false);
          resetModalState();
        }
      });
    } else {
      setCreateCourseModal(false);
      resetModalState();
    }
  };

  if (!create_course_modal) return null;

  const visibilityOptions = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-visible">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold">Course Creation</h2>
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
            {/* Course Name */}
            <ModalTextField
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
            />

            {/* Row: Visibility, Price */}
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
                min="1"
                required
                className={isLocked ? "w-full" : "w-1/2"}
              >
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₱
                </span>
              </ModalTextField>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-300">
              <h3 className="font-semibold text-lg mb-4">Course Requisites</h3>
              {(
                <>
                  {/* Requisites Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left px-3 py-2 font-medium text-sm">Type</th>
                          <th className="text-left px-3 py-2 font-medium text-sm">Course</th>
                          <th className="text-left px-3 py-2 font-medium text-sm hidden sm:table-cell">Rule Name</th>
                          <th className="text-center px-3 py-2 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {requisites.map((req) => (
                          <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2 capitalize text-xs sm:text-sm">
                              {req.type}
                            </td>
                            <td className="px-3 py-2 text-xs sm:text-sm">
                              {req.requisiteCourse?.name || req.requisiteCourseId}
                            </td>
                            <td className="px-3 py-2 text-xs sm:text-sm hidden sm:table-cell">
                              {req.ruleName || '-'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
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
                            <td colSpan={4} className="text-gray-500 text-center py-3 text-sm">
                              No requisites set.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Requisite Button & Conditional Form */}
                  {!showAddRequisite && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        className="bg-dark-red-2 text-white px-4 py-2 rounded hover:bg-dark-red-5 text-sm font-semibold transition-colors duration-150"
                        onClick={() => setShowAddRequisite(true)}
                      >
                        Add Requisite
                      </button>
                    </div>
                  )}
                  {showAddRequisite && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Add New Requisite</p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <select
                            value={newRequisite.type}
                            onChange={(e) =>
                              setNewRequisite((n) => ({ ...n, type: e.target.value }))
                            }
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-transparent"
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
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-transparent"
                          >
                            <option value="">Select Course</option>
                            {allCourses
                              .filter(
                                (c) =>
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
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleAddRequisite}
                            className="bg-dark-red-2 text-white px-4 py-2 rounded hover:bg-dark-red-5 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!newRequisite.requisiteCourseId}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddRequisite(false); setAddError(""); }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-semibold transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                        {addError && (
                          <div className="text-red-600 text-xs">{addError}</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-300">
              <button
                type="submit"
                disabled={loading || !hasChanges()}
                className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateCourseModal;
