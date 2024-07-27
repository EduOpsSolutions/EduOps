import React from 'react';

const BackButton = ({ onClick, className }) => {
    return (
        <button 
            onClick={onClick} 
            className={`absolute rounded-full bg-dark-red-5 p-3 focus:outline-none shadow-gray-300 shadow-md drop-shadow-md hover:bg-dark-red ${className}`}
        >
            <svg className="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
            </svg>
        </button>
    );
};

export default BackButton
