import React, { useState, useRef, useEffect } from 'react';

const FileUploadButton = ({
  label,
  id,
  onChange,
  onRemove,
  ariaDescribedBy,
  isUploading = false,
  isUploaded = false,
  helperText = null,
  uploadedFileName = null,
}) => {
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef(null);

  // Update fileName when uploadedFileName changes
  useEffect(() => {
    if (uploadedFileName) {
      setFileName(uploadedFileName);
    } else if (!isUploaded) {
      setFileName('No file chosen');
    }
  }, [uploadedFileName, isUploaded]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(event); // Call the parent component's onChange
    } else {
      // User canceled - reset to previous state
      if (!isUploaded) {
        setFileName('No file chosen');
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setFileName('No file chosen');
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          ref={fileInputRef}
          className="hidden"
          aria-describedby={ariaDescribedBy}
          id={id}
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={isUploading}
        />
        <div
          className={`text-sm text-black bg-white py-2 px-4 rounded-md border w-72 truncate flex items-center ${
            isUploaded ? 'border-green-500' : 'border-gray-300'
          }`}
          id={`${id}_filename`}
        >
          {isUploading && <LoadingSpinner />}
          {isUploaded && !isUploading && (
            <svg
              className="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          <span className={`flex-grow truncate ${isUploading ? 'ml-2' : ''}`}>
            {isUploading ? 'Uploading...' : fileName}
          </span>
        </div>
        {isUploaded && !isUploading && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm border-2 py-2 px-4 rounded-md border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 flex items-center justify-center"
            title="Remove file"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FileUploadButton;
