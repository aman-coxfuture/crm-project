import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, BookOpen, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { departmentService } from '../../services';

export default function CollegeDepartmentsPage() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hod: '',
    facultyCount: 20,
    studentCount: 300,
    intake: 120,
    labs: 4,
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getCollegeDepartments();
      setDepartments(data || []);
    } catch (err) {
      addToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newDept = await departmentService.createCollegeDepartment(formData);
      setDepartments([...departments, newDept]);
      setIsAddOpen(false);
      addToast(`Department "${formData.name}" established`, 'success');
    } catch (err) {
      addToast('Failed to add department', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await departmentService.deleteCollegeDepartment(selectedDept.id);
      setDepartments(departments.filter((d) => d.id !== selectedDept.id));
      setIsDeleteOpen(false);
      addToast('Department deleted', 'error');
    } catch (err) {
      addToast('Failed to delete department', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Code: {row.code} • {row.labs} Dedicated Laboratories</div>
        </div>
      ),
    },
    {
      key: 'hod',
      label: 'Head of Department (HOD)',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.hod}</span>,
    },
    {
      key: 'facultyCount',
      label: 'Faculty Count',
      render: (row) => <strong>{row.facultyCount} Professors</strong>,
    },
    {
      key: 'studentCount',
      label: 'Enrolled Students',
      render: (row) => <span>{row.studentCount} Students (Intake: {row.intake}/yr)</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => { setSelectedDept(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Department"
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
          <h1 className="page-title">College Academic Departments</h1>
          <p className="page-subtitle">Configure engineering wings, HOD leadership, and laboratory infrastructure</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Department
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        title="Departments & Laboratories"
        subtitle="Manage academic faculties and annual intake capacities"
        searchPlaceholder="Search departments by name, code, HOD..."
        searchKeys={['name', 'code', 'hod']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Create Department"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Establish New Department"
        subtitle="Create academic department and assign HOD"
      >
        <div className="grid-2">
          <Input
            label="Department Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Chemical Engineering"
          />
          <Input
            label="Department Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="CHEM"
          />
        </div>
        <div className="grid-2">
          <Input
            label="Head of Department (HOD)"
            required
            value={formData.hod}
            onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
            placeholder="Dr. Name"
          />
          <Input
            label="Annual Student Intake"
            type="number"
            value={formData.intake}
            onChange={(e) => setFormData({ ...formData, intake: Number(e.target.value) })}
          />
        </div>
      </FormModal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        itemName={selectedDept?.name}
      />
    </div>
  );
}
