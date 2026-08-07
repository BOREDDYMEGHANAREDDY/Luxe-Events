import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // default dark
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply dark class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('luxe_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Restore theme preference
  useEffect(() => {
    const saved = localStorage.getItem('luxe_theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      searchQuery, setSearchQuery,
      searchOpen, setSearchOpen,
      mobileMenuOpen, setMobileMenuOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
