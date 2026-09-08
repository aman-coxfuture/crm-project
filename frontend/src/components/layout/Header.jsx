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
  Search,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Check,
  CheckCheck,
  Settings,
  Shield,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataService';

export default function Header({ onMobileMenuClick }) {
  const { currentUser, role, selectedSchool, changeSchool, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { info } = useToast();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSchoolSelectOpen, setIsSchoolSelectOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const schoolRef = useRef(null);

  const schools = schoolDataService.getSchools();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Student Admission', desc: 'Ava Wilson admitted to Class 10-A', time: '10m ago', unread: true },
    { id: 2, title: 'Teacher Leave Request', desc: 'Dr. Anita Patel applied for 3 days leave', time: '1h ago', unread: true },
    { id: 3, title: 'Fee Reminder Sent', desc: 'Term 1 fee reminder broadcasted to 12 parents', time: '3h ago', unread: false },
    { id: 4, title: 'Mid-Term Exam Schedule', desc: 'Timetable published for Classes 9 to 12', time: '1d ago', unread: false },
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
      if (schoolRef.current && !schoolRef.current.contains(e.target)) setIsSchoolSelectOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (newRole) => {
    await switchRole(newRole);
    setIsProfileOpen(false);
    if (newRole === 'super-admin') navigate('/super-admin/dashboard');
    else if (newRole === 'teacher') navigate('/teacher/dashboard');
    else if (newRole === 'student') navigate('/student/dashboard');
    else navigate('/school-admin/dashboard');
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
        position: 'sticky',
        top: 0,
        zIndex: 990,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left side: Hamburger & Active School Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMobileMenuClick}
          className="btn btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-trigger"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {role === 'super-admin' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              }}
            >
              <Shield size={13} />
              SUPER ADMIN OVERVIEW
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Multi-School Control Center
            </span>
          </div>
        ) : (
          <div style={{ position: 'relative' }} ref={schoolRef}>
            <button
              onClick={() => setIsSchoolSelectOpen(!isSchoolSelectOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{selectedSchool?.logo || '🏫'}</span>
              <span style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedSchool?.name || 'Greenwood Public School'}
              </span>
              <ChevronDown size={14} color="var(--text-tertiary)" />
            </button>

            {/* School Switcher Dropdown */}
            {isSchoolSelectOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '280px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: '8px',
                  zIndex: 999,
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  SWITCH ACTIVE SCHOOL
                </div>
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => {
                      changeSchool(school);
                      setIsSchoolSelectOpen(false);
                      info(`Switched context to ${school.name}`);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: selectedSchool?.id === school.id ? 'var(--primary-light)' : 'transparent',
                      color: selectedSchool?.id === school.id ? 'var(--primary)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.825rem',
                      fontWeight: selectedSchool?.id === school.id ? 700 : 500,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span>{school.logo}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {school.name}
                      </span>
                    </div>
                    {selectedSchool?.id === school.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
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

        {/* User Profile Dropdown */}
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
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '240px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '8px',
                zIndex: 999,
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{currentUser?.email}</div>
              </div>

              {/* Quick Persona Switchers */}
              <div style={{ padding: '6px 10px', fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                SWITCH ROLE (DEMO)
              </div>

              <button
                onClick={() => handleRoleSwitch('school-admin')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: role === 'school-admin' ? 'var(--primary-light)' : 'transparent',
                  color: role === 'school-admin' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Building2 size={14} />
                <span>Principal / Admin</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('teacher')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: role === 'teacher' ? 'var(--primary-light)' : 'transparent',
                  color: role === 'teacher' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <GraduationCap size={14} />
                <span>Teacher</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('student')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: role === 'student' ? 'var(--primary-light)' : 'transparent',
                  color: role === 'student' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={14} />
                <span>Student</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('super-admin')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: role === 'super-admin' ? 'var(--primary-light)' : 'transparent',
                  color: role === 'super-admin' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Shield size={14} />
                <span>Super Admin</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--danger)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
