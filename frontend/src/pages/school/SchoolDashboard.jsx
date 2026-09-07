import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Layers,
  UserCheck,
  CreditCard,
  Award,
  Plus,
  ArrowRight,
  Calendar,
  Bell,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard, { BarChart, DonutChart, ProgressBar } from '../../components/dashboard/ChartCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityList from '../../components/dashboard/ActivityList';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import {
  studentService,
  examService,
  noticeService,
  analyticsService
} from '../../services';

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    class: 'Class 10',
    section: 'A',
    email: '',
    phone: '',
    guardian: '',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashData, stuList, examList, noticeList] = await Promise.all([
        analyticsService.getSchoolDashboardData(),
        studentService.getSchoolStudents(),
        examService.getSchoolExams(),
        noticeService.getSchoolNotices(),
      ]);
      setDashboardData(dashData);
      setStudents(stuList || []);
      setExams(examList || []);
      setNotices(noticeList || []);
    } catch (err) {
      addToast('Failed to load school dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const created = await studentService.createStudent({
        ...studentForm,
        rollNo: `ROL-${Date.now().toString().slice(-3)}`,
        guardianPhone: studentForm.phone,
        feeStatus: 'Paid',
        attendance: '100%',
        gender: 'Not Specified',
        dob: '2010-01-01',
      }, 'school');
      setStudents((prev) => [created, ...prev]);
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', class: 'Class 10', section: 'A', email: '', phone: '', guardian: '' });
      addToast(`Student "${created.name}" enrolled into ${created.class}-${created.section}`, 'success');
    } catch (err) {
      addToast('Failed to enroll student', 'error');
    }
  };

  const schoolProfile = dashboardData?.profile || {
    name: 'Delhi Public International School',
    board: 'CBSE Affiliated #1930214',
    academicYear: '2026-2027',
  };

  const schoolStats = dashboardData?.stats || {
    totalStudents: 2450,
    totalTeachers: 128,
    totalClasses: 36,
    todayAttendance: '95.4%',
    pendingFees: '₹4.8L',
    upcomingExams: 3,
  };

  const attendanceWeekly = [
    { label: 'Mon', value: 95.2 },
    { label: 'Tue', value: 96.4 },
    { label: 'Wed', value: 94.8 },
    { label: 'Thu', value: 95.8 },
    { label: 'Fri', value: 93.9 },
    { label: 'Sat', value: 91.5 },
  ];

  const classDistribution = [
    { label: 'Primary (1-5)', value: 820, color: '#111827' },
    { label: 'Middle (6-8)', value: 680, color: '#4b5563' },
    { label: 'Secondary (9-10)', value: 520, color: '#9ca3af' },
    { label: 'Sr Secondary (11-12)', value: 430, color: '#d1d5db' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">School Administration Portal</h1>
          <p className="page-subtitle">{schoolProfile.name} • {schoolProfile.board} • AY {schoolProfile.academicYear}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={FileText} onClick={() => navigate('/school/reports')}>
            Generate Reports
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddStudentOpen(true)}>
            Add Student
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Enrol Student', icon: Plus, onClick: () => setIsAddStudentOpen(true) },
          { label: 'Mark Attendance', icon: UserCheck, onClick: () => navigate('/school/attendance') },
          { label: 'Class Timetable', icon: Clock, onClick: () => navigate('/school/timetable') },
          { label: 'Exam Schedules', icon: Award, onClick: () => navigate('/school/exams') },
          { label: 'Fee Invoices', icon: CreditCard, onClick: () => navigate('/school/fees') },
          { label: 'School Notices', icon: Bell, onClick: () => navigate('/school/notices') },
        ]}
      />

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        <StatCard title="Total Students" value={schoolStats.totalStudents.toLocaleString()} subtitle="Enrolled in Nursery-12" icon={GraduationCap} change="+4.2%" />
        <StatCard title="Total Teachers" value={schoolStats.totalTeachers} subtitle="Teaching faculty" icon={Users} />
        <StatCard title="Total Classes" value={schoolStats.totalClasses} subtitle="Across 36 sections" icon={Layers} />
        <StatCard title="Today's Attendance" value={schoolStats.todayAttendance} subtitle="Marked by 09:30 AM" icon={UserCheck} change="+1.2%" />
        <StatCard title="Pending Fee Dues" value={schoolStats.pendingFees} subtitle="Q2 Collections" icon={CreditCard} changeType="neutral" />
        <StatCard title="Upcoming Exams" value={schoolStats.upcomingExams} subtitle="Term 1 Assessments" icon={Award} />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Weekly Attendance Average (%)"
          subtitle="Daily school-wide student presence rate"
        >
          <BarChart data={attendanceWeekly} height={170} />
        </ChartCard>

        <ChartCard
          title="Student Strength by Wing"
          subtitle="Distribution of 2,450 students across class divisions"
        >
          <DonutChart data={classDistribution} size={140} />
        </ChartCard>
      </div>

      {/* Tables & Widgets */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Recent Admissions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Student Enrolments
              </h2>
              <p className="text-xs text-muted">Newly admitted students</p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/school/students')}>
              View Directory
            </Button>
          </div>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class / Sec</th>
                  <th>Guardian</th>
                  <th>Fee Status</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((stu) => (
                  <tr key={stu.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stu.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{stu.id} • Roll: {stu.rollNo}</div>
                    </td>
                    <td>{stu.class} ({stu.section})</td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{stu.guardian}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stu.guardianPhone}</div>
                    </td>
                    <td>
                      <Badge variant={stu.feeStatus}>{stu.feeStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Exams & Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upcoming Exams */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} /> Upcoming School Examinations
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/school/exams')}>
                Full Schedule
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {exams.map((ex) => (
                <div key={ex.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{ex.title}</span>
                    <Badge variant={ex.status}>{ex.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    <span>{ex.classes} • {ex.type}</span>
                    <span>{ex.startDate} to {ex.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} /> Latest Circulars & Notices
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/school/notices')}>
                View All
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.map((not) => (
                <div key={not.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{not.title}</span>
                    <Badge variant="outline">{not.priority}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Audience: {not.audience}</span>
                    <span>{not.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <FormModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleSaveStudent}
        title="Enrol New Student"
        subtitle="Create school academic record"
        submitLabel="Enrol Student"
      >
        <div className="grid-2">
          <Input
            label="Student Full Name"
            required
            placeholder="e.g. Aarav Sharma"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          <Input
            label="Student Email"
            type="email"
            placeholder="student@school.edu"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Class"
            value={studentForm.class}
            onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
            options={['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
          />
          <Select
            label="Section"
            value={studentForm.section}
            onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
            options={['A', 'B', 'C', 'D']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Parent / Guardian Name"
            required
            placeholder="Sanjay Sharma"
            value={studentForm.guardian}
            onChange={(e) => setStudentForm({ ...studentForm, guardian: e.target.value })}
          />
          <Input
            label="Guardian Phone"
            required
            placeholder="+91 98100 00000"
            value={studentForm.phone}
            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}
