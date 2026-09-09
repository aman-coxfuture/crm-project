import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const contentScrollRef = useRef(null);

  // Requirement #20: Reset content scroll to top on navigation
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [location.pathname, location.search]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="main-content">
        <Header onMobileMenuClick={() => setIsMobileOpen(true)} />
        <main className="page-scroll-area" ref={contentScrollRef}>
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
