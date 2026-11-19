import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. መጀመሪያ ከ localStorage ያንብቡ፣ ካልተቀመጠ ደግሞ በነባሪ true (Sunny) ይሁን
  const [isSunny, setIsSunny] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'sunny' : true; // 👈 እዚህ ነው Default Sunny የሚደረገው
  });

  // 2. Theme ሲቀየር በ localStorage ውስጥ ይቀመጥ (ተጠቃሚው ምርጫውን እንዳይረሳ)
  useEffect(() => {
    localStorage.setItem('theme', isSunny ? 'sunny' : 'night');
  }, [isSunny]);

  const toggleTheme = () => {
    setIsSunny((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isSunny, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);