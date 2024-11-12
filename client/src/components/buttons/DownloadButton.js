import React from 'react';

function DownloadButton({ onClick}) {
    return (
        <button type="button" className="flex items-center w-3/4 h-auto bg-green-1 text-white text-lg drop-shadow-md hover:bg-green-800 ease-in duration-150 rounded-sm text-wrap" onClick={onClick}
        >
            <div className='w-2 flex-row ml-4'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            </div>
            <div className='ml-8'>
                <p>Download</p>
            </div>
        </button>
    );
}

export default DownloadButton