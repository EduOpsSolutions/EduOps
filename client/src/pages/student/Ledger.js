import React, { useState } from "react";
import { useLedgerStore } from "../../stores/ledgerStore";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import Pagination from "../../components/common/Pagination";


function Ledger() {
    const { ledgerEntries } = useLedgerStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const totalItems = ledgerEntries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const visibleEntries = ledgerEntries.slice(
        (currentPage - 1) * itemsPerPage,
        (currentPage - 1) * itemsPerPage + itemsPerPage
    );

    return (
        <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
                    <p className="text-xl uppercase grow">Dolor, Polano I</p>
                    <span className="m-0">
                        <ThinRedButton>Print Ledger</ThinRedButton>
                    </span>
                </div>
                <div className="grow overflow-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="border-b-2 border-dark-red-2">
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Date</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Time</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">O.R Number</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Debit Amount</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Credit Amount</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Balance</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Type</th>
                                <th className="py-3 px-4 font-normal whitespace-nowrap">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleEntries.map((entry) => (
                                <tr key={entry.id} className="border-b-2 border-[rgb(137,14,7,.49)]">
                                    <td className="py-3 px-4 text-center">{entry.date}</td>
                                    <td className="py-3 px-4 text-center">{entry.time}</td>
                                    <td className="py-3 px-4 text-center">{entry.orNumber}</td>
                                    <td className="py-3 px-4 text-center">{entry.debitAmount}</td>
                                    <td className="py-3 px-4 text-center">{entry.creditAmount}</td>
                                    <td className="py-3 px-4 text-center">{entry.balance}</td>
                                    <td className="py-3 px-4 text-center">{entry.type}</td>
                                    <td className="py-3 px-4 text-center">{entry.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        totalItems={totalItems}
                        itemName="transactions"
                        showItemsPerPageSelector={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default Ledger;