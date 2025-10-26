import React from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaDownload, FaFile, FaCheck } from 'react-icons/fa';
import {
  getFileType,
  getFileNameFromUrl,
  downloadFile,
} from '../../../utils/files';

export default function CommonModal({
  title,
  handleClose,
  children,
  show,
  fileUrl = null,
  className = 'w-full max-w-4xl',
  showVerifyPayment = false,
  onVerifyPayment = null,
  isVerifying = false,
}) {
  if (!show) return null;

  const fileType = getFileType(fileUrl);
  const fileName = getFileNameFromUrl(fileUrl);

  const handleDownload = () => {
    if (fileUrl) {
      downloadFile(fileUrl, fileName);
    }
  };

  const renderFileContent = () => {
    if (!fileUrl) {
      return children;
    }

    if (fileType === 'image') {
      return (
        <div className="flex flex-col items-center">
          <img
            src={fileUrl || ''}
            alt="Preview"
            className="w-full h-full object-contain max-h-[70vh]"
            onError={(e) => {
              e.target.src = '';
            }}
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDownload}
              className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-150"
            >
              <FaDownload />
              Download Image
            </button>
            {showVerifyPayment && onVerifyPayment && (
              <button
                onClick={onVerifyPayment}
                disabled={isVerifying}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2 transition-colors duration-150"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Verify Payment
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      );
    } else if (fileType === 'document' || fileType === 'unknown') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FaFile className="text-6xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {fileName}
          </h3>
          <p className="text-gray-500 mb-6 text-center">
            This file cannot be previewed directly. Would you like to download
            it?
          </p>
          <button
            onClick={handleDownload}
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white px-6 py-3 rounded flex items-center gap-2 transition-colors duration-150"
          >
            <FaDownload />
            Download File
          </button>
        </div>
      );
    }

    return children;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div
        className={`bg-white-yellow-tone rounded-lg ${className} relative max-h-[90vh] overflow-y-auto flex flex-col`}
      >
        <div className="flex items-start justify-between mb-4 sm:mb-6 p-6 sticky top-0 bg-white-yellow-tone z-10 border-b ">
          <h2 className="text-xl sm:text-2xl font-bold pr-4">
            {title || 'View'}
          </h2>
          <button
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
            onClick={handleClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">{renderFileContent()}</div>
      </div>
    </div>,
    document.body
  );
}
