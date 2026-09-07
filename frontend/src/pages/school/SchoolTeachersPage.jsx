import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services';

export default function SchoolTeachersPage() {
  const { addToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    subject: 'Mathematics',
    qualification: '',
    classesAssigned: '',
    email: '',
    phone: '',
    experience: '5 Years',
    status: 'Active',
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getSchoolTeachers();
      setTeachers(data || []);
    } catch (err) {
      addToast('Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      empId: `T-10${teachers.length + 1}`,
      subject: 'Mathematics',
      qualification: 'M.Sc., B.Ed.',
      classesAssigned: 'Class 9A, 10A',
      email: '',
      phone: '',
      experience: '5 Years',
      status: 'Active',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTeacher(t);
    setFormData({ ...t });
    setIsEditOpen(true);
  };

  const handleOpenView = (t) => {
    setSelectedTeacher(t);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (t) => {
    setSelectedTeacher(t);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newTeacher = await teacherService.createSchoolTeacher({
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
      });
      setTeachers([newTeacher, ...teachers]);
      setIsAddOpen(false);
      addToast(`Teacher "${formData.name}" added successfully`, 'success');
    } catch (err) {
      addToast('Failed to add teacher', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await teacherService.updateSchoolTeacher(selectedTeacher.id, formData);
      setTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? updated : t))
      );
      setIsEditOpen(false);
      addToast('Teacher record updated', 'success');
    } catch (err) {
      addToast('Failed to update teacher', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await teacherService.deleteSchoolTeacher(selectedTeacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
      setIsDeleteOpen(false);
      addToast('Teacher record removed', 'error');
    } catch (err) {
      addToast('Failed to remove teacher', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Teacher Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Emp ID: {row.empId} • {row.qualification}</div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Primary Subject',
      render: (row) => <strong>{row.subject}</strong>,
    },
    {
      key: 'classesAssigned',
      label: 'Classes Assigned',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.classesAssigned}</span>,
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12.5px' }}>{row.email}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.phone}</div>
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
          <h1 className="page-title">School Teaching Faculty</h1>
          <p className="page-subtitle">Faculty roster, subject allocations, and classroom assignments</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Teacher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        title="Faculty Directory"
        subtitle="Manage educators and academic workload"
        searchPlaceholder="Search by name, subject, emp ID..."
        searchKeys={['name', 'subject', 'empId', 'email', 'classesAssigned']}
        filters={[
          { key: 'subject', label: 'Subject', options: ['Mathematics', 'Physics', 'English Literature', 'Chemistry', 'Computer Science & AI', 'Social Science & History'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Add Teacher"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add Faculty Member"
        subtitle="School teaching staff registration"
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Smt. Vandana Kaushik"
          />
          <Input
            label="Employee ID"
            value={formData.empId}
            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Primary Subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <Input
            label="Qualifications"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            placeholder="M.Sc. Physics, B.Ed."
          />
        </div>
        <Input
          label="Classes Assigned"
          value={formData.classesAssigned}
          onChange={(e) => setFormData({ ...formData, classesAssigned: e.target.value })}
          placeholder="Class 10A, 10B, 12A"
        />
        <div className="grid-2">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="teacher@school.edu"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98711 00000"
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Teacher Information"
        subtitle={selectedTeacher?.name}
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Employee ID"
            value={formData.empId}
            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Primary Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <Input
            label="Qualifications"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          />
        </div>
        <Input
          label="Classes Assigned"
          value={formData.classesAssigned}
          onChange={(e) => setFormData({ ...formData, classesAssigned: e.target.value })}
        />
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedTeacher?.name || 'Teacher Profile'}
        subtitle={`Emp ID: ${selectedTeacher?.empId}`}
        data={selectedTeacher || {}}
        fields={[
          { label: 'Full Name', key: 'name' },
          { label: 'Employee ID', key: 'empId' },
          { label: 'Primary Subject', key: 'subject' },
          { label: 'Qualifications', key: 'qualification' },
          { label: 'Classes Assigned', key: 'classesAssigned' },
          { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' },
          { label: 'Teaching Experience', key: 'experience' },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Joining Date', key: 'joinDate' },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Teacher Record"
        itemName={selectedTeacher?.name}
      />
    </div>
  );
}
