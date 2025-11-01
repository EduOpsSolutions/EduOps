import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../utils/axios';

function TransactionSelector({ onSelectTransaction, selectedTransactionId }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch transactions when modal opens or when there's a selected transaction to display
  useEffect(() => {
    if ((isOpen || selectedTransactionId) && !hasFetchedRef.current) {
      fetchDocumentTransactions();
      hasFetchedRef.current = true;
    }
  }, [isOpen, selectedTransactionId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction => 
        transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userId?.toString().includes(searchTerm) ||
        transaction.studentId?.toString().includes(searchTerm) ||
        transaction.amount?.toString().includes(searchTerm)
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, transactions]);

  const fetchDocumentTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all transactions and filter for document_fee
      const response = await axiosInstance.get("/payments/admin/allTransactions");
      const allTransactions = response.data.data?.payments || [];
      
      // Filter only paid transactions with feeType = 'document_fee'
      const documentTransactions = allTransactions.filter(
        transaction => 
          transaction.feeType === 'document_fee' && 
          transaction.status === 'paid'
      );
      
      setTransactions(documentTransactions);
      setFilteredTransactions(documentTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transaction) => {
    onSelectTransaction(transaction);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onSelectTransaction(null);
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Link Payment Transaction
      </label>

      {selectedTransaction ? (
        <div className="bg-green-50 border border-green-300 rounded-lg p-3 space-y-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {selectedTransaction.firstName} {selectedTransaction.lastName}
              </p>
              <p className="text-xs text-gray-600">
                Transaction ID: {selectedTransaction.transactionId}
              </p>
              <p className="text-xs text-gray-600">
                Amount: {formatAmount(selectedTransaction.amount)}
              </p>
              <p className="text-xs text-gray-600">
                Date: {formatDate(selectedTransaction.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-red-600 hover:text-red-800 text-xs font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 hover:border-dark-red-2 hover:text-dark-red-2 transition-colors duration-150"
        >
          + Search and Link Payment
        </button>
      )}

      {/* Transaction Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Document Payment</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search by Name, Student ID, Transaction ID, or Amount"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-dark-red-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Showing only paid document fee transactions
              </p>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-red-2"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  {error}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No transactions found matching your search' : 'No paid document transactions available'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() => handleSelectTransaction(transaction)}
                      className="w-full text-left border border-gray-200 rounded-lg p-3 hover:border-dark-red-2 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {transaction.firstName} {transaction.lastName}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Student ID:</span> {transaction.studentId || transaction.userId || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Transaction ID:</span> {transaction.transactionId}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Date:</span> {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-dark-red-2">
                            {formatAmount(transaction.amount)}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Paid
                          </span>
                        </div>
                      </div>
                      {transaction.remarks && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {transaction.remarks}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionSelector;
