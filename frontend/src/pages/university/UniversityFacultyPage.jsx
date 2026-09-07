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

export default function UniversityFacultyPage() {
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
    designation: 'Professor & Dean',
    department: 'Computer Science & Engineering',
    college: 'Apex Inst. of Technology',
    email: '',
    phone: '',
    status: 'Active',
  });

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getUniversityFaculty();
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
      empId: `UNIV-P-0${faculty.length + 15}`,
      designation: 'Professor & Dean',
      department: 'Computer Science & Engineering',
      college: 'Apex Inst. of Technology',
      email: '',
      phone: '',
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
      const newFac = await facultyService.createUniversityFaculty(formData);
      setFaculty([...faculty, newFac]);
      setIsAddOpen(false);
      addToast(`Chair Professor "${formData.name}" added`, 'success');
    } catch (err) {
      addToast('Failed to add faculty member', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await facultyService.updateUniversityFaculty(selectedFac.id, formData);
      setFaculty(faculty.map((f) => (f.id === selectedFac.id ? updated : f)));
      setIsEditOpen(false);
      addToast('Faculty details updated', 'success');
    } catch (err) {
      addToast('Failed to update faculty details', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await facultyService.deleteUniversityFaculty(selectedFac.id);
      setFaculty(faculty.filter((f) => f.id !== selectedFac.id));
      setIsDeleteOpen(false);
      addToast('Faculty record removed', 'error');
    } catch (err) {
      addToast('Failed to delete faculty record', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Professor / Dean Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.empId}</div>
        </div>
      ),
    },
    {
      key: 'designation',
      label: 'Designation & Role',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.designation}</span>,
    },
    {
      key: 'college',
      label: 'Constituent Institute & Dept',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12.5px' }}>{row.college}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email & Contact',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12.5px' }}>{row.email}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.phone}</div>
        </div>
      ),
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
          <h1 className="page-title">University Faculty & Deans</h1>
          <p className="page-subtitle">Central registry of Senior Chair Professors, Deans, and Academic Council Members</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Faculty Chair
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={faculty}
        title="University Academic Leadership"
        subtitle="Manage professors, department chairs, and faculty deans"
        searchPlaceholder="Search faculty by name, department, college..."
        searchKeys={['name', 'department', 'college', 'designation', 'email']}
        onAdd={handleOpenAdd}
        addLabel="Add Chair Professor"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register University Professor"
        subtitle="Chair Professor & Dean Appointment"
      >
        <div className="grid-2">
          <Input
            label="Professor Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Prof. Dr. Name"
          />
          <Input
            label="Employee ID"
            value={formData.empId}
            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
          <Input
            label="Constituent College"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Faculty Record"
        subtitle={selectedFac?.name}
      >
        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="grid-2">
          <Input
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedFac?.name || 'Faculty Profile'}
        subtitle={`ID: ${selectedFac?.empId}`}
        data={selectedFac || {}}
        fields={[
          { label: 'Name', key: 'name' },
          { label: 'Designation', key: 'designation' },
          { label: 'Department', key: 'department' },
          { label: 'Constituent College', key: 'college' },
          { label: 'Official Email', key: 'email' },
          { label: 'Phone', key: 'phone' },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Faculty Record"
        itemName={selectedFac?.name}
      />
    </div>
  );
}
