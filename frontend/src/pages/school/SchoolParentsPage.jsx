import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Eye } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { parentService } from '../../services';

export default function SchoolParentsPage() {
  const { addToast } = useToast();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    ward: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
  });

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await parentService.getSchoolParents();
      setParents(data || []);
    } catch (err) {
      addToast('Failed to load parents directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newParent = await parentService.createSchoolParent(formData);
      setParents([...parents, newParent]);
      setIsAddOpen(false);
      addToast(`Parent "${formData.name}" added to directory`, 'success');
    } catch (err) {
      addToast('Failed to add parent', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Parent / Guardian Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.occupation}</div>
        </div>
      ),
    },
    {
      key: 'ward',
      label: 'Student Ward',
      render: (row) => <strong>{row.ward}</strong>,
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.phone}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.email}</span>,
    },
    {
      key: 'address',
      label: 'Residential Address',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{row.address}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Parents & Guardians Directory</h1>
          <p className="page-subtitle">Parent contact registry, emergency phone numbers, and PTM records</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Parent Contact
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={parents}
        title="Registered Parents"
        subtitle="Manage guardian communication and parent-teacher meeting notifications"
        searchPlaceholder="Search parent name, student ward, phone..."
        searchKeys={['name', 'ward', 'phone', 'email', 'occupation']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Parent"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add Parent / Guardian Record"
        subtitle="School contact directory"
      >
        <div className="grid-2">
          <Input
            label="Parent Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sanjay Sharma"
          />
          <Input
            label="Student Ward & Class"
            required
            value={formData.ward}
            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            placeholder="Aarav Sharma (Class 10A)"
          />
        </div>
        <div className="grid-2">
          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98100 00000"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="parent@domain.com"
          />
        </div>
        <div className="grid-2">
          <Input
            label="Occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            placeholder="Civil Engineer"
          />
          <Input
            label="Residential Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Rohini Sec 14, Delhi"
          />
        </div>
      </FormModal>
    </div>
  );
}
