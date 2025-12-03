import React from 'react';
import { FaLock } from 'react-icons/fa';

const NotLabelledInputField = ({ name, id, label, type = "text", required = true, value, disabled = false, onChange}) => {
    return (
        <div className="relative z-0 w-full mb-5 group">
            <input
                type={type}
                name={name}
                id={id}
                required={required}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className={`block py-2.5 px-0 w-full text-sm bg-white pl-2 text-gray-900 bg-transparent border-2 border-b-2 border-gray-300 rounded-md appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-dark-red peer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder=""
            />
            <label htmlFor={id} className="peer-focus:font-medium absolute text-sm text-black pl-2 dark:text-gray-400 duration-300 transform -translate-y-7 scale-75 top-3 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 placeholder-black z-10">
                {label}
            </label>
            {disabled && (
                <div className="absolute right-3 top-3 text-gray-500">
                    <FaLock size={14} />
                </div>
            )}
        </div>
    );
}

export default NotLabelledInputField;