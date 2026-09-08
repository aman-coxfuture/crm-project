import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Briefcase, Plus, Eye, DollarSign, Mail, Phone, Calendar } from 'lucide-react';

export default function StaffPage() {
  const { success } = useToast();
  const [staff, setStaff] = useState(() => schoolDataService.getStaff());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Administration',
    designation: 'Office Executive',
    salary: '$36,000/yr',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.name) return;
    const created = schoolDataService.addStaff(newStaff);
    setStaff(schoolDataService.getStaff());
    setIsAddModalOpen(false);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      department: 'Administration',
      designation: 'Office Executive',
      salary: '$36,000/yr',
    });
    success(`Staff member ${created.name} added!`);
  };

  const columns = [
    {
      header: 'Staff Member & ID',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={val}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.id} • {row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Designation / Role',
      accessor: 'designation',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      sortable: true,
    },
    {
      header: 'Annual Salary',
      accessor: 'salary',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={26} color="var(--primary)" />
            Staff & Non-Teaching Personnel Management
          </h1>
          <p className="page-subtitle">
            Manage accountants, librarians, receptionists, security, lab technicians and office staff
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      <DataTable
        title="Support Staff Directory"
        subtitle={`Total ${staff.length} staff members on campus`}
        columns={columns}
        data={staff}
        searchKeys={['name', 'id', 'email', 'department', 'designation']}
        filterOptions={[
          { label: 'Department', key: 'department', options: ['Finance & Accounts', 'Front Office', 'Library', 'Laboratories', 'Security & Campus', 'Administration'] },
          { label: 'Status', key: 'status', options: ['Active', 'On Leave'] },
        ]}
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Staff Member"
        subtitle="Add non-teaching operational personnel to school records"
      >
        <form onSubmit={handleAddSubmit}>
          <FormInput
            label="Staff Full Name"
            required
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            placeholder="e.g. Walter White"
          />
          <div className="grid-2">
            <FormInput
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              placeholder="walter@school.edu"
            />
            <FormInput
              label="Phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              placeholder="+1 (555) 234-5678"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={newStaff.department}
              onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
              options={['Finance & Accounts', 'Front Office', 'Library', 'Laboratories', 'Security & Campus', 'Administration']}
            />
            <FormInput
              label="Designation"
              value={newStaff.designation}
              onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
              placeholder="e.g. Head Librarian"
            />
          </div>

          <FormInput
            label="Salary"
            value={newStaff.salary}
            onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
            placeholder="$42,000/yr"
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Personnel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
