import React from 'react';

const ModalTextField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  disabled = false,
  min,
  max,
  step,
  children, // For prefix/suffix content like peso symbol
  options = [],
  ...props
}) => {
  if (type === 'option') {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
          className="w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label || option.value}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        {children}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`w-full border border-dark-red-2 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red ${
            type === 'number'
              ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              : ''
          } ${children ? 'pl-8 pr-3' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default ModalTextField;
