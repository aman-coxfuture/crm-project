import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Building2, GraduationCap, ShieldCheck, ArrowRight, Lock, Mail, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('school'); // 'school' | 'college' | 'university' | 'super-admin'
  const [email, setEmail] = useState('principal@dpis-delhi.edu.in');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    // Pre-fill demo email based on selected role
    switch (roleKey) {
      case 'school':
        setEmail('principal@dpis-delhi.edu.in');
        break;
      case 'college':
        setEmail('dean@heritagevalley.ac.in');
        break;
      case 'university':
        setEmail('vc@apex-university.ac.in');
        break;
      case 'super-admin':
        setEmail('admin@edusys-corp.in');
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(selectedRole, { email });
      addToast(`Logged in successfully as ${selectedRole.replace('-', ' ').toUpperCase()}`, 'success');
      setIsLoading(false);
      navigate(`/${selectedRole}/dashboard`);
    }, 400);
  };

  const roles = [
    {
      id: 'school',
      title: 'School',
      subtitle: 'K-12 Management',
      icon: School,
      tag: 'K-12 Board',
    },
    {
      id: 'college',
      title: 'College',
      subtitle: 'UG/PG Programs',
      icon: Building2,
      tag: 'Autonomous/Affiliated',
    },
    {
      id: 'university',
      title: 'University',
      subtitle: 'Multi-Institute & Research',
      icon: GraduationCap,
      tag: 'Central & State',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '24px 16px',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#111827',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '18px',
            marginBottom: '12px',
          }}
        >
          E
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          EDUCATION CRM
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Manage Education Smarter • Unified Enterprise Platform
        </p>
      </div>

      {/* Main Login Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Step 1: Institution Selector (3 cards) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            Select Institution Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? '#111827' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? '#111827' : '#ffffff',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? '#ffffff' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Super Admin Alternative Switch */}
        <div style={{ marginBottom: '22px' }}>
          <button
            type="button"
            onClick={() => handleRoleSelect('super-admin')}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed',
              borderColor: selectedRole === 'super-admin' ? '#111827' : 'var(--border-medium)',
              backgroundColor: selectedRole === 'super-admin' ? '#111827' : 'var(--bg-secondary)',
              color: selectedRole === 'super-admin' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Super Admin Access</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <Input
              label="Email / Username"
              type="text"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@institution.edu"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <Input
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#111827' }}
              />
              Remember my session
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Selected: <strong style={{ color: '#111827', textTransform: 'capitalize' }}>{selectedRole}</strong>
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={ArrowRight}
            iconPosition="right"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : `Sign in to ${selectedRole === 'super-admin' ? 'Super Admin' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </Button>
        </form>

        {/* Demo Helper box */}
        <div
          style={{
            marginTop: '20px',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Info size={14} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
          <span>Click any role above for instant 1-click test access.</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Reset Password</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Enter your registered administrator email to receive a password reset link.
              </p>
              <Input label="Email address" type="email" placeholder="admin@domain.edu" defaultValue={email} />
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowForgotPassword(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowForgotPassword(false);
                  addToast('Reset instructions sent to your email (Mock)', 'info');
                }}
              >
                Send Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} EduCRM Platform • Enterprise Edition
      </div>
    </div>
  );
}
