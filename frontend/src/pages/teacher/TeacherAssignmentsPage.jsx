import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookOpen, Plus, Eye, CheckCircle2, Award } from 'lucide-react';

export default function TeacherAssignmentsPage() {
  const { success } = useToast();
  const [assignments, setAssignments] = useState(() => schoolDataService.getAssignments());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsn, setSelectedAsn] = useState(null);

  const [newAsn, setNewAsn] = useState({
    title: '',
    subject: 'Mathematics',
    class: '10',
    section: 'A',
    teacher: 'Sarah Jenkins',
    dueDate: '2025-09-25',
    maxMarks: 25,
    description: '',
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAsn.title) return;
    const created = schoolDataService.addAssignment(newAsn);
    setAssignments(schoolDataService.getAssignments());
    setIsCreateModalOpen(false);
    success(`Assignment "${created.title}" published to Class ${newAsn.class}-${newAsn.section}!`);
  };

  const columns = [
    {
      header: 'Assignment Title',
      accessor: 'title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class {row.class}-{row.section} • Max Marks: {row.maxMarks}</div>
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
      header: 'Submission Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Submissions',
      accessor: 'totalSubmissions',
      sortable: true,
      render: (val, row) => (
        <div>
          <strong>{val || 0}</strong> / {row.totalStudents} Submissions
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (id, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setSelectedAsn(row)}
        >
          <Eye size={13} />
          <span>Review Submissions</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={26} color="var(--primary)" />
            Assignments & Coursework Grading
          </h1>
          <p className="page-subtitle">
            Create homework tasks, inspect student submissions and assign marks & qualitative feedback
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>Create New Assignment</span>
        </button>
      </div>

      <DataTable
        title="My Active Coursework Tasks"
        subtitle="Assignments created for your classes"
        columns={columns}
        data={assignments}
        searchKeys={['title', 'subject', 'class', 'dueDate']}
      />

      {/* Review Submissions Modal */}
      <Modal
        isOpen={!!selectedAsn}
        onClose={() => setSelectedAsn(null)}
        title={selectedAsn?.title || 'Review Submissions'}
        subtitle={`Class ${selectedAsn?.class}-${selectedAsn?.section} • Max Score: ${selectedAsn?.maxMarks}`}
        size="lg"
      >
        {selectedAsn && (
          <div>
            <div className="card" style={{ padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>PROMPT:</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedAsn.description}</p>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Feedback Given</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAsn.submissions?.map((sub, i) => (
                    <tr key={i}>
                      <td><strong>{sub.studentName}</strong></td>
                      <td>{sub.submittedAt}</td>
                      <td><StatusBadge status={sub.status} size="sm" /></td>
                      <td><strong>{sub.marks ?? 'Ungraded'}</strong> / {selectedAsn.maxMarks}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.feedback || '—'}</td>
                    </tr>
                  ))}
                  {(!selectedAsn.submissions || selectedAsn.submissions.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No submissions received from students yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedAsn(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Class Assignment"
        subtitle="Set homework prompt and deadline for students"
      >
        <form onSubmit={handleCreateSubmit}>
          <FormInput
            label="Assignment Title"
            required
            value={newAsn.title}
            onChange={(e) => setNewAsn({ ...newAsn, title: e.target.value })}
            placeholder="e.g. Chapter 4 Quadratic Formula Exercises"
          />
          <div className="grid-2">
            <FormInput
              label="Subject"
              value={newAsn.subject}
              onChange={(e) => setNewAsn({ ...newAsn, subject: e.target.value })}
            />
            <Select
              label="Target Class"
              value={newAsn.class}
              onChange={(e) => setNewAsn({ ...newAsn, class: e.target.value })}
              options={['8', '9', '10', '11', '12']}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Due Date"
              type="date"
              value={newAsn.dueDate}
              onChange={(e) => setNewAsn({ ...newAsn, dueDate: e.target.value })}
            />
            <FormInput
              label="Max Marks"
              type="number"
              value={newAsn.maxMarks}
              onChange={(e) => setNewAsn({ ...newAsn, maxMarks: e.target.value })}
            />
          </div>

          <Textarea
            label="Assignment Instructions"
            value={newAsn.description}
            onChange={(e) => setNewAsn({ ...newAsn, description: e.target.value })}
            placeholder="Write clear instructions for students..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Distribute Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
