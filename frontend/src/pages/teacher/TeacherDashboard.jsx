import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import TeacherPunchCard from '../../components/teacher/TeacherPunchCard';
import {
  CalendarCheck,
  BookOpen,
  Award,
  Clock,
  Bell,
  CheckCircle2,
  ArrowRight,
  Plus,
  ClipboardList,
  Layers,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const teacherName = currentUser?.name || 'Rahul Sharma';
  const teacherSchedule = schoolDataService.getTimetableForTeacher(teacherName);
  const assignments = schoolDataService.getAssignments('SCH-001');
  const notices = schoolDataService.getNotices('SCH-001');
  const leaves = schoolDataService.getLeaves('SCH-001');
  const exams = schoolDataService.getExams('SCH-001');

  // Teacher-specific data filters
  const myAssignments = assignments.filter((a) =>
    a.teacher?.toLowerCase().includes(teacherName.split(' ')[0].toLowerCase())
  );
  const myLeaves = leaves.filter((l) =>
    l.applicantName?.toLowerCase().includes(teacherName.split(' ')[0].toLowerCase()) || l.role === 'Teacher'
  );

  const assignedClasses = currentUser?.classes || ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'];
  const assignedSubjects = currentUser?.assignedSubjects || [currentUser?.subject || 'Mathematics', 'Computer'];

  // Active non-break teaching periods count
  const teachingPeriodsCount = teacherSchedule.filter((p) => !p.isBreak && !p.monday?.includes('Free')).length;

  return (
    <div>
      {/* Teacher Dashboard Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Welcome, {teacherName}! 👨‍🏫</span>
          </h1>
          <p className="page-subtitle">
            Department of {currentUser?.department || 'Mathematics & Computing'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Action Buttons (Mark Attendance, View Timetable, Create Assignment, View Exams, Apply Leave) */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/attendance')}>
            <CalendarCheck size={15} />
            <span>Mark Attendance</span>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/teacher/timetable')}>
            <Clock size={15} />
            <span>View Timetable</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/assignments')}>
            <Plus size={15} />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS — Focused on Teacher's Responsibilities (NO 'My Students') */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Today's Teaching Schedule"
          value={`${teachingPeriodsCount} Active Periods`}
          icon={Clock}
          color="indigo"
          subtitle="7-Period Daily Roster"
          onClick={() => navigate('/teacher/timetable')}
        />
        <StatCard
          title="Assigned Grades"
          value={`${assignedClasses.length} Classes`}
          icon={Layers}
          color="sky"
          subtitle={assignedClasses.slice(0, 3).join(', ')}
        />
        <StatCard
          title="Active Assignments"
          value={`${myAssignments.length || 2} Homework Sets`}
          icon={BookOpen}
          color="amber"
          subtitle="Pending grading & review"
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          title="Upcoming Exam Duty"
          value="Mid-Term Series"
          icon={Award}
          color="emerald"
          subtitle="Oct 15 • Mathematics Hall A"
          onClick={() => navigate('/teacher/marks')}
        />
      </div>

      {/* Quick Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Actions:
        </div>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/teacher/attendance')}>
          <CalendarCheck size={14} /> Mark Attendance
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/teacher/timetable')}>
          <Clock size={14} /> View 7-Period Timetable
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/teacher/assignments')}>
          <BookOpen size={14} /> Create Assignment
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/teacher/marks')}>
          <Award size={14} /> View Exams & Marks
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/teacher/leave')}>
          <ClipboardList size={14} /> Apply Leave
        </button>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* LEFT 2 COLUMNS: Today's 7-Period Timetable (Teacher Specific) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Assigned Schedule (7-Period Timetable)</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
                4 Periods before lunch • 30-Minute Lunch Break • 3 Periods after lunch
              </p>
            </div>
            <span className="badge badge-primary">Personal Roster</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teacherSchedule.map((slot, idx) => {
              const isBreak = slot.isBreak || slot.period === 'Lunch';
              const isFree = slot.monday?.includes('Free');

              if (isBreak) {
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      border: '1px dashed #f59e0b',
                      color: '#d97706',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>🍱</span>
                    <span>LUNCH BREAK (10:40 AM - 11:10 AM) — 30 Minutes</span>
                    <span>🍱</span>
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
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isFree ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    borderLeft: `4px solid ${isFree ? 'var(--border-color)' : 'var(--primary)'}`,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isFree ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                        color: isFree ? 'var(--text-tertiary)' : 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      P{slot.period}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.925rem', color: isFree ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                        {slot.monday}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {isFree ? 'Planning & Evaluation Time' : `Room: ${slot.room || 'Room 201'}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                      {slot.time}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span
                        className={`badge ${
                          slot.status === 'Completed'
                            ? 'badge-success'
                            : slot.status === 'In Progress'
                            ? 'badge-primary'
                            : isFree
                            ? 'badge-gray'
                            : 'badge-info'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {slot.status || 'Scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Assigned Classes, Subjects, Notices, Leave */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Assigned Classes & Subjects Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assigned Classes & Subjects</h3>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Class Allocations
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {assignedClasses.map((c, i) => (
                  <span key={i} className="badge badge-primary" style={{ padding: '5px 10px', fontSize: '0.775rem' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Teaching Subjects
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {assignedSubjects.map((sub, i) => (
                  <span key={i} className="badge badge-purple" style={{ padding: '5px 10px', fontSize: '0.775rem' }}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Own Attendance (Punch In / Punch Out Card) */}
          <TeacherPunchCard showHistory={false} />

          {/* School Notices */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Faculty Notices</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/notices')}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notices.slice(0, 2).map((n) => (
                <div key={n.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {n.content.substring(0, 75)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Leave Status</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/leave')}>
                Apply Leave
              </button>
            </div>
            {myLeaves.slice(0, 2).map((l) => (
              <div key={l.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.leaveType}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem' }}>
                    {l.startDate} • {l.days} Day(s)
                  </div>
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
