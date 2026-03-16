import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      // Check for saved theme
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Default to dark mode if no preference
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove both to ensure clean state
    root.classList.remove('light', 'dark');
    // Add current theme
    root.classList.add(theme);
    // Save to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}