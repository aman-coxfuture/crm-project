import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService } from '../../services/schoolDataService';
import { FormInput } from '../../components/common/FormInput';
import TeacherPunchCard from '../../components/teacher/TeacherPunchCard';
import { UserCheck, Clock, Save, Building2, BookOpen, Award, Calendar, Phone, Mail, Hash } from 'lucide-react';

export default function TeacherProfilePage() {
  const { currentUser } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Rahul Sharma',
    email: currentUser?.email || 'rahul@example.com',
    phone: currentUser?.phone || '+1 (555) 789-0123',
    employeeId: currentUser?.id || 'TCH-001',
    qualification: currentUser?.qualification || 'M.Sc. Mathematics, B.Ed',
    experience: currentUser?.experience || '7 Years',
    department: currentUser?.department || 'Mathematics & Computing',
    subjects: currentUser?.assignedSubjects?.join(', ') || 'Mathematics, Computer',
    joiningDate: currentUser?.joiningDate || '2019-08-01',
  });

  const teacherSchedule = schoolDataService.getTimetableForTeacher(formData.name);

  const handleSave = (e) => {
    e.preventDefault();
    success('Teacher profile updated successfully!');
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={26} color="var(--primary)" />
            Faculty Profile & Assigned Schedule
          </h1>
          <p className="page-subtitle">
            Manage your credentials, contact information, subject specializations, and 7-period schedule
          </p>
        </div>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formData.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{formData.department}</span>
              <span className="badge badge-purple">{formData.employeeId}</span>
              <span className="badge badge-success">Active Faculty</span>
            </div>
          </div>
        </div>
      </div>

      {/* PART 9, 10, 11, 13: TEACHER OWN ATTENDANCE & PUNCH IN/OUT WITH HISTORY */}
      <div style={{ marginBottom: '24px' }}>
        <TeacherPunchCard showHistory={true} />
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Academic & Contact Information</h3>
          </div>

          <div className="grid-2">
            <FormInput
              label="Teacher Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormInput
              label="Official Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormInput
              label="Employee ID"
              value={formData.employeeId}
              disabled
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Qualifications"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <FormInput
              label="Teaching Experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <FormInput
              label="Assigned Subjects"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Joining Date"
              value={formData.joiningDate}
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '10px' }}>
            <Save size={18} />
            <span>Save Profile Details</span>
          </button>
        </div>
      </form>

      {/* Assigned 7-Period Timetable Section */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 className="card-title">Assigned 7-Period Teaching Timetable</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Personal weekly matrix configured by the Principal</p>
          </div>
          <span className="badge badge-primary">7 Periods + Lunch</span>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="custom-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ width: '130px', textAlign: 'left' }}>Period / Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {teacherSchedule.map((row, idx) => {
                const isBreak = row.isBreak || row.period === 'Lunch';

                if (isBreak) {
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        fontWeight: 800,
                        color: '#d97706',
                        borderTop: '2px dashed #f59e0b',
                        borderBottom: '2px dashed #f59e0b',
                      }}
                    >
                      <td style={{ textAlign: 'left', fontWeight: 800 }}>🍱 Lunch Break</td>
                      <td colSpan={5} style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        🍱 30-MINUTE SCHOOL LUNCH BREAK ({row.time}) 🍱
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Period {row.period}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>{row.time}</div>
                    </td>
                    <td>
                      <div style={{ padding: '6px 8px', backgroundColor: row.monday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.monday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.monday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '6px 8px', backgroundColor: row.tuesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.tuesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.tuesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '6px 8px', backgroundColor: row.wednesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.wednesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.wednesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '6px 8px', backgroundColor: row.thursday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.thursday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.thursday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '6px 8px', backgroundColor: row.friday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.friday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.friday}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
