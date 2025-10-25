import React, { useState, useEffect } from "react";
import DocumentForm from "../../form/DocumentForm";
import Swal from 'sweetalert2';

const AddNewDocumentModal = ({ isOpen, onClose, onAddDocument }) => {
    const [formData, setFormData] = useState({
        documentName: "",
        description: "",
        privacy: "Teacher's Only",
        requestBasis: "Yes",
        downloadable: "Yes",
        price: "Free",
        amount: "",
        uploadedFile: null,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                documentName: "",
                description: "",
                privacy: "Teacher's Only",
                requestBasis: "Yes",
                downloadable: "Yes",
                price: "Free",
                amount: "",
                uploadedFile: null,
            });
            setError("");
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (error) setError("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, uploadedFile: file }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            let amountValue = "";
            if (formData.price === "Paid") {
                const parsedAmount = parseFloat(formData.amount || 0);
                if (!isNaN(parsedAmount)) {
                    amountValue = parsedAmount.toFixed(2);
                }
            }

            const documentData = {
                documentName: formData.documentName,
                description: formData.description,
                privacy: formData.privacy,
                requestBasis: formData.requestBasis,
                downloadable: formData.downloadable,
                price: formData.price,
                amount: amountValue,
                uploadFile: formData.uploadedFile ? formData.uploadedFile.name : "",
            };

            if (onAddDocument && typeof onAddDocument === "function") {
                await onAddDocument(documentData);
            }

            onClose();
        } catch (error) {
            setError(error.message || "Failed to add document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return formData.documentName.trim() !== "" ||
            formData.description.trim() !== "" ||
            formData.amount.trim() !== "" ||
            formData.uploadedFile !== null;
    };

    const handleClose = () => {
        if (hasChanges()) {
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes that will be lost. Do you want to continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'No, Keep Editing',
                cancelButtonText: 'Yes, Discard Changes',
                confirmButtonColor: '#992525',
                cancelButtonColor: '#6B7280',
            }).then((result) => {
                if (result.isDismissed || result.dismiss === Swal.DismissReason.cancel) {
                    onClose();
                }
            });
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-2xl font-bold">Add Document</h2>
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

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <DocumentForm
                            formData={formData}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            loading={loading}
                            isEditing={false}
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddNewDocumentModal;