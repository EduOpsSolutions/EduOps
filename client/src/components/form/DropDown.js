import React from 'react';
import { cn } from '../../utils/cn';

export default function DropDown({
  name,
  id,
  options = [{ value: null, label: 'Select an option' }],
  value = '',
  onChange = () => {},
  className,
}) {
  return (
    <div className={cn('relative w-1/4', className)}>
      <select
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className="block py-2.5 w-full pl-4 text-sm text-gray-900 bg-white border border-dark-red-2 focus:outline-none focus:ring-0 focus:border-dark-red peer rounded-3xl"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-sm text-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
