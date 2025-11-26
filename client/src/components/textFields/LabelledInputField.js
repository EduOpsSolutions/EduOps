import React from "react";
import { FaLock } from "react-icons/fa";
import { cn } from "../../utils/cn";

const LabelledInputField = ({
  name,
  id,
  label,
  type = "text",
  required,
  placeholder = {},
  value,
  onChange,
  disabled,
  className,
  showLabel = true,
  minLength,
  maxLength,
  ...rest
}) => {
  return (
    <div className="relative z-0 w-full mb-5 group">
      {showLabel && (
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-medium dark:text-white"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={id}
        className={cn(
          disabled && "bg-gray-100 cursor-not-allowed",
          "block py-2.5 px-2 w-full text-sm pl-2 text-gray-900 bg-transparent border-2 border-b-2 bg-white border-gray-300 rounded-md appearance-none dark:text-white dark:border-gray-600 dark:focus:border-dark-red focus:outline-none focus:ring-0 focus:border-dark-red peer",
          className
        )}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        {...rest}
      />
      {disabled && (
        <div className="absolute right-3 top-9 text-gray-500">
          <FaLock size={14} />
        </div>
      )}
    </div>
  );
};

export default LabelledInputField;
