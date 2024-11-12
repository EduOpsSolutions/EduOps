import React from 'react';

const SmallGreySelectField = ({ name, id, options }) => {
    return (
            <div className='flex justify-center items-center w-full'>
                <select name={name} id={id} className="bg-grey-1 text-black text-base text-center w-4/5 h-7 py-1 focus:ring-grey-2 leading-tight border-none appearance-none rounded-sm focus:outline-none">
                    <option value="" disabled hidden>
                        NG
                    </option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            { option.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

export default SmallGreySelectField;
