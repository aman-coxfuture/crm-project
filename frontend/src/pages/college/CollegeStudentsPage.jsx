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
import { studentService } from '../../services';

export default function CollegeStudentsPage() {
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
    usn: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 1',
    cgpa: '9.00',
    email: '',
    phone: '',
    admissionCategory: 'Merit (KCET)',
    status: 'Active',
    feeStatus: 'Paid',
    attendance: '95.0%',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getCollegeStudents();
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
      usn: `1HV26CS0${students.length + 10}`,
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      semester: 'Semester 1',
      cgpa: '9.00',
      email: '',
      phone: '',
      admissionCategory: 'Merit (KCET)',
      status: 'Active',
      feeStatus: 'Paid',
      attendance: '100%',
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
      const newStu = await studentService.createStudent(formData, 'college');
      setStudents([newStu, ...students]);
      setIsAddOpen(false);
      addToast(`College student "${formData.name}" enrolled successfully`, 'success');
    } catch (err) {
      addToast('Failed to enroll student', 'error');
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
      addToast('Student record deleted', 'error');
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
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>USN: {row.usn}</div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course & Semester',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.course}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.semester} • {row.department}</div>
        </div>
      ),
    },
    {
      key: 'cgpa',
      label: 'Cumulative CGPA',
      render: (row) => <strong>{row.cgpa} / 10</strong>,
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (row) => <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{row.attendance}</span>,
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
          <h1 className="page-title">College Students Roster</h1>
          <p className="page-subtitle">Undergraduate and Postgraduate degree enrollment records</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Register Student
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={students}
        title="Enrolled Undergraduates & Postgraduates"
        subtitle="Filter by department, academic course, and fee clearance"
        searchPlaceholder="Search by name, USN, course, email..."
        searchKeys={['name', 'usn', 'course', 'department', 'email']}
        filters={[
          { key: 'course', label: 'Course', options: ['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Marketing & Finance)'] },
          { key: 'feeStatus', label: 'Fee Status', options: ['Paid', 'Pending', 'Overdue'] },
          { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="Add Student"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register College Student"
        subtitle="Create student profile & USN mapping"
      >
        <div className="grid-2">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Aditya Venkatesh"
          />
          <Input
            label="University Seat Number (USN)"
            required
            value={formData.usn}
            onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Electronics & Communication', 'Mechanical Engineering', 'Management Studies']}
          />
          <Select
            label="Course"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            options={['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Marketing & Finance)']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Contact Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@college.edu"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 94480 00000"
          />
        </div>
        <div className="grid-2">
          <Input
            label="CGPA"
            value={formData.cgpa}
            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
          />
          <Select
            label="Admission Category"
            value={formData.admissionCategory}
            onChange={(e) => setFormData({ ...formData, admissionCategory: e.target.value })}
            options={['Merit (KCET)', 'Merit (COMEDK)', 'Management Quota', 'PGCET Merit']}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit College Student"
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
            label="USN"
            value={formData.usn}
            onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Course"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            options={['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Marketing & Finance)']}
          />
          <Input
            label="CGPA"
            value={formData.cgpa}
            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedStudent?.name || 'Student Record'}
        subtitle={`USN: ${selectedStudent?.usn}`}
        data={selectedStudent || {}}
        fields={[
          { label: 'Student Name', key: 'name' },
          { label: 'USN', key: 'usn' },
          { label: 'Course', key: 'course' },
          { label: 'Department', key: 'department' },
          { label: 'Semester', key: 'semester' },
          { label: 'Cumulative CGPA', key: 'cgpa' },
          { label: 'Attendance', key: 'attendance' },
          { label: 'Admission Category', key: 'admissionCategory' },
          { label: 'Fee Status', key: 'feeStatus', render: (v) => <Badge variant={v}>{v}</Badge> },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
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
