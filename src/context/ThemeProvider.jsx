import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const THEME_STORAGE_KEY = "cooperanki:theme";

const getInitialTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  } catch (error) {
    console.warn("No se pudo leer el tema guardado.", error);
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn("No se pudo guardar el tema seleccionado.", error);
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((currentTheme) => !currentTheme);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
