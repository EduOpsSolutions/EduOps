import React from 'react';
import { Pagination as FlowbitePagination } from 'flowbite-react';
import { cn } from '../../utils/cn';

const Pagination = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  itemName = 'items',
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50],
  showItemsPerPageSelector = true,
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const customPaginationTheme = {
    pages: {
      base: 'xs:mt-0 mt-2 inline-flex items-center -space-x-px',
      showIcon:
        'inline-flex items-center justify-center px-3 py-2 ml-0 leading-tight text-gray-700 bg-white border border-red-900 hover:bg-red-50 hover:text-red-900',
      previous:
        'ml-0 rounded-l-lg px-3 py-2 leading-tight text-gray-700 bg-white border border-red-900 hover:bg-red-50 hover:text-red-900',
      next: 'rounded-r-lg px-3 py-2 leading-tight text-gray-700 bg-white border border-red-900 hover:bg-red-50 hover:text-red-900',
      selector: {
        base: 'py-2 px-3 ml-0 leading-tight text-gray-700 bg-white border border-red-900 hover:bg-red-50 hover:text-red-900',
        active:
          'py-2 px-3 text-white bg-red-900 border border-red-900 hover:bg-red-800 hover:text-white',
        disabled:
          'py-2 px-3 ml-0 leading-tight text-gray-300 bg-white border border-red-900 cursor-default opacity-50',
      },
    },
  };

  return (
    <div className={cn('flex flex-col gap-4 mt-6', className)}>
      {showItemsPerPageSelector && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-dark-red-2 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-dark-red-2 focus:border-dark-red"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-600">
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of{' '}
            {totalItems} {itemName}
          </span>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <FlowbitePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
            previousLabel="Previous"
            nextLabel="Next"
            theme={customPaginationTheme}
            className="flex items-center"
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;