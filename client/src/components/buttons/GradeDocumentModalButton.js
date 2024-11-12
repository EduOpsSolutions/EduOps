import React from 'react';

function GradeDocumentModalButton({status, hasDoc}) {
    const isLocked = status === 'locked';

    const buttonClass = isLocked 
        ? hasDoc 
            ? 'bg-green-2' 
            : 'bg-grey-1'
        : hasDoc
        ? 'bg-green-2 hover:bg-green-3' 
        : 'bg-grey-1 hover:bg-grey-2';
    

    const buttonText = isLocked
        ? hasDoc
            ? 'With Document'
            : 'No Document'
        : hasDoc
        ? 'With Document'
        : 'Upload Document';

    return (
        <div className='flex justify-center items-center'>
            <button
                type="button"
                className={`flex items-center w-1/2 h-auto text-black text-lg drop-shadow-md ease-in duration-150 rounded-sm ${buttonClass}`}
                disabled={isLocked}  // Disable the button if it's locked
            >
                {!isLocked && (
                    <div className='w-4 flex-row ml-4'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                )}
                
                <div className='mx-auto'>
                    <p className='text-center'>{buttonText}</p>
                </div>
            </button>
        </div>
    );
}

export default GradeDocumentModalButton;
