import React from 'react';

function EnrollmentStepIcon({ stepNumber, isCompleted, isCurrent }) {
  if (stepNumber === 5 && isCompleted) {
    return (
      <svg className="w-4 h-4 text-green-600 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
    );
  } else if (isCompleted) {
    // Completed step: checkmark icon
    return (
      <svg className="w-4 h-4 text-green-600 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
    );
  } else if (isCurrent) {
    // Current step: step number
    return <span className="text-yellow-600 font-bold text-lg">{stepNumber}</span>;
  } else {
    // Pending steps: default icon 
    switch (stepNumber) {
      case 1:
        return (
          <svg className="w-4 h-4 text-green-600 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
        );
      case 3:
        // Payment step icon
        return (
          <svg className="w-4 h-4 text-gray-500 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
            <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 12V2h16v10H2Z" />
            <path d="M6 9h8a1 1 0 0 0 0-2H6a1 1 0 1 0 0 2Z" />
          </svg>
        );
      case 4:
        // Payment Verification icon
        return (
          <svg className="w-4 h-4 text-gray-500 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
            <path d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 12V6h16v6H2Z" />
            <path d="M6 8H4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2Zm8 0H9a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2Z" />
          </svg>
        );
      case 5:
        // Complete icon
        return (
          <svg className="w-4 h-4 text-gray-500 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z" />
          </svg>
        );
      default:
        // Step number icon
        return (
          <svg className="w-4 h-4 text-gray-500 lg:w-6 lg:h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
            <path d="M14 0H2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 16V2h12v14H2Z" />
            <path d="M5 5h6a1 1 0 0 0 0-2H5a1 1 0 0 0 0 2Zm0 4h6a1 1 0 0 0 0-2H5a1 1 0 0 0 0 2Zm0 4h6a1 1 0 0 0 0-2H5a1 1 0 1 0 0 2Z" />
          </svg>
        );
    }
  }
}

export default EnrollmentStepIcon;