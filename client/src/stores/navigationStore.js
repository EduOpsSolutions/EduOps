import { create } from "zustand";

const getNavigationConfig = (role) => {
  const baseConfig = {
    student: {
      home: { path: `/${role}`, label: "Home" },
      enrollment: {
        label: "Enrollment",
        items: [
          { path: `/${role}/notfound`, label: "Student Admission" },
          { path: `/${role}/schedule`, label: "Schedule" },
          { path: `/${role}/studyLoad`, label: "Study Load" },
        ],
      },
      grades: { path: `/${role}/gradxses`, label: "Grades" },
      payment: {
        label: "Payment",
        items: [
          { path: `/${role}/assessment`, label: "Assessment" },
          { path: `/${role}/ledger`, label: "Ledger" },
        ],
      },
      documents: { path: `/${role}/documents`, label: "Documents" },
    },
    teacher: {
      home: { path: `/${role}`, label: "Home" },
      tasks: {
        label: "Tasks",
        items: [
          { path: `/${role}/schedule`, label: "Schedule" },
          { path: `/${role}/teachingLoad`, label: "Teaching Load" },
        ],
      },
      documents: { path: `/${role}/documents`, label: "Documents" },
    },
    admin: {
      home: { path: `/${role}`, label: "Home" },
      enrollment: {
        label: "Enrollment",
        items: [
          { path: `/${role}/coursemanagement`, label: "Course Assignment" },
          { path: `/${role}/enrollmentperiod`, label: "Enrollment Period" },
          { path: `/${role}/enrollmentrequests`, label: "Enrollment Request" },
          { path: `/${role}/schedule`, label: "Schedule" },
        ],
      },
      grades: { path: `/${role}/grades`, label: "Grades" },
      payment: {
        label: "Payment",
        items: [
          { path: `/${role}/assessment`, label: "Assessment" },
          { path: `/${role}/ledger`, label: "Ledger" },
          { path: `/${role}/managefees`, label: "Manage Fees" },
          { path: `/${role}/transaction`, label: "Manage Transactions" },
        ],
      },
      documents: {
        label: "Documents",
        items: [
          { path: `/${role}/manage-documents`, label: "Manage Documents" },
          { path: `/${role}/document-requests`, label: "Document Requests" },
          { path: `/${role}/chatbot`, label: "Reports" },
          {
            path: `/${role}/document-validation`,
            label: "Document Validation",
          },
        ],
      },
      accounts: {
        label: "Accounts",
        items: [
          { path: `/${role}/account-management`, label: "Manage Accounts" },
          { path: `/${role}/create-user`, label: "Create User" },
        ],
      },
      logs: { path: `/${role}/logs`, label: "Logs" },
    },
  };

  return baseConfig[role] || {};
};

const useNavigationStore = create((set, get) => ({
  isCompactMenuOpen: false,
  activeDropdown: null,

  toggleCompactMenu: () =>
    set((state) => ({
      isCompactMenuOpen: !state.isCompactMenuOpen,
    })),

  closeCompactMenu: () => set({ isCompactMenuOpen: false }),

  setActiveDropdown: (dropdown) => set({ activeDropdown: dropdown }),

  closeAllDropdowns: () => set({ activeDropdown: null }),

  getNavigationItems: (role) => getNavigationConfig(role),
}));

export default useNavigationStore;
