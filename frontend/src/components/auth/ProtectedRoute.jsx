import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRoute, matchesAnyRole, ROLES } from '../../config/roles';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, hasAnyRole } = useAuth();

  // If user is not logged in
  if (!isAuthenticated) {
    const isSuperAdminRoute = matchesAnyRole(ROLES.SUPER_ADMIN, allowedRoles);
    return <Navigate to={isSuperAdminRoute ? '/super-admin/login' : '/login'} replace />;
  }

  // If role is not allowed, redirect to user's authorized dashboard
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    const targetDashboard = getDashboardRoute(role);
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
}
