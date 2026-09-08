import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  CalendarCheck,
  BookOpen,
  Award,
  Clock,
  Bell,
  CheckCircle2,
  ArrowRight,
  Plus,
  ClipboardList,
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const students = schoolDataService.getStudents();
  const assignments = schoolDataService.getAssignments();
  const notices = schoolDataService.getNotices();
  const leaves = schoolDataService.getLeaves();

  const myStudents = students.filter((s) => s.class === '10');
  const myAssignments = assignments.filter((a) => a.teacher.includes(currentUser?.name?.split(' ')[0] || 'Sarah'));
  const myLeaves = leaves.filter((l) => l.role === 'Teacher');

  const todayClasses = [
    { period: '1', time: '08:30 - 09:15 AM', class: 'Class 10-A', subject: 'Mathematics', room: 'Room 204', topic: 'Quadratic Formula Derivation' },
    { period: '2', time: '09:15 - 10:00 AM', class: 'Class 10-B', subject: 'Mathematics', room: 'Room 205', topic: 'Polynomial Division' },
    { period: '3', time: '10:00 - 10:45 AM', class: 'Class 11-Science', subject: 'Calculus', room: 'Room 301', topic: 'Limits & Derivatives' },
    { period: '5', time: '12:00 - 12:45 PM', class: 'Class 10-A', subject: 'Math Lab', room: 'Lab 2', topic: 'Graphing Parabolic Curves' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Welcome, {currentUser?.name || 'Professor'}! 👩‍🏫</span>
          </h1>
          <p className="page-subtitle">
            Department of {currentUser?.department || 'Science & Math'} • Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/attendance')}>
            <CalendarCheck size={16} />
            <span>Mark Attendance</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/assignments')}>
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Assigned Students"
          value={myStudents.length || 70}
          icon={Users}
          color="indigo"
          subtitle="Classes 10-A & 10-B"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          title="Today's Classes"
          value="4 Periods"
          icon={Clock}
          color="sky"
          subtitle="Next: 10-A (08:30 AM)"
          onClick={() => navigate('/teacher/timetable')}
        />
        <StatCard
          title="Pending Submissions"
          value="8 Submissions"
          icon={BookOpen}
          color="amber"
          subtitle="Needs review & grading"
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          title="Upcoming Exam Duty"
          value="Oct 15"
          icon={Award}
          color="emerald"
          subtitle="Mid-Term Mathematics"
          onClick={() => navigate('/teacher/marks')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Today's Schedule Timeline */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Teaching Schedule</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Live timeline of lectures and laboratory sessions</p>
            </div>
            <span className="badge badge-primary">4 Active Sessions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayClasses.map((cls, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: 'var(--primary)',
                      textAlign: 'center',
                    }}
                  >
                    P{cls.period}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {cls.class} • {cls.subject}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Topic: <strong>{cls.topic}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cls.time}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{cls.room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Notices & Leave Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recent Notices */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Faculty Notices</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/notices')}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.slice(0, 2).map((n) => (
                <div key={n.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.content.substring(0, 60)}...</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Leave History</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/leave')}>
                Apply Leave
              </button>
            </div>
            {myLeaves.slice(0, 2).map((l) => (
              <div key={l.id} style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.leaveType}</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>{l.startDate} • {l.days} Day(s)</div>
                </div>
                <StatusBadge status={l.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
