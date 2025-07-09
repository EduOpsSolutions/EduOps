import React from 'react';

function GradeStatusModalButton({ status, name, id, options, defaultValue, onChange }) {
    const getSelectStyle = (value) => {
        if (value === 'pass') return 'bg-green-500 text-white';
        if (value === 'fail') return 'bg-red-400 text-white';
        return 'bg-gray-300 text-gray-800';
    };

    return (
        <div className='flex justify-center items-center w-full'>
            <select
                name={name}
                id={id}
                className={`${getSelectStyle(defaultValue || status?.toLowerCase())} text-xs sm:text-sm md:text-base text-center w-full max-w-[100px] h-7 py-1 focus:ring-grey-2 leading-tight border-none appearance-none rounded-sm focus:outline-none transition-colors duration-200`}
                value={defaultValue || status?.toLowerCase() || "ng"}
                onChange={onChange}
            >
                {options?.map((option, index) => {
                    let optionClass = 'bg-gray-300 text-gray-800';
                    if (option.value === 'pass') optionClass = 'bg-green-500 text-white';
                    if (option.value === 'fail') optionClass = 'bg-red-400 text-white';

                    return (
                        <option key={index} value={option.value} className={optionClass}>
                            {option.label}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default GradeStatusModalButton;