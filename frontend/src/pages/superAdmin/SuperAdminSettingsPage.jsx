import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Database, Lock, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { settingsService } from '../../services';

export default function SuperAdminSettingsPage() {
  const { addToast } = useToast();
  const [platformName, setPlatformName] = useState('EduCRM Enterprise Platform');
  const [contactEmail, setContactEmail] = useState('support@edusys-corp.in');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [enable2FA, setEnable2FA] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('Daily at 03:00 UTC');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsService.getSuperAdminSettings();
        if (data) {
          if (data.platformName) setPlatformName(data.platformName);
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.sessionTimeout) setSessionTimeout(data.sessionTimeout);
          if (data.enable2FA !== undefined) setEnable2FA(data.enable2FA);
          if (data.backupSchedule) setBackupSchedule(data.backupSchedule);
          if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
        }
      } catch (err) {
        addToast('Failed to load settings', 'error');
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await settingsService.updateSuperAdminSettings({
        platformName,
        contactEmail,
        sessionTimeout,
        enable2FA,
        backupSchedule,
        maintenanceMode,
      });
      addToast('System settings saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Platform Settings</h1>
          <p className="page-subtitle">Configure global tenant defaults, security parameters, and data governance</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>General Platform Configuration</h2>
          <div className="grid-2">
            <Input
              label="Platform Branding Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
            <Input
              label="Central Support & Escalation Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Security & Access Governance</h2>
          <div className="grid-2">
            <Select
              label="Admin Idle Session Timeout (Minutes)"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              options={['15', '30', '60', '120']}
            />
            <Select
              label="Automated Database Backup Frequency"
              value={backupSchedule}
              onChange={(e) => setBackupSchedule(e.target.value)}
              options={['Every 6 Hours', 'Daily at 03:00 UTC', 'Twice Daily', 'Weekly']}
            />
          </div>
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                style={{ accentColor: '#111827' }}
              />
              <span>Enforce Multi-Factor Authentication (MFA/2FA) for all Administrator accounts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                style={{ accentColor: '#111827' }}
              />
              <span>System Maintenance Mode (Restricts access to Super Admins only)</span>
            </label>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Tenant Default Quotas</h2>
          <div className="grid-3">
            <Input label="Max School Students Default" defaultValue="3,000" />
            <Input label="Max College Students Default" defaultValue="5,000" />
            <Input label="Max University Students Default" defaultValue="25,000" />
          </div>
        </div>
      </form>
    </div>
  );
}
