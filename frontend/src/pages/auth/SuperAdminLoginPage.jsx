import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import Modal from '../../components/common/Modal';
import {
  Shield,
  Building2,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Moon,
  Sun,
  Eye,
  EyeOff,
  School,
} from 'lucide-react';

export default function SuperAdminLoginPage() {
  const { login } = useAuth();
  const { success, error, info } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setFormError('Please enter your Super Admin email address.');
      return;
    }
    if (!cleanPassword) {
      setFormError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 250));

      const user = await login(
        {
          email: cleanEmail,
          password: cleanPassword,
        },
        rememberMe
      );

      // Verify that this is indeed a Super Admin account
      if (user.role !== 'super_admin' && user.role !== 'super-admin') {
        throw new Error('This account does not have Super Admin platform permissions. Please use School Login.');
      }

      success(`Welcome back, ${user.name}!`);
      navigate('/super-admin/dashboard', { replace: true });
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please verify Super Admin credentials.';
      setFormError(errorMsg);
      error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@crm.com');
    setPassword('admin123');
    setFormError('');
    info('Loaded demo credentials for Super Admin');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    try {
      const response = await authService.forgotPassword(forgotEmail);
      setIsForgotModalOpen(false);
      setForgotEmail('');
      success(response.message);
    } catch {
      error('Unable to process password reset request.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top right theme toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
        <button
          onClick={toggleTheme}
          className="btn btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* LEFT SIDE: Visual Showcase (Super Admin Enterprise Control) */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)',
          color: '#ffffff',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="login-showcase-panel"
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(79, 70, 229, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.4rem',
                boxShadow: '0 8px 24px rgba(147, 51, 234, 0.45)',
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                EduPulse Platform
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em' }}>
                SUPER ADMINISTRATOR WORKSPACE
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(147, 51, 234, 0.18)',
              border: '1px solid rgba(147, 51, 234, 0.35)',
              color: '#d8b4fe',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} />
            <span>Global Multi-Tenant Supervision • Platform Controls</span>
          </div>
        </div>

        {/* Center Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '30px 0' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '16px' }}>
            Manage Your Entire Education CRM From One Secure Workspace.
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '480px', marginBottom: '32px' }}>
            Comprehensive visibility and centralized governance across all affiliated schools, institutions, platform metrics, and administrative operators.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#c084fc', marginBottom: '8px' }}>
                <Building2 size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Multi-School Control</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Provision and monitor school branches and principal assignments.
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#38bdf8', marginBottom: '8px' }}>
                <BarChart3 size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Global Analytics</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Aggregated student enrollments, fee collections, and school performance.
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#34d399', marginBottom: '8px' }}>
                <Users size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>User Governance</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Enforce role-based access control and tenant isolation.
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#fbbf24', marginBottom: '8px' }}>
                <Settings size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>System Settings</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Platform configuration, database health, and security policies.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Multi-Tenant CRM Architecture v2.4
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>● Tier-1 Security</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Super Admin Form */}
      <div
        className="login-form-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9333ea', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Shield size={16} />
              <span>Super Admin Portal</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Platform Master Login
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Authenticate with your root administrator credentials
            </p>
          </div>

          {/* Error Banner */}
          {formError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="sa-email">
                Super Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  id="sa-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="admin@crm.com"
                  autoComplete="username email"
                  style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="sa-password">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotModalOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9333ea',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  id="sa-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Enter master password"
                  autoComplete="current-password"
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px', fontSize: '0.9rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="saRememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#9333ea', cursor: 'pointer' }}
              />
              <label htmlFor="saRememberMe" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '46px',
                fontSize: '0.95rem',
                fontWeight: 800,
                marginTop: '4px',
                background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                borderColor: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Quick Demo Account Fill
            </div>

            <button
              type="button"
              onClick={handleQuickFill}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', padding: '9px 12px', fontSize: '0.825rem' }}
            >
              <span>🛡️ Super Admin Demo (admin@crm.com / admin123)</span>
            </button>
          </div>

          {/* Return to School Login */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                color: 'var(--text-tertiary)',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <School size={14} />
              <span>&larr; Return to School Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Super Admin Password"
        subtitle="Password recovery instructions will be dispatched to root email"
      >
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="sa-forgot-email">Registered Master Email</label>
            <input
              id="sa-forgot-email"
              type="email"
              required
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="admin@crm.com"
              autoComplete="email"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isForgotLoading}>
              {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
