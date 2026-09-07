import React, { useState, useEffect } from 'react';
import { Users, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { userService } from '../../services';
import { useToast } from '../../context/ToastContext';

export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'School Admin',
    institution: 'Delhi Public Int. School',
    status: 'Active',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await userService.getUsers();
    setUsers(list);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      role: 'School Admin',
      institution: 'Delhi Public Int. School',
      status: 'Active',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setIsEditOpen(true);
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const created = await userService.createUser(formData);
    setUsers([created, ...users]);
    setIsAddOpen(false);
    addToast(`User ${formData.name} provisioned successfully`, 'success');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const updated = await userService.updateUser(selectedUser.id, formData);
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updated } : u))
    );
    setIsEditOpen(false);
    addToast('User details updated', 'success');
  };

  const handleConfirmDelete = async () => {
    await userService.deleteUser(selectedUser.id);
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setIsDeleteOpen(false);
    addToast('User account revoked', 'error');
  };

  const columns = [
    {
      key: 'name',
      label: 'User Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Assigned Role',
      render: (row) => (
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'institution',
      label: 'Institution Scope',
      render: (row) => <Badge variant="outline">{row.institution}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      key: 'lastLogin',
      label: 'Last Active',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{row.lastLogin}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => handleOpenView(row)} className="btn-ghost btn-icon" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => handleOpenEdit(row)} className="btn-ghost btn-icon" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleOpenDelete(row)} className="btn-ghost btn-icon" title="Revoke">
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
          <h1 className="page-title">Users & Administrators Directory</h1>
          <p className="page-subtitle">Manage role-based access control and tenant operator credentials</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        title="Active CRM Users"
        subtitle="Filter by administrative privileges and account status"
        searchPlaceholder="Search users by name, email, role..."
        searchKeys={['name', 'email', 'role', 'institution']}
        filters={[
          { key: 'role', label: 'Role', options: ['Super Admin', 'School Admin', 'College Admin', 'University Admin', 'System Auditor'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Provision User"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Provision New CRM User"
        subtitle="Assign roles and scoped permissions"
      >
        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Dr. Rajesh Sharma"
        />
        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@domain.edu"
        />
        <div className="grid-2">
          <Select
            label="Role Permission"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={['Super Admin', 'School Admin', 'College Admin', 'University Admin', 'System Auditor']}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={['Active', 'Inactive']}
          />
        </div>
        <Input
          label="Assigned Institution Scope"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          placeholder="Institution Name or System Wide"
        />
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit User Details"
        subtitle={selectedUser?.name}
      >
        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <div className="grid-2">
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={['Super Admin', 'School Admin', 'College Admin', 'University Admin', 'System Auditor']}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={['Active', 'Inactive']}
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedUser?.name || 'User Details'}
        subtitle={`User ID: ${selectedUser?.id}`}
        data={selectedUser || {}}
        fields={[
          { label: 'Full Name', key: 'name' },
          { label: 'Email', key: 'email' },
          { label: 'Role', key: 'role' },
          { label: 'Assigned Scope', key: 'institution' },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Last Active', key: 'lastLogin' },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Revoke User Access"
        itemName={selectedUser?.name}
      />
    </div>
  );
}
