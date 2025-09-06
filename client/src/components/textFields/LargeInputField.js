import React from 'react';

const LargeInputField = ({ name, id, label, required = true, placeholder = "" }) => {
    return (
        <div className="relative z-0 w-full h-[88%] mb-5 group">
            <label htmlFor={id} className="block mb-2 text-sm font-medium dark:text-white">
                {label}
            </label>
            <textarea
                name={name}
                id={id}
                className="block w-full h-[84%] text-sm p-2 text-gray-900 border-2 border-gray-300 rounded-md appearance-none dark:text-white dark:border-gray-600 dark:focus:border-dark-red focus:outline-none focus:ring-0 focus:border-dark-red resize-none"
                placeholder={placeholder}
                required={required}
                rows="4"
            />
        </div>
    );
}

export default LargeInputField;