import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const login = async (role, customData = {}) => {
    const user = await authService.login(role, customData);
    setCurrentUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const switchRole = async (role) => {
    return await login(role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'super-admin',
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
