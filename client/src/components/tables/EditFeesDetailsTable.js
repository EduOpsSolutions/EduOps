import React from 'react';

//Edit mode table for Manage Fees
const FeesTable = ({ 
  fees, 
  isEditMode, 
  onInputChange, 
  onFieldUndo, 
  hasFieldChanged,
  onDelete = () => {} 
}) => {
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-dark-red-2">
              <th className="py-4 px-4 sm:px-6 font-bold w-[45%] text-start text-sm sm:text-base md:text-lg">
                Description
              </th>
              <th className="py-4 px-4 sm:px-6 font-bold w-[20%] text-center text-sm sm:text-base md:text-lg">Amount</th>
              <th className="py-4 px-4 sm:px-6 font-bold w-[22%] text-center text-sm sm:text-base md:text-lg">Due Date</th>
              {isEditMode && <th className="py-4 px-4 sm:px-6 font-bold w-[13%] text-center text-sm sm:text-base md:text-lg">Action</th>}
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, idx) => (
              <tr
                key={fee.id ? fee.id : fee.description === 'Course Fee' || fee.description === 'Base Fee' ? 'base-fee' : idx}
                className="border-b border-[rgb(137,14,7,.3)] hover:bg-gray-50"
              >
                <td className="py-4 px-4 sm:px-6 uppercase text-sm sm:text-base">
                  {(isEditMode && fee.isBaseFee) ? (
                    fee.description
                  ) : isEditMode ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={fee.description}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          if (value.trim() !== "") {
                            onInputChange(fee.id, "name", value);
                          }
                        }}
                        className={`flex-1 min-w-0 px-3 py-2.5 border ${fee.description.trim() === "" ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2 transition-colors text-sm sm:text-base`}
                        placeholder="Enter description"
                      />
                      <button
                        onClick={() => onFieldUndo(fee.id, "name")}
                        className={`flex-shrink-0 p-2 rounded-md transition-all duration-200 ${hasFieldChanged(fee.id, "name")
                            ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                        title="Undo changes to description"
                        disabled={!hasFieldChanged(fee.id, "name")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    fee.description
                  )}
                </td>
                <td className="py-4 px-4 sm:px-6 text-center text-sm sm:text-base">
                  {(isEditMode && fee.isBaseFee) ? (
                    fee.price
                  ) : isEditMode ? (
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        value={fee.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value)) {
                            onInputChange(fee.id, "price", value);
                          }
                        }}
                        className={`w-28 sm:w-32 px-3 py-2.5 border ${fee.price === "" ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2 transition-colors text-center text-sm sm:text-base`}
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => onFieldUndo(fee.id, "price")}
                        className={`flex-shrink-0 p-2 rounded-md transition-all duration-200 ${hasFieldChanged(fee.id, "price")
                            ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                        title="Undo changes to amount"
                        disabled={!hasFieldChanged(fee.id, "price")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    fee.price
                  )}
                </td>
                <td className="py-4 px-4 sm:px-6 text-center text-sm sm:text-base">
                  {(isEditMode && fee.isBaseFee) ? (
                    fee.dueDate
                  ) : isEditMode ? (
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="date"
                        value={fee.dueDate ? fee.dueDate.slice(0, 10) : ''}
                        onChange={(e) => {
                          const dateStr = e.target.value;
                          // Always set as UTC midnight ISO string
                          const isoDate = dateStr ? `${dateStr}T00:00:00.000Z` : '';
                          onInputChange(
                            fee.id,
                            "dueDate",
                            isoDate
                          );
                        }}
                        className="w-36 sm:w-40 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red-2 transition-colors text-center text-sm sm:text-base"
                        placeholder="YYYY-MM-DD"
                      />
                      <button
                        onClick={() => onFieldUndo(fee.id, "dueDate")}
                        className={`flex-shrink-0 p-2 rounded-md transition-all duration-200 ${hasFieldChanged(fee.id, "dueDate")
                            ? "text-dark-red-2 hover:text-white hover:bg-dark-red-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                        title="Undo changes to due date"
                        disabled={!hasFieldChanged(fee.id, "dueDate")}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    fee.dueDate
                  )}
                </td>
                {(isEditMode && fee.isBaseFee) ? null : (isEditMode && onDelete && (
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <button
                      onClick={() => onDelete(fee.id)}
                      className="px-3 py-2 text-sm font-semibold text-white bg-dark-red-2 hover:bg-dark-red-5 focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:ring-offset-2 rounded-md transition-all duration-200 shadow-sm shadow-black"
                      title="Delete fee"
                    >
                      Delete
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeesTable;