import React from 'react';
import { cn } from '../../utils/cn';

const LabelledInputField = ({
  name,
  id,
  label,
  type = 'text',
  required,
  placeholder = {},
  value,
  onChange,
  disabled,
  className,
}) => {
  return (
    <div className="relative z-0 w-full mb-5 group">
      <label
        htmlFor={id}
        class="block mb-2 text-sm font-medium dark:text-white"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        className={cn(
          disabled && 'bg-gray-200',
          'block py-2.5 px-2 w-full text-sm pl-2 text-gray-900 bg-transparent border-2 border-b-2 bg-white border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-dark-red focus:outline-none focus:ring-0 focus:border-dark-red peer',
          className
        )}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default LabelledInputField;
