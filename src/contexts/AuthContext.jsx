import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('wellness_token');
      const storedUser = localStorage.getItem('wellness_user');

      if (storedToken && storedUser) {
        try {
          // Set token for API calls
          api.setToken(storedToken);
          
          // Verify token is still valid
          const response = await api.getCurrentUser();
          
          setToken(storedToken);
          setUser(response.user);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('wellness_token');
          localStorage.removeItem('wellness_user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('wellness_token', newToken);
    localStorage.setItem('wellness_user', JSON.stringify(newUser));
    api.setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wellness_token');
    localStorage.removeItem('wellness_user');
    api.setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};