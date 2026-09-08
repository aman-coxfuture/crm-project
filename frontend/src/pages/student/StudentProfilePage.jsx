import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { User, BookOpen, Calendar, MapPin, Phone, Mail, Heart, Bus, Award } from 'lucide-react';

export default function StudentProfilePage() {
  const { currentUser } = useAuth();
  const students = schoolDataService.getStudents();
  const student = students.find((s) => s.id === currentUser?.id || s.rollNumber === currentUser?.rollNumber) || students[0];

  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={26} color="var(--primary)" />
            Student Academic Profile
          </h1>
          <p className="page-subtitle">
            Your official student record, class enrollment, guardian details and transport info
          </p>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={student.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
              alt={student.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
            />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{student.name}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">Class {student.class}-{student.section}</span>
                <span className="badge badge-purple">Roll No: {student.rollNumber}</span>
                <span className="badge badge-danger">Blood Group: {student.bloodGroup}</span>
                <StatusBadge status={student.status} size="sm" />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-text)' }}>{student.attendance}%</div>
          </div>
        </div>
      </div>

      {/* Personal & Academic Details Grid */}
      <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal & Contact Info</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Email:</span> <strong>{student.email}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Date of Birth:</span> <strong>{student.dob}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Gender:</span> <strong>{student.gender}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Residential Address:</span> <strong>{student.address}</strong></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Parent & Guardian Details</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Parent Name:</span> <strong>{student.parentName}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Primary Phone:</span> <strong>{student.parentPhone}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Emergency Contact:</span> <strong>{student.emergencyContact}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Previous School:</span> <strong>{student.previousSchool}</strong></div>
          </div>
        </div>
      </div>

      {/* Transport & School Info */}
      <div className="grid-2" style={{ gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transport & Bus Assignment</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Assigned Route:</span> <strong>{student.assignedRoute || 'Route 1 - North Express'}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Pickup Stop:</span> <strong>{student.routeStop || 'Maple Street Crossing'}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Bus Driver:</span> <strong>Robert Clark (+1 555 901-4433)</strong></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Institutional Affiliation</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--text-tertiary)' }}>School Name:</span> <strong>Greenwood International Public School</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Admission Date:</span> <strong>{student.admissionDate}</strong></div>
            <div><span style={{ color: 'var(--text-tertiary)' }}>Academic House:</span> <strong>Einstein House (Blue)</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
