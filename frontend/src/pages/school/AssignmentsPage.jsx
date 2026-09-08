import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookOpen, Plus, Eye, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function AssignmentsPage() {
  const { success } = useToast();
  const [assignments, setAssignments] = useState(() => schoolDataService.getAssignments());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAsn.title) return;
    const created = schoolDataService.addAssignment(newAsn);
    setAssignments(schoolDataService.getAssignments());
    setIsAddModalOpen(false);
    setNewAsn({
      title: '',
      subject: 'Mathematics',
      class: '10',
      section: 'A',
      teacher: 'Sarah Jenkins',
      dueDate: '2025-09-25',
      maxMarks: 25,
      description: '',
    });
    success(`Assignment "${created.title}" created successfully!`);
  };

  const columns = [
    {
      header: 'Assignment Title',
      accessor: 'title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Teacher: {row.teacher} • Max Marks: {row.maxMarks}
          </div>
        </div>
      ),
    },
    {
      header: 'Subject & Class',
      accessor: 'subject',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="badge badge-primary">{val}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Class {row.class}-{row.section}
          </div>
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Submissions',
      accessor: 'totalSubmissions',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <strong>{val || 0}</strong> / {row.totalStudents} submitted
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
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedAssignment(row)}
        >
          <Eye size={13} />
          <span>Submissions</span>
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
            Assignments & Coursework
          </h1>
          <p className="page-subtitle">
            Create homework tasks, monitor submissions and review grading across classes
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Create Assignment</span>
        </button>
      </div>

      <DataTable
        title="Class Coursework & Homework Tasks"
        subtitle={`Total ${assignments.length} assignments tracked`}
        columns={columns}
        data={assignments}
        searchKeys={['title', 'subject', 'teacher', 'class']}
        filterOptions={[
          { label: 'Class', key: 'class', options: ['8', '9', '10', '11', '12'] },
          { label: 'Status', key: 'status', options: ['Active', 'Graded'] },
        ]}
      />

      {/* Submissions Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title || 'Submissions'}
        subtitle={`Subject: ${selectedAssignment?.subject} • Class ${selectedAssignment?.class}-${selectedAssignment?.section}`}
        size="lg"
      >
        {selectedAssignment && (
          <div>
            <div className="card" style={{ padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>DESCRIPTION & PROMPT</div>
              <p style={{ fontSize: '0.875rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {selectedAssignment.description}
              </p>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Submitted Time</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAssignment.submissions?.map((sub, i) => (
                    <tr key={i}>
                      <td><strong>{sub.studentName}</strong></td>
                      <td>{sub.submittedAt}</td>
                      <td><StatusBadge status={sub.status} size="sm" /></td>
                      <td><strong>{sub.marks ?? '—'}</strong> / {selectedAssignment.maxMarks}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.feedback || 'No feedback yet'}</td>
                    </tr>
                  ))}
                  {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                        No student submissions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedAssignment(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Class Assignment"
        subtitle="Distribute homework task to students"
      >
        <form onSubmit={handleAddSubmit}>
          <FormInput
            label="Assignment Title"
            required
            value={newAsn.title}
            onChange={(e) => setNewAsn({ ...newAsn, title: e.target.value })}
            placeholder="e.g. Chapter 5 Calculus Exercises"
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
              label="Submission Due Date"
              type="date"
              value={newAsn.dueDate}
              onChange={(e) => setNewAsn({ ...newAsn, dueDate: e.target.value })}
            />
            <FormInput
              label="Maximum Marks"
              type="number"
              value={newAsn.maxMarks}
              onChange={(e) => setNewAsn({ ...newAsn, maxMarks: e.target.value })}
            />
          </div>

          <Textarea
            label="Assignment Instructions"
            value={newAsn.description}
            onChange={(e) => setNewAsn({ ...newAsn, description: e.target.value })}
            placeholder="Detailed instructions for the students..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
