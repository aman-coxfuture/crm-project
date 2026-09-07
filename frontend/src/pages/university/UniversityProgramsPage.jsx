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

export default function UniversityProgramsPage() {
  const { addToast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPgm, setSelectedPgm] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level: 'Postgraduate',
    duration: '2 Years',
    departments: 'Advanced Computing',
    totalIntake: 120,
    status: 'Active',
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await courseService.getUniversityPrograms();
      setPrograms(data || []);
    } catch (err) {
      addToast('Failed to load university programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newPgm = await courseService.createUniversityProgram(formData);
      setPrograms([...programs, newPgm]);
      setIsAddOpen(false);
      addToast(`Program "${formData.name}" sanctioned`, 'success');
    } catch (err) {
      addToast('Failed to sanction program', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await courseService.deleteUniversityProgram(selectedPgm.id);
      setPrograms(programs.filter((p) => p.id !== selectedPgm.id));
      setIsDeleteOpen(false);
      addToast('Program deleted', 'error');
    } catch (err) {
      addToast('Failed to delete program', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Academic Program Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Code: {row.code} • {row.duration}</div>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Program Level',
      render: (row) => <Badge variant="outline">{row.level}</Badge>,
    },
    {
      key: 'departments',
      label: 'Participating Departments',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.departments}</span>,
    },
    {
      key: 'totalIntake',
      label: 'Annual Intake',
      render: (row) => <strong>{row.totalIntake} Seats</strong>,
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
          onClick={() => { setSelectedPgm(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Program"
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
          <h1 className="page-title">University Academic Programs & Degrees</h1>
          <p className="page-subtitle">Central curriculum registry for Doctoral, Medical, Legal, and STEM degrees</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Sanction New Program
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={programs}
        title="Sanctioned Academic Programs"
        subtitle="Approved degree programs offered across affiliated colleges"
        searchPlaceholder="Search programs..."
        searchKeys={['name', 'code', 'level', 'departments']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Program"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Sanction Academic Program"
        subtitle="University Senate Academic Council Approval"
      >
        <div className="grid-2">
          <Input
            label="Program Title"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Master of Science in Data Science & AI"
          />
          <Input
            label="Program Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="MSC-DSAI"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Academic Level"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            options={['Undergraduate', 'Postgraduate', 'Doctoral', 'Medical Professional', 'Postgraduate Law']}
          />
          <Input
            label="Program Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="2 Years (4 Semesters)"
          />
        </div>
        <Input
          label="Offering Departments"
          value={formData.departments}
          onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
          placeholder="Computer Science, Mathematics, Statistics"
        />
        <Input
          label="Total University Sanctioned Seats"
          type="number"
          value={formData.totalIntake}
          onChange={(e) => setFormData({ ...formData, totalIntake: Number(e.target.value) })}
        />
      </FormModal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Academic Program"
        itemName={selectedPgm?.name}
      />
    </div>
  );
}
