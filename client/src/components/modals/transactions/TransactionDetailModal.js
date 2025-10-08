import React from "react";

function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onOpenCheckout,
  onRefreshStatus,
}) {
  if (!isOpen || !transaction) return null;

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFeeType = (feeType) => {
    return feeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCheckoutClick = () => {
    if (transaction.checkoutUrl) {
      onOpenCheckout(transaction.checkoutUrl);
    }
  };

  const handleRefreshClick = () => {
    onRefreshStatus(transaction.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white-yellow-tone rounded-lg p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="inline-flex bg-dark-red-2 rounded-lg px-4 py-1.5 text-white hover:bg-dark-red-5 ease-in duration-150"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          {/* Payment ID */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Payment ID:
            </label>
            <span className="text-gray-900 font-mono">{transaction.id}</span>
          </div>

          {/* Student Information */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Student ID:
            </label>
            <span className="text-gray-900">{transaction.userId}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Student Name:
            </label>
            <span className="text-gray-900">
              {`${transaction.firstName} ${transaction.lastName}`}
            </span>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Fee Type:
            </label>
            <span className="text-gray-900">{formatFeeType(transaction.feeType)}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Amount:
            </label>
            <span className="text-gray-900 font-semibold text-lg">
              ₱{parseFloat(transaction.amount).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Status:
            </label>
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(transaction.status)}`}
            >
              {transaction.status.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Payment Method:
            </label>
            <span className="text-gray-900">{transaction.paymentMethod}</span>
          </div>

          {/* OR/Reference Number */}
          {transaction.referenceNumber && (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
                OR/Reference:
              </label>
              <span className="text-gray-900 font-mono">{transaction.referenceNumber}</span>
            </div>
          )}

          {/* Remarks */}
          {transaction.remarks && (
            <div className="flex flex-col sm:flex-row sm:items-start">
              <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
                Remarks:
              </label>
              <span className="text-gray-900 flex-1">{transaction.remarks}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="font-semibold text-gray-700 w-32 mb-1 sm:mb-0">
              Created At:
            </label>
            <span className="text-gray-900">{formatDateTime(transaction.createdAt)}</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              {transaction.checkoutUrl && transaction.status === 'pending' && (
                <button
                  onClick={handleCheckoutClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                  Open Checkout
                </button>
              )}
              
              <button
                onClick={handleRefreshClick}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Refresh Status
              </button>
            </div>
          </div>

          {/* Additional Information */}
          {transaction.status === 'failed' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">
                <strong>Payment Failed:</strong> This transaction could not be completed. 
                Please try again or contact support if the issue persists.
              </p>
            </div>
          )}

          {transaction.status === 'expired' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-orange-800 text-sm">
                <strong>Payment Expired:</strong> This payment link has expired. 
                A new payment link may need to be generated.
              </p>
            </div>
          )}

          {transaction.status === 'paid' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">
                <strong>Payment Successful:</strong> This payment has been completed successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailModal;