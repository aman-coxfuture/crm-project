import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRoute } from '../../config/roles';

export default function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const targetDashboard = getDashboardRoute(role);
    return <Navigate to={targetDashboard} replace />;
  }

  return children ? children : <Outlet />;
}
