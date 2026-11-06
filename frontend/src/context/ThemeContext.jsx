import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.removeItem('smart_krushi_theme');
  }, []);

  const toggleTheme = () => {
    // Dark mode disabled as requested; enforce clean white theme
    const root = document.documentElement;
    root.classList.remove('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
