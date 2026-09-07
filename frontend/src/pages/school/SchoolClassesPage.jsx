import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { classService } from '../../services';

export default function SchoolClassesPage() {
  const { addToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    grade: '10',
    section: 'C',
    room: 'Room 206 (Wing B)',
    classTeacher: 'Mrs. Rekha Menon',
    maxCapacity: 45,
    stream: 'General',
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getSchoolClasses();
      setClasses(data || []);
    } catch (err) {
      addToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newClass = await classService.createSchoolClass(formData);
      setClasses([...classes, newClass]);
      setIsAddOpen(false);
      addToast(`Class ${newClass.name} created`, 'success');
    } catch (err) {
      addToast('Failed to create class', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await classService.deleteSchoolClass(selectedClass.id);
      setClasses(classes.filter((c) => c.id !== selectedClass.id));
      setIsDeleteOpen(false);
      addToast('Class section deleted', 'error');
    } catch (err) {
      addToast('Failed to delete class', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Class & Section',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.stream}</div>
        </div>
      ),
    },
    {
      key: 'classTeacher',
      label: 'Class Teacher',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.classTeacher}</span>,
    },
    {
      key: 'room',
      label: 'Assigned Classroom',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.room}</span>,
    },
    {
      key: 'totalStudents',
      label: 'Enrolled / Capacity',
      render: (row) => (
        <span>
          <strong>{row.totalStudents}</strong> / {row.maxCapacity} students
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => { setSelectedClass(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Section"
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
          <h1 className="page-title">Classes & Sections Management</h1>
          <p className="page-subtitle">Configure academic grade levels, rooms, and class teacher allocations</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Create Section
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        title="Active Grade Divisions"
        subtitle="Manage room allotments and batch sizes"
        searchPlaceholder="Search classes by grade, teacher, room..."
        searchKeys={['name', 'classTeacher', 'room', 'stream']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Class Section"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Create Class Division"
        subtitle="Configure section parameters"
      >
        <div className="grid-2">
          <Select
            label="Grade Level"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
          />
          <Select
            label="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            options={['A', 'B', 'C', 'D', 'E']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Assigned Classroom"
            required
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Room 204"
          />
          <Input
            label="Class Teacher Name"
            required
            value={formData.classTeacher}
            onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Maximum Seating Capacity"
            type="number"
            value={formData.maxCapacity}
            onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
          />
          <Select
            label="Academic Stream"
            value={formData.stream}
            onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
            options={['General', 'Science (PCM/B)', 'Commerce', 'Humanities / Arts']}
          />
        </div>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class Section"
        itemName={selectedClass?.name}
      />
    </div>
  );
}
