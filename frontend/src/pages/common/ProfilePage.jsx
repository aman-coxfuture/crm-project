import React, { useState } from 'react';
import { User, Mail, Shield, Save, Key } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProfilePage() {
  const { currentUser, role } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile account information updated', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword) return;
    addToast('Password updated successfully', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account Profile</h1>
          <p className="page-subtitle">Personal account credentials, contact information, and role privileges</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#111827',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              {currentUser?.avatar || 'AD'}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.name}</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>{currentUser?.email}</p>
              <div style={{ marginTop: '6px' }}>
                <Badge variant="active">{currentUser?.roleLabel || role}</Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Institution Scope"
              value={currentUser?.institutionName || 'Global'}
              disabled
            />
            <Button type="submit" variant="primary" icon={Save}>
              Save Profile
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Update Security Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" variant="secondary" icon={Key}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
