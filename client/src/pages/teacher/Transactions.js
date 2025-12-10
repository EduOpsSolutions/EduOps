import React, { useState, useEffect } from "react";
import { getCookieItem } from "../../utils/jwt";
import axios from "axios";
import ThinRedButton from "../../components/buttons/ThinRedButton";

const printStyles = `
  @media print {
    body * { visibility: hidden !important; }
    .print-container, .print-container * { visibility: visible !important; }
    .print-container { position: absolute !important; left: 0; top: 0; width: 100vw !important; background: #fff !important; box-shadow: none !important; border: 1px solid #000 !important; z-index: 9999; }
    .no-print { display: none !important; }
  }
`;

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Get current teacher info from JWT
  let teacherName = "";
  let teacherId = "";
  const token = getCookieItem("token");
  if (token) {
    try {
      const decoded = require("../../utils/jwt").decodeToken(token);
      const firstName = decoded?.data?.firstName || "";
      const lastName = decoded?.data?.lastName || "";
      teacherName = `${lastName}, ${firstName}`.trim();
      teacherId = decoded?.data?.id || "";
    } catch (err) {
      teacherName = "";
    }
  }

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const token = getCookieItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/ledger/teacher/${teacherId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    if (teacherId) {
      fetchTransactions();
    }
    // eslint-disable-next-line
  }, [teacherId]);

  // Print handler
  const handlePrint = () => {
    if (!document.getElementById("print-styles")) {
      const style = document.createElement("style");
      style.id = "print-styles";
      style.innerHTML = printStyles;
      document.head.appendChild(style);
    }
    window.print();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total
  const totalAmount = transactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      <div className="h-full flex flex-col bg-white border-dark-red-2 border-2 rounded-lg p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-2 border-dark-red-2 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Payment Transactions
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {teacherName || "Teacher"}
            </p>
          </div>
          <span className="m-0">
            <ThinRedButton onClick={handlePrint}>Print History</ThinRedButton>
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
              <p className="text-lg">Loading transactions...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grow overflow-auto print-container mt-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-dark-red-2">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Status
                    </th>

                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Transaction ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Payment Method
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction, idx) => (
                      <tr
                        key={transaction.transactionId || idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {String(transaction.status).toLocaleUpperCase()}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {transaction.transactionId || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.description || "Payment"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {transaction.type
                              .replace("_", " ")
                              .toLocaleUpperCase() || "Payment"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.paymentMethod || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-16 h-16 text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-lg">No transactions found</p>
                          <p className="text-sm mt-1">
                            Your payment history will appear here
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {transactions.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-dark-red-2 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </p>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-dark-red-2">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Transactions;
