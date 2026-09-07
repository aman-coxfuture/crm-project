import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { examService } from '../../services';

export default function CollegeExamsPage() {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Autonomous SEE',
    semester: 'All Semesters',
    startDate: '',
    endDate: '',
    status: 'Upcoming',
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getCollegeExams();
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
      const newExam = await examService.createCollegeExam(formData);
      setExams([...exams, newExam]);
      setIsAddOpen(false);
      addToast(`Examination schedule "${formData.title}" published`, 'success');
    } catch (err) {
      addToast('Failed to publish exam', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await examService.deleteCollegeExam(selectedExam.id);
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
      label: 'Exam Schedule Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.type}</div>
        </div>
      ),
    },
    {
      key: 'semester',
      label: 'Applicable Semesters',
      render: (row) => <span>{row.semester}</span>,
    },
    {
      key: 'startDate',
      label: 'Dates',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.startDate} → {row.endDate}</span>,
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
          <h1 className="page-title">Autonomous Examination Cell</h1>
          <p className="page-subtitle">Schedule Semester End Examinations (SEE), CIE internal assessments, and lab evaluations</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Schedule Examination
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={exams}
        title="College Examination Master"
        subtitle="Manage VTU/Autonomous affiliated examination cycles"
        searchPlaceholder="Search exams..."
        searchKeys={['title', 'type', 'semester']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Create Exam Schedule"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Create Exam Cycle"
        subtitle="Autonomous SEE / CIE schedule"
      >
        <Input
          label="Examination Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Even Semester SEE May-June 2027"
        />
        <div className="grid-2">
          <Select
            label="Examination Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['Autonomous SEE', 'Continuous Internal Evaluation (CIE)', 'Lab Practical & Viva', 'Backlog / Supplementary']}
          />
          <Input
            label="Eligible Semesters"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="Sem 3, Sem 5, Sem 7"
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
