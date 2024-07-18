import React from 'react';

const FileUploadButton = ({ label, id, ariaDescribedBy }) => {
    return (
        <div className="relative z-0 w-1/3 mb-5 group">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for={id}>
                {label}
            </label>
            
                <input
                    class="block w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    aria-describedby={ariaDescribedBy}
                    id={id}
                    type="file"
                />

        </div>
        
    );
};


export default FileUploadButton;
