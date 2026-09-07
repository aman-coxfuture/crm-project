import React, { useState, useEffect } from 'react';
import { Award, Plus, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { examService } from '../../services';

export default function SchoolExamsPage() {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    classes: 'Class 9 to 12',
    startDate: '',
    endDate: '',
    type: 'Written Assessment',
    status: 'Upcoming',
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getSchoolExams();
      setExams(data || []);
    } catch (err) {
      addToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newExam = await examService.createSchoolExam(formData);
      setExams([...exams, newExam]);
      setIsAddOpen(false);
      addToast(`Exam schedule "${formData.title}" published`, 'success');
    } catch (err) {
      addToast('Failed to publish exam schedule', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await examService.deleteSchoolExam(selectedExam.id);
      setExams(exams.filter((e) => e.id !== selectedExam.id));
      setIsDeleteOpen(false);
      addToast('Exam schedule deleted', 'error');
    } catch (err) {
      addToast('Failed to delete exam', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Exam Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.type}</div>
        </div>
      ),
    },
    {
      key: 'classes',
      label: 'Applicable Classes',
      render: (row) => <span>{row.classes}</span>,
    },
    {
      key: 'startDate',
      label: 'Schedule Timeline',
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          {row.startDate} → {row.endDate}
        </span>
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
        <button
          onClick={() => { setSelectedExam(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Schedule"
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
          <h1 className="page-title">School Examinations & Assessments</h1>
          <p className="page-subtitle">Publish examination schedules, hall tickets, and midterm/annual grade assessments</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Create Exam Schedule
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={exams}
        title="Assessment Calendar"
        subtitle="Manage upcoming evaluation rounds and CBSE board prep"
        searchPlaceholder="Search exam title, class..."
        searchKeys={['title', 'classes', 'type']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Schedule Exam"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Create Exam Schedule"
        subtitle="Schedule assessment cycle"
      >
        <Input
          label="Examination Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Half-Yearly Examination 2026"
        />
        <div className="grid-2">
          <Input
            label="Eligible Classes"
            value={formData.classes}
            onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
            placeholder="Class 9 to 12"
          />
          <Select
            label="Evaluation Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['Offline Theory', 'Written Assessment', 'Practical / VIVA', 'Board Pattern']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Start Date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </FormModal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Examination Schedule"
        itemName={selectedExam?.title}
      />
    </div>
  );
}
