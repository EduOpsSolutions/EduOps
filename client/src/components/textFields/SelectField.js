import React from 'react';

const SelectField = ({ name, id, label, required, options, onChange, value, defaultValue, disabled }) => {
    return (
        <div className="relative z-0 w-full group mb-5 group">
            <label htmlFor={id} className="block mb-2 text-sm font-medium dark:text-gray-400">
                {label}
            </label>
            <select
                name={name}
                id={id}
                className={`mt-2 py-2.5 bg-white border-2 border-gray-300 rounded-md text-gray-900 text-sm focus:ring-dark-red-2 focus:border-dark-red block w-full dark:bg-dark-red-5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-dark-red-2 dark:focus:border-dark-red-2 ${disabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                required={required}
                value={value !== undefined ? value : defaultValue || ""}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="" disabled hidden>
                    Select an option
                </option>
                {options.map((option, index) => (
                    <option key={index} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectField;