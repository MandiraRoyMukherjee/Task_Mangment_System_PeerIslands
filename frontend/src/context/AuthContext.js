import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("tm_user");
    const token = localStorage.getItem("tm_token");
    if (saved && token) {
      setUser(JSON.parse(saved));
      setAuthToken(token);
    }
  }, []);

  const login = (userObj, token) => {
    setUser(userObj);
    localStorage.setItem("tm_user", JSON.stringify(userObj));
    localStorage.setItem("tm_token", token);
    setAuthToken(token);
    navigate("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tm_user");
    localStorage.removeItem("tm_token");
    setAuthToken(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
