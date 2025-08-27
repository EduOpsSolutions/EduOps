import React from 'react';

function GradeDocumentModalButton({ hasDoc, onClick }) {
    const buttonClass = hasDoc
        ? 'bg-green-500 hover:bg-green-600 cursor-pointer text-white'
        : 'bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-700';

    const buttonText = hasDoc
        ? 'With Document'
        : 'Upload Document';

    const iconColor = hasDoc ? 'text-white' : 'text-gray-600';

    return (
        <div className='flex justify-center items-center w-full'>
            <button
                type="button"
                className={`flex items-center justify-between w-full px-2 py-1 h-auto text-xs sm:text-sm drop-shadow-sm ease-in duration-150 rounded ${buttonClass}`}
                onClick={onClick}
                style={{ width: '160px' }}
            >
                <div className={`flex-shrink-0 ${iconColor}`}>
                    {hasDoc ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3 sm:size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3 sm:size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    )}
                </div>

                <div className='flex-1 px-1 overflow-hidden'>
                    <p className='text-center truncate'>{buttonText}</p>
                </div>
            </button>
        </div>
    );
}

export default GradeDocumentModalButton;