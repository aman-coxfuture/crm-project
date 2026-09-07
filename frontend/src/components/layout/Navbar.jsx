import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, User, LogOut, ChevronDown, Check, Building2, School, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import Badge from '../common/Badge';

export default function Navbar({ onToggleSidebar, isMobileSidebarOpen }) {
  const { currentUser, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const roleSwitcherRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(event.target)) {
        setShowRoleSwitcher(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (newRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
    navigate(`/${newRole}/dashboard`);
  };

  const getRoleIcon = (r) => {
    switch (r) {
      case 'super-admin': return ShieldCheck;
      case 'school': return School;
      case 'college': return Building2;
      case 'university': return GraduationCap;
      default: return Building2;
    }
  };

  const RoleIcon = getRoleIcon(role);

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left side: Hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-ghost btn-icon"
          style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
          aria-label="Toggle navigation sidebar"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'none', md: 'block' }}>
          <Breadcrumb />
        </div>
      </div>

      {/* Right side: Search, Role Switcher, Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Role Switcher Pill */}
        <div style={{ position: 'relative' }} ref={roleSwitcherRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <RoleIcon size={14} />
            <span style={{ textTransform: 'capitalize' }}>
              {role === 'super-admin' ? 'Super Admin' : role}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {showRoleSwitcher && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: '6px',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Switch CRM Experience
              </div>
              {[
                { id: 'super-admin', label: 'Super Admin Portal', desc: 'Complete System Control', icon: ShieldCheck },
                { id: 'school', label: 'School Portal', desc: 'Classes, Students, Teachers', icon: School },
                { id: 'college', label: 'College Portal', desc: 'Depts, Courses, Faculty', icon: Building2 },
                { id: 'university', label: 'University Portal', desc: 'Research, Colleges, Programs', icon: GraduationCap },
              ].map((item) => {
                const ItemIcon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSwitchRole(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ItemIcon size={15} style={{ color: isSelected ? '#111827' : 'var(--text-tertiary)' }} />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: isSelected ? 600 : 500, color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: '#111827' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-ghost btn-icon"
            style={{ position: 'relative', color: 'var(--text-secondary)' }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#111827',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '300px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>3 unread</span>
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {[
                  { text: 'Quarterly examination dates published', time: '10m ago' },
                  { text: '24 admission applications verified', time: '1h ago' },
                  { text: 'Fee reconciliation batch completed', time: '4h ago' },
                ].map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: '12.5px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>{n.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 16px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => { setShowNotifications(false); navigate(`/${role}/notices`); }}
                  style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  View All Notices & Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 8px 3px 3px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {currentUser?.avatar || 'AD'}
            </div>
            <div style={{ display: 'none', md: 'block', textAlign: 'left' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentUser?.name?.split(' ')[0]}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: '6px',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                  {currentUser?.email}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <Badge variant="outline">{currentUser?.institutionName || 'CRM Admin'}</Badge>
                </div>
              </div>

              <button
                onClick={() => { setShowUserMenu(false); navigate(`/${role}/profile`); }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  textAlign: 'left',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <User size={14} /> Profile & Account
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  textAlign: 'left',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#111827',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: '4px',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
