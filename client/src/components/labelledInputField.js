import React from 'react';

const LabelledInputField = ({ name, id, label, type = "text", required = true , placeholder={}}) => {
    return (
        <div className="relative z-0 w-full mb-5 group">
            <label htmlFor={id} class="block mb-2 text-sm font-medium dark:text-white">
                {label}
            </label>
            <input type={type} name={name} id={id} className="block py-2.5 px-0 w-full text-sm pl-2  text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder={placeholder} required={required}/>
        </div>
    );
}

export default LabelledInputField;
