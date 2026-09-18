import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, mockUsers } from '../services/authService';
import { matchesRole, matchesAnyRole, normalizeRole, ROLES } from '../config/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [selectedSchool, setSelectedSchool] = useState(() => authService.getSelectedSchool());
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!currentUser;
  const role = currentUser ? normalizeRole(currentUser.role) : null;
  const schoolId = currentUser?.schoolId || null;

  // Sync selected school whenever currentUser changes
  useEffect(() => {
    setSelectedSchool(authService.getSelectedSchool());
  }, [currentUser]);

  const login = async (credentials, rememberMe = true) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials, rememberMe);
      setCurrentUser(user);
      setSelectedSchool(authService.getSelectedSchool());
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setSelectedSchool(null);
  }, []);

  const hasRole = useCallback((targetRole) => {
    if (!currentUser) return false;
    return matchesRole(currentUser.role, targetRole);
  }, [currentUser]);

  const hasAnyRole = useCallback((allowedRoles = []) => {
    if (!currentUser) return false;
    return matchesAnyRole(currentUser.role, allowedRoles);
  }, [currentUser]);

  const changeSchool = useCallback((school) => {
    authService.setSelectedSchool(school);
    setSelectedSchool(school);
  }, []);

  // Backward compatibility method for internal switchRole calls in dev/test flows
  const switchRole = useCallback(async (roleName) => {
    const norm = normalizeRole(roleName);
    let creds;
    if (norm === ROLES.SUPER_ADMIN) {
      creds = { email: mockUsers.superAdmin.email, password: mockUsers.superAdmin.password };
    } else if (norm === ROLES.TEACHER) {
      creds = { email: mockUsers.teacher.email, password: mockUsers.teacher.password };
    } else if (norm === ROLES.STUDENT) {
      creds = { email: mockUsers.student.email, rollNumber: mockUsers.student.rollNumber, password: mockUsers.student.password };
    } else {
      creds = { email: mockUsers.principal.email, password: mockUsers.principal.password };
    }
    return await login(creds, true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        schoolId,
        selectedSchool,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        changeSchool,
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
