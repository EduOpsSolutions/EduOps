import React from "react";
import Pagination from "./Pagination";

/**
 * Reusable search results component
 * @param {Object} props
 * @param {Boolean} props.visible
 * @param {Array} props.items 
 * @param {Array} props.columns 
 * @param {Function} props.onItemClick 
 * @param {Object} props.pagination 
 * @param {Object} props.columnRenderers 
 */
const SearchResults = ({ 
  visible, 
  items, 
  columns, 
  onItemClick,
  pagination,
  actionButton = null,
  title = "SEARCH RESULTS",
  columnRenderers = {},
  emptyMessage = "No items found"
}) => {
  if (!visible) return null;
  
  return (
    <div className="bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-7 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <span className="text-base sm:text-lg font-bold">{title}</span>
        {actionButton && (
          <div className="flex justify-end">
            {actionButton}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b-2 border-dark-red-2">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold border-t-2 border-b-2 border-dark-red-2 text-sm sm:text-base w-1/3"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id || item._id || item.studentId || item.name || index}
                className="cursor-pointer transition-colors duration-200 hover:bg-dark-red-2 hover:text-white"
                onClick={() => onItemClick(item)}
              >
                {columns.map((column) => (
                  <td 
                    key={`${item.id || item._id || item.studentId || item.name || index}-${column.key}`} 
                    className="py-2 sm:py-3 px-2 sm:px-4 border-t border-b border-dark-red-2 text-sm sm:text-base w-1/3"
                  >
                    {columnRenderers[column.key] 
                      ? columnRenderers[column.key](item[column.key], item)
                      : item[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 sm:py-8 text-gray-500 border-t border-b border-dark-red-2 text-sm sm:text-base"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
          totalItems={pagination.totalItems}
          itemName={pagination.itemName}
          showItemsPerPageSelector={pagination.showItemsPerPageSelector}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default SearchResults;