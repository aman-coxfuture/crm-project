import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Check, X } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { admissionService } from '../../services';

export default function UniversityAdmissionsPage() {
  const { addToast } = useToast();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: '',
    appliedProgram: 'B.Tech CSE (Honours)',
    exam: 'CUET Score 750',
    college: 'Apex Inst. of Technology',
    status: 'Approved',
  });

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const data = await admissionService.getUniversityAdmissions();
      setAdmissions(data || []);
    } catch (err) {
      addToast('Failed to load university admissions', 'error');
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
      const newAdm = await admissionService.createUniversityAdmission(formData);
      setAdmissions([newAdm, ...admissions]);
      setIsAddOpen(false);
      addToast(`Candidate "${formData.applicantName}" registered for central allotment`, 'success');
    } catch (err) {
      addToast('Failed to register admission', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await admissionService.updateUniversityAdmissionStatus(id, newStatus);
      setAdmissions(
        admissions.map((a) => (a.id === id ? updated : a))
      );
      addToast(`Allotment status updated to ${newStatus}`, 'info');
    } catch (err) {
      addToast('Failed to update allotment status', 'error');
    }
  };

  const columns = [
    {
      key: 'applicantName',
      label: 'Applicant Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.applicantName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'appliedProgram',
      label: 'Program Applied',
      render: (row) => <strong>{row.appliedProgram}</strong>,
    },
    {
      key: 'exam',
      label: 'National Entrance Score',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.exam}</span>,
    },
    {
      key: 'college',
      label: 'Allotted Institute',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.college}</span>,
    },
    {
      key: 'status',
      label: 'Allotment Status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {row.status !== 'Approved' && (
            <button
              onClick={() => handleStatusChange(row.id, 'Approved')}
              className="btn-ghost btn-icon"
              title="Approve Allotment"
            >
              <Check size={14} />
            </button>
          )}
          {row.status !== 'Waitlisted' && (
            <button
              onClick={() => handleStatusChange(row.id, 'Waitlisted')}
              className="btn-ghost btn-icon"
              title="Waitlist Candidate"
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
          <h1 className="page-title">University Central Admissions & Allotments</h1>
          <p className="page-subtitle">Central counseling desk for CUET, NEET, GATE, CLAT, and Ph.D. allotments</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          New Allotment Record
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={admissions}
        title="Central Admissions Master"
        subtitle="Manage seat allocations across affiliated institutes"
        searchPlaceholder="Search candidate, program, exam..."
        searchKeys={['applicantName', 'appliedProgram', 'exam', 'college']}
        filters={[
          { key: 'status', label: 'Status', options: ['Approved', 'Under Review', 'Waitlisted'] },
        ]}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Candidate"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Register Central Allotment"
        subtitle="University Admissions Directorate"
      >
        <div className="grid-2">
          <Input
            label="Applicant Full Name"
            required
            value={formData.applicantName}
            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
            placeholder="Candidate Name"
          />
          <Input
            label="National Entrance Exam & Rank"
            required
            value={formData.exam}
            onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
            placeholder="e.g. CUET Score 780 or GATE 720"
          />
        </div>
        <div className="grid-2">
          <Select
            label="Program Applied"
            value={formData.appliedProgram}
            onChange={(e) => setFormData({ ...formData, appliedProgram: e.target.value })}
            options={['B.Tech CSE (Honours)', 'M.Tech AI & Data Science', 'Doctor of Philosophy (Ph.D.)', 'MBBS (Clinical Year)', 'LL.M Corporate Law']}
          />
          <Select
            label="Allotted College / Campus"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            options={['Apex Inst. of Technology', 'School of Medical Sciences', 'National School of Law', 'School of Advanced Sciences']}
          />
        </div>
      </FormModal>
    </div>
  );
}
