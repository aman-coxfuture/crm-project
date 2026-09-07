import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isDesktopSidebarOpen} isMobile={false} />

      {/* Mobile Drawer Sidebar */}
      <Sidebar
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        isMobile={true}
      />

      {/* Main Content Area */}
      <div
        className="main-content"
        style={{
          marginLeft: isDesktopSidebarOpen ? 'var(--sidebar-width)' : '0',
          transition: 'margin-left var(--transition-normal)',
        }}
      >
        <Navbar
          onToggleSidebar={toggleSidebar}
          isMobileSidebarOpen={isMobileDrawerOpen}
        />

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
