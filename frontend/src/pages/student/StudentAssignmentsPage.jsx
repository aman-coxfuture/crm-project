import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookOpen, UploadCloud, CheckCircle2, FileText, Send } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const { currentUser } = useAuth();
  const { success, info } = useToast();
  const [assignments, setAssignments] = useState(() => schoolDataService.getAssignments());
  const [selectedAsnToSubmit, setSelectedAsnToSubmit] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  const studentId = currentUser?.id || 'STU001';
  const studentName = currentUser?.name || 'Alex Johnson';

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!selectedAsnToSubmit) return;

    schoolDataService.submitAssignmentWork(selectedAsnToSubmit.id, {
      studentId,
      studentName,
      text: submissionText,
    });

    setAssignments(schoolDataService.getAssignments());
    setSelectedAsnToSubmit(null);
    setSubmissionText('');
    success(`Assignment "${selectedAsnToSubmit.title}" submitted successfully!`);
  };

  const columns = [
    {
      header: 'Assignment Title',
      accessor: 'title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Teacher: {row.teacher} • Max: {row.maxMarks} Marks</div>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessor: 'subject',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'My Submission Status',
      accessor: 'id',
      render: (id, row) => {
        const mySub = row.submissions?.find((s) => s.studentId === studentId);
        if (!mySub) {
          return <span className="badge badge-warning">Pending Submission</span>;
        }
        return <StatusBadge status={mySub.status} />;
      },
    },
    {
      header: 'My Grade / Feedback',
      accessor: 'submissions',
      render: (subs, row) => {
        const mySub = subs?.find((s) => s.studentId === studentId);
        if (!mySub || mySub.marks === null) {
          return <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Awaiting review</span>;
        }
        return (
          <div>
            <strong style={{ color: 'var(--primary)' }}>{mySub.marks} / {row.maxMarks}</strong>
            {mySub.feedback && <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>"{mySub.feedback}"</div>}
          </div>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (id, row) => {
        const mySub = row.submissions?.find((s) => s.studentId === studentId);
        return (
          <button
            className={`btn btn-sm ${mySub ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setSelectedAsnToSubmit(row)}
          >
            {mySub ? <CheckCircle2 size={13} /> : <UploadCloud size={13} />}
            <span>{mySub ? 'Resubmit' : 'Submit Work'}</span>
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={26} color="var(--primary)" />
            My Homework & Assignments
          </h1>
          <p className="page-subtitle">
            Submit coursework tasks online, track grading feedback and score summaries
          </p>
        </div>
      </div>

      <DataTable
        title="Class 10-A Coursework Roster"
        subtitle="Active and completed assignments"
        columns={columns}
        data={assignments}
        searchKeys={['title', 'subject', 'teacher', 'dueDate']}
      />

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={!!selectedAsnToSubmit}
        onClose={() => setSelectedAsnToSubmit(null)}
        title={selectedAsnToSubmit?.title || 'Submit Assignment'}
        subtitle={`Subject: ${selectedAsnToSubmit?.subject} • Due: ${selectedAsnToSubmit?.dueDate}`}
      >
        {selectedAsnToSubmit && (
          <form onSubmit={handleSubmitWork}>
            <div className="card" style={{ padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>TEACHER INSTRUCTIONS:</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {selectedAsnToSubmit.description}
              </p>
            </div>

            <Textarea
              label="Your Solution / Submission Text"
              required
              rows={5}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your essay, working steps, or document submission link here..."
            />

            <div
              style={{
                padding: '16px',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '16px',
                cursor: 'pointer',
              }}
              onClick={() => info('Mock file attached: Homework_Solution.pdf')}
            >
              <UploadCloud size={24} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>Click to mock upload PDF / Doc file</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Max file size: 25 MB</div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedAsnToSubmit(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={15} />
                <span>Submit to Teacher</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
