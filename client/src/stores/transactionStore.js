import { create } from 'zustand';
import createSearchStore from './searchStore';
import axiosInstance from '../utils/axios';

const useTransactionSearchStore = createSearchStore({
  initialData: [],
  defaultSearchParams: {
    searchTerm: "",
    status: ""
  },
  searchableFields: ["firstName", "lastName", "userId", "feeType"],
  exactMatchFields: ["status"],
  initialItemsPerPage: 10,
  filterFunction: (data, params) => {
    if (!params.searchTerm && !params.status) return data;
    
    let filteredData = data;
    
    // Filter by search term
    if (params.searchTerm) {
      filteredData = filteredData.filter(transaction => 
        transaction.firstName?.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
        transaction.lastName?.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
        transaction.userId?.toString().includes(params.searchTerm) ||
        transaction.feeType?.toLowerCase().includes(params.searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (params.status) {
      filteredData = filteredData.filter(transaction => transaction.status === params.status);
    }
    
    return filteredData;
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
    console.log('Modal submit:', data);
  },

  // Open checkout URL
  openCheckoutUrl: (url) => {
    if (url) {
      window.open(url, '_blank');
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
              status: response.data.data.status
            }
          });
        }
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