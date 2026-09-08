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

  const students = schoolDataService.getStudents();
  const student = students.find((s) => s.id === currentUser?.id || s.rollNumber === currentUser?.rollNumber) || students[0];

  const assignments = schoolDataService.getAssignments();
  const notices = schoolDataService.getNotices();
  const marks = schoolDataService.getMarks()[student.id] || schoolDataService.getMarks()['STU001'];

  const studentNotices = notices.filter((n) => n.audience === 'Students' || n.audience === 'All');

  const todayClasses = [
    { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Sarah Jenkins', room: 'Room 204' },
    { period: 2, time: '09:15 - 10:00 AM', subject: 'English Literature', teacher: 'Elena Rostova', room: 'Room 204' },
    { period: 3, time: '10:00 - 10:45 AM', subject: 'Physics', teacher: 'David Reynolds', room: 'Physics Lab' },
    { period: 4, time: '11:15 - 12:00 PM', subject: 'Chemistry', teacher: 'Dr. Anita Patel', room: 'Room 204' },
  ];

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
                Class {student.class}-{student.section} • Roll Number: <strong>{student.rollNumber}</strong> • Greenwood Public School
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
          trend="Good Standing"
          trendPositive={true}
          onClick={() => navigate('/student/profile')}
        />
        <StatCard
          title="Term Exam Score"
          value={`${marks.percentage}%`}
          icon={Award}
          color="indigo"
          subtitle={`Rank #${marks.rank} in Class`}
          onClick={() => navigate('/student/results')}
        />
        <StatCard
          title="Active Homework Tasks"
          value={`${assignments.length} Tasks`}
          icon={BookOpen}
          color="sky"
          subtitle="2 Due this week"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="Fee Payment Status"
          value={student.feeStatus}
          icon={DollarSign}
          color={student.feeStatus === 'Paid' ? 'emerald' : 'amber'}
          subtitle={student.feeStatus === 'Paid' ? 'No outstanding dues' : `$${student.totalFee - student.paidFee} pending`}
          onClick={() => navigate('/student/fees')}
        />
      </div>

      {/* Main Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Today's Classes */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Class Schedule</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class 10-A Daily Periods</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/timetable')}>
              Full Timetable
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayClasses.map((cls, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: '3px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
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
                    P{cls.period}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cls.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Teacher: {cls.teacher}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{cls.time}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>{cls.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport & Bus Route Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My School Bus</h3>
            <span className="badge badge-success">Active Route</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Bus size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.assignedRoute || 'Route 1 - North Express'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Vehicle: BUS-101 (Robert Clark)</div>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>DESIGNATED PICKUP POINT</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{student.routeStop || 'Maple Street Crossing'}</div>
              <div style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>Morning Pickup: 07:15 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Homework & Bulletins */}
      <div className="grid-2">
        {/* Homework Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Homework Tasks</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/assignments')}>
              Submit Work
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.slice(0, 3).map((asn) => (
              <div
                key={asn.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.825rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{asn.title}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                    {asn.subject} • Due: <strong>{asn.dueDate}</strong>
                  </div>
                </div>
                <span className="badge badge-primary">{asn.maxMarks} Marks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">School Announcements</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/notices')}>
              All Notices
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studentNotices.slice(0, 3).map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{n.title}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{n.date}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '4px' }}>
                  {n.content.substring(0, 75)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
