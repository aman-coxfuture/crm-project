import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  School,
  Award,
  Bell,
  MessageSquare,
  BarChart3,
  UserCheck,
  Briefcase,
  Layers,
  FlaskConical,
  Microscope,
  FileCheck,
  Clock,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, isMobile = false }) {
  const { role, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation config per role
  const getNavSections = () => {
    switch (role) {
      case 'super-admin':
        return [
          {
            title: 'Overview',
            items: [
              { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
              { label: 'Analytics', path: '/super-admin/analytics', icon: BarChart3 },
            ],
          },
          {
            title: 'Multi-Tenant Management',
            items: [
              { label: 'All Institutions', path: '/super-admin/institutions', icon: Building2, badge: '8' },
              { label: 'System Users', path: '/super-admin/users', icon: Users },
              { label: 'Admins Directory', path: '/super-admin/admins', icon: ShieldCheck },
            ],
          },
          {
            title: 'Global Operations',
            items: [
              { label: 'Global Students', path: '/super-admin/students', icon: GraduationCap },
              { label: 'Global Faculty & Staff', path: '/super-admin/faculty', icon: UserCheck },
              { label: 'Academic Programs', path: '/super-admin/courses', icon: BookOpen },
              { label: 'Global Fees & Finance', path: '/super-admin/fees', icon: CreditCard },
              { label: 'Admissions Central', path: '/super-admin/admissions', icon: FileCheck },
            ],
          },
          {
            title: 'Communications & Audit',
            items: [
              { label: 'System Notices', path: '/super-admin/notices', icon: Bell },
              { label: 'Global Events', path: '/super-admin/events', icon: Calendar },
              { label: 'Audit & Reports', path: '/super-admin/reports', icon: FileText },
            ],
          },
          {
            title: 'System',
            items: [
              { label: 'Platform Settings', path: '/super-admin/settings', icon: Settings },
              { label: 'My Profile', path: '/super-admin/profile', icon: User },
            ],
          },
        ];

      case 'school':
        return [
          {
            title: 'Main',
            items: [
              { label: 'Dashboard', path: '/school/dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Academic',
            items: [
              { label: 'Students', path: '/school/students', icon: GraduationCap, badge: '2.4k' },
              { label: 'Teachers', path: '/school/teachers', icon: Users },
              { label: 'Classes & Sections', path: '/school/classes', icon: Layers },
              { label: 'Timetable', path: '/school/timetable', icon: Clock },
              { label: 'Attendance', path: '/school/attendance', icon: UserCheck },
              { label: 'Exams & Results', path: '/school/exams', icon: Award },
            ],
          },
          {
            title: 'Administration',
            items: [
              { label: 'Parents Directory', path: '/school/parents', icon: Users },
              { label: 'Fee Management', path: '/school/fees', icon: CreditCard },
              { label: 'School Notices', path: '/school/notices', icon: Bell },
              { label: 'Events & Sports', path: '/school/events', icon: Calendar },
            ],
          },
          {
            title: 'Communication & Reports',
            items: [
              { label: 'Messages', path: '/school/messages', icon: MessageSquare },
              { label: 'Reports & Analytics', path: '/school/reports', icon: FileText },
            ],
          },
          {
            title: 'System',
            items: [
              { label: 'School Settings', path: '/school/settings', icon: Settings },
              { label: 'Profile', path: '/school/profile', icon: User },
            ],
          },
        ];

      case 'college':
        return [
          {
            title: 'Main',
            items: [
              { label: 'Dashboard', path: '/college/dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Academic',
            items: [
              { label: 'Students', path: '/college/students', icon: GraduationCap, badge: '3.6k' },
              { label: 'Faculty Members', path: '/college/faculty', icon: Users },
              { label: 'Departments', path: '/college/departments', icon: Building2 },
              { label: 'Courses & Programs', path: '/college/courses', icon: BookOpen },
              { label: 'Attendance', path: '/college/attendance', icon: UserCheck },
              { label: 'Examinations (SEE/CIE)', path: '/college/exams', icon: Award },
              { label: 'Timetable Schedule', path: '/college/timetable', icon: Clock },
            ],
          },
          {
            title: 'Administration',
            items: [
              { label: 'Admissions 2026', path: '/college/admissions', icon: FileCheck, badge: 'New' },
              { label: 'Fee Management', path: '/college/fees', icon: CreditCard },
              { label: 'Notices & Circulars', path: '/college/notices', icon: Bell },
              { label: 'Events & Conclaves', path: '/college/events', icon: Calendar },
            ],
          },
          {
            title: 'Communication & Reports',
            items: [
              { label: 'Messages', path: '/college/messages', icon: MessageSquare },
              { label: 'College Reports', path: '/college/reports', icon: FileText },
            ],
          },
          {
            title: 'System',
            items: [
              { label: 'College Settings', path: '/college/settings', icon: Settings },
              { label: 'Profile', path: '/college/profile', icon: User },
            ],
          },
        ];

      case 'university':
        return [
          {
            title: 'Main',
            items: [
              { label: 'Dashboard', path: '/university/dashboard', icon: LayoutDashboard },
            ],
          },
          {
            title: 'Academic & Institutes',
            items: [
              { label: 'Colleges & Institutes', path: '/university/colleges', icon: Building2, badge: '32' },
              { label: 'Academic Programs', path: '/university/programs', icon: BookOpen },
              { label: 'University Students', path: '/university/students', icon: GraduationCap },
              { label: 'Faculty & Deans', path: '/university/faculty', icon: Users },
              { label: 'Examinations Cell', path: '/university/exams', icon: Award },
            ],
          },
          {
            title: 'Research & Innovation',
            items: [
              { label: 'Research Projects', path: '/university/research', icon: Microscope, badge: '42' },
              { label: 'Researchers & Ph.D.', path: '/university/researchers', icon: FlaskConical },
            ],
          },
          {
            title: 'Administration',
            items: [
              { label: 'Central Admissions', path: '/university/admissions', icon: FileCheck },
              { label: 'Fee & Grant Accounts', path: '/university/fees', icon: CreditCard },
              { label: 'University Notices', path: '/university/notices', icon: Bell },
              { label: 'Conferences & Events', path: '/university/events', icon: Calendar },
            ],
          },
          {
            title: 'Reports & Governance',
            items: [
              { label: 'Messages & Dispatch', path: '/university/messages', icon: MessageSquare },
              { label: 'NIRF / NAAC Reports', path: '/university/reports', icon: FileText },
            ],
          },
          {
            title: 'System',
            items: [
              { label: 'University Settings', path: '/university/settings', icon: Settings },
              { label: 'Profile', path: '/university/profile', icon: User },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const sections = getNavSections();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '-0.05em',
            }}
          >
            E
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              EDU<span style={{ fontWeight: 400 }}>CRM</span>
            </div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              {role === 'super-admin' ? 'Master Admin' : `${role} Edition`}
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Institution Info Card */}
      <div
        style={{
          padding: '12px 14px',
          margin: '12px 12px 4px 12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          Active Tenant
        </div>
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentUser?.institutionName || 'Global Workspace'}
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '4px 10px 6px 10px',
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && onClose && onClose()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <ItemIcon size={16} style={{ color: isActive ? '#111827' : 'var(--text-tertiary)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: isActive ? '#111827' : 'var(--border-subtle)',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {currentUser?.avatar || 'AD'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {currentUser?.roleLabel || 'Admin'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop static sidebar
  if (!isMobile) {
    return (
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          zIndex: 30,
          display: isOpen ? 'block' : 'none',
        }}
      >
        {sidebarContent}
      </aside>
    );
  }

  // Mobile drawer
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '270px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideRight 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarContent}
      </div>
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
