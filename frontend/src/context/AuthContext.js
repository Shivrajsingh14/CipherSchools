import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set auth token header
      const res = await api.get('/auth/me');
      
      setUser(res.data.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setError('Authentication error. Please log in again.');
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return { success: true, data: res.data };
    } catch (err) {
      setError(
        err.response && err.response.data.error
          ? err.response.data.error
          : 'Registration failed'
      );
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return { success: true };
    } catch (err) {
      setError(
        err.response && err.response.data.error
          ? err.response.data.error
          : 'Invalid credentials'
      );
      return { success: false, error: err.response && err.response.data.error };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // We don't need this anymore as it's handled in api.js
  // But keeping a reference here in case we need to add functionality later

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};