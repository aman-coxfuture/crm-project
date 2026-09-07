import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { researchService } from '../../services';

export default function UniversityResearchersPage() {
  const { addToast } = useToast();
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRsc, setSelectedRsc] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    scholarName: '',
    fellowship: 'CSIR-JRF Fellow',
    guide: '',
    department: 'Quantum Physics',
    thesisTopic: '',
    year: 'Year 1 (Ph.D.)',
    status: 'Active',
  });

  const fetchResearchers = async () => {
    try {
      setLoading(true);
      const data = await researchService.getResearchers();
      setResearchers(data || []);
    } catch (err) {
      addToast('Failed to load researchers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchers();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newRsc = await researchService.createResearcher(formData);
      setResearchers([...researchers, newRsc]);
      setIsAddOpen(false);
      addToast(`Researcher "${formData.scholarName}" enrolled in Doctoral Programme`, 'success');
    } catch (err) {
      addToast('Failed to enroll researcher', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await researchService.deleteResearcher(selectedRsc.id);
      setResearchers(researchers.filter((r) => r.id !== selectedRsc.id));
      setIsDeleteOpen(false);
      addToast('Scholar record removed', 'error');
    } catch (err) {
      addToast('Failed to delete researcher', 'error');
    }
  };

  const columns = [
    {
      key: 'scholarName',
      label: 'Ph.D. Scholar & Fellowship',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.scholarName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.fellowship}</div>
        </div>
      ),
    },
    {
      key: 'thesisTopic',
      label: 'Doctoral Thesis Investigation',
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          {row.thesisTopic}
        </span>
      ),
    },
    {
      key: 'guide',
      label: 'Research Supervisor',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.guide}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Standing Year',
      render: (row) => <span>{row.year}</span>,
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
          onClick={() => { setSelectedRsc(row); setIsDeleteOpen(true); }}
          className="btn-ghost btn-icon"
          title="Delete Scholar"
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
          <h1 className="page-title">Doctoral Researchers & Ph.D. Scholars</h1>
          <p className="page-subtitle">Track research fellowships, supervisor allotments, and thesis viva milestones</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Enrol Ph.D. Scholar
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={researchers}
        title="Doctoral Scholars Roster"
        subtitle="Manage PMRF, CSIR-NET, and UGC research fellows"
        searchPlaceholder="Search scholar, supervisor, topic..."
        searchKeys={['scholarName', 'guide', 'thesisTopic', 'department', 'fellowship']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Enrol Scholar"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Enrol Doctoral Scholar"
        subtitle="Ph.D. Candidate Supervisor Allocation"
      >
        <div className="grid-2">
          <Input
            label="Scholar Full Name"
            required
            value={formData.scholarName}
            onChange={(e) => setFormData({ ...formData, scholarName: e.target.value })}
            placeholder="e.g. Arunav Sengupta"
          />
          <Select
            label="Fellowship Scheme"
            value={formData.fellowship}
            onChange={(e) => setFormData({ ...formData, fellowship: e.target.value })}
            options={['Prime Minister Research Fellow (PMRF)', 'CSIR-JRF Fellow', 'DBT-BET Fellow', 'UGC-NET SRF', 'University Research Scholar (URS)']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Research Supervisor (Guide)"
            required
            value={formData.guide}
            onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
            placeholder="Prof. Dr. Name"
          />
          <Input
            label="Academic Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <Input
          label="Doctoral Thesis Topic / Abstract"
          required
          value={formData.thesisTopic}
          onChange={(e) => setFormData({ ...formData, thesisTopic: e.target.value })}
          placeholder="Research investigation synopsis"
        />
      </FormModal>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Scholar Record"
        itemName={selectedRsc?.scholarName}
      />
    </div>
  );
}
