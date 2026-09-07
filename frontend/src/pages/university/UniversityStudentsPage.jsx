import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
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

export default function UniversityStudentsPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStu, setSelectedStu] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    enrollmentNo: '',
    program: 'B.Tech CSE (Honours)',
    college: 'Apex Inst. of Technology',
    department: 'Computer Science',
    year: '1st Year',
    cgpa: '9.00',
    status: 'Active',
    feeStatus: 'Paid',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getUniversityStudents();
      setStudents(data || []);
    } catch (err) {
      addToast('Failed to load university students', 'error');
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
      enrollmentNo: `APEX2026-CS-0${students.length + 50}`,
      program: 'B.Tech CSE (Honours)',
      college: 'Apex Inst. of Technology',
      department: 'Computer Science',
      year: '1st Year',
      cgpa: '9.00',
      status: 'Active',
      feeStatus: 'Paid',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setSelectedStu(stu);
    setFormData({ ...stu });
    setIsEditOpen(true);
  };

  const handleOpenView = (stu) => {
    setSelectedStu(stu);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (stu) => {
    setSelectedStu(stu);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newStu = await studentService.createStudent(formData, 'university');
      setStudents([newStu, ...students]);
      setIsAddOpen(false);
      addToast(`University student "${formData.name}" enrolled`, 'success');
    } catch (err) {
      addToast('Failed to enroll student', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await studentService.updateStudent(selectedStu.id, formData);
      setStudents(students.map((s) => (s.id === selectedStu.id ? updated : s)));
      setIsEditOpen(false);
      addToast('Student enrollment record updated', 'success');
    } catch (err) {
      addToast('Failed to update student record', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await studentService.deleteStudent(selectedStu.id);
      setStudents(students.filter((s) => s.id !== selectedStu.id));
      setIsDeleteOpen(false);
      addToast('Student record removed', 'error');
    } catch (err) {
      addToast('Failed to delete student record', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Student Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Enrollment: {row.enrollmentNo}</div>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Enrolled Program',
      render: (row) => <strong>{row.program}</strong>,
    },
    {
      key: 'college',
      label: 'Campus / College',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12.5px' }}>{row.college}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Academic Year',
      render: (row) => <span>{row.year}</span>,
    },
    {
      key: 'cgpa',
      label: 'CGPA',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.cgpa}</span>,
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
          <h1 className="page-title">University Enrolled Students</h1>
          <p className="page-subtitle">Centralized student records across all constituent and affiliated colleges</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Enrol Student
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={students}
        title="Central Student Register"
        subtitle="Filter by constituent college and degree program"
        searchPlaceholder="Search student name, enrollment #, college..."
        searchKeys={['name', 'enrollmentNo', 'program', 'college', 'department']}
        onAdd={handleOpenAdd}
        addLabel="Add Student"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Enrol University Student"
        subtitle="Central enrollment registry"
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
            label="Central Enrollment Number"
            required
            value={formData.enrollmentNo}
            onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Select
            label="Degree Program"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            options={['B.Tech CSE (Honours)', 'M.Tech AI & Data Science', 'Doctor of Philosophy (Ph.D.)', 'MBBS (Clinical Year)', 'LL.M Corporate Law']}
          />
          <Select
            label="Constituent College / Institute"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            options={['Apex Inst. of Technology', 'School of Medical Sciences', 'National School of Law', 'School of Advanced Sciences']}
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Student Record"
        subtitle={selectedStu?.name}
      >
        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="grid-2">
          <Select
            label="Program"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            options={['B.Tech CSE (Honours)', 'M.Tech AI & Data Science', 'Doctor of Philosophy (Ph.D.)', 'MBBS (Clinical Year)', 'LL.M Corporate Law']}
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
        title={selectedStu?.name || 'Student Profile'}
        subtitle={`Enrollment: ${selectedStu?.enrollmentNo}`}
        data={selectedStu || {}}
        fields={[
          { label: 'Student Name', key: 'name' },
          { label: 'Enrollment No', key: 'enrollmentNo' },
          { label: 'Degree Program', key: 'program' },
          { label: 'Constituent College', key: 'college' },
          { label: 'Department', key: 'department' },
          { label: 'Year of Study', key: 'year' },
          { label: 'CGPA', key: 'cgpa' },
          { label: 'Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record"
        itemName={selectedStu?.name}
      />
    </div>
  );
}
