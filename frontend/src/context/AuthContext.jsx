import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData) => {
    // Handle cases where the user object is nested inside the response data
    const userToSet = userData.user || userData;
    localStorage.setItem("user", JSON.stringify(userToSet));
    setUser(userToSet);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
