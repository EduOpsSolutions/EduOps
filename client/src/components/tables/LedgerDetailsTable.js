import React, { useState, useEffect } from 'react';
import ThinRedButton from '../buttons/ThinRedButton';

// Print-specific CSS (hide everything except the ledger details card when printing)
const printStyles = `
  @media print {
    body * { visibility: hidden !important; }
    .print-ledger-container, .print-ledger-container * { visibility: visible !important; }
    .print-ledger-container { position: absolute !important; left: 0; top: 0; width: 100vw !important; background: #fff !important; box-shadow: none !important; border: 1px solid #000 !important; z-index: 9999; }
    .no-print { display: none !important; }
  }
`;

//Table after clicking a result from ledger
const LedgerDetails = ({ 
  student, 
  onBackClick, 
  onAddTransaction,
  ledgerEntries = []
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [ledgerEntries]);

  if (!student) return null;
  
  return (
    <>
      {/* Print styles injected only once */}
      <style>{printStyles}</style>
    <div className="print-ledger-container flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-3 sm:p-5 print-ledger-table">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
              <p className="text-lg">Loading student's ledger...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
          <p className="text-lg sm:text-xl uppercase text-center sm:text-left">{student.name}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 no-print">
            <ThinRedButton onClick={() => window.print()}>Print Ledger</ThinRedButton>
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
                    ledgerEntries.map((entry, idx) => {
                      // Support both mapped and legacy fields
                      const dt = new Date(entry.paidAt || entry.createdAt || entry.date);
                      const date = dt && !isNaN(dt) ? dt.toLocaleDateString() : "";
                      const time = dt && !isNaN(dt) ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                      const referenceNumber = entry.referenceNumber || entry.orNumber || "";
                      const debitAmount = (entry.debitAmount !== undefined && entry.debitAmount !== null && entry.debitAmount !== 0 && entry.debitAmount !== "0" && entry.debitAmount !== "0.00") ? entry.debitAmount : (entry.debit !== undefined && entry.debit !== null && entry.debit !== 0 && entry.debit !== "0" && entry.debit !== "0.00" ? entry.debit : "");
                      const creditAmount = (entry.amount !== undefined && entry.amount !== null && entry.amount !== 0 && entry.amount !== "0" && entry.amount !== "0.00") ? entry.amount : (entry.credit !== undefined && entry.credit !== null && entry.credit !== 0 && entry.credit !== "0" && entry.credit !== "0.00" ? entry.credit : "");
                      const balance = entry.balance;
                      let feeType = entry.feeType || entry.type || "";
                      if (feeType) {
                        feeType = feeType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      }
                      return (
                        <tr key={entry.id || referenceNumber || idx} className="border-b border-[rgb(137,14,7,.49)]">
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={date}>
                              {date}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={time}>
                              {time}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-24 sm:max-w-28 md:max-w-none" title={referenceNumber}>
                              {referenceNumber}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={debitAmount != null ? debitAmount : " "}>
                              {debitAmount != null ? debitAmount : " "}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={creditAmount != null ? creditAmount : " "}>
                              {creditAmount != null ? creditAmount : " "}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={balance != null ? balance : "N/A"}>
                              {balance != null ? balance : "N/A"}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-20 sm:max-w-24 md:max-w-none" title={feeType}>
                              {feeType}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 text-center text-xs sm:text-sm md:text-base">
                            <div className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none" title={entry.remarks}>
                              {entry.remarks}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
          </>
        )}
      </div>
    </>
  );
};

export default LedgerDetails;