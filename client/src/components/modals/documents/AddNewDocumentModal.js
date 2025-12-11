import React, { useState, useEffect } from "react";
import DocumentForm from "../../form/DocumentForm";
import { useManageDocumentsStore } from "../../../stores/manageDocumentsStore";
import Swal from 'sweetalert2';

const AddNewDocumentModal = ({ isOpen, onClose }) => {
    const { handleAddDocumentSubmit, loading, error } = useManageDocumentsStore();
    
    const [formData, setFormData] = useState({
        documentName: "",
        description: "",
        privacy: "public",
        requestBasis: false,
        downloadable: false,
        price: "free",
        amount: "",
    });
    
    const [uploadedFile, setUploadedFile] = useState(null);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                documentName: "",
                description: "",
                privacy: "public",
                requestBasis: false,
                downloadable: false,
                price: "free",
                amount: "",
            });
            setUploadedFile(null);
            setLocalError("");
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let processedValue = value;
        if (type === 'checkbox') {
            processedValue = checked;
        } else if (name === 'price' && value === 'free') {
            // Reset amount when switching to free
            setFormData(prev => ({ ...prev, amount: "" }));
        }
        
        setFormData((prev) => ({ ...prev, [name]: processedValue }));

        if (localError) setLocalError("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        if (localError) setLocalError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.documentName.trim()) {
            setLocalError("Document name is required");
            return;
        }

        if (formData.price === "paid" && (!formData.amount || parseFloat(formData.amount) <= 0)) {
            setLocalError("Amount is required for paid documents");
            return;
        }

        try {
            const documentData = {
                documentName: formData.documentName.trim(),
                description: formData.description.trim(),
                privacy: formData.privacy,
                requestBasis: formData.requestBasis,
                downloadable: formData.downloadable,
                price: formData.price,
                amount: formData.price === "paid" ? parseFloat(formData.amount) : null,
            };

            await handleAddDocumentSubmit(documentData, uploadedFile);
            onClose();
        } catch (error) {
            setLocalError(error.message || "Failed to add document. Please try again.");
        }
    };

    const hasChanges = () => {
        return formData.documentName.trim() !== "" ||
            formData.description.trim() !== "" ||
            formData.amount.trim() !== "" ||
            uploadedFile !== null;
    };

    const handleClose = () => {
        if (hasChanges()) {
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes that will be lost. Do you want to continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: "Yes, discard",
                cancelButtonText: "No, keep editing",
                confirmButtonColor: "#992525",
                cancelButtonColor: "#6b7280",
                reverseButtons: true,
            }).then((result) => {
                if (result.isConfirmed) {
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

                    {(error || localError) && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error || localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <DocumentForm
                            formData={formData}
                            handleChange={handleChange}
                            handleFileChange={handleFileChange}
                            loading={loading}
                            isEditing={false}
                            uploadedFile={uploadedFile}
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddNewDocumentModal;