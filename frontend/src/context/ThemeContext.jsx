import {
  createContext,
  useState,
  useEffect,
  useMemo,
} from "react";

export const ThemeContext =
  createContext();

export const ThemeProvider = ({
  children,
}) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightTheme = () => {
    setTheme("light");
  };

  const setDarkTheme = () => {
    setTheme("dark");
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};