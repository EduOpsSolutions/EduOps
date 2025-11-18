import React from 'react';

function GradeStatusModalButton({ status, name, id, options, defaultValue, onChange }) {
    const getButtonStyle = (value) => {
        if (value === 'pass') return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
        if (value === 'fail') return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300';
        return 'bg-gray-200 text-gray-600 hover:bg-gray-300 border-gray-300';
    };

    const currentValue = defaultValue || status?.toLowerCase() || "ng";

    return (
        <div className='flex justify-center items-center w-full'>
            <select
                name={name}
                id={id}
                className={`${getButtonStyle(currentValue)} px-2 py-1 rounded border text-xs sm:text-sm md:text-base text-center w-full max-w-[80px] sm:max-w-[90px] md:max-w-[100px] h-6 sm:h-7 md:h-8 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none transition-colors duration-200 appearance-none cursor-pointer`}
                value={currentValue}
                onChange={e => onChange(e.target.value)}
            >
                {options?.map((option, index) => {
                    let optionClass = 'bg-gray-200 text-gray-600';
                    if (option.value === 'PASS') optionClass = 'bg-green-100 text-green-800';
                    if (option.value === 'FAIL') optionClass = 'bg-red-100 text-red-800';

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