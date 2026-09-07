import React, { useState, useEffect } from 'react';
import { Building2, Plus, Eye, Edit2, Trash2, Power, Download } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { institutionService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function InstitutionsPage() {
  const { addToast } = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const list = await institutionService.getInstitutions();
    setInstitutions(list);
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
    addToast(`Institution "${formData.name}" added successfully`, 'success');
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

  const columns = [
    {
      key: 'name',
      label: 'Institution Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.code} • {row.location}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: 'admin',
      label: 'Head Administrator',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.admin}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Students',
      render: (row) => <strong>{row.students.toLocaleString()}</strong>,
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.plan}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => handleOpenView(row)}
            className="btn-ghost btn-icon"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="btn-ghost btn-icon"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className="btn-ghost btn-icon"
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <Power size={14} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="btn-ghost btn-icon"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Institution Management</h1>
          <p className="page-subtitle">Central registry of Schools, Colleges, and Universities</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Institution
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={institutions}
        title="Registered Institutions"
        subtitle="Filter by institution classification and subscription status"
        searchPlaceholder="Search by name, location, code, or admin..."
        searchKeys={['name', 'location', 'code', 'admin', 'email']}
        filters={[
          { key: 'type', label: 'Type', options: ['School', 'College', 'University'] },
          { key: 'status', label: 'Status', options: ['Active', 'Pending', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Add Institution"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register New Institution"
        subtitle="Provision a dedicated tenancy"
      >
        <div className="grid-2">
          <Input
            label="Institution Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Greenwood International School"
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
            label="Administrator Name"
            required
            value={formData.admin}
            onChange={(e) => setFormData({ ...formData, admin: e.target.value })}
            placeholder="Dr. / Prof. Name"
          />
          <Input
            label="Official Contact Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@domain.edu"
          />
        </div>
        <div className="grid-2">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98112 00000"
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, State"
          />
        </div>
        <Select
          label="Subscription Tier"
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
        title="Edit Institution"
        subtitle={selectedInst?.name}
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
            label="Administrator"
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
        <Select
          label="Plan"
          value={formData.plan}
          onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
          options={['Basic', 'Standard', 'Enterprise', 'Ultra Enterprise']}
        />
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedInst?.name || 'Institution Details'}
        subtitle={`ID: ${selectedInst?.id} • Code: ${selectedInst?.code}`}
        data={selectedInst || {}}
        fields={[
          { label: 'Name', key: 'name' },
          { label: 'Type', key: 'type' },
          { label: 'Administrator', key: 'admin' },
          { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' },
          { label: 'Location', key: 'location' },
          { label: 'Students', key: 'students', render: (v) => v?.toLocaleString() },
          { label: 'Faculty', key: 'faculty', render: (v) => v?.toLocaleString() },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Plan', key: 'plan' },
          { label: 'Created Date', key: 'createdDate' },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Institution"
        itemName={selectedInst?.name}
      />
    </div>
  );
}
