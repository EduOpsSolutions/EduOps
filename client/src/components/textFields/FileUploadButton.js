import React, { useState } from 'react';

const FileUploadButton = ({
  label,
  id,
  onChange,
  ariaDescribedBy,
  isUploading = false,
}) => {
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

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <div className="relative z-0 mb-5 group">
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <label
          className={`w-fit text-sm border-2 py-2 px-4 rounded-md text-left flex items-center justify-center ${
            isUploading
              ? 'border-gray-400 bg-gray-400 text-white cursor-not-allowed'
              : 'border-dark-red-2 cursor-pointer bg-dark-red-2 text-white hover:bg-dark-red-5'
          }`}
          htmlFor={isUploading ? undefined : id}
        >
          {isUploading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Uploading...</span>
            </>
          ) : (
            'Choose File'
          )}
        </label>
        <input
          className="hidden"
          aria-describedby={ariaDescribedBy}
          id={id}
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={isUploading}
        />
        <div
          className="text-sm text-black bg-white py-2 px-4 rounded-md border border-gray-300 w-72 truncate flex items-center"
          id={`${id}_filename`}
        >
          {isUploading && <LoadingSpinner />}
          <span className={isUploading ? 'ml-2' : ''}>
            {isUploading ? 'Uploading...' : fileName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUploadButton;
