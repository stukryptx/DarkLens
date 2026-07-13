import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    if (token && email) {
      setUser({ email });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userEmail', res.data.email);
    setUser({ email: res.data.email });
    return res;
  };

  const register = async (email, password) => {
    const res = await api.register({ email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userEmail', res.data.email);
    setUser({ email: res.data.email });
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
