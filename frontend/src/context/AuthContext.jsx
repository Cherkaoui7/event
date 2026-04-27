import { useState, useEffect } from "react";
import apiClient from "../api/axios";
import { AuthContext } from "./AuthContextObject";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get("/user");
          setUser(res.data);
        } catch {
          setToken(null);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post("/login", { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
  };

  const register = async (name, email, password, passwordConfirmation) => {
    const res = await apiClient.post("/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
  };

  const logout = async () => {
    await apiClient.post("/logout");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
