import React from 'react';

const SelectField = ({ name, id, label, required, options }) => {
    return (
        <div className="relative z-0 w-full group">
            <label htmlFor={id} className="block mb-2 text-sm font-medium dark:text-gray-400"
            >
                {label}
            </label>
            <select name={name} id={id} className="mt-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required={required} defaultValue="">
                <option value="" disabled hidden>
                Select an option
                </option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
    };

export default SelectField;
