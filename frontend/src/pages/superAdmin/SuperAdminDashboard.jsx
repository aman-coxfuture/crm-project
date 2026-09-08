import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import { BarChart, DonutChart, TrendLineChart } from '../../components/common/Charts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  Plus,
  ExternalLink,
  Power,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { changeSchool, switchRole } = useAuth();
  const { success, info } = useToast();

  const [schools, setSchools] = useState(() => schoolDataService.getSchools());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    schoolCode: '',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliation: 'CBSE / State Board',
    establishedYear: '2020',
  });

  // Aggregated platform stats
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.status === 'Active').length;
  const inactiveSchools = totalSchools - activeSchools;
  const totalStudents = schools.reduce((acc, s) => acc + (s.studentsCount || 0), 0);
  const totalTeachers = schools.reduce((acc, s) => acc + (s.teachersCount || 0), 0);
  const totalStaff = schools.reduce((acc, s) => acc + (s.staffCount || 0), 0);

  const handleToggleStatus = (id) => {
    const updated = schoolDataService.toggleSchoolStatus(id);
    setSchools(updated);
    info('School status updated');
  };

  const handleOpenSchool = async (school) => {
    changeSchool(school);
    await switchRole('school-admin');
    success(`Launched management dashboard for ${school.name}`);
    navigate('/school-admin/dashboard');
  };

  const handleAddSchoolSubmit = (e) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.principal) return;
    const created = schoolDataService.addSchool(newSchool);
    setSchools(schoolDataService.getSchools());
    setIsAddModalOpen(false);
    setNewSchool({
      name: '',
      schoolCode: '',
      principal: '',
      email: '',
      phone: '',
      address: '',
      affiliation: 'CBSE / State Board',
      establishedYear: '2020',
    });
    success(`School "${created.name}" created successfully!`);
  };

  const schoolChartData = schools.map((s) => ({
    label: s.name.split(' ')[0],
    value: s.studentsCount || 0,
    color: '#4f46e5',
  }));

  const statusDonutData = [
    { label: 'Active Schools', value: activeSchools, color: '#10b981' },
    { label: 'Inactive / Suspended', value: inactiveSchools, color: '#ef4444' },
  ];

  const growthTrend = [
    { label: '2021', value: 2 },
    { label: '2022', value: 5 },
    { label: '2023', value: 9 },
    { label: '2024', value: 16 },
    { label: '2025', value: 24 },
  ];

  const columns = [
    {
      header: 'School Name & Code',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{row.logo || '🏫'}</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.schoolCode} • Est. {row.establishedYear}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Principal / Head',
      accessor: 'principal',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Enrollment',
      accessor: 'studentsCount',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <strong>{val?.toLocaleString()}</strong> students
          <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>{row.teachersCount} teachers</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenSchool(row)}
            title="Open School Admin Dashboard"
          >
            <ExternalLink size={13} />
            <span>Launch</span>
          </button>
          <button
            className={`btn btn-sm ${row.status === 'Active' ? 'btn-outline' : 'btn-success'}`}
            onClick={() => handleToggleStatus(id)}
            title={row.status === 'Active' ? 'Deactivate School' : 'Activate School'}
          >
            <Power size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={28} color="var(--primary)" />
            Super Admin Control Center
          </h1>
          <p className="page-subtitle">
            Global multi-school monitoring, institution onboarding and system statistics
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add New School</span>
        </button>
      </div>

      {/* Top Aggregated Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Schools Managed"
          value={totalSchools}
          icon={Building2}
          color="indigo"
          subtitle={`${activeSchools} Active • ${inactiveSchools} Inactive`}
        />
        <StatCard
          title="Total Students (Global)"
          value={totalStudents.toLocaleString()}
          icon={Users}
          color="emerald"
          trend="+18%"
          trendPositive={true}
        />
        <StatCard
          title="Total Teachers (Global)"
          value={totalTeachers.toLocaleString()}
          icon={GraduationCap}
          color="sky"
          trend="+12%"
          trendPositive={true}
        />
        <StatCard
          title="Total Staff Personnel"
          value={totalStaff.toLocaleString()}
          icon={Briefcase}
          color="purple"
          subtitle="Non-teaching operations"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">School Student Capacity & Enrollment</h3>
            <span className="badge badge-primary">Current Term</span>
          </div>
          <BarChart data={schoolChartData} height={200} color="#6366f1" />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Institution Status</h3>
          </div>
          <DonutChart data={statusDonutData} size={150} />
        </div>
      </div>

      {/* Schools DataTable */}
      <DataTable
        title="Managed Schools Directory"
        subtitle="List of all registered educational campuses on the platform"
        columns={columns}
        data={schools}
        searchKeys={['name', 'schoolCode', 'principal', 'email']}
        pageSize={5}
      />

      {/* Add School Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New School"
        subtitle="Onboard a new educational campus into the CRM platform"
        size="lg"
      >
        <form onSubmit={handleAddSchoolSubmit}>
          <div className="grid-2">
            <FormInput
              label="School Name"
              required
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              placeholder="e.g. Cambridge International School"
            />
            <FormInput
              label="Unique School ID / Code"
              value={newSchool.schoolCode}
              onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
              placeholder="e.g. CIS-505"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Principal / Head Name"
              required
              value={newSchool.principal}
              onChange={(e) => setNewSchool({ ...newSchool, principal: e.target.value })}
              placeholder="e.g. Dr. Eleanor Vance"
            />
            <FormInput
              label="Official Contact Email"
              type="email"
              value={newSchool.email}
              onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
              placeholder="contact@cambridge.edu"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newSchool.phone}
              onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
              placeholder="+1 (555) 000-1122"
            />
            <Select
              label="Board / Affiliation"
              value={newSchool.affiliation}
              onChange={(e) => setNewSchool({ ...newSchool, affiliation: e.target.value })}
              options={['CBSE / State Board', 'ICSE / Cambridge', 'IB World School', 'Other State Board']}
            />
          </div>

          <Textarea
            label="Campus Address"
            value={newSchool.address}
            onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
            placeholder="Full postal address with district and zip code"
            rows={2}
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register School
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
