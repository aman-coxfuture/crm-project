import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import { BarChart, ComparisonBarChart, DonutChart, TrendLineChart } from '../../components/common/Charts';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  GraduationCap,
  Briefcase,
  Bus,
  Layers,
  CalendarCheck,
  DollarSign,
  Award,
  Plus,
  Clock,
  Bell,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { selectedSchool, currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || selectedSchool?.id || 'SCH-001';

  // Scoped strictly to current school
  const students = schoolDataService.getStudents(schoolId);
  const teachers = schoolDataService.getTeachers(schoolId);
  const staff = schoolDataService.getStaff(schoolId);
  const drivers = schoolDataService.getDrivers(schoolId);
  const classes = schoolDataService.getClasses(schoolId);
  const exams = schoolDataService.getExams(schoolId);
  const notices = schoolDataService.getNotices(schoolId);
  const leaves = schoolDataService.getLeaves(schoolId);
  const feeTransactions = schoolDataService.getFeeTransactions(schoolId);
  const staffFeeLedgers = schoolDataService.getStaffFeeLedgers(schoolId);

  // Staff Fee Metrics (Current Month: September 2026)
  const staffPaidCount = staffFeeLedgers.filter((s) => s.status === 'Paid').length;
  const staffPendingCount = staffFeeLedgers.filter((s) => s.status === 'Pending').length;
  const staffPartialCount = staffFeeLedgers.filter((s) => s.status === 'Partially Paid').length;
  const staffOutstandingAmount = staffFeeLedgers.reduce((sum, s) => sum + (Number(s.pendingAmount) || 0), 0);

  // Teacher Attendance (Scoped to current school)
  const todayDate = '2026-09-09';
  const teacherAttendanceList = schoolDataService.getTeacherAttendance(schoolId, todayDate);
  const presentTeachers = teacherAttendanceList.filter((t) => t.status === 'present');
  const absentTeachers = teacherAttendanceList.filter((t) => t.status === 'absent');
  const teacherAttendanceRate =
    teachers.length > 0
      ? ((presentTeachers.length / teachers.length) * 100).toFixed(1)
      : '0.0';

  // Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = staff.length;
  const totalDrivers = drivers.length;

  const presentCount = students.filter((s) => s.attendance >= 85).length;
  const absentCount = totalStudents - presentCount;

  const pendingFeeStudents = students.filter((s) => s.feeStatus !== 'Paid').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;

  // Chart Data
  const attendanceWeekly = [
    { day: 'Mon', value1: 34, value2: 2 },
    { day: 'Tue', value1: 35, value2: 1 },
    { day: 'Wed', value1: 33, value2: 3 },
    { day: 'Thu', value1: 36, value2: 0 },
    { day: 'Fri', value1: 32, value2: 4 },
  ];

  const genderData = [
    { label: 'Boys', value: students.filter((s) => s.gender === 'Male').length || 4, color: '#4f46e5' },
    { label: 'Girls', value: students.filter((s) => s.gender === 'Female').length || 4, color: '#ec4899' },
  ];

  const feeStatusData = [
    { label: 'Fully Paid', value: students.filter((s) => s.feeStatus === 'Paid').length || 5, color: '#10b981' },
    { label: 'Pending Dues', value: students.filter((s) => s.feeStatus === 'Pending').length || 2, color: '#f59e0b' },
    { label: 'Overdue', value: students.filter((s) => s.feeStatus === 'Overdue').length || 1, color: '#ef4444' },
  ];

  const classWiseStudents = [
    { label: 'Nursery', value: 38, color: '#6366f1' },
    { label: 'KG', value: 66, color: '#6366f1' },
    { label: 'Class 1-3', value: 146, color: '#4f46e5' },
    { label: 'Class 4-5', value: 100, color: '#4338ca' },
    { label: 'Class 6-8', value: 132, color: '#3730a3' },
    { label: 'Class 9-10', value: 170, color: '#312e81' },
  ];

  const feeMonthlyTrend = [
    { label: 'May', value: 18000 },
    { label: 'Jun', value: 24000 },
    { label: 'Jul', value: 42000 },
    { label: 'Aug', value: 38000 },
    { label: 'Sep', value: 49000 },
  ];

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>{selectedSchool?.logo || '🏫'}</span>
            <span>{selectedSchool?.name || 'Greenwood Public School'}</span>
          </h1>
          <p className="page-subtitle">
            Principal Control Center • Academic Session {selectedSchool?.academicSession || '2025-2026'} • Affiliated with {selectedSchool?.affiliation || 'CBSE Board'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/school-admin/teachers')}>
            <GraduationCap size={16} />
            <span>Assign Teachers</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/school-admin/students')}>
            <Plus size={16} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* PART 15: TEACHER ATTENDANCE ALERT (Visible to School Admin / Principal ONLY) */}
      {absentTeachers.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            color: '#b91c1c',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Teacher Attendance Alert</span>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Action Notice</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '3px' }}>
                🔴 <strong>{absentTeachers.map((t) => t.teacherName).join(', ')}</strong> {absentTeachers.length === 1 ? 'is' : 'are'} absent today.
                <span style={{ marginLeft: '8px', opacity: 0.85, fontWeight: 500 }}>(Date: 09 September 2026)</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ borderColor: '#ef4444', color: '#b91c1c' }}
            onClick={() => navigate('/school-admin/attendance')}
          >
            View Faculty Attendance
          </button>
        </div>
      )}

      {/* Primary Top Metric Cards (Scoped to this school only) */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="indigo"
          trend="+8%"
          trendPositive={true}
          onClick={() => navigate('/school-admin/students')}
        />
        <StatCard
          title="Teaching Faculty"
          value={totalTeachers}
          icon={GraduationCap}
          color="sky"
          subtitle="Nursery to Class 10"
          onClick={() => navigate('/school-admin/teachers')}
        />
        <StatCard
          title="Support Staff"
          value={totalStaff}
          icon={Briefcase}
          color="purple"
          subtitle="Non-teaching personnel"
          onClick={() => navigate('/school-admin/staff')}
        />
        <StatCard
          title="School Drivers & Fleet"
          value={`${totalDrivers} Drivers`}
          icon={Bus}
          color="amber"
          subtitle="3 Active bus routes"
          onClick={() => navigate('/school-admin/transport')}
        />
      </div>

      {/* Secondary Operational Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Present Today"
          value={`${presentCount} Students`}
          icon={CalendarCheck}
          color="emerald"
          trend="92% Rate"
          trendPositive={true}
          onClick={() => navigate('/school-admin/attendance')}
        />
        <StatCard
          title="Absent / On Leave"
          value={`${absentCount} Students`}
          icon={Clock}
          color="rose"
          subtitle="Medical & Casual leaves"
          onClick={() => navigate('/school-admin/attendance')}
        />
        <StatCard
          title="Fee Defaulters"
          value={`${pendingFeeStudents} Students`}
          icon={DollarSign}
          color="amber"
          subtitle="Pending balance notice"
          onClick={() => navigate('/school-admin/fees')}
        />
        <StatCard
          title="Upcoming Exams"
          value={exams.length}
          icon={Award}
          color="indigo"
          subtitle="Mid-Term Series"
          onClick={() => navigate('/school-admin/exams')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Weekly Attendance */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Daily Student Attendance Breakdown</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class 5-A Present (Green) vs Absent (Red)</p>
            </div>
            <span className="badge badge-success">This Week</span>
          </div>
          <ComparisonBarChart data={attendanceWeekly} height={200} />
        </div>

        {/* PART 16: Today's Teacher Attendance Widget */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Teacher Attendance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Date: 09 September 2026 • Faculty Roster
              </p>
            </div>
            <span className="badge badge-primary">{teacherAttendanceRate}% Present</span>
          </div>

          <div className="grid-3" style={{ marginBottom: '14px' }}>
            <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Teachers</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{totalTeachers}</div>
            </div>
            <div style={{ padding: '8px 10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.675rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>🟢 Present</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{presentTeachers.length}</div>
            </div>
            <div style={{ padding: '8px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.675rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700 }}>🔴 Absent</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>{absentTeachers.length}</div>
            </div>
          </div>

          {absentTeachers.length > 0 ? (
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px' }}>
                Absent Today:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {absentTeachers.map((t) => (
                  <div
                    key={t.id || t.teacherId}
                    onClick={() => navigate('/school-admin/attendance')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#dc2626' }}>
                      🔴 {t.teacherName}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                      {t.department || 'Faculty'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', color: '#10b981', fontSize: '0.775rem', fontWeight: 700, textAlign: 'center' }}>
              ✓ 100% Faculty Attendance Recorded Today
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts & Operations Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Class-wise enrollment */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Grade-Wise Student Count</h3>
          </div>
          <BarChart data={classWiseStudents} height={190} />
        </div>

        {/* Monthly Fee Collection Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Fee Collection ($)</h3>
            <span className="badge badge-primary">Term 1</span>
          </div>
          <TrendLineChart data={feeMonthlyTrend} height={170} color="#10b981" />
        </div>

        {/* Fee Collection Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Payment Status</h3>
          </div>
          <DonutChart data={feeStatusData} size={145} />
        </div>
      </div>

      {/* Quick Action & Bulletin Feeds */}
      <div className="grid-3">
        {/* Pending Leave Requests */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title">Pending Leave Requests</h3>
              {pendingLeaves > 0 && <span className="badge badge-danger">{pendingLeaves} Action Required</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/school-admin/leave')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaves.slice(0, 3).map((leave) => (
              <div
                key={leave.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.825rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {leave.applicantName}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>({leave.role})</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {leave.leaveType} • {leave.days} Day(s) • {leave.startDate}
                  </div>
                </div>
                <StatusBadge status={leave.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bulletins & Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">School Notice Bulletin</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/school-admin/notices')}>
              Create Notice
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.825rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{notice.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    Audience: <strong>{notice.audience}</strong> • {notice.date}
                  </div>
                </div>
                <span className={`badge ${notice.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>
                  {notice.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Payments Summary (Section 18) */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Wallet size={16} />
              </div>
              <h3 className="card-title">Staff Payments</h3>
            </div>
            <span className="badge badge-primary">Sep 2026</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Employees
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {staffFeeLedgers.length}
                </div>
              </div>
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase' }}>
                  Outstanding
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                  ₹{staffOutstandingAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
              }}
            >
              <span>Paid: <strong style={{ color: '#10b981' }}>{staffPaidCount}</strong></span>
              <span>Pending: <strong style={{ color: '#ef4444' }}>{staffPendingCount}</strong></span>
              <span>Partial: <strong style={{ color: '#f59e0b' }}>{staffPartialCount}</strong></span>
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: '4px', justifyContent: 'center' }}
              onClick={() => navigate('/school-admin/staff-fees')}
            >
              <Wallet size={14} />
              <span>View Staff Payments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
