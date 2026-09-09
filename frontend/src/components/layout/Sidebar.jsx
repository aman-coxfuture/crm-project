import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  LogOut,
  X,
  ClipboardList,
  UserCheck,
  CheckSquare,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
  const { role, currentUser, selectedSchool, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({ fees: false, 'staff-fees': false });

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
          {
            label: 'Fee Management',
            path: '/school-admin/fees',
            icon: DollarSign,
            id: 'fees',
            children: [
              { label: 'Fee Dashboard', path: '/school-admin/fees?tab=dashboard', tabKey: 'dashboard' },
              { label: 'Student Fees', path: '/school-admin/fees?tab=students', tabKey: 'students' },
              { label: 'Fee Collection', path: '/school-admin/fees?tab=collection', tabKey: 'collection' },
              { label: 'Pending Fees', path: '/school-admin/fees?tab=pending', tabKey: 'pending' },
              { label: 'Overdue Fees', path: '/school-admin/fees?tab=overdue', tabKey: 'overdue' },
              { label: 'Late Fine', path: '/school-admin/fees?tab=late-fine', tabKey: 'late-fine' },
              { label: 'Payment History', path: '/school-admin/fees?tab=history', tabKey: 'history' },
              { label: 'Fee Reports', path: '/school-admin/fees?tab=reports', tabKey: 'reports' },
            ],
          },
          {
            label: 'Staff Fee Management',
            path: '/school-admin/staff-fees',
            icon: Wallet,
            id: 'staff-fees',
            children: [
              { label: 'Staff Fee Dashboard', path: '/school-admin/staff-fees?tab=dashboard', tabKey: 'dashboard' },
              { label: 'All Employees', path: '/school-admin/staff-fees?tab=all', tabKey: 'all' },
              { label: 'Pending Payments', path: '/school-admin/staff-fees?tab=pending', tabKey: 'pending' },
              { label: 'Paid Payments', path: '/school-admin/staff-fees?tab=paid', tabKey: 'paid' },
              { label: 'Payment History', path: '/school-admin/staff-fees?tab=history', tabKey: 'history' },
              { label: 'Salary Payments', path: '/school-admin/staff-fees?tab=salary', tabKey: 'salary' },
              { label: 'Payment Reports', path: '/school-admin/staff-fees?tab=reports', tabKey: 'reports' },
            ],
          },
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
          className="sidebar-mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Main Aside */}
      <aside
        className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '72px' : '260px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
          zIndex: 100,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Brand / Header */}
        <div
          style={{
            padding: isCollapsed ? '16px 8px' : '20px 18px',
            borderBottom: '1px solid var(--sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              🏫
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  className="sidebar-brand-title"
                  style={{
                    fontSize: '1.025rem',
                    fontWeight: 800,
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
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
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
            aria-label="Close menu"
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
                  className="sidebar-section-title"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 750,
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
                  const isParentActive = location.pathname === item.path;
                  const isExpanded = Boolean(expandedMenus[item.id || item.label]);

                  if (item.children && !isCollapsed) {
                    return (
                      <div key={item.path} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div
                          className="sidebar-menu-btn"
                          onClick={() => {
                            setExpandedMenus((prev) => ({
                              ...prev,
                              [item.id || item.label]: !prev[item.id || item.label],
                            }));
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.925rem',
                            fontWeight: isParentActive ? 700 : 600,
                            color: isParentActive ? 'var(--primary)' : 'var(--sidebar-text)',
                            backgroundColor: isParentActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Icon size={18} style={{ flexShrink: 0, color: isParentActive ? 'var(--primary)' : 'inherit' }} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              color: 'inherit',
                            }}
                          />
                        </div>

                        {isExpanded && (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              paddingLeft: '32px',
                              borderLeft: '2px solid rgba(99, 102, 241, 0.2)',
                              marginLeft: '20px',
                              marginTop: '2px',
                              marginBottom: '6px',
                            }}
                          >
                            {item.children.map((sub) => {
                              const currentSearch = new URLSearchParams(location.search);
                              const currentTab = currentSearch.get('tab') || 'dashboard';
                              const isSubActive = isParentActive && currentTab === sub.tabKey;

                              return (
                                <NavLink
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={`sidebar-sub-nav-item ${isSubActive ? 'active-sub-item' : ''}`}
                                  style={{
                                    display: 'block',
                                    padding: '7px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: isSubActive ? 700 : 500,
                                    color: isSubActive ? 'var(--primary)' : 'var(--sidebar-sub-text, var(--sidebar-text))',
                                    backgroundColor: isSubActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {sub.label}
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: isCollapsed ? '12px 0' : '10px 14px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.925rem',
                        fontWeight: isActive ? 700 : 550,
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
            className="sidebar-collapse-btn"
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
              fontSize: '0.825rem',
              fontWeight: 600,
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
              fontSize: '0.85rem',
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
