import React, { useState, useMemo } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Library,
  Plus,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Clock,
  Layers,
  Users,
  Search,
  BookMarked,
  Calendar,
  DollarSign,
  Info,
  Edit,
  Eye,
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Computer Science',
  'General Knowledge',
  'History',
  'Geography',
  'Literature',
  'Competitive',
  'Story Books',
  'Other',
];

// Helper: Format Indian Rupee currency
const formatRupee = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

// Helper: Format date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Helper: Add days to date string (YYYY-MM-DD)
const addDaysToDate = (dateStr, days) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Helper: Calculate late days between two dates
const getDaysDifference = (fromDateStr, toDateStr) => {
  if (!fromDateStr || !toDateStr) return 0;
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const diffTime = to.getTime() - from.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function LibraryPage() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('catalog');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Main Local States
  const [books, setBooks] = useState(() => schoolDataService.getLibraryBooks());
  const [issuedBooks, setIssuedBooks] = useState(() => schoolDataService.getIssuedBooks());
  const [students] = useState(() => schoolDataService.getStudents());
  const [staffList, setStaffList] = useState(() => schoolDataService.getLibraryStaff());

  // Inventory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState('All');

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selected records for modals
  const [selectedBookForAction, setSelectedBookForAction] = useState(null);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState(null);

  // Return calculation state
  const [returnDateInput, setReturnDateInput] = useState(todayStr);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    bookName: '',
    category: '',
    availableCopies: 0,
    studentId: '',
    studentName: '',
    rollNumber: '',
    className: '',
    section: '',
    issueDate: todayStr,
    dueDate: addDaysToDate(todayStr, 10),
  });

  // Add Book Form State
  const [newBookForm, setNewBookForm] = useState({
    name: '',
    id: '',
    author: '',
    category: 'Mathematics',
    publisher: '',
    totalCopies: 10,
    shelfLocation: 'Shelf M-01',
    isbn: '',
  });

  // Edit Book Form State
  const [editBookForm, setEditBookForm] = useState({
    id: '',
    name: '',
    author: '',
    category: 'Mathematics',
    publisher: '',
    totalCopies: 10,
    shelfLocation: '',
    isbn: '',
    issuedCopies: 0,
  });

  // Derive active / dynamic status for issued books
  const processedIssuedBooks = useMemo(() => {
    return issuedBooks.map((item) => {
      const isReturned = item.status === 'Returned';
      if (isReturned) {
        return item;
      }
      // Calculate real-time overdue if active
      const lateDays = Math.max(0, getDaysDifference(item.dueDate, todayStr));
      const isOverdue = lateDays > 0;
      const fine = lateDays * 100;

      return {
        ...item,
        status: isOverdue ? 'Overdue' : 'Issued',
        lateDays: lateDays,
        fine: fine,
      };
    });
  }, [issuedBooks, todayStr]);

  // Derived Summary KPI Metrics
  const totalBooksCount = useMemo(() => {
    return books.reduce((acc, b) => acc + (Number(b.totalCopies) || 0), 0);
  }, [books]);

  const availableBooksCount = useMemo(() => {
    return books.reduce((acc, b) => acc + (Number(b.availableCopies) || 0), 0);
  }, [books]);

  const issuedBooksCount = useMemo(() => {
    return processedIssuedBooks.filter((i) => i.status !== 'Returned').length;
  }, [processedIssuedBooks]);

  const overdueBooksCount = useMemo(() => {
    return processedIssuedBooks.filter((i) => i.status === 'Overdue').length;
  }, [processedIssuedBooks]);

  const totalCategoriesCount = useMemo(() => {
    const uniqueCats = new Set(books.map((b) => b.category || 'Other'));
    return uniqueCats.size;
  }, [books]);

  // Category breakdown data
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((catName) => {
      const catBooks = books.filter((b) => (b.category || '').toLowerCase() === catName.toLowerCase());
      const total = catBooks.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0);
      const available = catBooks.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0);
      const issued = catBooks.reduce((sum, b) => sum + (Number(b.issuedCopies) || 0), 0);
      return {
        category: catName,
        total,
        available,
        issued,
        count: catBooks.length,
      };
    });
  }, [books]);

  // Filtered Books for Main Inventory Table
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Category filter
      if (selectedCategoryFilter !== 'All' && (b.category || '').toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }
      // Availability filter
      if (selectedAvailabilityFilter === 'Available' && b.availableCopies <= 0) return false;
      if (selectedAvailabilityFilter === 'Issued' && b.issuedCopies <= 0) return false;
      if (selectedAvailabilityFilter === 'Not Available' && b.availableCopies > 0) return false;

      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (b.name || b.title || '').toLowerCase().includes(query);
        const matchId = (b.id || '').toLowerCase().includes(query);
        const matchAuthor = (b.author || '').toLowerCase().includes(query);
        const matchCategory = (b.category || '').toLowerCase().includes(query);
        const matchPublisher = (b.publisher || '').toLowerCase().includes(query);
        const matchIsbn = (b.isbn || '').toLowerCase().includes(query);
        return matchName || matchId || matchAuthor || matchCategory || matchPublisher || matchIsbn;
      }

      return true;
    });
  }, [books, selectedCategoryFilter, selectedAvailabilityFilter, searchQuery]);

  // Handle Open Issue Modal for a specific book or generic
  const handleOpenIssueModal = (book) => {
    const targetBook = book || books.find((b) => b.availableCopies > 0) || books[0];
    const defaultStudent = students[0] || { name: 'Rahul Kumar', rollNumber: 'STU901', class: 'Class 9', section: 'A', id: 'STU901' };

    setIssueForm({
      bookId: targetBook ? targetBook.id : '',
      bookName: targetBook ? (targetBook.name || targetBook.title) : '',
      category: targetBook ? targetBook.category : '',
      availableCopies: targetBook ? targetBook.availableCopies : 0,
      studentId: defaultStudent.id || '',
      studentName: defaultStudent.name || '',
      rollNumber: defaultStudent.rollNumber || '',
      className: defaultStudent.class || 'Class 9',
      section: defaultStudent.section || 'A',
      issueDate: todayStr,
      dueDate: addDaysToDate(todayStr, 10),
    });
    setIsIssueModalOpen(true);
  };

  // Handle Student Selection in Issue Form
  const handleStudentSelect = (studentId) => {
    const found = students.find((s) => s.id === studentId);
    if (found) {
      setIssueForm((prev) => ({
        ...prev,
        studentId: found.id,
        studentName: found.name,
        rollNumber: found.rollNumber || '',
        className: found.class || '',
        section: found.section || 'A',
      }));
    }
  };

  // Handle Book Selection in Issue Form
  const handleBookSelect = (bookId) => {
    const found = books.find((b) => b.id === bookId);
    if (found) {
      setIssueForm((prev) => ({
        ...prev,
        bookId: found.id,
        bookName: found.name || found.title,
        category: found.category,
        availableCopies: found.availableCopies,
      }));
    }
  };

  // Handle Issue Form Date Change (Auto-calculate 10-day due date)
  const handleIssueDateChange = (newDate) => {
    setIssueForm((prev) => ({
      ...prev,
      issueDate: newDate,
      dueDate: addDaysToDate(newDate, 10),
    }));
  };

  // Submit Issue Book
  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.bookId) {
      showError('Please select a valid book to issue.');
      return;
    }
    const book = books.find((b) => b.id === issueForm.bookId);
    if (!book || book.availableCopies <= 0) {
      showError('Selected book is currently not available in stock.');
      return;
    }
    if (!issueForm.studentName) {
      showError('Please select or specify student details.');
      return;
    }

    const createdIssue = schoolDataService.issueBook({
      bookId: issueForm.bookId,
      bookName: issueForm.bookName,
      bookTitle: issueForm.bookName,
      category: issueForm.category,
      studentId: issueForm.studentId,
      studentName: issueForm.studentName,
      rollNumber: issueForm.rollNumber,
      className: issueForm.className,
      section: issueForm.section,
      issueDate: issueForm.issueDate,
      dueDate: issueForm.dueDate,
    });

    setBooks(schoolDataService.getLibraryBooks());
    setIssuedBooks(schoolDataService.getIssuedBooks());
    setIsIssueModalOpen(false);
    success(`Book issued successfully to ${issueForm.studentName}.`);
  };

  // Open Return Modal
  const handleOpenReturnModal = (issue) => {
    setSelectedIssueForReturn(issue);
    setReturnDateInput(todayStr);
    setIsReturnModalOpen(true);
  };

  // Return calculations for modal
  const returnCalculation = useMemo(() => {
    if (!selectedIssueForReturn) return { lateDays: 0, fine: 0 };
    const diff = getDaysDifference(selectedIssueForReturn.dueDate, returnDateInput);
    const lateDays = Math.max(0, diff);
    const fine = lateDays * 100;
    return { lateDays, fine };
  }, [selectedIssueForReturn, returnDateInput]);

  // Confirm Return Book
  const handleConfirmReturn = () => {
    if (!selectedIssueForReturn) return;

    schoolDataService.returnBook(selectedIssueForReturn.id, selectedIssueForReturn.bookId, {
      returnDate: returnDateInput,
      lateDays: returnCalculation.lateDays,
      fine: returnCalculation.fine,
    });

    setBooks(schoolDataService.getLibraryBooks());
    setIssuedBooks(schoolDataService.getIssuedBooks());
    setIsReturnModalOpen(false);

    if (returnCalculation.fine > 0) {
      success(`Book returned successfully! Late fine applied: ${formatRupee(returnCalculation.fine)} (${returnCalculation.lateDays} days late).`);
    } else {
      success(`Book returned successfully on time. No late fine applied.`);
    }
  };

  // Add Book Handlers
  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    if (!newBookForm.name) {
      showError('Please enter a book name.');
      return;
    }
    const totalCopies = parseInt(newBookForm.totalCopies, 10) || 1;
    const generatedId = newBookForm.id.trim() || `BOOK-${String(books.length + 1).padStart(3, '0')}`;

    schoolDataService.addLibraryBook({
      ...newBookForm,
      id: generatedId,
      name: newBookForm.name,
      title: newBookForm.name,
      totalCopies: totalCopies,
      availableCopies: totalCopies,
      issuedCopies: 0,
    });

    setBooks(schoolDataService.getLibraryBooks());
    setIsAddBookModalOpen(false);
    setNewBookForm({
      name: '',
      id: '',
      author: '',
      category: 'Mathematics',
      publisher: '',
      totalCopies: 10,
      shelfLocation: 'Shelf M-01',
      isbn: '',
    });
    success(`"${newBookForm.name}" added to library inventory successfully.`);
  };

  // Open Edit Book Modal
  const handleOpenEditBookModal = (book) => {
    setEditBookForm({
      id: book.id,
      name: book.name || book.title,
      author: book.author || '',
      category: book.category || 'Other',
      publisher: book.publisher || '',
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || '',
      isbn: book.isbn || '',
      issuedCopies: book.issuedCopies || 0,
    });
    setIsEditBookModalOpen(true);
  };

  // Submit Edit Book
  const handleEditBookSubmit = (e) => {
    e.preventDefault();
    const newTotal = parseInt(editBookForm.totalCopies, 10);
    if (newTotal < editBookForm.issuedCopies) {
      showError(`Total copies cannot be less than currently issued copies (${editBookForm.issuedCopies}).`);
      return;
    }

    schoolDataService.updateLibraryBook(editBookForm.id, {
      ...editBookForm,
      name: editBookForm.name,
      title: editBookForm.name,
      totalCopies: newTotal,
    });

    setBooks(schoolDataService.getLibraryBooks());
    setIsEditBookModalOpen(false);
    success(`Book details updated successfully.`);
  };

  // Open Details Modal
  const handleOpenDetailsModal = (book) => {
    setSelectedBookForAction(book);
    setIsDetailsModalOpen(true);
  };

  // Main Inventory Table Columns
  const bookColumns = [
    {
      header: 'Book Name',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div
            style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
            onClick={() => handleOpenDetailsModal(row)}
          >
            {val || row.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            By {row.author || 'Unknown'} {row.isbn ? `• ISBN: ${row.isbn}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Book ID',
      accessor: 'id',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>{val}</span>,
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val || 'General'}</span>,
    },
    {
      header: 'Total Copies',
      accessor: 'totalCopies',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Available',
      accessor: 'availableCopies',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: val > 0 ? 'var(--success-text)' : 'var(--danger-text)',
            backgroundColor: val > 0 ? 'var(--success-light)' : 'var(--danger-light)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
          }}
        >
          {val} Available
        </span>
      ),
    },
    {
      header: 'Issued',
      accessor: 'issuedCopies',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? 'var(--warning-text, #d97706)' : 'var(--text-tertiary)' }}>
          {val || 0} Issued
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.availableCopies > 0 ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenIssueModal(row)}
              title="Issue this book to a student"
            >
              <BookOpen size={13} />
              <span>Issue</span>
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--bg-tertiary)' }}
            >
              <span>Not Available</span>
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEditBookModal(row)}
            title="Edit book information"
            style={{ padding: '6px 8px' }}
          >
            <Edit size={13} />
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenDetailsModal(row)}
            title="View complete details"
            style={{ padding: '6px 8px' }}
          >
            <Eye size={13} />
          </button>
        </div>
      ),
    },
  ];

  // Active Issued Books Columns
  const activeIssuedColumns = [
    {
      header: 'Book',
      accessor: 'bookName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val || row.bookTitle}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {row.bookId} • {row.category}</div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'studentName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Roll: {row.rollNumber || row.roll || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Class',
      accessor: 'className',
      sortable: true,
      render: (val) => val || '-',
    },
    {
      header: 'Section',
      accessor: 'section',
      sortable: true,
      render: (val) => val || 'A',
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val, row) => (
        <span
          style={{
            fontWeight: 700,
            color: row.status === 'Overdue' ? 'var(--danger-text)' : 'var(--text-primary)',
          }}
        >
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => {
        if (val === 'Overdue') {
          return (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#dc2626',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertTriangle size={12} />
              Overdue
            </span>
          );
        }
        return (
          <span
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              color: '#0284c7',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            Issued
          </span>
        );
      },
    },
    {
      header: 'Fine',
      accessor: 'fine',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: val > 0 ? 'var(--danger-text)' : 'var(--success-text)',
          }}
        >
          {val > 0 ? formatRupee(val) : '₹0'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (_, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleOpenReturnModal(row)}
          style={{ backgroundColor: 'var(--primary)', gap: '6px' }}
        >
          <RotateCcw size={13} />
          <span>Return Book</span>
        </button>
      ),
    },
  ];

  // Full History Columns
  const historyColumns = [
    {
      header: 'Book',
      accessor: 'bookName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val || row.bookTitle}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {row.bookId}</div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: 'studentName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Roll: {row.rollNumber || row.roll || '-'} • {row.className || 'Class 9'}-{row.section || 'A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Return Date',
      accessor: 'returnDate',
      sortable: true,
      render: (val) => (val ? formatDate(val) : <span style={{ color: 'var(--text-tertiary)' }}>Active Loan</span>),
    },
    {
      header: 'Fine',
      accessor: 'fine',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 0 ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
          {formatRupee(val || 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => {
        if (val === 'Returned') {
          return (
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Returned
            </span>
          );
        }
        if (val === 'Overdue') {
          return (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#dc2626',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Overdue
            </span>
          );
        }
        return (
          <span
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              color: '#0284c7',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            Issued
          </span>
        );
      },
    },
  ];

  // Library Staff Columns
  const staffColumns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {val ? val.charAt(0) : 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.qualification || 'Library Staff'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      sortable: true,
      render: (val, row) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val || row.id}</span>,
    },
    {
      header: 'Designation',
      accessor: 'designation',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="badge badge-primary">{val}</span>
          {row.role === 'Library In-Charge' && (
            <span
              style={{
                marginLeft: '6px',
                fontSize: '0.72rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#b45309',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              In-Charge
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (val, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
            <Phone size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span>{val || '9876543210'}</span>
          </div>
          {row.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              <Mail size={11} />
              <span>{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <span
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#059669',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        >
          {val || 'Active'}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">
            <Library size={26} color="var(--primary)" />
            Library Management System
          </h1>
          <p className="page-subtitle">
            Catalog inventory, issue books to students, track 10-day return deadlines, manage overdue fines & staff
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsAddBookModalOpen(true)}>
            <Plus size={16} />
            <span>Add Book</span>
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenIssueModal()}>
            <BookOpen size={16} />
            <span>Issue Book</span>
          </button>
        </div>
      </div>

      {/* 1. Dashboard Summary KPI Cards */}
      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="Total Books"
          value={totalBooksCount.toLocaleString('en-IN')}
          icon={BookMarked}
          color="indigo"
          subtitle={`${books.length} unique titles`}
        />
        <StatCard
          title="Available Books"
          value={availableBooksCount.toLocaleString('en-IN')}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for issuing"
        />
        <StatCard
          title="Issued Books"
          value={issuedBooksCount.toLocaleString('en-IN')}
          icon={BookOpen}
          color="sky"
          subtitle="Active student loans"
        />
        <StatCard
          title="Overdue Books"
          value={overdueBooksCount.toLocaleString('en-IN')}
          icon={AlertCircle}
          color="rose"
          subtitle="Late fine: ₹100/day"
        />
        <StatCard
          title="Total Categories"
          value={totalCategoriesCount}
          icon={Layers}
          color="purple"
          subtitle="Academic & general"
        />
      </div>

      {/* 2. Book Category Section */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Book Categories Breakdown
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Click any category below to quickly filter the inventory catalog
            </p>
          </div>
          {selectedCategoryFilter !== 'All' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedCategoryFilter('All')}
              style={{ fontSize: '0.75rem' }}
            >
              Reset Filter ({selectedCategoryFilter})
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '12px',
          }}
        >
          {categoryStats.map((cat) => {
            const isSelected = selectedCategoryFilter.toLowerCase() === cat.category.toLowerCase();
            return (
              <div
                key={cat.category}
                onClick={() => {
                  setSelectedCategoryFilter(isSelected ? 'All' : cat.category);
                  setActiveTab('catalog');
                }}
                style={{
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {cat.category}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Total:</span>
                    <strong>{cat.total}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-text)' }}>
                    <span>Available:</span>
                    <strong>{cat.available}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning-text, #d97706)' }}>
                    <span>Issued:</span>
                    <strong>{cat.issued}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'catalog', label: `Book Inventory (${books.length})`, icon: <BookOpen size={15} /> },
          { id: 'issued', label: `Issued Books (${issuedBooksCount})`, icon: <Clock size={15} /> },
          { id: 'history', label: `Issue History (${processedIssuedBooks.length})`, icon: <RotateCcw size={15} /> },
          { id: 'staff', label: `Library Staff (${staffList.length})`, icon: <Users size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* TAB 1: MAIN BOOK INVENTORY */}
      {activeTab === 'catalog' && (
        <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            {/* Search Box */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                }}
              >
                <Search size={16} />
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Search by Book Name, ID, Author, Category, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', width: '100%' }}
              />
            </div>

            {/* Category Dropdown */}
            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Dropdown */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-select"
                value={selectedAvailabilityFilter}
                onChange={(e) => setSelectedAvailabilityFilter(e.target.value)}
              >
                <option value="All">All Availability</option>
                <option value="Available">Available (In Stock)</option>
                <option value="Issued">Issued</option>
                <option value="Not Available">Not Available (0 Copies)</option>
              </select>
            </div>

            {/* Add Book Action */}
            <button className="btn btn-primary" onClick={() => setIsAddBookModalOpen(true)}>
              <Plus size={15} />
              <span>+ Add Book</span>
            </button>
          </div>

          {/* Book Catalog Table */}
          <DataTable
            columns={bookColumns}
            data={filteredBooks}
            pageSize={8}
            emptyMessage="No books matching your criteria."
          />
        </div>
      )}

      {/* TAB 2: ISSUED BOOKS */}
      {activeTab === 'issued' && (
        <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Active & Overdue Book Loans</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                All currently borrowed volumes. Standard loan period is 10 days. Late fine: ₹100/day after due date.
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => handleOpenIssueModal()}>
              <Plus size={14} />
              <span>Issue New Loan</span>
            </button>
          </div>

          <DataTable
            columns={activeIssuedColumns}
            data={processedIssuedBooks.filter((i) => i.status !== 'Returned')}
            pageSize={8}
            searchKeys={['bookName', 'studentName', 'rollNumber', 'className', 'section', 'bookId']}
            emptyMessage="No active book loans at present."
          />
        </div>
      )}

      {/* TAB 3: ISSUE HISTORY */}
      {activeTab === 'history' && (
        <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Library Issue & Return History</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              Complete record of all library borrowings, returned books, due dates and late fees collected.
            </p>
          </div>

          <DataTable
            columns={historyColumns}
            data={processedIssuedBooks}
            pageSize={10}
            searchKeys={['bookName', 'studentName', 'rollNumber', 'status', 'className']}
            emptyMessage="No transaction history found."
          />
        </div>
      )}

      {/* TAB 4: LIBRARY STAFF */}
      {activeTab === 'staff' && (
        <div style={{ marginTop: '16px' }}>
          {/* Library In-Charge Summary Card */}
          <div
            className="card"
            style={{
              padding: '20px',
              marginBottom: '20px',
              borderLeft: '4px solid var(--primary)',
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(99, 102, 241, 0.05) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                  }}
                >
                  P
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Priya Sharma
                    </h3>
                    <span
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#b45309',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      Library In-Charge
                    </span>
                    <span
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Designation: <strong>Library Teacher</strong> • Employee ID: <strong>TCH-104</strong> • Contact: <strong>9876543210</strong>
                  </div>
                </div>
              </div>

              {/* Staff stats */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Library Staff</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{staffList.length}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Staff</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{staffList.filter((s) => s.status === 'Active').length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Library Staff Roster Table */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Library Staff & Administrators</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                Authorized librarians and teachers managing central cataloging and circulation
              </p>
            </div>

            <DataTable
              columns={staffColumns}
              data={staffList}
              pageSize={6}
              searchKeys={['name', 'employeeId', 'designation', 'contact']}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ISSUE BOOK MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book"
        subtitle="Check out book to a registered student with 10-day return policy"
      >
        <form onSubmit={handleIssueSubmit}>
          {/* Important Rule Notice */}
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              <strong style={{ color: '#d97706' }}>NOTE:</strong> This book must be returned within{' '}
              <strong>10 days</strong> from the issue date. A late fine of <strong>₹100 per day</strong> will be
              charged for late return.
            </div>
          </div>

          {/* Section 1: Book Details */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
              1. Book Details
            </h4>
            <div className="grid-2" style={{ gap: '12px' }}>
              <Select
                label="Select Book"
                value={issueForm.bookId}
                onChange={(e) => handleBookSelect(e.target.value)}
                options={books
                  .filter((b) => b.availableCopies > 0)
                  .map((b) => ({
                    value: b.id,
                    label: `${b.name || b.title} (${b.availableCopies} available)`,
                  }))}
                required
              />
              <FormInput
                label="Category"
                value={issueForm.category || 'General'}
                disabled
              />
            </div>
            <div className="grid-2" style={{ gap: '12px', marginTop: '4px' }}>
              <FormInput
                label="Book ID"
                value={issueForm.bookId}
                disabled
              />
              <FormInput
                label="Available Copies"
                value={`${issueForm.availableCopies} copies`}
                disabled
              />
            </div>
          </div>

          {/* Section 2: Student Details */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
              2. Student Details
            </h4>
            <Select
              label="Student Name"
              value={issueForm.studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (Roll: ${s.rollNumber || s.id} - ${s.class || 'Class 9'})`,
              }))}
              required
            />
            <div className="grid-3" style={{ gap: '10px', marginTop: '10px' }}>
              <FormInput
                label="Roll Number"
                value={issueForm.rollNumber}
                onChange={(e) => setIssueForm({ ...issueForm, rollNumber: e.target.value })}
                required
              />
              <FormInput
                label="Class"
                value={issueForm.className}
                onChange={(e) => setIssueForm({ ...issueForm, className: e.target.value })}
                required
              />
              <FormInput
                label="Section"
                value={issueForm.section}
                onChange={(e) => setIssueForm({ ...issueForm, section: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 3: Issue Details */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--primary)' }}>
              3. Issue Details & Return Due Date
            </h4>
            <div className="grid-2" style={{ gap: '12px' }}>
              <FormInput
                label="Issue Date"
                type="date"
                value={issueForm.issueDate}
                onChange={(e) => handleIssueDateChange(e.target.value)}
                required
              />
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Return Due Date
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    (Auto +10 days)
                  </span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={issueForm.dueDate}
                  disabled
                  style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 700, color: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Book
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. RETURN BOOK MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Book"
        subtitle="Confirm book return and review late fine calculation"
      >
        {selectedIssueForReturn && (
          <div>
            {/* Fine Banner */}
            {returnCalculation.fine > 0 ? (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 700 }}>
                  <AlertCircle size={18} />
                  <span>Late Return Fine Applicable: {formatRupee(returnCalculation.fine)}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  This book is overdue by <strong>{returnCalculation.lateDays} days</strong>. Late fine rate is ₹100 per late day ({returnCalculation.lateDays} × ₹100 = {formatRupee(returnCalculation.fine)}).
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>Returned On Time - No Late Fine</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  The book is being returned within the standard 10-day borrowing period. Late fine: <strong>₹0</strong>.
                </div>
              </div>
            )}

            {/* Loan Details Grid */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Book Name:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedIssueForReturn.bookName || selectedIssueForReturn.bookTitle}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Student Name:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedIssueForReturn.studentName} (Roll: {selectedIssueForReturn.rollNumber || selectedIssueForReturn.roll || '-'})
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Issue Date:</span>
                  <div style={{ fontWeight: 600 }}>{formatDate(selectedIssueForReturn.issueDate)}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Due Date:</span>
                  <div style={{ fontWeight: 700, color: returnCalculation.lateDays > 0 ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                    {formatDate(selectedIssueForReturn.dueDate)}
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />

              <div className="grid-3" style={{ gap: '10px', alignItems: 'center' }}>
                <FormInput
                  label="Return Date"
                  type="date"
                  value={returnDateInput}
                  onChange={(e) => setReturnDateInput(e.target.value)}
                  required
                />
                <div>
                  <label className="form-label">Late Days</label>
                  <div
                    style={{
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 700,
                      color: returnCalculation.lateDays > 0 ? '#dc2626' : 'var(--text-secondary)',
                      fontSize: '1rem',
                    }}
                  >
                    {returnCalculation.lateDays} Days
                  </div>
                </div>
                <div>
                  <label className="form-label">Late Fine</label>
                  <div
                    style={{
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 800,
                      color: returnCalculation.fine > 0 ? '#dc2626' : '#059669',
                      fontSize: '1.2rem',
                    }}
                  >
                    {formatRupee(returnCalculation.fine)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmReturn}>
                Confirm Return
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 16. ADD BOOK MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Add New Book to Inventory"
        subtitle="Catalog a new volume and replenish library stock"
      >
        <form onSubmit={handleAddBookSubmit}>
          <div className="grid-2" style={{ gap: '12px' }}>
            <FormInput
              label="Book Name"
              value={newBookForm.name}
              onChange={(e) => setNewBookForm({ ...newBookForm, name: e.target.value })}
              placeholder="e.g. Mathematics Class 8"
              required
            />
            <FormInput
              label="Book ID"
              value={newBookForm.id}
              onChange={(e) => setNewBookForm({ ...newBookForm, id: e.target.value })}
              placeholder="e.g. BOOK-015 (auto-generated if empty)"
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="Author"
              value={newBookForm.author}
              onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
              placeholder="e.g. R.D. Sharma"
              required
            />
            <Select
              label="Category"
              value={newBookForm.category}
              onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="Publisher"
              value={newBookForm.publisher}
              onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
              placeholder="e.g. Dhanpat Rai Publications"
            />
            <FormInput
              label="Total Copies"
              type="number"
              min="1"
              value={newBookForm.totalCopies}
              onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="Shelf Location"
              value={newBookForm.shelfLocation}
              onChange={(e) => setNewBookForm({ ...newBookForm, shelfLocation: e.target.value })}
              placeholder="e.g. Shelf M-01"
            />
            <FormInput
              label="ISBN (Optional)"
              value={newBookForm.isbn}
              onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
              placeholder="e.g. 978-8193452101"
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddBookModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Book
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 17. EDIT BOOK MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditBookModalOpen}
        onClose={() => setIsEditBookModalOpen(false)}
        title="Edit Book Details"
        subtitle={`Updating catalog information for ${editBookForm.id}`}
      >
        <form onSubmit={handleEditBookSubmit}>
          <div className="grid-2" style={{ gap: '12px' }}>
            <FormInput
              label="Book Name"
              value={editBookForm.name}
              onChange={(e) => setEditBookForm({ ...editBookForm, name: e.target.value })}
              required
            />
            <FormInput
              label="Author"
              value={editBookForm.author}
              onChange={(e) => setEditBookForm({ ...editBookForm, author: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <Select
              label="Category"
              value={editBookForm.category}
              onChange={(e) => setEditBookForm({ ...editBookForm, category: e.target.value })}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              required
            />
            <FormInput
              label="Publisher"
              value={editBookForm.publisher}
              onChange={(e) => setEditBookForm({ ...editBookForm, publisher: e.target.value })}
            />
          </div>

          <div className="grid-2" style={{ gap: '12px', marginTop: '10px' }}>
            <FormInput
              label="Total Copies"
              type="number"
              min={editBookForm.issuedCopies}
              value={editBookForm.totalCopies}
              onChange={(e) => setEditBookForm({ ...editBookForm, totalCopies: parseInt(e.target.value, 10) || 1 })}
              helperText={`Currently issued: ${editBookForm.issuedCopies}. Cannot be less than ${editBookForm.issuedCopies}.`}
              required
            />
            <FormInput
              label="Shelf Location"
              value={editBookForm.shelfLocation}
              onChange={(e) => setEditBookForm({ ...editBookForm, shelfLocation: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditBookModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 15. BOOK DETAILS MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Book Details & Stock Info"
        subtitle="Comprehensive catalog overview"
      >
        {selectedBookForAction && (
          <div>
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-primary">{selectedBookForAction.category || 'General'}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{selectedBookForAction.id}</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                {selectedBookForAction.name || selectedBookForAction.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                Author: <strong>{selectedBookForAction.author || 'Unknown'}</strong> • Publisher: <strong>{selectedBookForAction.publisher || 'School Press'}</strong>
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Copies</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedBookForAction.totalCopies}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Available</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{selectedBookForAction.availableCopies}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Issued</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{selectedBookForAction.issuedCopies || 0}</div>
                </div>
              </div>

              <div style={{ marginTop: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Shelf Location: <strong>{selectedBookForAction.shelfLocation || 'Not Assigned'}</strong></div>
                {selectedBookForAction.isbn && <div>ISBN: <strong>{selectedBookForAction.isbn}</strong></div>}
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenEditBookModal(selectedBookForAction);
                }}
              >
                <Edit size={14} />
                <span>Edit Book</span>
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </button>
                {selectedBookForAction.availableCopies > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenIssueModal(selectedBookForAction);
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Issue This Book</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
