import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/common/Modal';
import {
  School,
  GraduationCap,
  Building,
  Shield,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Hash,
  Moon,
  Sun,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Clock,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error, info } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Role Selection: 'school-admin' (Principal), 'teacher', 'student', 'super-admin'
  const [selectedRole, setSelectedRole] = useState('school-admin');

  // Form Fields
  const [email, setEmail] = useState('principal@school.com');
  const [password, setPassword] = useState('password123');
  const [rollNumber, setRollNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // When role changes, set standard mock credentials
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setFormError('');
    if (roleKey === 'super-admin') {
      setEmail('admin@crm.com');
      setPassword('admin123');
      setRollNumber('');
    } else if (roleKey === 'school-admin') {
      setEmail('principal@school.com');
      setPassword('principal123');
      setRollNumber('');
    } else if (roleKey === 'teacher') {
      setEmail('rahul@example.com');
      setPassword('teacher123');
      setRollNumber('');
    } else if (roleKey === 'student') {
      setEmail('student@example.com');
      setRollNumber('STU001');
      setPassword('');
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    setIsLoading(true);

    try {
      if (!email && selectedRole !== 'student') {
        setFormError('Please enter your registered email address');
        setIsLoading(false);
        return;
      }

      if (selectedRole === 'student' && !email && !rollNumber) {
        setFormError('Please provide your Student Email or Roll Number (e.g. STU001)');
        setIsLoading(false);
        return;
      }

      // Simulate quick auth
      await new Promise((res) => setTimeout(res, 350));

      const user = await login({
        role: selectedRole,
        email: email.trim(),
        password,
        rollNumber: rollNumber.trim(),
      });

      success(`Welcome back, ${user.name}!`);

      if (selectedRole === 'super-admin') {
        navigate('/super-admin/dashboard');
      } else if (selectedRole === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (selectedRole === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/school-admin/dashboard');
      }
    } catch (err) {
      setFormError('Authentication failed. Please check your credentials.');
      error('Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Fast Fill for Evaluator / Demo testing
  const handleQuickFill = (roleKey) => {
    handleRoleSelect(roleKey);
    info(`Loaded demo credentials for ${roleKey.replace('-', ' ').toUpperCase()}`);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setIsForgotModalOpen(false);
    success(`Password reset link sent to ${forgotEmail || email}`);
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
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* LEFT SIDE: Visual Showcase (Enterprise Education Branding) */}
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
        {/* Subtle Background Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(6, 182, 212, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Brand */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.4rem',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
              }}
            >
              🏫
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                EduPulse CRM
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>
                NEXT-GEN SCHOOL MANAGEMENT PLATFORM
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
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} />
            <span>Nursery to Class 10 Curriculum • 7-Period Engine</span>
          </div>
        </div>

        {/* Center Key Value Proposition */}
        <div style={{ position: 'relative', zIndex: 2, my: 'auto', padding: '30px 0' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '16px' }}>
            Empowering Modern Schools with Real-Time Academic Intelligence.
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '480px', marginBottom: '32px' }}>
            Seamlessly coordinate teacher timetables, student academic records, exam evaluations, and multi-tenant school administration from one unified portal.
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
              <div style={{ color: '#818cf8', marginBottom: '8px' }}>
                <Clock size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>7-Period Structure</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                4 periods before lunch, lunch break, 3 periods after lunch.
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
                <Layers size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Nursery – Class 10</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Canonical K-10 grade progression and sections.
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
                <GraduationCap size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Teacher Allocations</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Principal-to-teacher class and subject assignments.
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
                <Shield size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Data Isolation</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Multi-tenant scoping: School Admins view only their school.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Trusted by 50+ Primary & Secondary Institutions
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>● 99.9% Uptime</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: SaaS Login Form Panel */}
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
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Sign In to Your Portal
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Select your role and authenticate with your school credentials
            </p>
          </div>

          {/* Role Tab Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Select Portal Persona
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '5px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            >
              {[
                { key: 'school-admin', label: 'Principal', icon: Building },
                { key: 'teacher', label: 'Teacher', icon: GraduationCap },
                { key: 'student', label: 'Student', icon: BookOpen },
                { key: 'super-admin', label: 'Super Admin', icon: Shield },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleSelect(r.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.75rem',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon size={16} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {formError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '18px',
              }}
            >
              {formError}
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {selectedRole === 'student' ? 'Student Email Address' : 'Official Email Address'}
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
                  id="login-email"
                  type="text"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'super-admin'
                      ? 'admin@crm.com'
                      : selectedRole === 'teacher'
                      ? 'rahul@example.com'
                      : selectedRole === 'student'
                      ? 'student@example.com'
                      : 'principal@school.com'
                  }
                  style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
                  required={selectedRole !== 'student'}
                />
              </div>
            </div>

            {/* Student Roll Number vs Password Field */}
            {selectedRole === 'student' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="login-roll">
                  Student Roll Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash
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
                    id="login-roll"
                    type="text"
                    className="form-input"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. STU001 or STU005"
                    style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  Demo Roll Numbers: <strong>STU001</strong> (Class 10), <strong>STU005</strong> (Class 5)
                </span>
              </div>
            ) : (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">
                    Password
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
                      color: 'var(--primary)',
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
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember me option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Enter {selectedRole === 'school-admin' ? 'Principal' : selectedRole.replace('-', ' ')} Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Fill Selector */}
          <div
            style={{
              marginTop: '32px',
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
              Instant 1-Click Demo Fill
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('school-admin')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <span>🏫 Principal / Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <span>👩‍🏫 Teacher (Rahul)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <span>🎒 Student (Alex)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('super-admin')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <span>🛡️ Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        subtitle="We'll send password recovery instructions to your registered email"
      >
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Registered Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@school.com"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
