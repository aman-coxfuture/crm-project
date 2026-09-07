import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services';

export default function SchoolStudentsPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    class: 'Class 10',
    section: 'A',
    rollNo: '',
    email: '',
    phone: '',
    guardian: '',
    guardianPhone: '',
    attendance: '95.0%',
    feeStatus: 'Paid',
    status: 'Active',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getSchoolStudents();
      setStudents(data || []);
    } catch (err) {
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      class: 'Class 10',
      section: 'A',
      rollNo: `10-A-${students.length + 1}`,
      email: '',
      phone: '',
      guardian: '',
      guardianPhone: '',
      attendance: '100%',
      feeStatus: 'Paid',
      status: 'Active',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setSelectedStudent(stu);
    setFormData({ ...stu });
    setIsEditOpen(true);
  };

  const handleOpenView = (stu) => {
    setSelectedStudent(stu);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (stu) => {
    setSelectedStudent(stu);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newStu = await studentService.createStudent({
        ...formData,
        admissionDate: new Date().toISOString().split('T')[0],
      }, 'school');
      setStudents((prev) => [newStu, ...prev]);
      setIsAddOpen(false);
      addToast(`Student "${formData.name}" enrolled successfully`, 'success');
    } catch (err) {
      addToast('Failed to enrol student', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await studentService.updateStudent(selectedStudent.id, formData);
      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudent.id ? updated : s))
      );
      setIsEditOpen(false);
      addToast('Student details updated', 'success');
    } catch (err) {
      addToast('Failed to update student', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await studentService.deleteStudent(selectedStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setIsDeleteOpen(false);
      addToast('Student record removed', 'error');
    } catch (err) {
      addToast('Failed to delete student', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Student Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • Roll: {row.rollNo}</div>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class & Section',
      render: (row) => <span>{row.class} - {row.section}</span>,
    },
    {
      key: 'guardian',
      label: 'Guardian & Contact',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12.5px' }}>{row.guardian}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.guardianPhone || row.phone}</div>
        </div>
      ),
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.attendance}</strong>,
    },
    {
      key: 'feeStatus',
      label: 'Fee Status',
      render: (row) => <Badge variant={row.feeStatus}>{row.feeStatus}</Badge>,
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
          <button onClick={() => handleOpenView(row)} className="btn-ghost btn-icon" title="View Profile">
            <Eye size={14} />
          </button>
          <button onClick={() => handleOpenEdit(row)} className="btn-ghost btn-icon" title="Edit Student">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleOpenDelete(row)} className="btn-ghost btn-icon" title="Delete Student">
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
          <h1 className="page-title">School Students Directory</h1>
          <p className="page-subtitle">Enrolled student roster, admission data, guardian details, and academic status</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Student
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={students}
        title="Student Roster"
        subtitle="Filter by class, section, and fee payment status"
        searchPlaceholder="Search by name, ID, roll number, or guardian..."
        searchKeys={['name', 'id', 'rollNo', 'guardian', 'email', 'class']}
        filters={[
          { key: 'class', label: 'Class', options: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
          { key: 'feeStatus', label: 'Fee Status', options: ['Paid', 'Pending', 'Overdue'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Enrol Student"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Enrol New Student"
        subtitle="Register academic record into School CRM"
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Student Name"
          />
          <Input
            label="Roll Number"
            value={formData.rollNo}
            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
            placeholder="e.g. 10-A-01"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            options={['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
          />
          <Select
            label="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            options={['A', 'B', 'C', 'D']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Guardian Full Name"
            required
            value={formData.guardian}
            onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
            placeholder="Parent/Guardian Name"
          />
          <Input
            label="Guardian Phone"
            required
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            placeholder="+91 98100 00000"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Fee Status"
            value={formData.feeStatus}
            onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
            options={['Paid', 'Pending', 'Overdue']}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={['Active', 'Inactive']}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Student Record"
        subtitle={selectedStudent?.name}
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Roll Number"
            value={formData.rollNo}
            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            options={['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
          />
          <Select
            label="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            options={['A', 'B', 'C', 'D']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Guardian Name"
            value={formData.guardian}
            onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
          />
          <Input
            label="Guardian Phone"
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Fee Status"
            value={formData.feeStatus}
            onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
            options={['Paid', 'Pending', 'Overdue']}
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
        title={selectedStudent?.name || 'Student Profile'}
        subtitle={`ID: ${selectedStudent?.id} • Roll: ${selectedStudent?.rollNo}`}
        data={selectedStudent || {}}
        fields={[
          { label: 'Student Name', key: 'name' },
          { label: 'Class & Section', key: 'class', render: (v, d) => `${v} - Section ${d.section}` },
          { label: 'Roll Number', key: 'rollNo' },
          { label: 'Email', key: 'email' },
          { label: 'Student Phone', key: 'phone' },
          { label: 'Guardian Name', key: 'guardian' },
          { label: 'Guardian Phone', key: 'guardianPhone' },
          { label: 'Attendance Average', key: 'attendance' },
          { label: 'Fee Payment Status', key: 'feeStatus', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Account Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Admission Date', key: 'admissionDate' },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Student Record"
        itemName={selectedStudent?.name}
      />
    </div>
  );
}
