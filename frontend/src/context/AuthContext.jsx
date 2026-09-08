import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, mockUsers } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [selectedSchool, setSelectedSchool] = useState(() => authService.getSelectedSchool());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const login = async (credentials) => {
    const user = await authService.login(credentials);
    setCurrentUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = async (roleName) => {
    let creds = { role: roleName };
    if (roleName === 'student') {
      creds = { role: 'student', email: 'student@example.com', rollNumber: 'STU001' };
    } else if (roleName === 'teacher') {
      creds = { role: 'teacher', email: 'teacher@example.com' };
    } else if (roleName === 'super-admin') {
      creds = { role: 'super-admin', email: 'superadmin@schoolcrm.io' };
    } else {
      creds = { role: 'school-admin', email: 'principal@greenwood.edu' };
    }
    return await login(creds);
  };

  const changeSchool = (school) => {
    authService.setSelectedSchool(school);
    setSelectedSchool(school);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'school-admin',
        selectedSchool,
        isAuthenticated,
        login,
        logout,
        switchRole,
        changeSchool,
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
