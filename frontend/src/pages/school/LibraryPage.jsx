import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Library, Plus, BookOpen, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export default function LibraryPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState('catalog');

  const [books, setBooks] = useState(() => schoolDataService.getLibraryBooks());
  const [issuedBooks, setIssuedBooks] = useState(() => schoolDataService.getIssuedBooks());
  const [students] = useState(() => schoolDataService.getStudents());

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    bookId: 'BK-101',
    bookTitle: 'Concepts of Physics (Vol 1 & 2)',
    studentId: 'STU001',
    studentName: 'Alex Johnson',
    roll: 'STU001',
  });

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    const created = schoolDataService.issueBook(newIssue);
    setIssuedBooks(schoolDataService.getIssuedBooks());
    setBooks(schoolDataService.getLibraryBooks());
    setIsIssueModalOpen(false);
    success(`"${created.bookTitle}" issued to ${created.studentName}!`);
  };

  const handleReturnBook = (issue) => {
    schoolDataService.returnBook(issue.id, issue.bookId);
    setIssuedBooks(schoolDataService.getIssuedBooks());
    setBooks(schoolDataService.getLibraryBooks());
    success(`Book returned and restocked in library catalog.`);
  };

  const totalTitles = books.length;
  const totalIssued = issuedBooks.filter((i) => i.status !== 'Returned').length;
  const totalOverdue = issuedBooks.filter((i) => i.status === 'Overdue').length;

  const bookColumns = [
    {
      header: 'Book Title & Author',
      accessor: 'title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>By {row.author} • ISBN: {row.isbn}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Shelf Location',
      accessor: 'shelfLocation',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Availability',
      accessor: 'availableCopies',
      sortable: true,
      render: (val, row) => (
        <div>
          <strong style={{ color: val > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
            {val} Available
          </strong>{' '}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({row.totalCopies} Total)</span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (id, row) => (
        <button
          className="btn btn-primary btn-sm"
          disabled={row.availableCopies === 0}
          onClick={() => {
            setNewIssue({
              ...newIssue,
              bookId: row.id,
              bookTitle: row.title,
            });
            setIsIssueModalOpen(true);
          }}
        >
          <BookOpen size={13} />
          <span>Issue Book</span>
        </button>
      ),
    },
  ];

  const issueColumns = [
    {
      header: 'Book Title',
      accessor: 'bookTitle',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Issued To',
      accessor: 'studentName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Roll: {row.roll}</div>
        </div>
      ),
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      sortable: true,
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val, row) => (
        <span style={{ color: row.status === 'Overdue' ? 'var(--danger)' : undefined, fontWeight: 700 }}>
          {val}
        </span>
      ),
    },
    {
      header: 'Fine Status',
      accessor: 'fine',
      render: (val) => (val > 0 ? <span className="badge badge-danger">${val} Fine</span> : <span className="badge badge-success">No Fine</span>),
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
        row.status !== 'Returned' ? (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleReturnBook(row)}
          >
            <RotateCcw size={13} />
            <span>Return Book</span>
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Completed</span>
        )
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Library size={26} color="var(--primary)" />
            Library & Book Lending Manager
          </h1>
          <p className="page-subtitle">
            Catalog books, issue loans, manage returns and calculate overdue fines
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsIssueModalOpen(true)}>
          <Plus size={16} />
          <span>Issue Book Loan</span>
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Catalog Titles" value={totalTitles} icon={BookOpen} color="indigo" />
        <StatCard title="Active Issued Loans" value={totalIssued} icon={Library} color="sky" />
        <StatCard title="Overdue Returns" value={totalOverdue} icon={AlertCircle} color="rose" subtitle="Fine applicable" />
      </div>

      <Tabs
        tabs={[
          { id: 'catalog', label: 'Library Catalog', icon: <BookOpen size={15} /> },
          { id: 'issued', label: 'Issued Books & Loans', icon: <Library size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'catalog' && (
        <DataTable
          title="Central Library Catalog"
          subtitle="All academic and reference volumes in stock"
          columns={bookColumns}
          data={books}
          searchKeys={['title', 'author', 'category', 'isbn', 'shelfLocation']}
        />
      )}

      {activeTab === 'issued' && (
        <DataTable
          title="Active & Historical Book Issues"
          subtitle="Loan ledger and overdue fine tracking"
          columns={issueColumns}
          data={issuedBooks}
          searchKeys={['bookTitle', 'studentName', 'roll', 'status']}
        />
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book Loan"
        subtitle="Check out book to a registered student"
      >
        <form onSubmit={handleIssueSubmit}>
          <Select
            label="Select Book"
            value={newIssue.bookId}
            onChange={(e) => {
              const b = books.find((x) => x.id === e.target.value);
              setNewIssue({ ...newIssue, bookId: e.target.value, bookTitle: b?.title || '' });
            }}
            options={books.filter((b) => b.availableCopies > 0).map((b) => ({ value: b.id, label: `${b.title} (${b.availableCopies} available)` }))}
          />

          <Select
            label="Select Student Member"
            value={newIssue.studentId}
            onChange={(e) => {
              const s = students.find((x) => x.id === e.target.value);
              setNewIssue({ ...newIssue, studentId: e.target.value, studentName: s?.name || '', roll: s?.rollNumber || '' });
            }}
            options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.rollNumber})` }))}
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Loan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
