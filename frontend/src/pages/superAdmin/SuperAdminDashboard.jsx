import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  Plus,
  ExternalLink,
  Power,
  ShieldCheck,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Landmark,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  BookOpen,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// Format Indian Rupee currency
const formatRupee = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { changeSchool, switchRole } = useAuth();
  const { success, info } = useToast();

  const [schools, setSchools] = useState(() => schoolDataService.getSchools());
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState(null);

  // STEP 2: Calculate Super Admin Top Summary Cards dynamically from mock school data
  const totalSchools = schools.length;
  const activeSchools = useMemo(() => schools.filter((s) => s.status === 'Active').length, [schools]);
  const inactiveSchools = useMemo(() => schools.filter((s) => s.status !== 'Active').length, [schools]);
  const totalStudents = useMemo(() => schools.reduce((acc, s) => acc + (Number(s.students || s.studentsCount) || 0), 0), [schools]);
  const totalTeachers = useMemo(() => schools.reduce((acc, s) => acc + (Number(s.teachers || s.teachersCount) || 0), 0), [schools]);
  const totalStaff = useMemo(() => schools.reduce((acc, s) => acc + (Number(s.staff || s.staffCount) || 0), 0), [schools]);

  // STEP 19: Calculate Attention Required metrics
  const lowAttendanceSchools = useMemo(() => schools.filter((s) => (s.attendance || 90) < 80).length, [schools]);
  const pendingFeeSchools = useMemo(() => schools.filter((s) => (s.pendingFees || 0) > 300000).length, [schools]);

  // STEP 18: Mock Recent Activity Logs
  const recentActivities = [
    {
      id: 1,
      title: 'New school registered: Delhi Public School',
      time: '10 minutes ago',
      type: 'add',
      badge: 'New School',
      color: '#4f46e5',
    },
    {
      id: 2,
      title: 'School SCH-002 activated by Super Admin',
      time: '2 hours ago',
      type: 'status',
      badge: 'Status Update',
      color: '#10b981',
    },
    {
      id: 3,
      title: 'School SCH-006 status toggled to Inactive',
      time: '5 hours ago',
      type: 'status',
      badge: 'Attention',
      color: '#ef4444',
    },
    {
      id: 4,
      title: 'Kendriya Vidyalaya No. 1 updated principal details',
      time: '1 day ago',
      type: 'update',
      badge: 'Profile Update',
      color: '#0ea5e9',
    },
    {
      id: 5,
      title: 'Platform-wide quarterly academic audit completed',
      time: '2 days ago',
      type: 'system',
      badge: 'System Audit',
      color: '#8b5cf6',
    },
  ];

  // STEP 10: Super Admin Direct School Access
  const handleOpenSchool = (school) => {
    // Navigate to All Schools page with the selected school opened in overview mode
    navigate(`/super-admin/schools?openSchoolId=${school.id}`);
  };

  // Toggle school status
  const handleToggleStatus = (id) => {
    const updated = schoolDataService.toggleSchoolStatus(id);
    setSchools(schoolDataService.getSchools());
    if (selectedSchoolForDetails && selectedSchoolForDetails.id === id) {
      const updatedSchool = updated.find((s) => s.id === id);
      setSelectedSchoolForDetails(updatedSchool);
    }
    const currentSchool = updated.find((s) => s.id === id);
    if (currentSchool?.status === 'Active') {
      success(`${currentSchool.name} is now Activated.`);
    } else {
      info(`${currentSchool?.name} has been Deactivated.`);
    }
  };

  // Columns for Recent Schools Table
  const recentSchoolColumns = [
    {
      header: 'School',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{row.logo || '🏫'}</span>
          <div>
            <div
              style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
              onClick={() => setSelectedSchoolForDetails(row)}
            >
              {val}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              ID: {row.id} • {row.board || row.affiliation || 'CBSE'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      sortable: true,
      render: (_, row) => (
        <div style={{ fontSize: '0.85rem' }}>
          {row.city || 'Bhopal'}, {row.state || 'Madhya Pradesh'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            onClick={() => handleOpenSchool(row)}
            title="Open School Overview directly"
          >
            <ExternalLink size={13} />
            <span>Open</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <h1 className="page-title">
            <ShieldCheck size={28} color="var(--primary)" />
            Super Admin Control Center
          </h1>
          <p className="page-subtitle">
            Centralized multi-institution CRM administration. Direct global access to all registered schools.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/super-admin/schools')}>
          <Building2 size={16} />
          <span>Manage All Schools</span>
        </button>
      </div>

      {/* STEP 2: Top Cards - 6 Metric Cards */}
      <div
        className="grid-6"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="Total Schools"
          value={totalSchools}
          icon={Building2}
          color="indigo"
          subtitle="Registered institutions"
        />
        <StatCard
          title="Active Schools"
          value={activeSchools}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Operational campuses"
        />
        <StatCard
          title="Inactive Schools"
          value={inactiveSchools}
          icon={AlertCircle}
          color="rose"
          subtitle="Suspended or pending"
        />
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString('en-IN')}
          icon={Users}
          color="sky"
          subtitle="Across all schools"
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers.toLocaleString('en-IN')}
          icon={GraduationCap}
          color="purple"
          subtitle="Faculty strength"
        />
        <StatCard
          title="Total Staff"
          value={totalStaff.toLocaleString('en-IN')}
          icon={Briefcase}
          color="amber"
          subtitle="Support & operations"
        />
      </div>

      {/* STEP 3: 3 Institution Cards (ALL SCHOOLS, ALL COLLEGES, ALL UNIVERSITIES) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        {/* Card 1: ALL SCHOOLS (ACTIVE) */}
        <div
          className="card card-hover"
          style={{
            padding: '22px',
            borderTop: '4px solid var(--primary)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={24} />
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                ACTIVE
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              ALL SCHOOLS
            </h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              {totalSchools} Schools
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.4' }}>
              K-12 Primary, Secondary and Senior Secondary campuses under CBSE, ICSE & State boards.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/super-admin/schools')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Manage Schools</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Card 2: ALL COLLEGES (DISABLED - Coming Soon) */}
        <div
          className="card"
          style={{
            padding: '22px',
            borderTop: '4px solid #94a3b8',
            opacity: 0.65,
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'not-allowed',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={24} />
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#d97706',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                COMING SOON
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              ALL COLLEGES
            </h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Coming Soon
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', margin: '0 0 16px', lineHeight: '1.4' }}>
              Degree colleges, polytechnics, and vocational institutes management module.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            disabled
            style={{ width: '100%', justifyContent: 'center', cursor: 'not-allowed', opacity: 0.7 }}
          >
            <span>Disabled</span>
          </button>
        </div>

        {/* Card 3: ALL UNIVERSITIES (DISABLED - Coming Soon) */}
        <div
          className="card"
          style={{
            padding: '22px',
            borderTop: '4px solid #94a3b8',
            opacity: 0.65,
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'not-allowed',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={24} />
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#d97706',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                COMING SOON
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              ALL UNIVERSITIES
            </h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              Coming Soon
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', margin: '0 0 16px', lineHeight: '1.4' }}>
              Higher education universities, research wings and multi-faculty campuses module.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            disabled
            style={{ width: '100%', justifyContent: 'center', cursor: 'not-allowed', opacity: 0.7 }}
          >
            <span>Disabled</span>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Schools (Left) + Activity & Attention (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '22px' }}>
        {/* STEP 17: Recent Schools Section */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Recent Schools
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                Latest registered schools across the CRM
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/super-admin/schools')}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <DataTable
            columns={recentSchoolColumns}
            data={schools.slice(0, 5)}
            pageSize={5}
            emptyMessage="No schools found."
          />
        </div>

        {/* Right Column: Attention Required + Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* STEP 19: Attention Required Section */}
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertTriangle size={20} color="#d97706" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Attention Required
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Inactive Schools</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                  {inactiveSchools}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Low Attendance</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  {lowAttendanceSchools}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Pending Fee Data</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1', marginTop: '2px' }}>
                  {pendingFeeSchools}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 18: Recent Activity Section */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Activity size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Recent Activity
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: act.id !== recentActivities.length ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: act.color,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{act.time}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {act.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 8 & 9: View School Details Modal */}
      <Modal
        isOpen={!!selectedSchoolForDetails}
        onClose={() => setSelectedSchoolForDetails(null)}
        title={selectedSchoolForDetails ? `${selectedSchoolForDetails.name}` : 'School Details'}
        subtitle={`School ID: ${selectedSchoolForDetails?.id} • Board: ${selectedSchoolForDetails?.board || selectedSchoolForDetails?.affiliation || 'CBSE'}`}
        size="lg"
      >
        {selectedSchoolForDetails && (
          <div>
            {/* School Profile Card */}
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
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Location:</span>
                  <div>📍 {selectedSchoolForDetails.address || selectedSchoolForDetails.city}, {selectedSchoolForDetails.city}, {selectedSchoolForDetails.state} - {selectedSchoolForDetails.pincode}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Contact Info:</span>
                  <div>✉️ {selectedSchoolForDetails.email}</div>
                  <div>📞 {selectedSchoolForDetails.phone}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Principal:</span>
                  <div style={{ fontWeight: 700 }}>
                    {selectedSchoolForDetails.principalDetails?.name || selectedSchoolForDetails.principal}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {selectedSchoolForDetails.principalDetails?.email || selectedSchoolForDetails.email} • {selectedSchoolForDetails.principalDetails?.phone || selectedSchoolForDetails.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 9: School Statistics Cards */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
              School Academic & Financial Metrics
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

            {/* Modal Footer with Actions */}
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
              {/* STEP 15: Activate / Deactivate Button */}
              <button
                className={`btn btn-sm ${selectedSchoolForDetails.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggleStatus(selectedSchoolForDetails.id)}
              >
                <Power size={14} />
                <span>{selectedSchoolForDetails.status === 'Active' ? 'Deactivate School' : 'Activate School'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedSchoolForDetails(null)}>
                  Close
                </button>

                {/* STEP 10: Super Admin Global Open School */}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const schoolToOpen = selectedSchoolForDetails;
                    setSelectedSchoolForDetails(null);
                    handleOpenSchool(schoolToOpen);
                  }}
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
