import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  CalendarCheck,
  Clock,
  Award,
  BookOpen,
  DollarSign,
  Bus,
  Library,
  Calendar,
  Bell,
  FileText,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ClipboardList,
  UserCheck,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
  const { role, currentUser, selectedSchool, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build role-specific navigation menus
  const getNavSections = () => {
    if (role === 'super-admin') {
      return [
        {
          title: 'SUPER ADMIN',
          items: [
            { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
            { label: 'All Schools', path: '/super-admin/schools', icon: Building2 },
            { label: 'Platform Analytics', path: '/super-admin/analytics', icon: BarChart3 },
            { label: 'System Settings', path: '/super-admin/settings', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'teacher') {
      return [
        {
          title: 'TEACHER PORTAL',
          items: [
            { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
            { label: 'My Students', path: '/teacher/students', icon: Users },
            { label: 'Attendance', path: '/teacher/attendance', icon: CalendarCheck },
            { label: 'Assignments', path: '/teacher/assignments', icon: BookOpen },
            { label: 'Exam Marks', path: '/teacher/marks', icon: Award },
            { label: 'My Timetable', path: '/teacher/timetable', icon: Clock },
            { label: 'Apply Leave', path: '/teacher/leave', icon: ClipboardList },
            { label: 'Notices', path: '/teacher/notices', icon: Bell },
            { label: 'My Profile', path: '/teacher/profile', icon: UserCheck },
          ],
        },
      ];
    }

    if (role === 'student') {
      return [
        {
          title: 'STUDENT PORTAL',
          items: [
            { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
            { label: 'My Profile', path: '/student/profile', icon: UserCheck },
            { label: 'Timetable', path: '/student/timetable', icon: Clock },
            { label: 'Assignments', path: '/student/assignments', icon: BookOpen },
            { label: 'Exam Results', path: '/student/results', icon: Award },
            { label: 'Fee Status', path: '/student/fees', icon: DollarSign },
            { label: 'Leave Request', path: '/student/leave', icon: ClipboardList },
            { label: 'Notices', path: '/student/notices', icon: Bell },
          ],
        },
      ];
    }

    // Default: School Admin / Principal (Full 18 Module Navigation)
    return [
      {
        title: 'MAIN',
        items: [
          { label: 'Dashboard', path: '/school-admin/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'ACADEMICS & USERS',
        items: [
          { label: 'Students', path: '/school-admin/students', icon: Users },
          { label: 'Teachers', path: '/school-admin/teachers', icon: GraduationCap },
          { label: 'Staff Management', path: '/school-admin/staff', icon: Briefcase },
          { label: 'Classes & Sections', path: '/school-admin/classes', icon: Layers },
          { label: 'Attendance', path: '/school-admin/attendance', icon: CalendarCheck },
          { label: 'Timetable', path: '/school-admin/timetable', icon: Clock },
          { label: 'Examinations', path: '/school-admin/exams', icon: Award },
          { label: 'Assignments', path: '/school-admin/assignments', icon: BookOpen },
        ],
      },
      {
        title: 'OPERATIONS',
        items: [
          { label: 'Fee Management', path: '/school-admin/fees', icon: DollarSign },
          { label: 'Transport & Drivers', path: '/school-admin/transport', icon: Bus },
          { label: 'Library', path: '/school-admin/library', icon: Library },
          { label: 'Events & Calendar', path: '/school-admin/events', icon: Calendar },
          { label: 'Notices Board', path: '/school-admin/notices', icon: Bell },
          { label: 'Leave Management', path: '/school-admin/leave', icon: ClipboardList },
          { label: 'Reports & Analytics', path: '/school-admin/reports', icon: BarChart3 },
          { label: 'School Settings', path: '/school-admin/settings', icon: Settings },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        style={{
          width: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 999,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className={isMobileOpen ? 'sidebar-mobile-open' : ''}
      >
        {/* Sidebar Header Brand */}
        <div
          style={{
            height: 'var(--header-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--sidebar-border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
              }}
            >
              {selectedSchool?.logo || '🏫'}
            </div>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {role === 'super-admin'
                    ? 'Super Admin CRM'
                    : selectedSchool?.name?.split(' ')[0] + ' School' || 'School CRM'}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {role.replace('-', ' ')}
                </div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            className="mobile-only-btn"
            onClick={() => setIsMobileOpen(false)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!isCollapsed && section.title && (
                <div
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.08em',
                    padding: '0 12px 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: isCollapsed ? '12px 0' : '10px 14px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)',
                      })}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} style={{ flexShrink: 0 }} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Collapse & User */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Collapse Toggle Button for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: '1px solid var(--sidebar-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--sidebar-text)',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            {!isCollapsed && <span>Collapse Menu</span>}
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Quick Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            title="Log out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
