import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  School,
  GraduationCap,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  Download,
  Activity
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard, { BarChart, DonutChart } from '../../components/dashboard/ChartCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityList from '../../components/dashboard/ActivityList';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { institutionService, analyticsService } from '../../services';
import { useToast } from '../../context/ToastContext';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [institutions, setInstitutions] = useState([]);
  const [stats, setStats] = useState({
    totalInstitutions: 8,
    totalSchools: 3,
    totalColleges: 3,
    totalUniversities: 2,
    totalStudents: 46790,
    totalFaculty: 2388,
    activeInstitutions: 6,
    pendingInstitutions: 1,
    inactiveInstitutions: 1,
  });
  const [growthData, setGrowthData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'School',
    admin: '',
    email: '',
    phone: '',
    location: '',
    plan: 'Standard',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [instList, analytics] = await Promise.all([
      institutionService.getInstitutions(),
      analyticsService.getSuperAdminAnalytics(),
    ]);
    setInstitutions(instList);
    setStats(analytics.stats);
    setGrowthData(analytics.growthData);
    setActivities(analytics.recentActivities);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: 'School',
      admin: '',
      email: '',
      phone: '',
      location: '',
      plan: 'Standard',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (inst) => {
    setSelectedInst(inst);
    setFormData({ ...inst });
    setIsEditOpen(true);
  };

  const handleOpenView = (inst) => {
    setSelectedInst(inst);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (inst) => {
    setSelectedInst(inst);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (inst) => {
    const updated = await institutionService.toggleStatus(inst.id);
    setInstitutions((prev) =>
      prev.map((i) => (i.id === inst.id ? { ...i, status: updated.status } : i))
    );
    addToast(`${inst.name} is now ${updated.status}`, 'info');
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const created = await institutionService.createInstitution(formData);
    setInstitutions([created, ...institutions]);
    setIsAddOpen(false);
    addToast(`Institution "${formData.name}" registered successfully`, 'success');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const updated = await institutionService.updateInstitution(selectedInst.id, formData);
    setInstitutions((prev) =>
      prev.map((i) => (i.id === selectedInst.id ? { ...i, ...updated } : i))
    );
    setIsEditOpen(false);
    addToast(`Institution updated successfully`, 'success');
  };

  const handleConfirmDelete = async () => {
    await institutionService.deleteInstitution(selectedInst.id);
    setInstitutions((prev) => prev.filter((i) => i.id !== selectedInst.id));
    setIsDeleteOpen(false);
    addToast(`Institution deleted`, 'error');
  };

  const donutData = [
    { label: 'Schools', value: institutions.filter((i) => i.type === 'School').length, color: '#111827' },
    { label: 'Colleges', value: institutions.filter((i) => i.type === 'College').length, color: '#6b7280' },
    { label: 'Universities', value: institutions.filter((i) => i.type === 'University').length, color: '#9ca3af' },
  ];

  const barChartData = [
    { label: 'Jan', value: 24, secondary: 12 },
    { label: 'Feb', value: 28, secondary: 16 },
    { label: 'Mar', value: 34, secondary: 20 },
    { label: 'Apr', value: 40, secondary: 26 },
    { label: 'May', value: 48, secondary: 32 },
    { label: 'Jun', value: 56, secondary: 38 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Dashboard</h1>
          <p className="page-subtitle">Multi-tenant system monitoring, institutional control & telemetry</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Download} onClick={() => addToast('System audit log exported', 'info')}>
            Export Audit
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Institution
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <QuickActions
        actions={[
          { label: 'Register New Institution', icon: Plus, onClick: handleOpenAdd },
          { label: 'View All Institutions', icon: Building2, onClick: () => navigate('/super-admin/institutions') },
          { label: 'System Analytics', icon: Activity, onClick: () => navigate('/super-admin/analytics') },
          { label: 'Global Notice Dispatch', icon: ShieldCheck, onClick: () => navigate('/super-admin/notices') },
        ]}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Institutions" value={institutions.length} subtitle="Managed globally" icon={Building2} change="+2 this month" />
        <StatCard title="Total Schools" value={institutions.filter((i) => i.type === 'School').length} subtitle="K-12 Institutes" icon={School} />
        <StatCard title="Total Colleges" value={institutions.filter((i) => i.type === 'College').length} subtitle="Degree Colleges" icon={Building2} />
        <StatCard title="Total Universities" value={institutions.filter((i) => i.type === 'University').length} subtitle="Central & State" icon={GraduationCap} />
        <StatCard title="Total Students" value={stats.totalStudents?.toLocaleString() || '46,790'} subtitle="Across all tenants" icon={Users} change="+8.4% YoY" />
        <StatCard title="Total Faculty & Staff" value={stats.totalFaculty?.toLocaleString() || '2,388'} subtitle="Active educators" icon={UserCheck} />
        <StatCard title="Active Tenants" value={institutions.filter((i) => i.status === 'Active').length} subtitle="Healthy status" icon={CheckCircle2} />
        <StatCard title="Pending Review" value={institutions.filter((i) => i.status === 'Pending').length} subtitle="Awaiting compliance" icon={Clock} />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Tenant Growth Trend"
          subtitle="Monthly active student and institutional onboarding"
        >
          <BarChart data={barChartData} height={170} />
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#111827', borderRadius: 2 }} /> Institutions
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: 2 }} /> Admins
            </span>
          </div>
        </ChartCard>

        <ChartCard
          title="Institution Distribution"
          subtitle="Proportion of registered tenant categories"
        >
          <DonutChart data={donutData} size={140} />
        </ChartCard>
      </div>

      {/* Main Table & Activity Stream */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Quick Institution Management */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Institutions
              </h2>
              <p className="text-xs text-muted">Direct management and status control</p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/super-admin/institutions')}>
              View All
            </Button>
          </div>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Type</th>
                  <th>Admin</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.slice(0, 5).map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inst.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{inst.location}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{inst.type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{inst.admin}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{inst.email}</div>
                    </td>
                    <td>
                      <strong>{inst.students.toLocaleString()}</strong>
                    </td>
                    <td>
                      <Badge variant={inst.status}>{inst.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenView(inst)}
                          className="btn-ghost btn-icon"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(inst)}
                          className="btn-ghost btn-icon"
                          title="Edit Institution"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(inst)}
                          className="btn-ghost btn-icon"
                          title={inst.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(inst)}
                          className="btn-ghost btn-icon"
                          title="Delete Institution"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent System Activities</h2>
          </div>
          <ActivityList activities={activities} />
        </div>
      </div>

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register New Institution"
        subtitle="Add a new School, College, or University to the central CRM"
        submitLabel="Create Institution"
      >
        <div className="grid-2">
          <Input
            label="Institution Name"
            required
            placeholder="e.g. Cambridge Senior Secondary"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Institution Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['School', 'College', 'University']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Head Administrator Name"
            required
            placeholder="Dr. Rajesh / Prof. Sharma"
            value={formData.admin}
            onChange={(e) => setFormData({ ...formData, admin: e.target.value })}
          />
          <Input
            label="Official Contact Email"
            type="email"
            required
            placeholder="admin@school.edu.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Phone Number"
            placeholder="+91 98112 00000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Campus Location (City, State)"
            placeholder="New Delhi, Delhi"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <Select
          label="Subscription Plan"
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
          options={['Basic', 'Standard', 'Enterprise', 'Ultra Enterprise']}
        />
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Institution Details"
        subtitle={selectedInst?.name}
        submitLabel="Save Changes"
      >
        <div className="grid-2">
          <Input
            label="Institution Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Institution Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['School', 'College', 'University']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Head Administrator"
            required
            value={formData.admin}
            onChange={(e) => setFormData({ ...formData, admin: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedInst?.name || 'Institution Details'}
        subtitle={`System ID: ${selectedInst?.id} • Code: ${selectedInst?.code}`}
        data={selectedInst || {}}
        fields={[
          { label: 'Institution Name', key: 'name' },
          { label: 'Institution Type', key: 'type' },
          { label: 'Head Administrator', key: 'admin' },
          { label: 'Official Email', key: 'email' },
          { label: 'Contact Phone', key: 'phone' },
          { label: 'Location', key: 'location' },
          { label: 'Total Enrolled Students', key: 'students', render: (v) => v?.toLocaleString() },
          { label: 'Total Faculty & Staff', key: 'faculty', render: (v) => v?.toLocaleString() },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Subscription Plan', key: 'plan' },
          { label: 'Onboarded Date', key: 'createdDate' },
        ]}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Institution Tenant"
        itemName={selectedInst?.name}
        message="Are you sure you want to permanently remove this institution and all affiliated student and faculty records from the central CRM?"
      />
    </div>
  );
}
