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
  BookOpen,
  CalendarCheck,
  DollarSign,
  Award,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { selectedSchool } = useAuth();

  const students = schoolDataService.getStudents();
  const teachers = schoolDataService.getTeachers();
  const staff = schoolDataService.getStaff();
  const drivers = schoolDataService.getDrivers();
  const classes = schoolDataService.getClasses();
  const exams = schoolDataService.getExams();
  const notices = schoolDataService.getNotices();
  const leaves = schoolDataService.getLeaves();
  const feeTransactions = schoolDataService.getFeeTransactions();

  // Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = staff.length;
  const totalDrivers = drivers.length;
  const totalClasses = classes.length;

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
    { label: 'Boys', value: students.filter((s) => s.gender === 'Male').length, color: '#4f46e5' },
    { label: 'Girls', value: students.filter((s) => s.gender === 'Female').length, color: '#ec4899' },
  ];

  const feeStatusData = [
    { label: 'Fully Paid', value: students.filter((s) => s.feeStatus === 'Paid').length, color: '#10b981' },
    { label: 'Pending Dues', value: students.filter((s) => s.feeStatus === 'Pending').length, color: '#f59e0b' },
    { label: 'Overdue', value: students.filter((s) => s.feeStatus === 'Overdue').length, color: '#ef4444' },
  ];

  const classWiseStudents = [
    { label: 'Class 8', value: 58, color: '#6366f1' },
    { label: 'Class 9', value: 68, color: '#6366f1' },
    { label: 'Class 10', value: 102, color: '#4f46e5' },
    { label: 'Class 11', value: 98, color: '#4338ca' },
    { label: 'Class 12', value: 75, color: '#3730a3' },
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
            <span>{selectedSchool?.name || 'School Executive Dashboard'}</span>
          </h1>
          <p className="page-subtitle">
            Academic Year {selectedSchool?.academicSession || '2025-2026'} • Affiliated with {selectedSchool?.affiliation || 'CBSE Board'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/school-admin/attendance')}>
            <CalendarCheck size={16} />
            <span>Mark Attendance</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/school-admin/students')}>
            <Plus size={16} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Primary Top Metric Cards */}
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
          subtitle="Across 6 departments"
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
          subtitle="5 Medical leaves"
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class 10-A Present (Green) vs Absent (Red)</p>
            </div>
            <span className="badge badge-success">This Week</span>
          </div>
          <ComparisonBarChart data={attendanceWeekly} height={200} />
        </div>

        {/* Student Demographics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gender Distribution</h3>
          </div>
          <DonutChart data={genderData} size={145} />
        </div>
      </div>

      {/* Secondary Charts & Operations Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Class-wise enrollment */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Class-Wise Student Count</h3>
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
      <div className="grid-2">
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
      </div>
    </div>
  );
}
