import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Check, X, Eye } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { admissionService } from '../../services';

export default function CollegeAdmissionsPage() {
  const { addToast } = useToast();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: '',
    appliedCourse: 'B.Tech CSE',
    entranceExam: 'KCET Rank 2,400',
    category: 'General Merit',
    status: 'Approved',
    verifiedDocs: 'All Verified',
  });

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const data = await admissionService.getCollegeAdmissions();
      setAdmissions(data || []);
    } catch (err) {
      addToast('Failed to load admissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newAdm = await admissionService.createCollegeAdmission(formData);
      setAdmissions([newAdm, ...admissions]);
      setIsAddOpen(false);
      addToast(`Application for "${formData.applicantName}" registered`, 'success');
    } catch (err) {
      addToast('Failed to register application', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await admissionService.updateCollegeAdmissionStatus(id, newStatus);
      setAdmissions(
        admissions.map((a) => (a.id === id ? updated : a))
      );
      addToast(`Application status updated to ${newStatus}`, 'info');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const columns = [
    {
      key: 'applicantName',
      label: 'Applicant Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.applicantName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • Applied: {row.applicationDate}</div>
        </div>
      ),
    },
    {
      key: 'appliedCourse',
      label: 'Applied Course',
      render: (row) => <strong>{row.appliedCourse}</strong>,
    },
    {
      key: 'entranceExam',
      label: 'Entrance Score / Rank',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.entranceExam}</span>,
    },
    {
      key: 'category',
      label: 'Quota / Category',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.category}</span>,
    },
    {
      key: 'status',
      label: 'Review Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {row.status !== 'Approved' && (
            <button
              onClick={() => handleStatusChange(row.id, 'Approved')}
              className="btn-ghost btn-icon"
              title="Approve Admission"
            >
              <Check size={14} />
            </button>
          )}
          {row.status !== 'Waitlisted' && (
            <button
              onClick={() => handleStatusChange(row.id, 'Waitlisted')}
              className="btn-ghost btn-icon"
              title="Waitlist"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College Admissions Desk 2026-27</h1>
          <p className="page-subtitle">Verify entrance merit ranks, document dossiers, and seat allotment</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          New Application
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={admissions}
        title="Candidate Application Roster"
        subtitle="Filter by course, entrance merit category, and clearance status"
        searchPlaceholder="Search applicant, entrance exam, rank..."
        searchKeys={['applicantName', 'appliedCourse', 'entranceExam', 'category']}
        filters={[
          { key: 'status', label: 'Status', options: ['Approved', 'Under Review', 'Waitlisted'] },
          { key: 'appliedCourse', label: 'Course', options: ['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Marketing)'] },
        ]}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Candidate"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register Admission Application"
        subtitle="College candidate intake dossier"
      >
        <div className="grid-2">
          <Input
            label="Applicant Full Name"
            required
            value={formData.applicantName}
            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
            placeholder="Candidate Name"
          />
          <Select
            label="Applied Course"
            value={formData.appliedCourse}
            onChange={(e) => setFormData({ ...formData, appliedCourse: e.target.value })}
            options={['B.Tech CSE', 'B.Tech AI & DS', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA (Marketing)']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Entrance Exam & Score/Rank"
            required
            value={formData.entranceExam}
            onChange={(e) => setFormData({ ...formData, entranceExam: e.target.value })}
            placeholder="KCET (Rank 2,400) or JEE 94%"
          />
          <Select
            label="Admission Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={['General Merit', 'OBC', 'SC/ST', 'Management Quota', 'Sports Quota']}
          />
        </div>
      </FormModal>
    </div>
  );
}
