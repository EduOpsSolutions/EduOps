import React, { useState, useRef } from 'react';
import { BsPencilFill, BsTrash } from 'react-icons/bs';

const ImageUploadField = ({
  label,
  currentImage,
  onImageChange,
  onImageRemove,
  disabled = false,
  accept = '.jpg,.jpeg,.png',
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = '',
}) => {
  // Only set previewUrl if currentImage is a valid URL (contains http or blob)
  const [previewUrl, setPreviewUrl] = useState(
    currentImage &&
      (currentImage.startsWith('http') || currentImage.startsWith('blob'))
      ? currentImage
      : null
  );
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG or PNG only)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (onImageChange) {
      onImageChange(file, url);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Image Preview */}
      <div className="relative group">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-dark-red-2 bg-gray-100 flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-dark-red-2 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-white">
                {getUserInitials(currentImage)}
              </span>
            </div>
          )}
        </div>

        {/* Overlay buttons */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={triggerFileSelect}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Change image"
            >
              <BsPencilFill className="text-gray-700 text-sm" />
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Remove image"
              >
                <BsTrash className="text-red-600 text-sm" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex space-x-2 sm:hidden">
          <button
            type="button"
            onClick={triggerFileSelect}
            className="px-3 py-1 bg-dark-red-2 text-white text-xs rounded hover:bg-dark-red-5 transition-colors flex items-center space-x-1"
          >
            <BsPencilFill className="text-xs" />
            <span>Change</span>
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
            >
              <BsTrash className="text-xs" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Error message */}
      {error && (
        <div className="text-center">
          <p className="text-red-600 text-xs max-w-xs mb-1">{error}</p>
          <p className="text-xs text-gray-400">
            Accepted: JPG, PNG (max {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
        </div>
      )}

      {/* File format info - only show when no error and not disabled */}
      {!error && !disabled && (
        <p className="text-xs text-gray-400 text-center max-w-xs opacity-70 hover:opacity-100 transition-opacity">
          JPG, PNG (max {Math.round(maxSize / (1024 * 1024))}MB)
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
