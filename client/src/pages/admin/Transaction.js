import React, { useEffect } from "react";
import TransactionDetailModal from "../../components/modals/transactions/TransactionDetailModal";
import AddTransactionModal from "../../components/modals/transactions/AddTransactionModal";
import Pagination from "../../components/common/Pagination";
import SearchField from "../../components/textFields/SearchField";
import ThinRedButton from "../../components/buttons/ThinRedButton";
import { useTransactionSearchStore, useTransactionStore } from "../../stores/transactionStore";

function Transaction() {
  const searchStore = useTransactionSearchStore();

  const {
    // State
    selectedTransaction,
    loading,
    error,
    transactionDetailModal,
    addTransactionModal,

    // Actions
    fetchTransactions,
    refreshTransactions,
    handleStudentClick,
    openAddTransactionModal,
    closeAddTransactionModal,
    closeTransactionDetailModal,
    handleModalSubmit,
    openCheckoutUrl,
    refreshPaymentStatus,
    clearError,
    resetStore
  } = useTransactionStore();

  // Auto-refresh every 3 seconds for live status updates
  useEffect(() => {
    fetchTransactions();

    const interval = setInterval(() => {
      refreshTransactions();
    }, 3000); // Refresh every 3 seconds for near real-time updates

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshTransactions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when user focuses on the window/page
  useEffect(() => {
    const handleFocus = () => {
      refreshTransactions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      resetStore();
      searchStore.resetSearch();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    searchStore.handleSearch();
  };

  return (
    <div className="bg-white-yellow-tone min-h-[calc(100vh-80px)] box-border flex flex-col py-4 sm:py-6 px-4 sm:px-8 md:px-12 lg:px-20">
      <div className="w-full bg-white border-2 border-dark-red rounded-lg p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold break-words">
              Manage Transaction
            </h1>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              {/* Search Field */}
              <div>
                <SearchField
                  name="searchTerm"
                  placeholder="Search by Student ID or Name"
                  value={searchStore.searchParams.searchTerm || ""}
                  onChange={searchStore.handleInputChange}
                  onClick={handleSearch}
                  className="w-full sm:w-80"
                />
              </div>

              {/* Add Transaction Button */}
              <div className="flex gap-2">
                <ThinRedButton onClick={openAddTransactionModal}>
                  Add Transaction
                </ThinRedButton>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}



          {/* Table Section */}
          <div className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                  <p className="text-lg">Loading transactions...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Student ID
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Name
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Fee
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Amount
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Status
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Payment Method
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Email
                        </th>
                        <th className="text-left py-2 md:py-3 px-2 sm:px-3 md:px-4 font-semibold border-t-2 border-b-2 border-red-900 text-xs sm:text-sm md:text-base">
                          Issued At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchStore.currentItems.map((transaction, index) => (
                        <tr
                          key={transaction.id || index}
                          className="cursor-pointer transition-colors duration-200 hover:bg-dark-red hover:text-white"
                          onClick={() => handleStudentClick(transaction)}
                        >
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                              title={transaction.studentId || transaction.userId}
                            >
                              {transaction.studentId || transaction.userId}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                              title={transaction.studentName || `${transaction.firstName || ''} ${transaction.lastName || ''}`.trim()}
                            >
                              {transaction.studentName || `${transaction.firstName || ''} ${transaction.lastName || ''}`.trim()}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-20 sm:max-w-28 md:max-w-36 lg:max-w-none"
                              title={transaction.feeType ? transaction.feeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                            >
                              {transaction.feeType ? transaction.feeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                              title={`₱${transaction.amount}`}
                            >
                              ₱{transaction.amount}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : transaction.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : transaction.status === 'expired'
                                        ? 'bg-orange-100 text-orange-800'
                                        : transaction.status === 'refunded'
                                          ? 'bg-purple-100 text-purple-800'
                                          : transaction.status === 'cancelled'
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                              title={transaction.status}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-20 sm:max-w-24 md:max-w-none"
                              title={transaction.paymentMethod || 'N/A'}
                            >
                              {transaction.paymentMethod ?
                                transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)
                                : 'N/A'
                              }
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-32 sm:max-w-36 md:max-w-40 lg:max-w-none"
                              title={transaction.email}
                            >
                              {transaction.email}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 sm:px-3 md:px-4 border-t border-b border-red-900 text-xs sm:text-sm md:text-base">
                            <div
                              className="truncate max-w-24 sm:max-w-32 md:max-w-40 lg:max-w-none"
                              title={new Date(transaction.paidAt || transaction.createdAt).toLocaleDateString()}
                            >
                              {new Date(transaction.paidAt || transaction.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {searchStore.currentItems.length === 0 && !searchStore.loading && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-6 md:py-8 text-gray-500 border-t border-b border-red-900 text-sm md:text-base"
                          >
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={searchStore.currentPage}
                totalPages={searchStore.totalPages}
                onPageChange={searchStore.handlePageChange}
                itemsPerPage={searchStore.itemsPerPage}
                onItemsPerPageChange={searchStore.handleItemsPerPageChange}
                totalItems={searchStore.totalItems}
                itemName="transactions"
                showItemsPerPageSelector={true}
              />
            </div>
          </div>
        </div>

        <TransactionDetailModal
          isOpen={transactionDetailModal}
          onClose={closeTransactionDetailModal}
          transaction={selectedTransaction}
          onOpenCheckout={openCheckoutUrl}
        />

        <AddTransactionModal
          addTransactionModal={addTransactionModal}
          setAddTransactionModal={closeAddTransactionModal}
          selectedStudent={null}
          onSubmit={handleModalSubmit}
        />
      </div>
  );
}

export default Transaction;