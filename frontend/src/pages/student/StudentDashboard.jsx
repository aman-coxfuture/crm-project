import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BookOpen,
  CalendarCheck,
  Award,
  DollarSign,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Bus,
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const students = schoolDataService.getStudents('SCH-001');
  const student =
    students.find(
      (s) =>
        s.id === currentUser?.id ||
        (s.rollNumber && s.rollNumber.toUpperCase() === (currentUser?.rollNumber || '').toUpperCase())
    ) || students[0];

  const studentClassKey = student.class ? `${student.class}-${student.section || 'A'}` : 'Class 10-A';
  const scheduleRows = schoolDataService.getTimetableForClass(studentClassKey);

  const assignments = schoolDataService.getAssignments('SCH-001');
  const notices = schoolDataService.getNotices('SCH-001');
  const marks = schoolDataService.getMarks()[student.id] || schoolDataService.getMarks()['STU001'];

  const studentNotices = notices.filter((n) => n.audience === 'Students' || n.audience === 'All');

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: '#ffffff',
          padding: '28px',
          marginBottom: '24px',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={student.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
              alt={student.name}
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 'var(--radius-full)', marginBottom: '6px' }}>
                <Sparkles size={13} />
                <span>Student Portal</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Hello, {student.name}! 👋
              </h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '2px' }}>
                {student.class} - Section {student.section} • Roll Number: <strong>{student.rollNumber}</strong> • Greenwood Public School
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn"
              onClick={() => navigate('/student/assignments')}
              style={{ backgroundColor: '#ffffff', color: '#4338ca', fontWeight: 700 }}
            >
              <BookOpen size={16} />
              <span>My Homework</span>
            </button>
            <button
              className="btn"
              onClick={() => navigate('/student/profile')}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Student Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Attendance Rate"
          value={`${student.attendance}%`}
          icon={CalendarCheck}
          color="emerald"
          trend="Regular"
          trendPositive={true}
        />
        <StatCard
          title="Latest Exam Result"
          value={marks ? `${marks.percentage}%` : '90%'}
          icon={Award}
          color="indigo"
          subtitle={marks ? `${marks.grade} • Rank #${marks.rank}` : 'Grade A+'}
          onClick={() => navigate('/student/results')}
        />
        <StatCard
          title="Active Homework"
          value="3 Sets"
          icon={BookOpen}
          color="sky"
          subtitle="2 Completed • 1 Pending"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="Term Fee Status"
          value={student.feeStatus}
          icon={DollarSign}
          color={student.feeStatus === 'Paid' ? 'emerald' : 'amber'}
          subtitle={`Paid $${student.paidFee || 4500}`}
          onClick={() => navigate('/student/fees')}
        />
      </div>

      {/* Main Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Today's 7-Period Classes */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's 7-Period Schedule</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{studentClassKey} Daily Matrix</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/timetable')}>
              Full Timetable
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scheduleRows.map((slot, idx) => {
              const isBreak = slot.isBreak || slot.period === 'Lunch';

              if (isBreak) {
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      border: '1px dashed #f59e0b',
                      color: '#d97706',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      textAlign: 'center',
                    }}
                  >
                    🍱 LUNCH BREAK ({slot.time}) — 30 Minutes 🍱
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderLeft: '3px solid var(--primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                      }}
                    >
                      P{slot.period}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{slot.monday}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>Room: {slot.room || 'Room 201'}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{slot.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transport & Bus Route Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">School Bus Transport</h3>
            <span className="badge badge-success">Active Route</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.assignedRoute || 'Route 1 - North Express'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Vehicle: BUS-101 • Robert Clark</div>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Designated Stop:</span>
                <strong>{student.routeStop || 'Maple Street Crossing'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Morning Pickup:</span>
                <strong>07:15 AM</strong>
              </div>
            </div>
          </div>

          {/* Notices Feed */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>School Notices</div>
            {studentNotices.slice(0, 2).map((n) => (
              <div key={n.id} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.775rem', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700 }}>{n.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
