import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Spinner Component
 *
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color classes for the spinner
 * @param {string} message - Optional loading message to display
 * @param {string} className - Additional CSS classes
 */
function Spinner({
  size = 'md',
  color = 'text-dark-red-2',
  message = '',
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${spinnerSize} ${color}`}
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
      {message && (
        <p className={`mt-3 text-sm font-medium ${color}`}>{message}</p>
      )}
    </div>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  message: PropTypes.string,
  className: PropTypes.string,
};

export default Spinner;
