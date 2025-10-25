import { create } from 'zustand';

const createSearchStore = (config) => {
  const {
    initialData = [],
    defaultSearchParams = {},
    searchableFields = [],
    exactMatchFields = [],
    initialItemsPerPage = 10,
    filterFunction,
    showResultsOnLoad = false
  } = config;

  return create((set, get) => ({
    // State
    data: initialData,
    searchParams: { ...defaultSearchParams },
    filteredData: [],
    currentItems: [],
    selectedItem: null,
    
    // Pagination
    currentPage: 1,
    itemsPerPage: initialItemsPerPage,
    totalItems: 0,
    totalPages: 0,
    
    // UI State
    showResults: showResultsOnLoad,
    showDetails: false,
    isLoading: false,
    error: null,

    // Actions
    updateSearchParams: (params) => {
      set((state) => ({
        searchParams: { ...state.searchParams, ...params }
      }));
    },

    handleInputChange: (e) => {
      const { name, value } = e.target;
      set((state) => ({
        searchParams: { ...state.searchParams, [name]: value }
      }));
      // Live search while typing
      get().performSearch();
    },

    performSearch: () => {
      const { data, searchParams, itemsPerPage, currentPage } = get();
      
      const filteredData = filterFunction 
        ? filterFunction(data, searchParams)
        : data.filter(item => {
            const matchesSearchable = searchableFields.length === 0 || 
              searchableFields.some(field => {
                const value = item[field];
                const searchValue = searchParams[field] || '';
                return value && value.toString().toLowerCase().includes(searchValue.toLowerCase());
              });

            const matchesExact = exactMatchFields.every(field => {
              const searchValue = searchParams[field];
              return !searchValue || item[field] === searchValue;
            });

            return matchesSearchable && matchesExact;
          });

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = filteredData.slice(startIndex, endIndex);

      set({
        filteredData,
        totalItems,
        totalPages,
        currentItems,
        showResults: true,
        showDetails: false
      });
    },

    handleSearch: () => {
      set({ currentPage: 1 });
      get().performSearch();
    },

    handlePageChange: (page) => {
      set({ currentPage: page });
      get().performSearch();
    },

    handleItemsPerPageChange: (itemsPerPage) => {
      set({ itemsPerPage, currentPage: 1 });
      get().performSearch();
    },

    handleSelectItem: (item) => {
      set({
        selectedItem: item,
        showDetails: true,
        showResults: false
      });
    },

    handleBackToResults: () => {
      set({
        selectedItem: null,
        showDetails: false,
        showResults: true
      });
    },

    // Data management
    setData: (newData) => {
      set({ data: newData });
      if (showResultsOnLoad) {
        get().performSearch();
      }
    },

    updateData: (updatedData) => {
      set({ data: updatedData });
      get().performSearch();
    },

    // Reset store
    resetSearch: () => {
      set({
        searchParams: { ...defaultSearchParams },
        selectedItem: null,
        currentPage: 1,
        showResults: showResultsOnLoad,
        showDetails: false
      });
      if (showResultsOnLoad) {
        get().performSearch();
      }
    },

    // Initialize search
    initializeSearch: () => {
      if (showResultsOnLoad) {
        get().performSearch();
      }
    }
  }));
};

export default createSearchStore;