import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ 
    name: 'Demo User', 
    email: 'demo@example.com', 
    company: 'Demo Company',
    role: 'admin'
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    setUser({ 
      name: 'Demo User', 
      email, 
      company: 'Demo Company',
      role: 'admin'
    });
  };

  const register = async (userData) => {
    setUser({ 
      name: userData.name, 
      email: userData.email, 
      company: userData.company,
      role: 'admin'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};