import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsFileEarmarkText,
  BsFileEarmarkBarGraph,
  BsFileEarmarkSpreadsheet,
  BsEye,
  BsCalendar,
  BsPeople,
  BsCash,
  BsBook,
  BsClipboardCheck,
  BsFileEarmarkPdf,
  BsGraphUp,
  BsX,
} from 'react-icons/bs';
import useAuthStore from '../../stores/authStore';
import axiosInstance from '../../utils/axios';
import Swal from 'sweetalert2';

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [reportParams, setReportParams] = useState({});
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [isTeachersDropdownOpen, setIsTeachersDropdownOpen] = useState(false);

  const { getToken } = useAuthStore();
  const navigate = useNavigate();

  const fetchAcademicPeriods = async () => {
    try {
      const token = getToken();
      const response = await axiosInstance.get(`/academic-periods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      console.log('Academic periods fetched:', data);
      console.log('Type of data:', Array.isArray(data), typeof data);

      // Handle both array response and object with data property
      if (Array.isArray(data)) {
        setAcademicPeriods(data);
      } else if (data && !data.error && data.data) {
        setAcademicPeriods(data.data);
      } else if (data && !data.error) {
        setAcademicPeriods([data]);
      }

      console.log('Academic periods state updated');
    } catch (error) {
      console.error('Error fetching academic periods:', error);
    }
  };

  const fetchTeachers = async () => {
    // to use for report parameters
    // {
    //   name: 'teacherIds',
    //   label: 'Teachers (Multi-select)',
    //   type: 'multiselect',
    //   source: 'teachers',
    //   searchable: true,
    //   required: false // or true if needed
    // }
    try {
      const token = getToken();
      const response = await axiosInstance.get(`/users/role/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log('Teachers fetched:', data);
      console.log('Type of data:', Array.isArray(data), typeof data);

      // Handle both array response and object with data property
      if (Array.isArray(data)) {
        setTeachers(data);
      } else if (data && !data.error && data.data) {
        setTeachers(data.data);
      } else if (data && !data.error) {
        setTeachers([data]);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = getToken();
      const response = await axiosInstance.get(`/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      console.log('Courses fetched:', data);

      // Handle both array response and object with data property
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data && !data.error && data.data) {
        setCourses(data.data);
      } else if (data && !data.error) {
        setCourses([data]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Hardcoded list of reports for educational operations system
  const reports = [
    {
      //done
      id: 1,
      name: 'Student Enrollment Report',
      description:
        'Comprehensive list of all students with their enrollment status, academic period, courses enrolled, and account status',
      category: 'Enrollment',
      icon: <BsPeople className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      endpoint: 'student-enrollment',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
          required: true,
        },
        {
          name: 'courseIds',
          label: 'Courses (Multi-select)',
          type: 'multiselect',
          source: 'courses',
          searchable: true,
          required: true,
        },
        {
          name: 'studentEnrollmentStatus',
          label: 'Student Enrollment Status',
          type: 'select',
          options: [
            { value: 'all', label: 'All Students' },
            { value: 'enrolled', label: 'Enrolled' },
            { value: 'not_enrolled', label: 'Not Enrolled' },
          ],
          default: 'all',
        },
        {
          name: 'accountStatus',
          label: 'Account Status',
          type: 'select',
          options: [
            { value: null, label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 2,
      name: 'Financial Assessment Summary',
      description:
        'Overview of student assessments, fees, payments, and outstanding balances',
      category: 'Financial',
      icon: <BsCash className="text-2xl" />,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      endpoint: 'financial-assessment',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        { name: 'status', label: 'Status', type: 'text' },
        { name: 'minBalance', label: 'Min Balance', type: 'number' },
        { name: 'maxBalance', label: 'Max Balance', type: 'number' },
      ],
    },
    {
      id: 3,
      name: 'Grade Distribution Report',
      description:
        'Analysis of grade distributions across courses, programs, and academic periods',
      category: 'Academic',
      icon: <BsGraphUp className="text-2xl" />,
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      endpoint: 'grade-distribution',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        { name: 'courseId', label: 'Course ID', type: 'text' },
        { name: 'gradeRange', label: 'Grade Range', type: 'text' },
      ],
    },
    {
      //Done
      id: 4,
      name: 'Course Enrollment Statistics',
      description: 'Student count per course and schedule capacity',
      category: 'Enrollment',
      icon: <BsBook className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      endpoint: 'course-enrollment-stats',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period/ Batch',
          type: 'select',
          source: 'academicPeriods',
          required: true,
        },
        {
          name: 'courseIds',
          label: 'Courses (Multi-select)',
          type: 'multiselect',
          source: 'courses',
          searchable: true,
        },
      ],
    },
    {
      id: 5,
      name: 'Transaction History Report',
      description:
        'Detailed log of all financial transactions including payments, refunds, and adjustments',
      category: 'Financial',
      icon: <BsFileEarmarkBarGraph className="text-2xl" />,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      endpoint: 'transaction-history',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        { name: 'startDate', label: 'Start Date', type: 'date' },
        { name: 'endDate', label: 'End Date', type: 'date' },
        { name: 'minAmount', label: 'Min Amount', type: 'number' },
        { name: 'maxAmount', label: 'Max Amount', type: 'number' },
      ],
    },
    {
      id: 6,
      name: 'Faculty Teaching Load Report',
      description:
        'Summary of teaching assignments, units, and schedules for all faculty members',
      category: 'Faculty',
      icon: <BsClipboardCheck className="text-2xl" />,
      color:
        'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
      endpoint: 'faculty-teaching-load',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
          required: true,
        },
        {
          name: 'teacherIds',
          label: 'Teachers (Multi-select)',
          type: 'multiselect',
          source: 'teachers',
          searchable: true,
        },
      ],
    },
    {
      id: 7,
      name: 'Student Academic Progress',
      description:
        'Track student progress including completed units, GPA, and remaining requirements',
      category: 'Academic',
      icon: <BsFileEarmarkText className="text-2xl" />,
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      endpoint: 'student-academic-progress',
      parameters: [
        { name: 'studentId', label: 'Student ID', type: 'text' },
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
      ],
    },
    {
      id: 8,
      name: 'Enrollment Period Analysis',
      description:
        'Statistics on enrollment periods including start/end dates and enrollment counts',
      category: 'Enrollment',
      icon: <BsCalendar className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      endpoint: 'enrollment-period-analysis',
      parameters: [{ name: 'schoolYear', label: 'School Year', type: 'text' }],
    },
    {
      id: 9,
      name: 'Outstanding Balance Report',
      description:
        'List of students with unpaid balances and aging analysis of receivables',
      category: 'Financial',
      icon: <BsCash className="text-2xl" />,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      endpoint: 'outstanding-balance',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        {
          name: 'minBalance',
          label: 'Min Balance (default: 0.01)',
          type: 'number',
        },
      ],
    },
    {
      id: 10,
      name: 'Document Submission Status',
      description:
        'Track status of required document submissions and pending validations',
      category: 'Documents',
      icon: <BsFileEarmarkPdf className="text-2xl" />,
      color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
      endpoint: 'document-submission-status',
      parameters: [
        { name: 'status', label: 'Status', type: 'text' },
        { name: 'studentId', label: 'Student ID', type: 'text' },
      ],
    },
    {
      id: 11,
      name: 'Class Schedule Report',
      description:
        'Complete class schedule with room assignments, time slots, and instructor information',
      category: 'Academic',
      icon: <BsCalendar className="text-2xl" />,
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      endpoint: 'class-schedule',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        { name: 'courseId', label: 'Course ID', type: 'text' },
        { name: 'days', label: 'Days', type: 'text' },
      ],
    },
    {
      id: 12,
      name: 'Student Ledger Summary',
      description:
        'Individual student ledgers showing charges, payments, and balance history',
      category: 'Financial',
      icon: <BsFileEarmarkSpreadsheet className="text-2xl" />,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      endpoint: 'student-ledger-summary',
      parameters: [
        {
          name: 'studentId',
          label: 'Student ID (Required)',
          type: 'text',
          required: true,
        },
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
      ],
    },
    {
      id: 13,
      name: 'Enrollment Requests Log',
      description:
        'History of enrollment requests with approval/rejection status and timestamps',
      category: 'Enrollment',
      icon: <BsClipboardCheck className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      endpoint: 'enrollment-requests-log',
      parameters: [
        { name: 'status', label: 'Status', type: 'text' },
        { name: 'startDate', label: 'Start Date', type: 'date' },
        { name: 'endDate', label: 'End Date', type: 'date' },
      ],
    },
    {
      id: 14,
      name: 'Fee Structure Report',
      description: 'Breakdown of all fees by program, year level, and fee type',
      category: 'Financial',
      icon: <BsFileEarmarkBarGraph className="text-2xl" />,
      color:
        'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      endpoint: 'fee-structure',
      parameters: [
        {
          name: 'periodId',
          label: 'Academic Period',
          type: 'select',
          source: 'academicPeriods',
        },
        { name: 'feeType', label: 'Fee Type', type: 'text' },
      ],
    },
    {
      id: 15,
      name: 'User Account Activity',
      description:
        'Log of user activities including logins, profile updates, and system access',
      category: 'System',
      icon: <BsPeople className="text-2xl" />,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      endpoint: 'user-account-activity',
      parameters: [
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: ['student', 'teacher', 'admin'],
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: ['active', 'inactive', 'disabled'],
        },
        { name: 'startDate', label: 'Start Date', type: 'date' },
        { name: 'endDate', label: 'End Date', type: 'date' },
      ],
    },
    {
      id: 16,
      name: 'Graduated Students Report',
      description:
        'List of students who have completed all requirements and graduation dates',
      category: 'Academic',
      icon: <BsFileEarmarkText className="text-2xl" />,
      color:
        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      endpoint: 'graduated-students',
      parameters: [
        { name: 'schoolYear', label: 'School Year', type: 'text' },
        { name: 'program', label: 'Program', type: 'text' },
      ],
    },
    {
      id: 17,
      name: 'Archived Records Report',
      description:
        'Summary of archived student and course records by academic year',
      category: 'System',
      icon: <BsFileEarmarkPdf className="text-2xl" />,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      endpoint: 'archived-records',
      parameters: [
        {
          name: 'recordType',
          label: 'Record Type',
          type: 'select',
          options: ['users', 'courses', 'schedules'],
        },
        { name: 'schoolYear', label: 'School Year', type: 'text' },
      ],
    },
    {
      id: 18,
      name: 'Program Enrollment Trends',
      description:
        'Analysis of enrollment trends across different academic programs over time',
      category: 'Enrollment',
      icon: <BsGraphUp className="text-2xl" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      endpoint: 'program-enrollment-trends',
      parameters: [
        { name: 'startYear', label: 'Start Year', type: 'text' },
        { name: 'endYear', label: 'End Year', type: 'text' },
      ],
    },
  ];

  const categories = [
    'All',
    'Enrollment',
    'Financial',
    'Academic',
    'Faculty',
    'Documents',
    'System',
  ];

  // Filter reports based on search term and category
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const checkRequiredFields = (report) => {
    // Check all required fields first
    for (const param of report.parameters) {
      if (param.required && !reportParams[param.name]) {
        console.log(`${param.label} is required`);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${param.label} is required`,
        });
        return; // Exit the function, don't generate report
      }
    }

    // All required fields are filled, proceed with report generation
    handleGenerateReport(report);
  };

  const handleGenerateReport = async (report) => {
    setLoading(true);

    try {
      const token = getToken();

      // Build query string from parameters
      const queryParams = new URLSearchParams();
      Object.entries(reportParams).forEach(([key, value]) => {
        if (value) {
          // Handle arrays (for multi-select)
          if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, item));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const response = await axiosInstance.get(
        `/reports/${report.endpoint}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      console.log('Report data received:', data);

      if (data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message || 'Error generating report. Please try again.',
        });
        console.error('Error generating report:', data.message);
      } else {
        // Navigate to report summary page with data
        // Only pass serializable properties (exclude React elements like icon)
        navigate('/admin/report-summary', {
          state: {
            reportData: data,
            selectedReport: {
              id: report.id,
              name: report.name,
              description: report.description,
              category: report.category,
              color: report.color,
              endpoint: report.endpoint,
            },
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error || 'Error generating report. Please try again.',
      });
      console.error('Error generating report:', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);

    // Initialize reportParams with default values
    const initialParams = {};
    if (report.parameters) {
      report.parameters.forEach((param) => {
        if (param.default !== undefined) {
          initialParams[param.name] = param.default;
        }
      });
    }
    setReportParams(initialParams);
  };

  const handleParamChange = (paramName, value) => {
    setReportParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const renderParameterInput = (param) => {
    if (param.type === 'multiselect') {
      if (param.source === 'courses') {
        const selectedCourses = reportParams[param.name] || [];

        const filteredCourses = courses.filter((course) =>
          course.name?.toLowerCase().includes(courseSearchTerm.toLowerCase())
        );

        const toggleCourse = (courseId) => {
          const newSelected = selectedCourses.includes(courseId)
            ? selectedCourses.filter((id) => id !== courseId)
            : [...selectedCourses, courseId];
          handleParamChange(param.name, newSelected);
        };

        return (
          <div className="relative">
            {/* Dropdown button */}
            <button
              type="button"
              onClick={() => setIsCoursesDropdownOpen(!isCoursesDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red text-left flex items-center justify-between"
            >
              <span className="truncate">
                {selectedCourses.length > 0
                  ? `${selectedCourses.length} course(s) selected`
                  : 'Select courses...'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isCoursesDropdownOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Selected courses display as tags */}
            {selectedCourses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCourses.map((courseId) => {
                  const course = courses.find((c) => c.id === courseId);
                  return (
                    <span
                      key={courseId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-dark-red text-white text-xs rounded-full"
                    >
                      {course?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCourse(courseId);
                        }}
                        className="hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Dropdown panel */}
            {isCoursesDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                {/* Search input */}
                <div className="p-2 border-b border-gray-300 dark:border-gray-600">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Course list */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="rounded text-dark-red focus:ring-dark-red"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {course.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No courses found
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedCourses.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCoursesDropdownOpen(false)}
                    className="px-3 py-1 text-xs bg-dark-red text-white rounded hover:bg-dark-red-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Click outside to close */}
            {isCoursesDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCoursesDropdownOpen(false)}
              />
            )}
          </div>
        );
      }

      if (param.source === 'teachers') {
        const selectedTeachers = reportParams[param.name] || [];

        const filteredTeachers = teachers.filter((teacher) =>
          `${teacher.firstName} ${teacher.lastName} ${teacher.userId}`
            .toLowerCase()
            .includes(teacherSearchTerm.toLowerCase())
        );

        const toggleTeacher = (teacherId) => {
          const newSelected = selectedTeachers.includes(teacherId)
            ? selectedTeachers.filter((id) => id !== teacherId)
            : [...selectedTeachers, teacherId];
          handleParamChange(param.name, newSelected);
        };

        return (
          <div className="relative">
            {/* Dropdown button */}
            <button
              type="button"
              onClick={() => setIsTeachersDropdownOpen(!isTeachersDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red text-left flex items-center justify-between"
            >
              <span className="truncate">
                {selectedTeachers.length > 0
                  ? `${selectedTeachers.length} teacher(s) selected`
                  : 'Select teachers...'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isTeachersDropdownOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Selected teachers display as tags */}
            {selectedTeachers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTeachers.map((teacherId) => {
                  const teacher = teachers.find((t) => t.id === teacherId);
                  return (
                    <span
                      key={teacherId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-dark-red text-white text-xs rounded-full"
                    >
                      {teacher?.firstName} {teacher?.lastName}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTeacher(teacherId);
                        }}
                        className="hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Dropdown panel */}
            {isTeachersDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                {/* Search input */}
                <div className="p-2 border-b border-gray-300 dark:border-gray-600">
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Teacher list */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <label
                        key={teacher.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={() => toggleTeacher(teacher.id)}
                          className="rounded text-dark-red focus:ring-dark-red"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          [{teacher.userId}] - {teacher.firstName}{' '}
                          {teacher.lastName}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No teachers found
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedTeachers.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTeachersDropdownOpen(false)}
                    className="px-3 py-1 text-xs bg-dark-red text-white rounded hover:bg-dark-red-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Click outside to close */}
            {isTeachersDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTeachersDropdownOpen(false)}
              />
            )}
          </div>
        );
      }
    }

    if (param.type === 'select') {
      if (param.source === 'academicPeriods') {
        return (
          <>
            <select
              value={
                reportParams[param.name] !== undefined
                  ? reportParams[param.name]
                  : param.default || ''
              }
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red"
            >
              <option value="">Select {param.label}</option>
              {academicPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name || period.batchName}{' '}
                  {period.schoolYear && `(${period.schoolYear})`}
                </option>
              ))}
            </select>
          </>
        );
      } else if (param.options) {
        return (
          <select
            value={
              reportParams[param.name] !== undefined
                ? reportParams[param.name]
                : param.default || ''
            }
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red"
          >
            <option value="">Select {param.label}</option>
            {param.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
    }

    return (
      <input
        type={param.type}
        value={
          reportParams[param.name] !== undefined
            ? reportParams[param.name]
            : param.default || ''
        }
        onChange={(e) => handleParamChange(param.name, e.target.value)}
        placeholder={param.label}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red"
      />
    );
  };

  // Fetch academic periods and courses for dropdowns
  useEffect(() => {
    fetchAcademicPeriods();
    fetchCourses();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Monitor academicPeriods state changes
  useEffect(() => {
    console.log('Academic periods state changed:', academicPeriods);
  }, [academicPeriods]);

  // Debug: Monitor courses state changes
  useEffect(() => {
    console.log('Courses state changed:', courses);
  }, [courses]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download various reports for your educational
            institution
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-red"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-dark-red text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                {/* Icon and Category */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    {report.icon}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {report.category}
                  </span>
                </div>

                {/* Report Name */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {report.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <BsEye />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No reports found matching your criteria
            </p>
          </div>
        )}

        {/* Selected Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-visible">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedReport.color}`}>
                    {selectedReport.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedReport.name}
                    </h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setReportParams({});
                    setIsCoursesDropdownOpen(false);
                    setCourseSearchTerm('');
                    setIsTeachersDropdownOpen(false);
                    setTeacherSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  <BsX size={32} />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {selectedReport.description}
              </p>

              {/* Parameters Section */}
              {selectedReport.parameters &&
                selectedReport.parameters.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Report Parameters (Optional unless marked as Required)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.parameters.map((param) => (
                        <div key={param.name}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {param.label}
                            {param.required && (
                              <span className="text-red-500"> *</span>
                            )}
                          </label>
                          {renderParameterInput(param)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => checkRequiredFields(selectedReport)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-dark-red text-white rounded-lg hover:bg-dark-red-2 transition-colors font-medium disabled:opacity-50"
                >
                  <BsEye />
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8 mt-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-red mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Generating report...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
