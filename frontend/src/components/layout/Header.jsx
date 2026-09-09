import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  LogOut,
  ChevronDown,
  Building2,
  CheckCheck,
  Shield,
  User,
} from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataService';

export default function Header({ onMobileMenuClick }) {
  const { currentUser, role, selectedSchool, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { info } = useToast();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Timetable Published', desc: '7-Period timetable active for all classes', time: '10m ago', unread: true },
    { id: 2, title: 'Exam Schedule Notice', desc: 'Mid-Term schedule published for Classes 5 to 10', time: '1h ago', unread: true },
    { id: 3, title: 'School Bulletin', desc: 'Curriculum alignment meeting scheduled for Friday', time: '3h ago', unread: false },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    info('All notifications marked as read');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        width: '100%',
        position: 'relative',
        zIndex: 990,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left side: Hamburger & Active School Indicator (Scoped to School) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          onClick={onMobileMenuClick}
          className="btn btn-icon mobile-menu-trigger"
          id="mobile-menu-trigger"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {role === 'super-admin' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Shield size={13} />
              SUPER ADMIN
            </span>
            <span className="header-subtitle-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Platform Multi-School Control
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <div
              className="header-school-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                minWidth: 0,
                maxWidth: '240px',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{selectedSchool?.logo || '🏫'}</span>
              <span className="header-school-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedSchool?.name || 'Greenwood Public School'}
              </span>
            </div>
            <span className="header-school-grade-sub" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              (Nursery – Class 10)
            </span>
          </div>
        )}
      </div>

      {/* Right side: Actions, Theme, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Role Tag */}
        <span
          className="badge"
          style={{
            backgroundColor:
              role === 'super-admin'
                ? 'var(--purple-light)'
                : role === 'teacher'
                ? 'var(--info-light)'
                : role === 'student'
                ? 'var(--success-light)'
                : 'var(--primary-light)',
            color:
              role === 'super-admin'
                ? 'var(--purple-text)'
                : role === 'teacher'
                ? 'var(--info-text)'
                : role === 'student'
                ? 'var(--success-text)'
                : 'var(--primary-text)',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.725rem',
            padding: '4px 10px',
          }}
        >
          {role.replace('-', ' ')}
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="btn btn-icon"
            style={{ position: 'relative' }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                }}
              />
            )}
          </button>

          {isNotificationsOpen && (
            <div
              className="header-dropdown-menu"
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Notifications ({unreadCount})
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color-light)',
                      backgroundColor: notif.unread ? 'var(--primary-light)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{notif.time}</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {notif.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown — Clean, Teacher-Specific / Role-Specific, No "Switch Role Demo" */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-color)',
              }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="header-user-info">
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser?.name || 'User'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {currentUser?.email}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>

          {isProfileOpen && (
            <div
              className="header-dropdown-menu header-profile-dropdown"
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '230px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '8px',
                zIndex: 999,
              }}
            >
              {/* User details: Name and Email */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {currentUser?.email}
                </div>
                {currentUser?.department && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    {currentUser?.department}
                  </div>
                )}
              </div>

              {/* ONLY Logout option (NO Role Switcher) */}
              <div style={{ padding: '4px 0 0' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--danger)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
