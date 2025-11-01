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
        privacy: "teacher_only",
        requestBasis: true,
        downloadable: true,
        price: "free",
        amount: "",
        uploadFile: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    useEffect(() => {
        if (isOpen && selectedDocument) {
            let priceValue = "free";
            let amountValue = "";

            const amount = selectedDocument.amount;
            if (amount && selectedDocument.price === "paid") {
                const parsedAmount = parseFloat(amount);
                if (!isNaN(parsedAmount) && parsedAmount > 0) {
                    priceValue = "paid";
                    amountValue = parsedAmount.toString();
                }
            }

            setFormData({
                documentName: selectedDocument.documentName || "",
                description: selectedDocument.description || "",
                privacy: selectedDocument.privacy || "teacher_only",
                requestBasis: selectedDocument.requestBasis !== undefined ? selectedDocument.requestBasis : true,
                downloadable: selectedDocument.downloadable !== undefined ? selectedDocument.downloadable : true,
                price: priceValue,
                amount: amountValue,
                uploadFile: selectedDocument.uploadFile || "",
            });
            setUploadedFile(null);
            setError("");
        }
    }, [isOpen, selectedDocument]);

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

        if (error) setError("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        if (file) {
            setFormData(prev => ({
                ...prev,
                uploadFile: file.name
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const changed = hasChanges();
        try {
            setLoading(true);

            const documentData = {
                ...selectedDocument,
                documentName: formData.documentName.trim(),
                description: formData.description.trim(),
                privacy: formData.privacy,
                requestBasis: formData.requestBasis,
                downloadable: formData.downloadable,
                price: formData.price,
                amount: formData.price === "paid" ? parseFloat(formData.amount) : null,
                uploadFile: formData.uploadFile,
            };

            if (onUpdateDocument && typeof onUpdateDocument === "function") {
                await onUpdateDocument(documentData, uploadedFile);
            }

            if (changed) {
                Swal.fire({
                    title: 'Saved!',
                    text: 'Your changes have been saved successfully.',
                    icon: 'success',
                    confirmButtonColor: '#890E07',
                    timer: 2000,
                    showConfirmButton: false
                });
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

        // Determine original price and amount
        let originalPriceValue = "free";
        let originalAmount = "";

        if (selectedDocument.amount && selectedDocument.price === "paid") {
            const parsedAmount = parseFloat(selectedDocument.amount);
            if (!isNaN(parsedAmount) && parsedAmount > 0) {
                originalPriceValue = "paid";
                originalAmount = parsedAmount.toString();
            }
        }

        // Check for actual changes
        const nameChanged = formData.documentName.trim() !== (selectedDocument.documentName || "");
        const descChanged = formData.description.trim() !== (selectedDocument.description || "");
        const privacyChanged = formData.privacy !== (selectedDocument.privacy || "teacher_only");
        const requestBasisChanged = formData.requestBasis !== (selectedDocument.requestBasis !== undefined ? selectedDocument.requestBasis : true);
        const downloadableChanged = formData.downloadable !== (selectedDocument.downloadable !== undefined ? selectedDocument.downloadable : true);
        const priceChanged = formData.price !== originalPriceValue;
        const amountChanged = formData.price === "paid" && formData.amount !== originalAmount;
        const fileChanged = uploadedFile !== null; // Only check if a new file was uploaded

        return nameChanged || descChanged || privacyChanged || requestBasisChanged || 
               downloadableChanged || priceChanged || amountChanged || fileChanged;
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