import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isSunny, setIsSunny] = useState(() => {
    return localStorage.getItem('theme') === 'sunny';
  });

  useEffect(() => {
    localStorage.setItem('theme', isSunny ? 'sunny' : 'dark');
  }, [isSunny]);

  const toggleTheme = () => setIsSunny(!isSunny);

  return (
    <ThemeContext.Provider value={{ isSunny, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);