import { create } from 'zustand';
import createSearchStore from './searchStore';
import axiosInstance from '../utils/axios';

const useTransactionSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    searchTerm: ""
  },
  searchableFields: ["firstName", "lastName", "userId", "studentId", "feeType"],
  exactMatchFields: [],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    if (!params.searchTerm) return data;
    
    return data.filter(transaction => 
      transaction.firstName?.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
      transaction.lastName?.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
      transaction.userId?.toString().includes(params.searchTerm) ||
      transaction.studentId?.toString().includes(params.searchTerm) ||
      transaction.feeType?.toLowerCase().includes(params.searchTerm.toLowerCase())
    );
  },
  showResultsOnLoad: true
});

const useTransactionStore = create((set, get) => ({
  transactions: [],
  selectedTransaction: null,
  loading: false,
  error: null,
  
  transactionDetailModal: false,
  addTransactionModal: false,

  fetchTransactions: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get("/payments/admin/allTransactions");
      const transactions = response.data.data?.payments || [];
      
      set({ transactions, loading: false });
      
      const searchStore = useTransactionSearchStore.getState();
      searchStore.setData(transactions);
      
    } catch (error) {
      console.error("Failed to fetch transactions: ", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch transactions", 
        loading: false 
      });
    }
  },

  // Auto-refresh function for webhook updates
  refreshTransactions: async () => {
    try {
      const response = await axiosInstance.get("/payments/admin/allTransactions");
      const transactions = response.data.data?.payments || [];
      
      set({ transactions });
      
      const searchStore = useTransactionSearchStore.getState();
      searchStore.setData(transactions);
      
    } catch (error) {
      console.error("Failed to refresh transactions: ", error);
    }
  },

  setSelectedTransaction: (transaction) => set({ selectedTransaction: transaction }),
  
  clearSelectedTransaction: () => set({ selectedTransaction: null }),

  handleRowClick: (transaction) => {
    set({ 
      selectedTransaction: transaction, 
      transactionDetailModal: true 
    });
  },
  
  handleStudentClick: (transaction) => {
    set({ 
      selectedTransaction: transaction, 
      transactionDetailModal: true 
    });
  },
  
  openAddTransactionModal: () => set({ addTransactionModal: true }),
  closeAddTransactionModal: () => set({ addTransactionModal: false }),
  
  openDetailModal: () => set({ transactionDetailModal: true }),
  
  closeTransactionDetailModal: () => set({ 
    transactionDetailModal: false, 
    selectedTransaction: null 
  }),

  clearError: () => set({ error: null }),

  resetStore: () => set({ 
    selectedTransaction: null,
    transactionDetailModal: false,
    addTransactionModal: false 
  }),

  // Handle modal submit (placeholder for now)
  handleModalSubmit: async (data) => {
    try {
      const response = await axiosInstance.post('/payments/manual', {
        studentId: data.studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        purpose: data.purpose,
        paymentMethod: data.paymentMethod,
        amountPaid: data.amountPaid,
        referenceNumber: data.referenceNumber,
        remarks: data.remarks,
        academicPeriodId: data.academicPeriodId,
        courseId: data.courseId,
      });
      
      if (response.data.success) {
        // Refresh transactions to show the new manual transaction
        const store = get();
        store.refreshTransactions();
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create manual transaction:', error);
      throw error;
    }
  },

  // Open checkout URL
  openCheckoutUrl: (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  },

  // Sync all PayMongo payments status
  syncAllPayMongoPayments: async () => {
    try {
      set({ loading: true });
      
      const { transactions } = get();
      const paymongoTransactions = transactions.filter(transaction => 
        transaction.paymongoId && (transaction.status === 'paid' || transaction.status === 'pending')
      );
      
      console.log(`Syncing ${paymongoTransactions.length} PayMongo payments...`);
      
      // Refresh status for each PayMongo payment
      const syncPromises = paymongoTransactions.map(transaction =>
        axiosInstance.get(`/payments/${transaction.id}/status`).catch(error => {
          console.error(`Failed to sync payment ${transaction.id}:`, error);
          return null;
        })
      );
      
      await Promise.all(syncPromises);
      
      // Refresh the entire transactions list
      const store = get();
      await store.refreshTransactions();
      
      set({ loading: false });
      
      return { success: true, syncedCount: paymongoTransactions.length };
    } catch (error) {
      console.error('Error syncing PayMongo payments:', error);
      set({ loading: false, error: 'Failed to sync PayMongo payments' });
      return { success: false, error: error.message };
    }
  },

  // Refresh payment status
  refreshPaymentStatus: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}/status`);
      if (response.data.success) {
        const { selectedTransaction } = get();
        if (selectedTransaction && selectedTransaction.id === paymentId) {
          set({
            selectedTransaction: {
              ...selectedTransaction,
              status: response.data.data.status,
              ...response.data.data
            }
          });
        }
        
        // Refresh the entire transactions list to update the table
        const store = get();
        await store.refreshTransactions();
        
        return response.data.data;
      }
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    }
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status) => {
    try {
      const response = await axiosInstance.put(`/payments/${transactionId}/status`, {
        status
      });

      if (response.data.success) {
        set((state) => ({
          selectedTransaction: state.selectedTransaction?.id === transactionId 
            ? { ...state.selectedTransaction, status }
            : state.selectedTransaction
        }));
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction status'
      };
    }
  },


}));

export { useTransactionSearchStore, useTransactionStore };