import React from 'react';

function RequestButton({ onClick}) {
    return (
        <button
        type="button"
        className="flex items-center w-3/4 h-auto bg-blue-1 text-white text-lg drop-shadow-md hover:bg-blue-800 ease-in duration-150"
        onClick={onClick}
        >
            <div className='w-2 flex-row ml-4'>
            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-5"
                >
                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
            </div>
            <div className='ml-8'>
                <p>Request</p>
            </div>
        </button>
    );
}

export default RequestButton