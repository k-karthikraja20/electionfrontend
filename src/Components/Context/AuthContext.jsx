import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../Services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and verify session with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with /auth/me in background
          const { data } = await api.get("/auth/me");
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn("[Auth] Session invalid or expired:", err.message);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token && data.user) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || "Login failed");
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } catch (err) {
      console.warn("[Auth] Logout API notification failed:", err.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn("[Auth] Failed to refresh user profile:", err.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
