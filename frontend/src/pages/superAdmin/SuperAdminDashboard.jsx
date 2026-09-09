import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import { BarChart, DonutChart } from '../../components/common/Charts';
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
  Bus,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { changeSchool, switchRole } = useAuth();
  const { success, info } = useToast();

  const [schools, setSchools] = useState(() => schoolDataService.getSchools());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);

  const [newSchool, setNewSchool] = useState({
    name: '',
    schoolCode: '',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliation: 'CBSE Board',
    establishedYear: '2020',
  });

  // Aggregated platform stats across all registered schools
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
      affiliation: 'CBSE Board',
      establishedYear: '2020',
    });
    success(`School "${created.name}" registered successfully!`);
  };

  const schoolChartData = schools.map((s) => ({
    label: s.name.split(' ')[0],
    value: s.studentsCount || 0,
    color: '#4f46e5',
  }));

  const statusDonutData = [
    { label: 'Active Schools', value: activeSchools, color: '#10b981' },
    { label: 'Inactive Schools', value: inactiveSchools, color: '#ef4444' },
  ];

  const columns = [
    {
      header: 'School Name & ID',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>{row.logo || '🏫'}</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {row.id} • Code: {row.schoolCode} • Est. {row.establishedYear}
            </div>
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
      header: 'Enrollment & Staff',
      accessor: 'studentsCount',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <strong>{val?.toLocaleString()}</strong> students
          <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
            {row.teachersCount} teachers • {row.staffCount || 15} staff
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedSchoolDetails(row)}
            title="View School Details"
          >
            <Eye size={13} />
            <span>Details</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenSchool(row)}
            title="Launch School Admin Dashboard"
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
            Global multi-school monitoring, institution directory, platform statistics and school launching
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Register New School</span>
        </button>
      </div>

      {/* Top Aggregated Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Schools"
          value={totalSchools}
          icon={Building2}
          color="indigo"
          subtitle={`${activeSchools} Active • ${inactiveSchools} Inactive`}
        />
        <StatCard
          title="Total Students (Platform)"
          value={totalStudents.toLocaleString()}
          icon={Users}
          color="emerald"
          trend="+18%"
          trendPositive={true}
        />
        <StatCard
          title="Total Teachers (Platform)"
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
            <h3 className="card-title">School Enrollment Comparison</h3>
            <span className="badge badge-primary">Current Session</span>
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
        title="Registered Schools Directory"
        subtitle="Manage and inspect individual schools across the multi-tenant platform"
        columns={columns}
        data={schools}
        searchKeys={['name', 'id', 'schoolCode', 'principal', 'email']}
        pageSize={6}
      />

      {/* VIEW SCHOOL DETAILS MODAL (Requirement #11) */}
      <Modal
        isOpen={!!selectedSchoolDetails}
        onClose={() => setSelectedSchoolDetails(null)}
        title={selectedSchoolDetails ? `${selectedSchoolDetails.name} — School Details` : 'School Details'}
        subtitle={`School ID: ${selectedSchoolDetails?.id} • Affiliation: ${selectedSchoolDetails?.affiliation || 'CBSE Board'}`}
        size="lg"
      >
        {selectedSchoolDetails && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '2.5rem' }}>{selectedSchoolDetails.logo || '🏫'}</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedSchoolDetails.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Established {selectedSchoolDetails.establishedYear || '2005'} • Session: {selectedSchoolDetails.academicSession || '2025-2026'}
                  </div>
                </div>
              </div>

              <StatusBadge status={selectedSchoolDetails.status} />
            </div>

            {/* School Attributes Grid */}
            <div className="grid-3" style={{ gap: '12px', marginBottom: '20px' }}>
              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>SCHOOL ID</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px', color: 'var(--primary)' }}>
                  {selectedSchoolDetails.id}
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>PRINCIPAL / HEAD</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
                  {selectedSchoolDetails.principal}
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>CONTACT EMAIL</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                  {selectedSchoolDetails.email}
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>TOTAL STUDENTS</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '2px', color: '#10b981' }}>
                  {selectedSchoolDetails.studentsCount} Students
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>TEACHERS</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '2px', color: '#06b6d4' }}>
                  {selectedSchoolDetails.teachersCount} Teachers
                </div>
              </div>

              <div className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>STAFF & DRIVERS</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '2px', color: '#8b5cf6' }}>
                  {selectedSchoolDetails.staffCount || 22} Staff Personnel
                </div>
              </div>
            </div>

            {/* Address & Contact */}
            <div className="card" style={{ padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px' }}>
                CAMPUS ADDRESS & PHONE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                <div>📍 {selectedSchoolDetails.address || '452 Elmwood Avenue, North District'}</div>
                <div>📞 {selectedSchoolDetails.phone || '+1 (555) 234-5678'}</div>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSchoolDetails(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleOpenSchool(selectedSchoolDetails);
                  setSelectedSchoolDetails(null);
                }}
              >
                <ExternalLink size={15} />
                <span>Launch School Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add School Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New School"
        subtitle="Onboard a new educational campus into the platform"
        size="lg"
      >
        <form onSubmit={handleAddSchoolSubmit}>
          <div className="grid-2">
            <FormInput
              label="School Name"
              required
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              placeholder="e.g. Cambridge High School"
            />
            <FormInput
              label="Unique School ID / Code"
              value={newSchool.schoolCode}
              onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
              placeholder="e.g. CHS-505"
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
              options={['CBSE Board', 'ICSE Board', 'State Board', 'Cambridge / IB']}
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
