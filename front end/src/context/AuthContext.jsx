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
      // Backend returns: { message, data: { user, access_token } }
      const token = response.data?.data?.access_token;
      const userData = response.data?.data?.user;

      if (!token) {
        return {
          success: false,
          error: 'لم يتم استلام token',
        };
      }

      setToken(token);

      // Use user data from login response if available
      if (userData) {
        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      } else {
        // Fallback to email only
        const tempUserData = { email };
        setUser(tempUserData);
        localStorage.setItem('user', JSON.stringify(tempUserData));
      }

      localStorage.setItem('authToken', token);

      // Try to fetch complete user details if not already available
      if (!userData) {
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

