import React from "react";

/**
 * Reusable search form component vertical
 * @param {Object} props
 * @param {Object} props.searchLogic
 * @param {Array} props.fields
 * @param {Function} props.onSearch
 */
const SearchFormVertical = ({ searchLogic, fields, onSearch }) => {
  return (
    <div className="bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-7 shadow-[0_4px_3px_0_rgba(0,0,0,0.5)]">
      <form
        className="flex flex-col gap-4 sm:gap-6 lg:gap-7"
        onSubmit={onSearch}
      >
        <div className="flex flex-row gap-2 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-lg font-bold">{fields.title || "SEARCH"}</span>
        </div>

        {fields.formFields.map((field) => (
          <div key={field.name}>
            <p className="mb-1 text-sm sm:text-base">{field.label}</p>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={searchLogic.searchParams[field.name] || ""}
                onChange={searchLogic.handleInputChange}
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2 text-sm sm:text-base"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={searchLogic.searchParams[field.name] || ""}
                onChange={searchLogic.handleInputChange}
                placeholder={field.placeholder}
                className="w-full border-black focus:outline-dark-red-2 focus:ring-dark-red-2 focus:border-black rounded p-2 text-sm sm:text-base"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-dark-red-2 rounded-md hover:bg-dark-red-5 focus:outline-none text-white font-semibold text-md px-10 py-1.5 text-center shadow-sm shadow-black ease-in duration-150 w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFormVertical;