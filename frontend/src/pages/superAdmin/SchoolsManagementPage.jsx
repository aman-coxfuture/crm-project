import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Plus,
  ExternalLink,
  Power,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  ArrowLeft,
  BookOpen,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

// Format Indian Rupee currency
const formatRupee = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

export default function SchoolsManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { changeSchool, switchRole } = useAuth();
  const { success, error: showError, info } = useToast();

  const [schools, setSchools] = useState(() => schoolDataService.getSchools());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [boardFilter, setBoardFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState(null);

  // STEP 10 & 11: Active School Overview Mode (when Super Admin clicks "Open School")
  const [activeOverviewSchool, setActiveOverviewSchool] = useState(null);
  const [overviewActiveTab, setOverviewActiveTab] = useState('overview');

  // Overview search queries for nested tabs
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Check query parameter for direct school opening (e.g. from Dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('openSchoolId');
    if (openId) {
      const target = schools.find((s) => s.id === openId);
      if (target) {
        setActiveOverviewSchool(target);
        setOverviewActiveTab('overview');
      }
    }
  }, [location.search, schools]);

  // STEP 6: Add School Form state
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    id: '',
    schoolCode: '',
    board: 'CBSE',
    address: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462011',
    email: '',
    phone: '',
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    status: 'Active',
    students: 1000,
    teachers: 60,
    staff: 30,
    classes: 30,
    books: 4000,
    attendance: 92,
    collectedFees: 1500000,
    pendingFees: 300000,
  });

  // STEP 16: Search and Filter Logic
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Status Filter
      if (statusFilter !== 'All' && school.status !== statusFilter) {
        return false;
      }
      // State Filter
      if (stateFilter !== 'All') {
        if (stateFilter === 'Other') {
          const mainStates = ['Madhya Pradesh', 'Uttar Pradesh', 'Bihar'];
          if (mainStates.includes(school.state)) return false;
        } else if (school.state !== stateFilter) {
          return false;
        }
      }
      // Board Filter
      if (boardFilter !== 'All') {
        const schoolBoard = school.board || (school.affiliation?.includes('CBSE') ? 'CBSE' : school.affiliation?.includes('ICSE') ? 'ICSE' : 'State Board');
        if (schoolBoard !== boardFilter) return false;
      }
      // Search matching (School Name, School ID, City, Principal Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (school.name || '').toLowerCase().includes(q);
        const matchId = (school.id || '').toLowerCase().includes(q);
        const matchCity = (school.city || '').toLowerCase().includes(q);
        const principalName = school.principalDetails?.name || school.principal || '';
        const matchPrincipal = principalName.toLowerCase().includes(q);
        const matchCode = (school.code || school.schoolCode || '').toLowerCase().includes(q);
        return matchName || matchId || matchCity || matchPrincipal || matchCode;
      }

      return true;
    });
  }, [schools, statusFilter, stateFilter, boardFilter, searchQuery]);

  // STEP 7: Create School Submit Handler
  const handleCreateSchoolSubmit = (e) => {
    e.preventDefault();
    if (!newSchoolForm.name.trim()) {
      showError('Please enter a valid school name.');
      return;
    }
    if (!newSchoolForm.principalName.trim()) {
      showError('Please enter the principal name.');
      return;
    }

    const generatedId = newSchoolForm.id.trim() || `SCH-${String(schools.length + 1).padStart(3, '0')}`;
    const generatedCode = newSchoolForm.schoolCode.trim() || `${newSchoolForm.name.substring(0, 3).toUpperCase()}${String(schools.length + 1).padStart(3, '0')}`;

    const created = schoolDataService.addSchool({
      ...newSchoolForm,
      id: generatedId,
      code: generatedCode,
      schoolCode: generatedCode,
      affiliation: `${newSchoolForm.board} Board`,
    });

    const updatedList = schoolDataService.getSchools();
    setSchools(updatedList);
    setIsAddModalOpen(false);

    // Reset Form
    setNewSchoolForm({
      name: '',
      id: '',
      schoolCode: '',
      board: 'CBSE',
      address: '',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      pincode: '462011',
      email: '',
      phone: '',
      principalName: '',
      principalEmail: '',
      principalPhone: '',
      status: 'Active',
      students: 1000,
      teachers: 60,
      staff: 30,
      classes: 30,
      books: 4000,
      attendance: 92,
      collectedFees: 1500000,
      pendingFees: 300000,
    });

    success('School added successfully.');
  };

  // STEP 15: Activate / Deactivate School Toggle
  const handleToggleSchoolStatus = (id) => {
    const updated = schoolDataService.toggleSchoolStatus(id);
    setSchools(schoolDataService.getSchools());

    if (selectedSchoolForDetails && selectedSchoolForDetails.id === id) {
      const updatedSchool = updated.find((s) => s.id === id);
      setSelectedSchoolForDetails(updatedSchool);
    }
    if (activeOverviewSchool && activeOverviewSchool.id === id) {
      const updatedSchool = updated.find((s) => s.id === id);
      setActiveOverviewSchool(updatedSchool);
    }

    const currentSchool = updated.find((s) => s.id === id);
    if (currentSchool?.status === 'Active') {
      success(`${currentSchool.name} is now Active.`);
    } else {
      info(`${currentSchool?.name} has been marked Inactive.`);
    }
  };

  // STEP 10: Super Admin Direct Open School
  const handleOpenSchoolOverview = (school) => {
    setActiveOverviewSchool(school);
    setSelectedSchoolForDetails(null);
    setOverviewActiveTab('overview');
  };

  // Main School Table Columns
  const schoolColumns = [
    {
      header: 'School',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              flexShrink: 0,
            }}
          >
            {row.logo || '🏫'}
          </div>
          <div>
            <div
              style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
              onClick={() => setSelectedSchoolForDetails(row)}
            >
              {val}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Code: {row.code || row.schoolCode} • <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{row.board || row.affiliation || 'CBSE'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'School ID',
      accessor: 'id',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      header: 'Location',
      accessor: 'city',
      sortable: true,
      render: (_, row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div>📍 {row.city || 'Bhopal'}, {row.state || 'Madhya Pradesh'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pin: {row.pincode || '462001'}</div>
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'students',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {(val || row.studentsCount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Teachers',
      accessor: 'teachers',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: '#0ea5e9' }}>
          {val || row.teachersCount || 0}
        </span>
      ),
    },
    {
      header: 'Staff',
      accessor: 'staff',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: '#8b5cf6' }}>
          {val || row.staffCount || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <span
          style={{
            backgroundColor: val === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: val === 'Active' ? '#059669' : '#dc2626',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        >
          {val || 'Active'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedSchoolForDetails(row)}
            title="View School Details"
          >
            <Eye size={13} />
            <span>View</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenSchoolOverview(row)}
            title="Direct Super Admin Global Access"
          >
            <ExternalLink size={13} />
            <span>Open</span>
          </button>
        </div>
      ),
    },
  ];

  // Data for School Overview Tabs (Students, Teachers, Staff)
  const schoolStudents = useMemo(() => {
    if (!activeOverviewSchool) return [];
    const all = schoolDataService.getStudents(activeOverviewSchool.id);
    if (all && all.length > 0) return all;
    // Mock students connected to school
    return [
      { id: 'STU-101', name: 'Aman Kumar', rollNumber: '901', class: 'Class 9', section: 'A', status: 'Active' },
      { id: 'STU-102', name: 'Rahul Singh', rollNumber: '902', class: 'Class 9', section: 'A', status: 'Active' },
      { id: 'STU-103', name: 'Priya Sharma', rollNumber: '903', class: 'Class 9', section: 'B', status: 'Active' },
      { id: 'STU-104', name: 'Neha Verma', rollNumber: '1001', class: 'Class 10', section: 'A', status: 'Active' },
      { id: 'STU-105', name: 'Aarav Patel', rollNumber: '501', class: 'Class 5', section: 'A', status: 'Active' },
      { id: 'STU-106', name: 'Rohan Gupta', rollNumber: '802', class: 'Class 8', section: 'B', status: 'Active' },
    ];
  }, [activeOverviewSchool]);

  const filteredSchoolStudents = useMemo(() => {
    if (!studentSearch.trim()) return schoolStudents;
    const q = studentSearch.toLowerCase();
    return schoolStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.rollNumber || '').toLowerCase().includes(q) ||
        (s.class || '').toLowerCase().includes(q)
    );
  }, [schoolStudents, studentSearch]);

  const schoolTeachers = useMemo(() => {
    if (!activeOverviewSchool) return [];
    const all = schoolDataService.getTeachers(activeOverviewSchool.id);
    if (all && all.length > 0) return all;
    return [
      { id: 'TCH-001', name: 'Rahul Sharma', employeeId: 'TCH-001', subject: 'Mathematics', class: 'Class 9, 10', status: 'Active' },
      { id: 'TCH-002', name: 'Priya Singh', employeeId: 'TCH-002', subject: 'English Literature', class: 'Class 8, 9, 10', status: 'Active' },
      { id: 'TCH-003', name: 'Amit Kumar', employeeId: 'TCH-003', subject: 'Science & Physics', class: 'Class 6, 7, 8', status: 'Active' },
      { id: 'TCH-004', name: 'Sunita Mishra', employeeId: 'TCH-004', subject: 'Hindi & Sanskrit', class: 'Class 5, 6, 7', status: 'Active' },
      { id: 'TCH-005', name: 'Vikram Joshi', employeeId: 'TCH-005', subject: 'Computer Science', class: 'Class 9, 10, 11', status: 'Active' },
    ];
  }, [activeOverviewSchool]);

  const filteredSchoolTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return schoolTeachers;
    const q = teacherSearch.toLowerCase();
    return schoolTeachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.employeeId || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q)
    );
  }, [schoolTeachers, teacherSearch]);

  const schoolStaff = useMemo(() => {
    if (!activeOverviewSchool) return [];
    const all = schoolDataService.getStaff(activeOverviewSchool.id);
    if (all && all.length > 0) return all;
    return [
      { id: 'STF-001', name: 'Robert Clark', staffId: 'STF-001', type: 'Driver', designation: 'Senior Bus Driver', status: 'Active' },
      { id: 'STF-002', name: 'Walter Sterling', staffId: 'STF-002', type: 'Office Staff', designation: 'Chief Librarian', status: 'Active' },
      { id: 'STF-003', name: 'Rajesh Nair', staffId: 'STF-003', type: 'Support Staff', designation: 'Senior Lab Assistant', status: 'Active' },
      { id: 'STF-004', name: 'Meena Devi', staffId: 'STF-004', type: 'Support Staff', designation: 'Campus Caretaker', status: 'Active' },
      { id: 'STF-005', name: 'Kishore Patel', staffId: 'STF-005', type: 'Other Staff', designation: 'Security Head', status: 'Active' },
    ];
  }, [activeOverviewSchool]);

  const filteredSchoolStaff = useMemo(() => {
    if (!staffSearch.trim()) return schoolStaff;
    const q = staffSearch.toLowerCase();
    return schoolStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.staffId || '').toLowerCase().includes(q) ||
        (s.type || '').toLowerCase().includes(q) ||
        (s.designation || '').toLowerCase().includes(q)
    );
  }, [schoolStaff, staffSearch]);

  // =========================================================================
  // VIEW: SCHOOL OVERVIEW MODE (WHEN SUPER ADMIN OPENS A SCHOOL)
  // =========================================================================
  if (activeOverviewSchool) {
    return (
      <div>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setActiveOverviewSchool(null);
                // Clear URL param if present
                navigate('/super-admin/schools', { replace: true });
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to All Schools</span>
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>{activeOverviewSchool.logo || '🏫'}</span>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {activeOverviewSchool.name}
                </h1>
                <StatusBadge status={activeOverviewSchool.status} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                School ID: <strong>{activeOverviewSchool.id}</strong> • Board: <strong>{activeOverviewSchool.board || 'CBSE'}</strong> • Location: <strong>{activeOverviewSchool.city}, {activeOverviewSchool.state}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${activeOverviewSchool.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
              onClick={() => handleToggleSchoolStatus(activeOverviewSchool.id)}
            >
              <Power size={14} />
              <span>{activeOverviewSchool.status === 'Active' ? 'Deactivate School' : 'Activate School'}</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={async () => {
                changeSchool(activeOverviewSchool);
                await switchRole('school-admin');
                success(`Switched active context to ${activeOverviewSchool.name}`);
                navigate('/school-admin/dashboard');
              }}
            >
              <ExternalLink size={15} />
              <span>Launch School Portal</span>
            </button>
          </div>
        </div>

        {/* STEP 11: School Overview KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          <StatCard
            title="Students"
            value={(activeOverviewSchool.students || activeOverviewSchool.studentsCount || 0).toLocaleString('en-IN')}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Teachers"
            value={(activeOverviewSchool.teachers || activeOverviewSchool.teachersCount || 0).toLocaleString('en-IN')}
            icon={GraduationCap}
            color="sky"
          />
          <StatCard
            title="Staff"
            value={(activeOverviewSchool.staff || activeOverviewSchool.staffCount || 0).toLocaleString('en-IN')}
            icon={Briefcase}
            color="purple"
          />
          <StatCard
            title="Classes"
            value={activeOverviewSchool.classes || 30}
            icon={Layers}
            color="amber"
          />
          <StatCard
            title="Attendance"
            value={`${activeOverviewSchool.attendance || 92}%`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Collected Fees"
            value={formatRupee(activeOverviewSchool.collectedFees || 1500000)}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Total Books"
            value={(activeOverviewSchool.books || 4000).toLocaleString('en-IN')}
            icon={BookOpen}
            color="indigo"
          />
        </div>

        {/* Tabs for Overview, Students, Teachers, Staff */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'School Overview', icon: <Building2 size={15} /> },
            { id: 'students', label: `Students (${filteredSchoolStudents.length})`, icon: <Users size={15} /> },
            { id: 'teachers', label: `Teachers (${filteredSchoolTeachers.length})`, icon: <GraduationCap size={15} /> },
            { id: 'staff', label: `Staff (${filteredSchoolStaff.length})`, icon: <Briefcase size={15} /> },
          ]}
          activeTab={overviewActiveTab}
          onChange={setOverviewActiveTab}
          variant="pills"
        />

        {/* TAB 1: OVERVIEW */}
        {overviewActiveTab === 'overview' && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
                School Information & Campus Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <div><strong>Full Address:</strong> {activeOverviewSchool.address || 'Campus Road'}, {activeOverviewSchool.city}, {activeOverviewSchool.state} - {activeOverviewSchool.pincode}</div>
                <div><strong>Official Email:</strong> {activeOverviewSchool.email || 'contact@school.edu.in'}</div>
                <div><strong>Phone Number:</strong> {activeOverviewSchool.phone || '+91 9876543210'}</div>
                <div><strong>Affiliation Board:</strong> {activeOverviewSchool.board || activeOverviewSchool.affiliation || 'CBSE Board'}</div>
                <div><strong>Academic Session:</strong> 2026-2027</div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
                Principal & Administration Desk
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  {(activeOverviewSchool.principalDetails?.name || activeOverviewSchool.principal || 'P').charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {activeOverviewSchool.principalDetails?.name || activeOverviewSchool.principal || 'Principal In-Charge'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Principal & Head of Institution
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>✉️ {activeOverviewSchool.principalDetails?.email || activeOverviewSchool.email}</div>
                <div>📞 {activeOverviewSchool.principalDetails?.phone || activeOverviewSchool.phone}</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 12: TAB 2 - STUDENTS */}
        {overviewActiveTab === 'students' && (
          <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Enrolled Students</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Student directory for {activeOverviewSchool.name}
                </p>
              </div>

              <div style={{ width: '260px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <DataTable
              columns={[
                { header: 'Student Name', accessor: 'name', sortable: true, render: (v) => <strong>{v}</strong> },
                { header: 'Roll Number', accessor: 'rollNumber', sortable: true, render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
                { header: 'Class', accessor: 'class', sortable: true },
                { header: 'Section', accessor: 'section', sortable: true },
                {
                  header: 'Status',
                  accessor: 'status',
                  sortable: true,
                  render: (v) => (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                      {v || 'Active'}
                    </span>
                  ),
                },
              ]}
              data={filteredSchoolStudents}
              pageSize={6}
              emptyMessage="No students found."
            />
          </div>
        )}

        {/* STEP 13: TAB 3 - TEACHERS */}
        {overviewActiveTab === 'teachers' && (
          <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Faculty & Teachers</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Teaching staff assigned to {activeOverviewSchool.name}
                </p>
              </div>

              <div style={{ width: '260px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search teachers..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <DataTable
              columns={[
                { header: 'Teacher Name', accessor: 'name', sortable: true, render: (v) => <strong>{v}</strong> },
                { header: 'Employee ID', accessor: 'employeeId', sortable: true, render: (v, r) => <span style={{ fontFamily: 'monospace' }}>{v || r.id}</span> },
                { header: 'Subject', accessor: 'subject', sortable: true, render: (v) => <span className="badge badge-primary">{v}</span> },
                { header: 'Classes Assigned', accessor: 'class', sortable: true, render: (v, r) => Array.isArray(r.classes) ? r.classes.join(', ') : (v || 'Classes 6-10') },
                {
                  header: 'Status',
                  accessor: 'status',
                  sortable: true,
                  render: (v) => (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                      {v || 'Active'}
                    </span>
                  ),
                },
              ]}
              data={filteredSchoolTeachers}
              pageSize={6}
              emptyMessage="No teachers found."
            />
          </div>
        )}

        {/* STEP 14: TAB 4 - STAFF */}
        {overviewActiveTab === 'staff' && (
          <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Support & Operations Staff</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Non-teaching personnel, drivers, and office staff
                </p>
              </div>

              <div style={{ width: '260px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <DataTable
              columns={[
                { header: 'Staff Name', accessor: 'name', sortable: true, render: (v) => <strong>{v}</strong> },
                { header: 'Staff ID', accessor: 'staffId', sortable: true, render: (v, r) => <span style={{ fontFamily: 'monospace' }}>{v || r.id}</span> },
                {
                  header: 'Type',
                  accessor: 'type',
                  sortable: true,
                  render: (v) => (
                    <span
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                      }}
                    >
                      {v || 'Office Staff'}
                    </span>
                  ),
                },
                { header: 'Designation', accessor: 'designation', sortable: true, render: (v) => v || 'Staff Member' },
                {
                  header: 'Status',
                  accessor: 'status',
                  sortable: true,
                  render: (v) => (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                      {v || 'Active'}
                    </span>
                  ),
                },
              ]}
              data={filteredSchoolStaff}
              pageSize={6}
              emptyMessage="No staff personnel found."
            />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN ALL SCHOOLS PAGE
  // =========================================================================
  return (
    <div>
      {/* STEP 4: Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">
            <Building2 size={26} color="var(--primary)" />
            All Schools
          </h1>
          <p className="page-subtitle">
            Manage all schools registered in the CRM.
          </p>
        </div>

        {/* STEP 6: Top Right + Add School button */}
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>+ Add School</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="card" style={{ padding: '20px' }}>
        {/* STEP 4 & 16: Search Box & Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '18px',
          }}
        >
          {/* Search box */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search school by name, ID, city, principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', width: '100%' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* State Filter */}
          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="All">All States</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Board Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
            >
              <option value="All">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </div>
        </div>

        {/* STEP 5: School Table */}
        <DataTable
          columns={schoolColumns}
          data={filteredSchools}
          pageSize={8}
          emptyMessage="No schools matching your search or filters."
        />
      </div>

      {/* ========================================================================= */}
      {/* STEP 6 & 7: ADD NEW SCHOOL MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New School"
        subtitle="Register and onboard a new educational campus into the CRM"
        size="lg"
      >
        <form onSubmit={handleCreateSchoolSubmit}>
          <div className="grid-2" style={{ gap: '12px' }}>
            <FormInput
              label="School Name"
              value={newSchoolForm.name}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
              placeholder="e.g. Delhi Public School"
              required
            />
            <FormInput
              label="School ID"
              value={newSchoolForm.id}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, id: e.target.value })}
              placeholder="e.g. SCH-007 (auto-generated if empty)"
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="School Code"
              value={newSchoolForm.schoolCode}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, schoolCode: e.target.value })}
              placeholder="e.g. DPS007"
            />
            <Select
              label="Board"
              value={newSchoolForm.board}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, board: e.target.value })}
              options={['CBSE', 'ICSE', 'State Board']}
              required
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <FormInput
              label="Address"
              value={newSchoolForm.address}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, address: e.target.value })}
              placeholder="Campus road, locality, district"
            />
          </div>

          <div className="grid-3" style={{ gap: '10px', marginTop: '10px' }}>
            <FormInput
              label="City"
              value={newSchoolForm.city}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, city: e.target.value })}
              placeholder="e.g. Bhopal"
              required
            />
            <Select
              label="State"
              value={newSchoolForm.state}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, state: e.target.value })}
              options={['Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Maharashtra', 'Rajasthan', 'Other']}
              required
            />
            <FormInput
              label="Pincode"
              value={newSchoolForm.pincode}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, pincode: e.target.value })}
              placeholder="e.g. 462011"
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="School Email"
              type="email"
              value={newSchoolForm.email}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, email: e.target.value })}
              placeholder="contact@dpsbhopal.edu.in"
            />
            <FormInput
              label="School Phone"
              value={newSchoolForm.phone}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, phone: e.target.value })}
              placeholder="9876543210"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0' }} />

          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
            Principal Information
          </h4>

          <div className="grid-3" style={{ gap: '10px' }}>
            <FormInput
              label="Principal Name"
              value={newSchoolForm.principalName}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principalName: e.target.value })}
              placeholder="e.g. Dr. Rahul Sharma"
              required
            />
            <FormInput
              label="Principal Email"
              type="email"
              value={newSchoolForm.principalEmail}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principalEmail: e.target.value })}
              placeholder="principal@dpsbhopal.edu.in"
            />
            <FormInput
              label="Principal Phone"
              value={newSchoolForm.principalPhone}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principalPhone: e.target.value })}
              placeholder="9876543211"
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <Select
              label="Status"
              value={newSchoolForm.status}
              onChange={(e) => setNewSchoolForm({ ...newSchoolForm, status: e.target.value })}
              options={['Active', 'Inactive']}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create School
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* STEP 8 & 9: VIEW SCHOOL DETAILS MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedSchoolForDetails}
        onClose={() => setSelectedSchoolForDetails(null)}
        title={selectedSchoolForDetails ? `${selectedSchoolForDetails.name}` : 'School Details'}
        subtitle={`School ID: ${selectedSchoolForDetails?.id} • Board: ${selectedSchoolForDetails?.board || selectedSchoolForDetails?.affiliation || 'CBSE'}`}
        size="lg"
      >
        {selectedSchoolForDetails && (
          <div>
            {/* School Profile Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2.2rem' }}>{selectedSchoolForDetails.logo || '🏫'}</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                      {selectedSchoolForDetails.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Code: <strong>{selectedSchoolForDetails.code || selectedSchoolForDetails.schoolCode}</strong> • Board: <strong>{selectedSchoolForDetails.board || selectedSchoolForDetails.affiliation || 'CBSE'}</strong>
                    </div>
                  </div>
                </div>

                <StatusBadge status={selectedSchoolForDetails.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Address:</span>
                  <div>📍 {selectedSchoolForDetails.address || selectedSchoolForDetails.city}, {selectedSchoolForDetails.city}, {selectedSchoolForDetails.state} - {selectedSchoolForDetails.pincode}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>School Contact:</span>
                  <div>✉️ {selectedSchoolForDetails.email}</div>
                  <div>📞 {selectedSchoolForDetails.phone}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Principal:</span>
                  <div style={{ fontWeight: 750 }}>
                    {selectedSchoolForDetails.principalDetails?.name || selectedSchoolForDetails.principal}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    ✉️ {selectedSchoolForDetails.principalDetails?.email || selectedSchoolForDetails.email} • 📞 {selectedSchoolForDetails.principalDetails?.phone || selectedSchoolForDetails.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 9: School Statistics Cards */}
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
              School Statistics & Performance
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Students</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {(selectedSchoolForDetails.students || selectedSchoolForDetails.studentsCount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Teachers</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0ea5e9' }}>
                  {(selectedSchoolForDetails.teachers || selectedSchoolForDetails.teachersCount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Staff</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8b5cf6' }}>
                  {(selectedSchoolForDetails.staff || selectedSchoolForDetails.staffCount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Classes</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
                  {selectedSchoolForDetails.classes || 30}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Total Books</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  {(selectedSchoolForDetails.books || 3500).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Attendance</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: (selectedSchoolForDetails.attendance || 90) >= 80 ? '#10b981' : '#ef4444' }}>
                  {selectedSchoolForDetails.attendance || 92}%
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Collected Fees</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                  {formatRupee(selectedSchoolForDetails.collectedFees || 1500000)}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Pending Fees</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>
                  {formatRupee(selectedSchoolForDetails.pendingFees || 300000)}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              className="modal-footer"
              style={{
                margin: '20px -24px -24px',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* STEP 15: Activate / Deactivate Toggle */}
              <button
                className={`btn btn-sm ${selectedSchoolForDetails.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggleSchoolStatus(selectedSchoolForDetails.id)}
              >
                <Power size={14} />
                <span>{selectedSchoolForDetails.status === 'Active' ? 'Deactivate School' : 'Activate School'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedSchoolForDetails(null)}>
                  Close
                </button>

                {/* STEP 10: Direct Super Admin Global Access */}
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenSchoolOverview(selectedSchoolForDetails)}
                >
                  <ExternalLink size={15} />
                  <span>Open School</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
