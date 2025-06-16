import React from 'react';
import { cn } from '../../utils/cn';
import { ImSpinner } from 'react-icons/im';
import { MdWarningAmber } from 'react-icons/md';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  const formattedDate = new Intl.DateTimeFormat('en-US', options)
    .format(date)
    .toUpperCase();
  return formattedDate;
};

export default function Table({
  data = [],
  className,
  headers = [],
  onClick = () => {
    console.log('clicked');
  },
  isLoading = false,
  isError = false,
}) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col h-[30rem] justify-center items-center w-[80%] mx-auto bg-white border-2 rounded-md border-german-red',
          className
        )}
      >
        <ImSpinner className="animate-spin mt-2" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex flex-col h-[30rem] justify-center items-center w-[80%] mx-auto bg-white border-2 rounded-md border-german-red',
          className
        )}
      >
        <MdWarningAmber className="text-german-red" size={32} />
        <p className="text-black">Something went wrong, please try again.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-x-auto border-2 rounded-md border-german-red p-4 bg-white',
        className
      )}
    >
      <table className="w-full text-sm text-left rtl:text-right text-black">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr className="border-b-2">
            {headers &&
              headers.map((header, index) => (
                <th scope="col" className="px-6 py-3 border" key={index}>
                  {header}
                </th>
              ))}
            {headers.length === 0 && (
              <th scope="col" className="px-6 py-3"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onClick(row, rowIndex)}
              className="hover:cursor-pointer duration-200 hover:bg-german-red/20 bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
            >
              {Object.entries(row).map(([key, cell], cellIndex) =>
                cellIndex === 0 ? (
                  <th
                    key={cellIndex}
                    scope="row"
                    className="border px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-6 py-1 border !text-xs">
                    {key === 'status' ? (
                      cell === 'active' ? (
                        <p className="text-green-600">ACTIVE</p>
                      ) : cell === 'inactive' ? (
                        <p className="text-red-600">INACTIVE</p>
                      ) : cell === 'deleted' ? (
                        <p className="text-gray-600">DELETED</p>
                      ) : (
                        <p>{cell}</p>
                      )
                    ) : ['createdAt', 'updatedAt', 'deletedAt'].includes(
                        key
                      ) ? (
                      formatDateTime(cell)
                    ) : (
                      cell
                    )}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
