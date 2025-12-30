import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      
      if (!access_token) {
        return {
          success: false,
          error: 'لم يتم استلام token',
        };
      }
      
      setToken(access_token);
      // Store email temporarily, we'll fetch user data later if needed
      const userData = { email };
      setUser(userData);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Try to fetch user details
      try {
        const userResponse = await userAPI.findByEmail(email);
        if (userResponse.data) {
          const { password: _, ...userWithoutPassword } = userResponse.data;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        }
      } catch (err) {
        console.warn('Could not fetch user details:', err);
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'فشل تسجيل الدخول',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

