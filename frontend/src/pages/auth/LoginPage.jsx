import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardRoute } from '../../config/roles';
import { authService } from '../../services/authService';
import Modal from '../../components/common/Modal';
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Clock,
  Layers,
  Shield,
  HelpCircle,
  School,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanRoll = rollNumber.trim();

    if (!cleanEmail) {
      setFormError('Please enter your registered email address.');
      return;
    }
    if (!cleanPassword) {
      setFormError('Please enter your password.');
      return;
    }
    if (isStudentMode && !cleanRoll) {
      setFormError('Please enter your Student Roll Number (e.g. STU001).');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate rapid server validation
      await new Promise((res) => setTimeout(res, 250));

      const user = await login(
        {
          email: cleanEmail,
          password: cleanPassword,
          rollNumber: cleanRoll || undefined,
        },
        rememberMe
      );

      success(`Welcome back, ${user.name}!`);
      const targetDashboard = getDashboardRoute(user.role);
      navigate(targetDashboard, { replace: true });
    } catch (err) {
      const errorMsg = err.message || 'Authentication failed. Please check your credentials.';
      setFormError(errorMsg);
      error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Fast Fill for Evaluator / Demo testing (fills credentials into inputs)
  const handleQuickFill = (roleType) => {
    setFormError('');
    if (roleType === 'principal') {
      setEmail('principal@school.com');
      setPassword('principal123');
      setRollNumber('');
      setIsStudentMode(false);
      info('Loaded demo credentials for Principal');
    } else if (roleType === 'teacher') {
      setEmail('rahul@example.com');
      setPassword('teacher123');
      setRollNumber('');
      setIsStudentMode(false);
      info('Loaded demo credentials for Teacher (Rahul)');
    } else if (roleType === 'student') {
      setEmail('student@example.com');
      setRollNumber('STU001');
      setPassword('student123');
      setIsStudentMode(true);
      info('Loaded demo credentials for Student (Alex)');
    }
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
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top right theme toggle */}
      <div
        style={{ position: "absolute", top: "20px", right: "20px", zIndex: 50 }}
      >
        <button
          onClick={toggleTheme}
          className="btn btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* LEFT SIDE: Visual Showcase (Enterprise Education Branding) */}
      <div
        style={{
          flex: 1,
          background:
            "linear-gradient(145deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)",
          color: "#ffffff",
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
        className="login-showcase-panel"
      >
        {/* Background Glow */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(6, 182, 212, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Brand */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "1.4rem",
                boxShadow: "0 8px 24px rgba(79, 70, 229, 0.45)",
              }}
            >
              🏫
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                EduPulse CRM
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                NEXT-GEN SCHOOL MANAGEMENT PLATFORM
              </div>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#818cf8",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} />
            <span>Multi-Tenant School Operations • Unified Access Portal</span>
          </div>
        </div>

        {/* Center Key Value Proposition */}
        <div style={{ position: 'relative', zIndex: 2, padding: '30px 0' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '16px' }}>
            Empowering Modern Schools with Real-Time Academic Intelligence.
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#94a3b8",
              lineHeight: 1.6,
              maxWidth: "480px",
              marginBottom: "32px",
            }}
          >
            Seamlessly coordinate teacher timetables, student academic records,
            exam evaluations, and multi-tenant school administration from one
            unified portal.
          </p>

          {/* Feature Highlights Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ color: "#818cf8", marginBottom: "8px" }}>
                <Clock size={20} />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#ffffff",
                }}
              >
                7-Period Structure
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  marginTop: "2px",
                }}
              >
                4 periods before lunch, lunch break, 3 periods after lunch.
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ color: "#34d399", marginBottom: "8px" }}>
                <Layers size={20} />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#ffffff",
                }}
              >
                Nursery – Class 10
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  marginTop: "2px",
                }}
              >
                Canonical K-10 grade progression and sections.
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ color: "#38bdf8", marginBottom: "8px" }}>
                <GraduationCap size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Role Scoped UI</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Principals, Teachers, and Students access their tailored workspace.
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ color: "#fbbf24", marginBottom: "8px" }}>
                <Shield size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Tenant Isolation</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Multi-tenant scoping: School users view only their school.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "18px",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Trusted by 50+ Primary & Secondary Institutions
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}
            >
              ● 99.9% Uptime
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: School Portal Login Form */}
      <div
        className="login-form-panel"
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "var(--bg-secondary)",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <School size={16} />
              <span>School Portal</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Enter your official credentials to access your school dashboard
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

          {/* Main Auth Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="school-email">
                Official Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={17}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-tertiary)",
                  }}
                />
                <input
                  id="school-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="name@school.com"
                  autoComplete="username email"
                  style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="school-password">
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
                  id="school-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Enter your password"
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

            {/* Student Roll Number Expandable Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setIsStudentMode(!isStudentMode)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 0',
                  color: isStudentMode ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🎓 {isStudentMode ? 'Student mode enabled' : 'Logging in as a Student?'}</span>
                {isStudentMode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isStudentMode && (
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label className="form-label" htmlFor="student-roll">
                    Student Roll Number <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Required for students)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Hash
                      size={17}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50)',
                        color: 'var(--text-tertiary)',
                      }}
                    />
                    <input
                      id="student-roll"
                      type="text"
                      className="form-input"
                      value={rollNumber}
                      onChange={(e) => {
                        setRollNumber(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="e.g. STU001"
                      style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "var(--primary)",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: "0.825rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "46px",
                fontSize: "0.95rem",
                fontWeight: 800,
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to School Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Account Assistance Information (Replacing Public Signup) */}
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '0.825rem',
              color: 'var(--text-tertiary)',
            }}
          >
            Need access? <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Contact your school administrator.</span>
          </div>

          {/* Instant 1-Click Demo Fill Selector for Evaluators */}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('principal')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.78rem' }}
                title="Fill Principal credentials (principal@school.com)"
              >
                <span>🏫 Principal</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.78rem' }}
                title="Fill Teacher credentials (rahul@example.com)"
              >
                <span>👩‍🏫 Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', padding: '8px 6px', fontSize: '0.78rem' }}
                title="Fill Student credentials (student@example.com / STU001)"
              >
                <span>🎒 Student</span>
              </button>
            </div>
          </div>

          {/* Subtle link to Super Admin Portal */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              to="/super-admin/login"
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
              <Shield size={14} />
              <span>Super Admin Portal &rarr;</span>
            </Link>
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
            <label className="form-label" htmlFor="forgot-email">Registered Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@school.com"
              autoComplete="email"
            />
          </div>

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsForgotModalOpen(false)}
            >
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
