import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { courseService } from '../../services';

export default function CollegeCoursesPage() {
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    degree: 'Undergraduate',
    duration: '4 Years (8 Semesters)',
    department: 'CSE',
    feePerYear: '₹ 2,00,000',
    seats: 120,
    status: 'Active',
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCollegeCourses();
      setCourses(data || []);
    } catch (err) {
      addToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newCourse = await courseService.createCollegeCourse(formData);
      setCourses([...courses, newCourse]);
      setIsAddOpen(false);
      addToast(`Course "${formData.name}" added`, 'success');
    } catch (err) {
      addToast('Failed to add course', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await courseService.deleteCollegeCourse(selectedCourse.id);
      setCourses(courses.filter((c) => c.id !== selectedCourse.id));
      setIsDeleteOpen(false);
      addToast('Degree course deleted', 'error');
    } catch (err) {
      addToast('Failed to delete course', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Course Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Code: {row.code} • {row.duration}</div>
        </div>
      ),
    },
    {
      key: 'degree',
      label: 'Level',
      render: (row) => <Badge variant="outline">{row.degree}</Badge>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.department}</span>,
    },
    {
      key: 'feePerYear',
      label: 'Annual Tuition',
      render: (row) => <strong>{row.feePerYear}</strong>,
    },
    {
      key: 'seats',
      label: 'Sanctioned Seats',
      render: (row) => <span>{row.seats} Seats</span>,
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
        <button
          onClick={() => { setSelectedCourse(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Course"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Degree Programs & Courses</h1>
          <p className="page-subtitle">Configure approved degree curricula, durations, and sanctioned seat matrices</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Degree Program
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        title="Sanctioned Degree Programs"
        subtitle="Manage Undergraduate and Postgraduate curriculums"
        searchPlaceholder="Search courses..."
        searchKeys={['name', 'code', 'degree', 'department']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Program"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Add Degree Program"
        subtitle="Register new curriculum"
      >
        <div className="grid-2">
          <Input
            label="Program Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. B.Tech in Cyber Security"
          />
          <Input
            label="Course Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="BTECH-CYBER"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Degree Level"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            options={['Undergraduate', 'Postgraduate', 'Doctoral']}
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Annual Tuition Fee (₹)"
            value={formData.feePerYear}
            onChange={(e) => setFormData({ ...formData, feePerYear: e.target.value })}
            placeholder="₹ 2,25,000"
          />
          <Input
            label="Total Sanctioned Intake (Seats)"
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
          />
        </div>
      </FormModal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Degree Program"
        itemName={selectedCourse?.name}
      />
    </div>
  );
}
