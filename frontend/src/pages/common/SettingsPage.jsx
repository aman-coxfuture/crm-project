import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { settingsService } from '../../services';

export default function SettingsPage() {
  const { currentUser, role } = useAuth();
  const { addToast } = useToast();

  const [instName, setInstName] = useState(currentUser?.institutionName || '');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [currency, setCurrency] = useState('INR (₹)');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsService.getInstitutionSettings();
        if (data) {
          if (data.academicYear) setAcademicYear(data.academicYear);
          if (data.currency) setCurrency(data.currency);
          if (data.emailAlerts !== undefined) setEmailAlerts(data.emailAlerts);
          if (data.smsAlerts !== undefined) setSmsAlerts(data.smsAlerts);
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
      await settingsService.updateInstitutionSettings({
        academicYear,
        currency,
        emailAlerts,
        smsAlerts,
      });
      addToast('Institution settings updated successfully', 'success');
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
          <h1 className="page-title">Institution Settings</h1>
          <p className="page-subtitle">Configure academic sessions, notifications, and portal preferences</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>General Institution Information</h2>
          <div className="grid-2">
            <Input
              label="Official Institution Name"
              value={instName}
              onChange={(e) => setInstName(e.target.value)}
            />
            <Select
              label="Active Academic Session"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={['2026-2027 (Active)', '2025-2026 (Archived)', '2027-2028 (Upcoming)']}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Automated Alerts & Communication</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ accentColor: '#111827' }}
              />
              <span>Send automated email notifications for fee invoices and exam notices</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                style={{ accentColor: '#111827' }}
              />
              <span>Send SMS alerts to parents/students for unexcused attendance absences</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
