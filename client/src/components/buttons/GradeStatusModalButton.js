import React from 'react';

function GradeStatusModalButton({ status }) {
    // Set button color based on the status
    let buttonColor = '';

    if (status === 'PASS') {
        buttonColor = 'bg-green-2';
    } else if (status === 'NG') {
        buttonColor = 'bg-grey-1';
    } else if (status === 'FAIL') {
        buttonColor = 'bg-bright-red';
    }

    return (
        <div className='flex justify-center items-center w-full'>
            <div className={`flex items-center w-4/5 h-auto text-black text-lg drop-shadow-md rounded-sm ${buttonColor}`}>
                <div className='mx-auto'>
                    <p className='text-center'>{status}</p>
                </div>
            </div>
        </div>
    );
}

export default GradeStatusModalButton;
