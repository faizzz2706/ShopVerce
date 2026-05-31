import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: localStorage.getItem("darkMode") === "true",
    mobileMenuOpen: false,
    adminSidebarOpen: false,
    searchQuery: "",
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", state.darkMode);
      document.documentElement.classList.toggle("dark", state.darkMode);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    toggleAdminSidebar: (state) => {
      state.adminSidebarOpen = !state.adminSidebarOpen;
    },
    closeAdminSidebar: (state) => {
      state.adminSidebarOpen = false;
    },
  },
});

export const {
  toggleDarkMode,
  setSearchQuery,
  toggleMobileMenu,
  closeMobileMenu,
  toggleAdminSidebar,
  closeAdminSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
