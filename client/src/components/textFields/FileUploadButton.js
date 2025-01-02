import React, { useState } from 'react';

const FileUploadButton = ({ label, id, onChange, ariaDescribedBy }) => {
    const [fileName, setFileName] = useState('No file chosen');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            onChange(event); // Call the parent component's onChange
        } else {
            setFileName('No file chosen');
        }
    };

    return (
        <div className="relative z-0 w-1/3 mb-5 group">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor={id}>
                {label}
            </label>
            <div className="flex items-center space-x-2">
                <label className="block w-28 text-sm border-2 border-dark-red-2 cursor-pointer bg-dark-red-2 text-white py-2 px-4 rounded-md text-left" htmlFor={id}>
                    Choose File
                </label>
                <input
                    className="hidden"
                    aria-describedby={ariaDescribedBy}
                    id={id}
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                />
                <div className="text-sm text-black bg-white py-2 px-4 rounded-md border border-gray-300 w-72 truncate" id={`${id}_filename`}>
                    {fileName}
                </div>
            </div>
        </div>
    );
};

export default FileUploadButton;