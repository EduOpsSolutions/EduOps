import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ForgotEnrollmentIdModal from "./ForgotIdModal";

function TrackEnrollmentModal({ isOpen, onClose }) {
    const [enrollmentId, setEnrollmentId] = useState("");
    const [email, setEmail] = useState("");
    const [forgotEnrollmentIdModal, setForgotEnrollmentIdModal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!enrollmentId && !email) {
            Swal.fire({
                title: "Error",
                text: "Please provide either Enrollment ID or Email.",
                icon: "error",
                confirmButtonColor: "#992525",
            });
            return;
        }

        navigate('/enrollment');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white-yellow-tone rounded-lg p-4 sm:p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold pr-4">Track Enrollment</h2>
                    <button
                        className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
                        onClick={onClose}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Enrollment ID</label>
                        <input
                            type="text"
                            value={enrollmentId}
                            onChange={(e) => setEnrollmentId(e.target.value)}
                            className="w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                            placeholder="Enrollment ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                            placeholder="Email"
                        />
                    </div>

                    <div className="text-left mt-4">
                        <button
                            type="button"
                            className="text-sm text-dark-yellow hover:text-bright-red underline"
                            onClick={() => setForgotEnrollmentIdModal(true)}
                        >
                            Forgot enrollment ID?
                        </button>
                    </div>

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-8 py-2 rounded font-semibold transition-colors duration-150"
                        >
                            Confirm
                        </button>
                    </div>
                </form>

                <ForgotEnrollmentIdModal
                    isOpen={forgotEnrollmentIdModal}
                    onClose={() => setForgotEnrollmentIdModal(false)}
                />
            </div>
        </div>
    );
}

export default TrackEnrollmentModal;