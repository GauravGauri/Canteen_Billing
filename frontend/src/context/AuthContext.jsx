import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Set base backend URL
  const API_URL = 'http://localhost:5000/api';
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const checkCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Verify token failed', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      if (response.data.success) {
        const { token: userToken, ...userData } = response.data.data;
        localStorage.setItem('admin_token', response.data.data.token);
        setToken(response.data.data.token);
        setUser(response.data.data);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Server error, please try again later',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
