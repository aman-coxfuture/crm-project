import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/common/FormInput';
import { UserCheck, GraduationCap, Award, Mail, Phone, Save, Building2 } from 'lucide-react';

export default function TeacherProfilePage() {
  const { currentUser } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Sarah Jenkins',
    email: currentUser?.email || 'teacher@example.com',
    phone: '+1 (555) 789-0123',
    subject: 'Mathematics',
    department: 'Science & Math',
    qualification: 'M.Sc. Mathematics, B.Ed',
    experience: '8 Years',
    joiningDate: '2018-08-01',
  });

  const handleSave = (e) => {
    e.preventDefault();
    success('Teacher profile updated successfully!');
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={26} color="var(--primary)" />
            Faculty Profile & Credentials
          </h1>
          <p className="page-subtitle">
            Manage your personal contact info, academic qualifications and subject specializations
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt="Profile"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formData.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span className="badge badge-primary">{formData.subject} Specialist</span>
              <span className="badge badge-purple">{formData.department}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">Personal & Academic Details</h3>
          </div>

          <div className="grid-2">
            <FormInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormInput
              label="Official Email"
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
              label="Specialized Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Degrees"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <FormInput
              label="Experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          <Save size={18} />
          <span>Save Profile</span>
        </button>
      </form>
    </div>
  );
}
