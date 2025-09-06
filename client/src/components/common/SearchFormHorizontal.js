import React from "react";

/**
 * Reusable search form component horizontal
 * @param {Object} props
 * @param {Object} props.searchLogic
 * @param {Array} props.fields
 * @param {Function} props.onSearch
 */
const SearchForm = ({ searchLogic, fields, onSearch }) => {
  return (
    <div className="bg-white border-dark-red-2 border-2 rounded-lg p-7 mb-6">
      <div className="flex items-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 mr-2"
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-lg font-bold">{fields.title || "SEARCH"}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.formFields.map((field) => (
          <div
            key={field.name}
            className={field.fullWidth ? "md:col-span-2" : ""}
          >
            <p className="mb-1">{field.label}</p>
            {field.type === "select" ? (
              <select
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
                name={field.name}
                value={searchLogic.searchParams[field.name] || ""}
                onChange={searchLogic.handleInputChange}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2"
                placeholder={field.placeholder}
                name={field.name}
                value={searchLogic.searchParams[field.name] || ""}
                onChange={searchLogic.handleInputChange}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-1.5 text-center ease-in duration-150 w-full sm:w-auto"
          onClick={onSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchForm;