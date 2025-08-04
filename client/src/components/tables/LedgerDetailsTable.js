import React from 'react';
import ThinRedButton from '../buttons/ThinRedButton';

//Table after clicking a result from ledger
const LedgerDetails = ({ 
  student, 
  onBackClick, 
  onAddTransaction,
  ledgerEntries = []
}) => {
  if (!student) return null;
  
  return (
    <div className="flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-3 sm:p-5 shadow-[0_4px_3px_0_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
        <p className="text-lg sm:text-xl uppercase text-center sm:text-left">{student.name}</p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <ThinRedButton>Print Ledger</ThinRedButton>
          <button
            className="bg-dark-red-2 hover:bg-dark-red-5 text-white rounded focus:outline-none shadow-sm shadow-black ease-in duration-150 py-1.5 px-2 flex items-center justify-center"
            onClick={onAddTransaction}
            aria-label="Add transaction"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="pt-2">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-dark-red-2">
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Date
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Time
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    O.R. Number
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Debit Amount
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Credit Amount
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Balance
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Type
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 sm:px-3 md:px-4 font-normal text-xs sm:text-sm md:text-base">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.length > 0 ? (
                  ledgerEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-[rgb(137,14,7,.49)]">
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.date}>
                          {entry.date}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.time}>
                          {entry.time}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-24 sm:max-w-28 md:max-w-none" title={entry.orNumber}>
                          {entry.orNumber}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.debitAmount}>
                          {entry.debitAmount}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.creditAmount}>
                          {entry.creditAmount}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.balance}>
                          {entry.balance}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={entry.type}>
                          {entry.type}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                        <div className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" title={entry.remarks}>
                          {entry.remarks}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-[rgb(137,14,7,.49)]">
                    <td 
                      colSpan="8" 
                      className="py-6 md:py-8 text-center text-gray-500 text-sm md:text-base"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ThinRedButton onClick={onBackClick}>
          Back to Results
        </ThinRedButton>
      </div>
    </div>
  );
};

export default LedgerDetails;