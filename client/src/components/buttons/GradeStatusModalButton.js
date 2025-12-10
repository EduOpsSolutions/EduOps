import React from 'react';

function GradeStatusModalButton({ status, name, id, options, defaultValue, onChange, disabled = false }) {
    const getButtonStyle = (value, isDisabled) => {
        if (isDisabled) return 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed';
        if (value === 'pass') return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
        if (value === 'fail') return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300';
        return 'bg-gray-200 text-gray-600 hover:bg-gray-300 border-gray-300';
    };

    const currentValue = defaultValue || status?.toLowerCase() || "ng";

    return (
        <div className='flex justify-center items-center w-full gap-1'>
            {disabled && (
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            )}
            <select
                name={name}
                id={id}
                className={`${getButtonStyle(currentValue, disabled)} px-2 py-1 rounded border text-xs sm:text-sm md:text-base text-center w-full max-w-[80px] sm:max-w-[90px] md:max-w-[100px] h-6 sm:h-7 md:h-8 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none transition-colors duration-200 appearance-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                value={currentValue}
                onChange={e => !disabled && onChange(e.target.value)}
                disabled={disabled}
                title={disabled ? "Period locked - cannot change grades" : ""}
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