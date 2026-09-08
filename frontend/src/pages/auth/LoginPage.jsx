import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import {
  School,
  GraduationCap,
  Building,
  Shield,
  UserCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Hash,
  Moon,
  Sun,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Institution Selection: 'school', 'college', 'university'
  const [selectedInstitution, setSelectedInstitution] = useState('school');

  // Role Selection: 'principal', 'teacher', 'student', 'super-admin'
  const [selectedRole, setSelectedRole] = useState('school-admin');

  // Form Fields
  const [email, setEmail] = useState('principal@greenwood.edu');
  const [password, setPassword] = useState('password123');
  const [rollNumber, setRollNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When role changes, set sensible mock defaults
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'super-admin') {
      setEmail('superadmin@schoolcrm.io');
      setPassword('admin123');
      setRollNumber('');
    } else if (roleKey === 'school-admin') {
      setEmail('principal@greenwood.edu');
      setPassword('principal123');
      setRollNumber('');
    } else if (roleKey === 'teacher') {
      setEmail('teacher@example.com');
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
    setIsLoading(true);

    try {
      if (!email && selectedRole !== 'student') {
        error('Please enter an email address');
        setIsLoading(false);
        return;
      }

      if (selectedRole === 'student' && !email && !rollNumber) {
        error('Please enter either student email or roll number');
        setIsLoading(false);
        return;
      }

      const user = await login({
        role: selectedRole,
        email,
        password,
        rollNumber,
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
      error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Persona Login
  const handleQuickDemo = (roleKey) => {
    handleRoleSelect(roleKey);
    setTimeout(() => {
      let creds = { role: roleKey };
      if (roleKey === 'student') {
        creds = { role: 'student', email: 'student@example.com', rollNumber: 'STU001' };
      } else if (roleKey === 'teacher') {
        creds = { role: 'teacher', email: 'teacher@example.com', password: 'demo' };
      } else if (roleKey === 'super-admin') {
        creds = { role: 'super-admin', email: 'superadmin@schoolcrm.io', password: 'demo' };
      } else {
        creds = { role: 'school-admin', email: 'principal@greenwood.edu', password: 'demo' };
      }
      login(creds).then((u) => {
        success(`Logged in as ${u.name} (${roleKey.replace('-', ' ')})`);
        if (roleKey === 'super-admin') navigate('/super-admin/dashboard');
        else if (roleKey === 'teacher') navigate('/teacher/dashboard');
        else if (roleKey === 'student') navigate('/student/dashboard');
        else navigate('/school-admin/dashboard');
      });
    }, 50);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Top right theme toggle */}
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <button onClick={toggleTheme} className="btn btn-icon" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div style={{ maxWidth: '960px', width: '100%' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            <Sparkles size={14} />
            <span>Enterprise Education Platform</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            School Management CRM
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Unified role-based administration portal for modern educational institutions
          </p>
        </div>

        {/* STEP 1: Institution Selection */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            Step 1: Select Institution Type
          </div>

          <div className="grid-3" style={{ maxWidth: '750px', margin: '0 auto' }}>
            {/* School - Available */}
            <div
              onClick={() => setSelectedInstitution('school')}
              className="card card-hover"
              style={{
                cursor: 'pointer',
                borderColor: selectedInstitution === 'school' ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: selectedInstitution === 'school' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                boxShadow: selectedInstitution === 'school' ? '0 0 0 2px var(--primary)' : undefined,
                textAlign: 'center',
                padding: '18px 14px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <School size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>School</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                K-12 & Secondary CRM
              </div>
              <div style={{ marginTop: '10px' }}>
                <span className="badge badge-success">Available</span>
              </div>
            </div>

            {/* College - Coming Soon */}
            <div
              className="card"
              style={{
                opacity: 0.65,
                cursor: 'not-allowed',
                textAlign: 'center',
                padding: '18px 14px',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <GraduationCap size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>College</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Undergraduate Degree
              </div>
              <div style={{ marginTop: '10px' }}>
                <span className="badge badge-gray">Coming Soon</span>
              </div>
            </div>

            {/* University - Coming Soon */}
            <div
              className="card"
              style={{
                opacity: 0.65,
                cursor: 'not-allowed',
                textAlign: 'center',
                padding: '18px 14px',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <Building size={24} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>University</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Multi-Faculty Campus
              </div>
              <div style={{ marginTop: '10px' }}>
                <span className="badge badge-gray">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Role Selector & Login Card */}
        <div
          className="card"
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}
            >
              Step 2: Choose Portal Role
            </div>

            {/* Role Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '6px',
                borderRadius: 'var(--radius-lg)',
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
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.775rem',
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

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {selectedRole === 'student' ? 'Student Email or ID' : 'Account Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                />
                <input
                  id="email"
                  type="text"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'student' ? 'student@example.com' : 'user@domain.com'}
                  style={{ paddingLeft: '38px' }}
                  required={selectedRole !== 'student'}
                />
              </div>
            </div>

            {/* Student Roll Number vs Password */}
            {selectedRole === 'student' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="rollNumber">
                  Roll Number / Student ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)',
                    }}
                  />
                  <input
                    id="rollNumber"
                    type="text"
                    className="form-input"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. STU001"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                  Demo Roll Numbers: <strong>STU001</strong>, <strong>STU002</strong>, <strong>STU003</strong>
                </span>
              </div>
            ) : (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <span style={{ fontSize: '0.725rem', color: 'var(--primary)', cursor: 'pointer' }}>
                    Demo mode enabled
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)',
                    }}
                  />
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <span>{isLoading ? 'Authenticating...' : `Enter ${selectedRole.replace('-', ' ').toUpperCase()} Portal`}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Toolbar */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
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
              Instant 1-Click Demo Logins
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('school-admin')}
                className="btn btn-secondary btn-sm"
              >
                🏫 Principal
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher')}
                className="btn btn-secondary btn-sm"
              >
                👩‍🏫 Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="btn btn-secondary btn-sm"
              >
                🎒 Student (STU001)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('super-admin')}
                className="btn btn-secondary btn-sm"
              >
                🛡️ Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
