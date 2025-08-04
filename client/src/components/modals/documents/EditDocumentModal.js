import React, { useState, useEffect } from "react";
import DocumentForm from "../../form/DocumentForm";
import Swal from 'sweetalert2';

const EditDocumentModal = ({
    isOpen,
    onClose,
    selectedDocument,
    onUpdateDocument
}) => {
    const [formData, setFormData] = useState({
        documentName: "",
        description: "",
        privacy: "Teacher's Only",
        requestBasis: "Yes",
        downloadable: "Yes",
        price: "Free",
        amount: "",
        uploadFile: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && selectedDocument) {
            let priceValue = "Free";
            let amountValue = "";

            const amount = selectedDocument.amount;
            if (amount) {
                let cleanAmount = amount;
                if (typeof amount === 'string') {
                    cleanAmount = amount.replace(/[^0-9.-]+/g, '');
                }

                const parsedAmount = parseFloat(cleanAmount);

                if (!isNaN(parsedAmount) && parsedAmount > 0) {
                    priceValue = "Paid";
                    amountValue = parsedAmount.toFixed(2);
                }
            }

            setFormData({
                documentName: selectedDocument.documentName || "",
                description: selectedDocument.description || "",
                privacy: selectedDocument.privacy || "Teacher's Only",
                requestBasis: selectedDocument.requestBasis || "Yes",
                downloadable: selectedDocument.downloadable || "Yes",
                price: priceValue,
                amount: amountValue,
                uploadFile: selectedDocument.uploadFile || "",
            });
            setError("");
        }
    }, [isOpen, selectedDocument]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (error) setError("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                uploadFile: file.name
            }));
        }
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
                ...selectedDocument,
                documentName: formData.documentName,
                description: formData.description,
                privacy: formData.privacy,
                requestBasis: formData.requestBasis,
                downloadable: formData.downloadable,
                price: formData.price,
                amount: amountValue,
                uploadFile: formData.uploadFile,
            };

            if (onUpdateDocument && typeof onUpdateDocument === "function") {
                await onUpdateDocument(documentData);
            }

            onClose();
        } catch (error) {
            setError(error.message || "Failed to update document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        if (!selectedDocument) return false;

        let originalPriceValue = "Free";
        let originalAmount = "";

        if (selectedDocument.amount) {
            const cleanAmount = typeof selectedDocument.amount === 'string' ?
                selectedDocument.amount.replace(/[^0-9.-]+/g, '') :
                selectedDocument.amount;

            const parsedAmount = parseFloat(cleanAmount);

            if (!isNaN(parsedAmount) && parsedAmount > 0) {
                originalPriceValue = "Paid";
                originalAmount = parsedAmount.toFixed(2);
            }
        }

        return (
            formData.documentName !== (selectedDocument.documentName || "") ||
            formData.description !== (selectedDocument.description || "") ||
            formData.privacy !== (selectedDocument.privacy || "Teacher's Only") ||
            formData.requestBasis !== (selectedDocument.requestBasis || "Yes") ||
            formData.downloadable !== (selectedDocument.downloadable || "Yes") ||
            formData.price !== originalPriceValue ||
            (formData.price === "Paid" && formData.amount !== originalAmount) ||
            formData.uploadFile !== (selectedDocument.uploadFile || "")
        );
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
                confirmButtonColor: '#6b7280',
                cancelButtonColor: '#992525',
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
                        <h2 className="text-2xl font-bold">Edit Document</h2>
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
                            isEditing={true}
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditDocumentModal;