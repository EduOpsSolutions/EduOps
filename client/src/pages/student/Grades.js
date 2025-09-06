import React, { useState } from "react";
import GradeNotReadyModal from "../../components/modals/grades/GradeNotReadyModal";

function Grades() {
    const [grade_not_ready_modal, setGradeNotReadyModal] = useState(false);

    const getStudentGradesData = () => {
        return [
            {
                id: 1,
                courseName: "B1 Course",
                status: "NO GRADE",
                completedDate: null,
                courseId: 1,
                studentId: 1,
            },
            {
                id: 2,
                courseName: "A2 Course",
                status: "PASS",
                completedDate: "2024-07-15",
                courseId: 2,
                studentId: 1,
            },
        ];
    };

    const gradesData = getStudentGradesData();

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "PASS":
                return "bg-green-100 text-green-800 border border-green-200";
            case "FAIL":
                return "bg-red-100 text-red-800 border border-red-200";
            case "NO GRADE":
                return "bg-gray-100 text-gray-800 border border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleViewDetails = (grade) => {
        if (grade.status === "NO GRADE") {
            setGradeNotReadyModal(true);
        } else {
            console.log("Opening certificate for:", grade);
        }
    };

    return (
        <div className="bg-white-yellow-tone min-h-screen">
            <div className="flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-6 md:py-8">
                <div className="w-full max-w-7xl bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">

                    <div className="text-center mb-6 md:mb-8">
                        <div className="flex justify-center items-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-10 h-10 text-black mr-3"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                                />
                            </svg>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
                                My Grades
                            </h1>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                                            Course
                                        </th>
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                                            Status
                                        </th>
                                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                                            Completed
                                        </th>
                                        <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gradesData.map((grade, index) => (
                                        <tr
                                            key={grade.id}
                                            className="cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:shadow-sm"
                                            onClick={() => handleViewDetails(grade)}
                                        >
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {grade.courseName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <span
                                                    className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getStatusBadgeColor(
                                                        grade.status
                                                    )}`}
                                                >
                                                    {grade.status}
                                                </span>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                                                <div className="text-gray-600">
                                                    {formatDate(grade.completedDate)}
                                                </div>
                                            </td>
                                            <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(grade);
                                                    }}
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${grade.status === "NO GRADE"
                                                        ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                        : "text-dark-red-2 hover:text-dark-red hover:bg-red-50"
                                                        }`}
                                                    title={
                                                        grade.status === "NO GRADE"
                                                            ? "Certificate not available yet"
                                                            : "View certificate"
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Empty State */}
                    {gradesData.length === 0 && (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No grades available
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You haven't enrolled in any courses yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <GradeNotReadyModal
                grade_not_ready_modal={grade_not_ready_modal}
                setGradeNotReadyModal={setGradeNotReadyModal}
            />
        </div>
    );
}

export default Grades;