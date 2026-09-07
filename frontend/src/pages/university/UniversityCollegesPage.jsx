import React, { useState, useEffect } from 'react';
import { Building2, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { institutionService } from '../../services';

export default function UniversityCollegesPage() {
  const { addToast } = useToast();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCol, setSelectedCol] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Constituent Campus College',
    code: '',
    dean: '',
    location: '',
    programsOffered: 10,
    students: 1500,
    faculty: 100,
    accreditation: 'NAAC A+++',
    status: 'Active',
  });

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const data = await institutionService.getUniversityColleges();
      setColleges(data || []);
    } catch (err) {
      addToast('Failed to load affiliated colleges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: 'Constituent Campus College',
      code: `UNIV-COL-0${colleges.length + 1}`,
      dean: '',
      location: 'University Campus',
      programsOffered: 8,
      students: 1200,
      faculty: 80,
      accreditation: 'NBA Tier-1, NAAC A+++',
      status: 'Active',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (col) => {
    setSelectedCol(col);
    setFormData({ ...col });
    setIsEditOpen(true);
  };

  const handleOpenView = (col) => {
    setSelectedCol(col);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (col) => {
    setSelectedCol(col);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newCol = await institutionService.createUniversityCollege(formData);
      setColleges([...colleges, newCol]);
      setIsAddOpen(false);
      addToast(`College/Institute "${formData.name}" affiliated successfully`, 'success');
    } catch (err) {
      addToast('Failed to affiliate college', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await institutionService.updateUniversityCollege(selectedCol.id, formData);
      setColleges(colleges.map((c) => (c.id === selectedCol.id ? updated : c)));
      setIsEditOpen(false);
      addToast('Affiliated institute details updated', 'success');
    } catch (err) {
      addToast('Failed to update institute details', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await institutionService.deleteUniversityCollege(selectedCol.id);
      setColleges(colleges.filter((c) => c.id !== selectedCol.id));
      setIsDeleteOpen(false);
      addToast('Institute removed', 'error');
    } catch (err) {
      addToast('Failed to delete institute', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'College / Institute Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.code} • {row.location}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Affiliation Type',
      render: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: 'dean',
      label: 'Dean / Principal',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.dean}</span>,
    },
    {
      key: 'students',
      label: 'Enrolled Strength',
      render: (row) => (
        <span>
          <strong>{row.students.toLocaleString()}</strong> students ({row.faculty} faculty)
        </span>
      ),
    },
    {
      key: 'accreditation',
      label: 'Accreditation',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.accreditation}</span>,
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
          <button onClick={() => handleOpenView(row)} className="btn-ghost btn-icon" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => handleOpenEdit(row)} className="btn-ghost btn-icon" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleOpenDelete(row)} className="btn-ghost btn-icon" title="Delete">
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
          <h1 className="page-title">Constituent & Affiliated Colleges</h1>
          <p className="page-subtitle">Governance directory of university campuses, autonomous institutes, and specialized centers</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Affiliate Institute
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={colleges}
        title="University Institutes Directory"
        subtitle="Manage affiliated campus accreditations and seat capacities"
        searchPlaceholder="Search institute by name, dean, location..."
        searchKeys={['name', 'dean', 'location', 'type', 'code']}
        filters={[
          { key: 'type', label: 'Type', options: ['Constituent Campus College', 'Constituent Medical College', 'Affiliated Autonomous Institute', 'Constituent Science Institute', 'Affiliated Business School'] },
          { key: 'status', label: 'Status', options: ['Active', 'Pending Review', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Add Institute"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Affiliate New College / Institute"
        subtitle="Provision institute within university framework"
      >
        <div className="grid-2">
          <Input
            label="Institute Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Institute of Pharmaceutical Sciences"
          />
          <Select
            label="Affiliation Category"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['Constituent Campus College', 'Constituent Medical College', 'Affiliated Autonomous Institute', 'Constituent Science Institute', 'Affiliated Business School']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Dean / Principal In-Charge"
            required
            value={formData.dean}
            onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
            placeholder="Prof. Dr. Name"
          />
          <Input
            label="Campus Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="South Campus, Hyderabad"
          />
        </div>
        <div className="grid-2">
          <Input
            label="Accreditation / Approvals"
            value={formData.accreditation}
            onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
            placeholder="PCI Approved, NAAC A++"
          />
          <Input
            label="Total Student Capacity"
            type="number"
            value={formData.students}
            onChange={(e) => setFormData({ ...formData, students: Number(e.target.value) })}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Institute Details"
        subtitle={selectedCol?.name}
      >
        <Input
          label="Institute Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="grid-2">
          <Input
            label="Dean"
            value={formData.dean}
            onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
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
        title={selectedCol?.name || 'Institute Profile'}
        subtitle={`Code: ${selectedCol?.code}`}
        data={selectedCol || {}}
        fields={[
          { label: 'Institute Name', key: 'name' },
          { label: 'Affiliation Type', key: 'type' },
          { label: 'Dean / Principal', key: 'dean' },
          { label: 'Campus Location', key: 'location' },
          { label: 'Accreditation', key: 'accreditation' },
          { label: 'Programs Offered', key: 'programsOffered', render: (v) => `${v} Degree Programs` },
          { label: 'Enrolled Students', key: 'students', render: (v) => v?.toLocaleString() },
          { label: 'Teaching Faculty', key: 'faculty', render: (v) => v?.toLocaleString() },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Affiliation"
        itemName={selectedCol?.name}
      />
    </div>
  );
}
