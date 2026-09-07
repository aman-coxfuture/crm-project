import React, { useState, useEffect } from 'react';
import { Microscope, Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import DeleteModal from '../../components/modals/DeleteModal';
import ViewModal from '../../components/modals/ViewModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { researchService } from '../../services';

export default function UniversityResearchPage() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    pi: '',
    coPi: '',
    department: 'Department of Quantum Physics & Computing',
    fundingAgency: 'DST - Department of Science and Technology',
    grantAmount: '₹ 3,50,00,000',
    duration: '2026 - 2029 (3 Years)',
    status: 'Ongoing',
    publicationsCount: 0,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await researchService.getResearchProjects();
      setProjects(data || []);
    } catch (err) {
      addToast('Failed to load research projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      pi: '',
      coPi: '',
      department: 'Department of Quantum Physics & Computing',
      fundingAgency: 'DST - Department of Science and Technology',
      grantAmount: '₹ 3,50,00,000',
      duration: '2026 - 2029 (3 Years)',
      status: 'Ongoing',
      publicationsCount: 0,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedProject(p);
    setFormData({ ...p });
    setIsEditOpen(true);
  };

  const handleOpenView = (p) => {
    setSelectedProject(p);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (p) => {
    setSelectedProject(p);
    setIsDeleteOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newPrj = await researchService.createResearchProject(formData);
      setProjects([newPrj, ...projects]);
      setIsAddOpen(false);
      addToast(`Sponsored project "${formData.title}" registered`, 'success');
    } catch (err) {
      addToast('Failed to register research project', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await researchService.updateResearchProject(selectedProject.id, formData);
      setProjects(projects.map((p) => (p.id === selectedProject.id ? updated : p)));
      setIsEditOpen(false);
      addToast('Research project updated', 'success');
    } catch (err) {
      addToast('Failed to update research project', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await researchService.deleteResearchProject(selectedProject.id);
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setIsDeleteOpen(false);
      addToast('Project record archived', 'error');
    } catch (err) {
      addToast('Failed to delete research project', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Research Project Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '300px' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.department}</div>
        </div>
      ),
    },
    {
      key: 'pi',
      label: 'Principal Investigator (PI)',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.pi}</div>
          {row.coPi && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Co-PI: {row.coPi}</div>}
        </div>
      ),
    },
    {
      key: 'fundingAgency',
      label: 'Funding Agency',
      render: (row) => <Badge variant="outline">{row.fundingAgency.split('-')[0]}</Badge>,
    },
    {
      key: 'grantAmount',
      label: 'Sanctioned Grant',
      render: (row) => <strong>{row.grantAmount}</strong>,
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
          <button onClick={() => handleOpenDelete(row)} className="btn-ghost btn-icon" title="Archive">
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
          <h1 className="page-title">Sponsored Research & Grants (UCAR)</h1>
          <p className="page-subtitle">Track multi-crore national research projects funded by DST, DBT, SERB, and ICMR</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Register Research Grant
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        title="Funded Research Projects"
        subtitle="Manage government and industry sponsored research grants"
        searchPlaceholder="Search project title, PI, funding agency..."
        searchKeys={['title', 'pi', 'fundingAgency', 'department']}
        filters={[
          { key: 'status', label: 'Status', options: ['Ongoing', 'In Final Review', 'Completed'] },
        ]}
        onAdd={handleOpenAdd}
        addLabel="New Grant"
      />

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register Sponsored Research Grant"
        subtitle="Funded R&D Project Registration"
      >
        <Input
          label="Project Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Research investigation title"
        />
        <div className="grid-2">
          <Input
            label="Principal Investigator (PI)"
            required
            value={formData.pi}
            onChange={(e) => setFormData({ ...formData, pi: e.target.value })}
            placeholder="Prof. Dr. Name"
          />
          <Input
            label="Co-Principal Investigator (Co-PI)"
            value={formData.coPi}
            onChange={(e) => setFormData({ ...formData, coPi: e.target.value })}
            placeholder="Dr. Name (Optional)"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Funding Agency"
            value={formData.fundingAgency}
            onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
            options={['DST - Department of Science and Technology', 'DBT - Department of Biotechnology', 'ICMR - Indian Council of Medical Research', 'SERB & PowerGrid Industry Grant', 'CSIR Research Council']}
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Grant Sanctioned (₹)"
            required
            value={formData.grantAmount}
            onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
            placeholder="₹ 4,80,00,000"
          />
          <Input
            label="Project Timeline"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="2026 - 2029 (3 Years)"
          />
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEdit}
        title="Edit Research Grant"
        subtitle={selectedProject?.title}
      >
        <Input
          label="Project Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <div className="grid-2">
          <Input
            label="Principal Investigator (PI)"
            value={formData.pi}
            onChange={(e) => setFormData({ ...formData, pi: e.target.value })}
          />
          <Input
            label="Grant (₹)"
            value={formData.grantAmount}
            onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedProject?.title || 'Research Grant Dossier'}
        subtitle={`Grant ID: ${selectedProject?.id}`}
        data={selectedProject || {}}
        fields={[
          { label: 'Project Title', key: 'title' },
          { label: 'Principal Investigator', key: 'pi' },
          { label: 'Co-Principal Investigator', key: 'coPi' },
          { label: 'Department', key: 'department' },
          { label: 'Funding Agency', key: 'fundingAgency' },
          { label: 'Grant Sanctioned', key: 'grantAmount' },
          { label: 'Project Duration', key: 'duration' },
          { label: 'Journal Publications', key: 'publicationsCount', render: (v) => `${v || 0} Peer-reviewed Papers` },
          { label: 'Project Status', key: 'status', render: (v) => <Badge variant={v}>{v}</Badge> },
        ]}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Research Project"
        itemName={selectedProject?.title}
      />
    </div>
  );
}
