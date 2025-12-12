import React, { useState, useEffect } from "react";
import { getCookieItem } from '../../utils/jwt';
import { useLedgerStore } from "../../stores/ledgerStore";
import axios from "axios";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import LedgerPagination from "../../components/common/LedgerPagination";

const printStyles = `
  @media print {
    @page {
      size: landscape;
      margin: 0.5in;
    }
    body * { visibility: hidden !important; }
    .print-ledger-container, .print-ledger-container * { visibility: visible !important; }
    .print-ledger-container {
      position: absolute !important;
      left: 0;
      top: 0;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      overflow: visible !important;
      box-sizing: border-box !important;
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed !important;
      font-size: 9px !important;
      border-collapse: collapse !important;
    }
    th, td {
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      font-size: 9px !important;
      padding: 2px 4px !important;
      border: 1px solid #ddd !important;
    }
    th {
      font-weight: bold !important;
      background-color: #f5f5f5 !important;
    }
    .no-print { display: none !important; }
  }
`;

function Ledger() {
    const { ledgerEntries, setLedgerEntries } = useLedgerStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const totalItems = ledgerEntries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const visibleEntries = ledgerEntries.slice(
        (currentPage - 1) * itemsPerPage,
        (currentPage - 1) * itemsPerPage + itemsPerPage
    );

    const API_BASE_URL = process.env.REACT_APP_API_URL;

    // Get current student name from JWT
    let studentName = '';
    let studentId = '';
    const token = getCookieItem('token');
    if (token) {
        try {
            const decoded = require('../../utils/jwt').decodeToken(token);
            const firstName = decoded?.data?.firstName || '';
            const lastName = decoded?.data?.lastName || '';
            studentName = `${lastName}, ${firstName}`.trim();
            studentId = decoded?.data?.id || '';
        } catch (err) {
            studentName = '';
        }
    }

    useEffect(() => {
        async function fetchMyLedger() {
            setLoading(true);
            try {
                const token = getCookieItem('token');
                const res = await axios.get(`${API_BASE_URL}/ledger/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLedgerEntries(res.data || []);
            } catch (err) {
                setLedgerEntries([]);
            } finally {
                setLoading(false);
            }
        }
        fetchMyLedger();
        // eslint-disable-next-line
    }, []);

    // Print handler
    const handlePrint = () => {
        if (!document.getElementById('print-ledger-styles')) {
            const style = document.createElement('style');
            style.id = 'print-ledger-styles';
            style.innerHTML = printStyles;
            document.head.appendChild(style);
        }
        window.print();
    };

    return (
        <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
                    <p className="text-xl uppercase grow">{studentName || 'Student'}</p>
                    <span className="m-0">
                        <ThinRedButton onClick={handlePrint}>Print Ledger</ThinRedButton>
                    </span>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                            <p className="text-lg">Loading ledger...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grow overflow-auto print-ledger-container">
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
                                {visibleEntries.length > 0 ? (
                                    visibleEntries.map((entry, idx) => {
                                    const dt = new Date(entry.paidAt || entry.createdAt || entry.date);
                                    let date = "";
                                    if (dt && !isNaN(dt)) {
                                        const mm = String(dt.getMonth() + 1).padStart(2, '0');
                                        const dd = String(dt.getDate()).padStart(2, '0');
                                        const yy = String(dt.getFullYear()).slice(-2);
                                        date = `${mm}/${dd}/${yy}`;
                                    }
                                    const time = dt && !isNaN(dt) ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : "";
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
                        <div className="mt-4">
                            <LedgerPagination
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
                    </>
                )}
            </div>
        </div>
    );
}

export default Ledger;