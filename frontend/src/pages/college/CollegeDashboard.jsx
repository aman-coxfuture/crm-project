import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  UserCheck,
  CreditCard,
  FileCheck,
  Award,
  Plus,
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  Download
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard, { BarChart, DonutChart } from '../../components/dashboard/ChartCard';
import QuickActions from '../../components/dashboard/QuickActions';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import {
  analyticsService,
  admissionService,
  examService,
  noticeService,
  studentService
} from '../../services';

export default function CollegeDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 1',
    email: '',
    phone: '',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashData, admList, examList, noticeList] = await Promise.all([
        analyticsService.getCollegeDashboardData(),
        admissionService.getCollegeAdmissions(),
        examService.getCollegeExams(),
        noticeService.getCollegeNotices(),
      ]);
      setDashboardData(dashData);
      setAdmissions(admList || []);
      setExams(examList || []);
      setNotices(noticeList || []);
    } catch (err) {
      addToast('Failed to load college dashboard', 'error');
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
        usn: `1HV24CS${Date.now().toString().slice(-3)}`,
        cgpa: '8.50',
        attendance: '100%',
        feeStatus: 'Paid',
      }, 'college');
      setIsAddStudentOpen(false);
      setStudentForm({
        name: '',
        department: 'Computer Science & Engineering',
        course: 'B.Tech CSE',
        semester: 'Semester 1',
        email: '',
        phone: '',
      });
      addToast(`College student "${created.name}" registered`, 'success');
    } catch (err) {
      addToast('Failed to register student', 'error');
    }
  };

  const collegeProfile = dashboardData?.profile || {
    name: 'Heritage Valley College of Engineering & Tech',
    affiliation: 'Affiliated to VTU Belagavi • NBA Accredited',
    academicYear: '2026-2027',
  };

  const collegeStats = dashboardData?.stats || {
    totalStudents: 3600,
    totalFaculty: 210,
    totalDepartments: 8,
    totalCourses: 14,
    todayAttendance: '92.6%',
    pendingFees: '₹18.4L',
  };

  const departmentWiseStudents = [
    { label: 'CSE', value: 780 },
    { label: 'AI&DS', value: 480 },
    { label: 'ECE', value: 650 },
    { label: 'MECH', value: 420 },
    { label: 'CIVIL', value: 340 },
    { label: 'MBA', value: 240 },
  ];

  const courseDistribution = [
    { label: 'B.Tech CSE & AI', value: 1260, color: '#111827' },
    { label: 'B.Tech Core Engg', value: 1410, color: '#4b5563' },
    { label: 'Postgraduate (MBA/M.Tech)', value: 530, color: '#9ca3af' },
    { label: 'Ph.D. Scholars', value: 400, color: '#d1d5db' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">College Administration Portal</h1>
          <p className="page-subtitle">{collegeProfile.name} • {collegeProfile.affiliation} • {collegeProfile.academicYear}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Download} onClick={() => navigate('/college/reports')}>
            NBA / NAAC Reports
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddStudentOpen(true)}>
            Add Student
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Register Student', icon: Plus, onClick: () => setIsAddStudentOpen(true) },
          { label: 'Manage Faculty', icon: Users, onClick: () => navigate('/college/faculty') },
          { label: 'Admissions 2026', icon: FileCheck, onClick: () => navigate('/college/admissions') },
          { label: 'Degree Programs', icon: BookOpen, onClick: () => navigate('/college/courses') },
          { label: 'SEE / CIE Exams', icon: Award, onClick: () => navigate('/college/exams') },
          { label: 'College Notices', icon: Bell, onClick: () => navigate('/college/notices') },
        ]}
      />

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard title="Total UG/PG Students" value={collegeStats.totalStudents.toLocaleString()} subtitle="Across all branches" icon={GraduationCap} change="+6.8%" />
        <StatCard title="Total Faculty Members" value={collegeStats.totalFaculty} subtitle="Professors & Assts" icon={Users} />
        <StatCard title="Total Departments" value={collegeStats.totalDepartments} subtitle="8 Academic Centers" icon={Building2} />
        <StatCard title="Degree Courses" value={collegeStats.totalCourses} subtitle="B.Tech, M.Tech, MBA" icon={BookOpen} />
        <StatCard title="Today's Attendance" value={collegeStats.todayAttendance} subtitle="Campus biometric sync" icon={UserCheck} change="+0.8%" />
        <StatCard title="Pending Semester Fees" value={collegeStats.pendingFees} subtitle="Odd Sem 2026-27" icon={CreditCard} changeType="neutral" />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Department-wise Student Enrollment"
          subtitle="Distribution across Engineering and Management branches"
        >
          <BarChart data={departmentWiseStudents} height={170} />
        </ChartCard>

        <ChartCard
          title="Program Tier Breakdown"
          subtitle="Ratio of Undergraduate vs Postgraduate students"
        >
          <DonutChart data={courseDistribution} size={140} />
        </ChartCard>
      </div>

      {/* Admissions & Circulars Grid */}
      <div className="grid-2">
        {/* Recent Admissions Applications */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Admission Applications
              </h2>
              <p className="text-xs text-muted">Intake 2026-27 verification stream</p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/college/admissions')}>
              View All
            </Button>
          </div>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Course Applied</th>
                  <th>Score / Rank</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {admissions.slice(0, 5).map((adm) => (
                  <tr key={adm.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{adm.applicantName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {adm.id} • {adm.category}</div>
                    </td>
                    <td>{adm.appliedCourse}</td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{adm.entranceExam}</span>
                    </td>
                    <td>
                      <Badge variant={adm.status}>{adm.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exams & Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upcoming Examinations */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} /> Autonomous Examinations Schedule
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/college/exams')}>
                Full Calendar
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
                    <span>{ex.semester} • {ex.type}</span>
                    <span>{ex.startDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Circulars */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} /> Campus Placement & Circulars
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/college/notices')}>
                All Notices
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.map((not) => (
                <div key={not.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{not.title}</span>
                    <Badge variant="outline">{not.priority}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{not.audience}</span>
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
        title="Register College Student"
        subtitle="Provision University Seat Number (USN) record"
      >
        <div className="grid-2">
          <Input
            label="Student Full Name"
            required
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
            placeholder="Student Name"
          />
          <Input
            label="Email Address"
            type="email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            placeholder="student@college.edu"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Department"
            value={studentForm.department}
            onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
            options={['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Electronics & Communication', 'Mechanical Engineering', 'Management Studies']}
          />
          <Select
            label="Degree Course"
            value={studentForm.course}
            onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
            options={['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Gen)', 'M.Tech CSE']}
          />
        </div>
      </FormModal>
    </div>
  );
}
