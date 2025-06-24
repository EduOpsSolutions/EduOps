import React from 'react';

const ModalSelectField = ({
    label,
    name,
    value,
    onChange,
    options,
    className = '',
    ...props
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-1">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ModalSelectField;