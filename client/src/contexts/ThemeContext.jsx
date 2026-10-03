import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Read initial theme from localStorage or default to 'light'
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Could not read theme from localStorage', e);
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class to documentElement and handle system theme changes
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let darkActive = false;
      if (theme === 'dark') {
        darkActive = true;
      } else if (theme === 'system') {
        darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        darkActive = false;
      }

      setIsDark(darkActive);
      if (darkActive) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    try {
      localStorage.setItem('app_theme', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
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

export default ThemeContext;
