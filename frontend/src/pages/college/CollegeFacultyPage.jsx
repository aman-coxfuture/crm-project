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
import { useToast } from '../../context/ToastContext';
import { facultyService } from '../../services';

export default function CollegeFacultyPage() {
  const { addToast } = useToast();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFac, setSelectedFac] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    qualification: '',
    specialization: '',
    email: '',
    phone: '',
    experience: '5 Years',
    publications: 0,
    status: 'Active',
  });

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getCollegeFaculty();
      setFaculty(data || []);
    } catch (err) {
      addToast('Failed to load faculty', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      empId: `FAC-CS-0${faculty.length + 5}`,
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      qualification: 'M.Tech, Ph.D. Pursuing',
      specialization: 'Artificial Intelligence',
      email: '',
      phone: '',
      experience: '5 Years',
      publications: 2,
      status: 'Active',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (f) => {
    setSelectedFac(f);
    setFormData({ ...f });
    setIsEditOpen(true);
  };

  const handleOpenView = (f) => {
    setSelectedFac(f);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (f) => {
    setSelectedFac(f);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newFac = await facultyService.createCollegeFaculty(formData);
      setFaculty([newFac, ...faculty]);
      setIsAddOpen(false);
      addToast(`Faculty member "${formData.name}" added successfully`, 'success');
    } catch (err) {
      addToast('Failed to add faculty member', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await facultyService.updateCollegeFaculty(selectedFac.id, formData);
      setFaculty((prev) =>
        prev.map((f) => (f.id === selectedFac.id ? updated : f))
      );
      setIsEditOpen(false);
      addToast('Faculty profile updated', 'success');
    } catch (err) {
      addToast('Failed to update faculty profile', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await facultyService.deleteCollegeFaculty(selectedFac.id);
      setFaculty((prev) => prev.filter((f) => f.id !== selectedFac.id));
      setIsDeleteOpen(false);
      addToast('Faculty member record removed', 'error');
    } catch (err) {
      addToast('Failed to delete faculty record', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Faculty Member',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.empId} • {row.qualification}</div>
        </div>
      ),
    },
    {
      key: 'designation',
      label: 'Designation & Dept',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.designation}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Research Specialization',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.specialization}</span>,
    },
    {
      key: 'publications',
      label: 'Papers / Scopus',
      render: (row) => <strong>{row.publications} Papers</strong>,
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
          <h1 className="page-title">College Faculty Directory</h1>
          <p className="page-subtitle">Professors, Assistant Professors, and departmental researchers</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Faculty Member
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={faculty}
        title="Teaching & Research Faculty"
        subtitle="Manage faculty assignments, qualifications, and publications"
        searchPlaceholder="Search faculty by name, department, specialization..."
        searchKeys={['name', 'empId', 'department', 'specialization', 'designation']}
        filters={[
          { key: 'department', label: 'Department', options: ['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Electronics & Communication', 'Mechanical Engineering', 'Management Studies'] },
          { key: 'designation', label: 'Designation', options: ['Professor & Head of Department', 'Professor', 'Associate Professor', 'Assistant Professor'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Add Faculty"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add Faculty Member"
        subtitle="Register professor or lecturer"
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Ramesh Chandran"
          />
          <Input
            label="Employee ID"
            value={formData.empId}
            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            options={['Professor & Head of Department', 'Professor', 'Associate Professor', 'Assistant Professor']}
          />
          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Electronics & Communication', 'Mechanical Engineering', 'Management Studies']}
          />
        </div>
        <Input
          label="Research Specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          placeholder="e.g. Distributed Systems & Cloud Architecture"
        />
        <div className="grid-2">
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="faculty@college.edu"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 94490 00000"
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Faculty Member"
        subtitle={selectedFac?.name}
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            options={['Professor & Head of Department', 'Professor', 'Associate Professor', 'Assistant Professor']}
          />
        </div>
        <Input
          label="Specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        />
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedFac?.name || 'Faculty Details'}
        subtitle={`Emp ID: ${selectedFac?.empId}`}
        data={selectedFac || {}}
        fields={[
          { label: 'Name', key: 'name' },
          { label: 'Designation', key: 'designation' },
          { label: 'Department', key: 'department' },
          { label: 'Qualifications', key: 'qualification' },
          { label: 'Specialization', key: 'specialization' },
          { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' },
          { label: 'Experience', key: 'experience' },
          { label: 'Published Papers', key: 'publications', render: (v) => `${v} Journal Papers` },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Faculty Member"
        itemName={selectedFac?.name}
      />
    </div>
  );
}
