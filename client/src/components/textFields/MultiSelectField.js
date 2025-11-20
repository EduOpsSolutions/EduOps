import React, { useState, useRef, useEffect } from 'react';

const MultiSelectField = ({
  label,
  id,
  name,
  options = [],
  value = [],
  onChange,
  disabled = false,
  required = false,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    if (disabled) return;

    let newValue;
    if (value.includes(optionValue)) {
      // Removing a course - also remove its co-requisites
      newValue = value.filter((v) => v !== optionValue);

      const selectedOption = options.find(opt => opt.value === optionValue);

      // Remove all co-requisites of this course
      if (selectedOption?.corequisites && selectedOption.corequisites.length > 0) {
        selectedOption.corequisites.forEach(coreqId => {
          newValue = newValue.filter((v) => v !== coreqId);
        });
      }

      // Also remove courses that list THIS course as their co-requisite (bidirectional)
      options.forEach(opt => {
        if (opt.corequisites && opt.corequisites.includes(optionValue)) {
          newValue = newValue.filter((v) => v !== opt.value);
        }
      });
    } else {
      // Adding a course - also add its co-requisites
      newValue = [...value, optionValue];

      // Check if this course has co-requisites and auto-add them
      const selectedOption = options.find(opt => opt.value === optionValue);
      if (selectedOption?.corequisites && selectedOption.corequisites.length > 0) {
        // Add all co-requisites that aren't already selected and aren't disabled
        selectedOption.corequisites.forEach(coreqId => {
          if (!newValue.includes(coreqId)) {
            // Check if the co-requisite course is disabled
            const coreqOption = options.find(opt => opt.value === coreqId);
            if (!coreqOption?.disabled) {
              newValue.push(coreqId);
            }
          }
        });
      }

      // Also check if any OTHER courses list THIS course as a co-requisite (bidirectional)
      options.forEach(opt => {
        if (opt.corequisites && opt.corequisites.includes(optionValue)) {
          // This option has the selected course as its co-requisite
          if (!newValue.includes(opt.value) && !opt.disabled) {
            newValue.push(opt.value);
          }
        }
      });
    }

    onChange({ target: { name, value: newValue } });
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    if (disabled) return;

    // Same logic as handleToggle when removing - remove co-requisites too
    let newValue = value.filter((v) => v !== optionValue);

    const selectedOption = options.find(opt => opt.value === optionValue);

    // Remove all co-requisites of this course
    if (selectedOption?.corequisites && selectedOption.corequisites.length > 0) {
      selectedOption.corequisites.forEach(coreqId => {
        newValue = newValue.filter((v) => v !== coreqId);
      });
    }

    // Also remove courses that list THIS course as their co-requisite (bidirectional)
    options.forEach(opt => {
      if (opt.corequisites && opt.corequisites.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== opt.value);
      }
    });

    onChange({ target: { name, value: newValue } });
  };

  const filteredOptions = options.filter((option) =>
    option.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  return (
    <div className="relative mb-5 group">
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Selected Items Display */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`min-h-[42px] w-full px-3 py-2 border rounded-lg cursor-pointer ${
            disabled
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 hover:border-dark-red-2'
          } ${isOpen ? 'border-dark-red-2 ring-1 ring-dark-red-2' : ''}`}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                    option.disabled
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-dark-red-2 text-white'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{option.label}</span>
                  {!disabled && !option.disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="ml-1 hover:bg-dark-red-5 rounded-full p-0.5"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}

          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dark-red-2 focus:border-dark-red-2"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-60">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isDisabled = option.disabled;

                  return (
                    <div
                      key={option.value}
                      onClick={() => !isDisabled && handleToggle(option.value)}
                      className={`px-3 py-2 cursor-pointer flex items-start gap-2 ${
                        isDisabled
                          ? 'bg-gray-50 cursor-not-allowed opacity-60'
                          : 'hover:bg-gray-100'
                      } ${isSelected ? 'bg-red-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 text-dark-red-2 border-gray-300 rounded focus:ring-dark-red-2"
                      />
                      <div className="flex-1">
                        <div className={isDisabled ? 'text-gray-500' : ''}>
                          {option.label}
                        </div>
                        {option.price && (
                          <div className="text-xs text-gray-500 mt-1">
                            Price: ₱{parseFloat(option.price).toLocaleString()}
                          </div>
                        )}
                        {option.helperText && (
                          <div className="text-xs text-gray-600 mt-1 italic">
                            {option.helperText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value.join(',')}
        required={required && value.length === 0}
      />
    </div>
  );
};

export default MultiSelectField;
