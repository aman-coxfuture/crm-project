import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle2, Download, Send } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { feeService } from '../../services';

export default function CollegeFeesPage() {
  const { addToast } = useToast();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    student: '',
    usn: '',
    course: 'B.Tech CSE',
    amount: '₹ 1,12,500',
    term: 'Semester 5 Tuition',
    dueDate: '2026-09-30',
    status: 'Pending',
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await feeService.getCollegeFees();
      setFees(data || []);
    } catch (err) {
      addToast('Failed to load college fees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newFee = await feeService.createCollegeFee(formData);
      setFees([newFee, ...fees]);
      setIsAddOpen(false);
      addToast(`Semester fee invoice created for ${formData.student}`, 'success');
    } catch (err) {
      addToast('Failed to generate fee invoice', 'error');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const updated = await feeService.markCollegeFeePaid(id);
      setFees(fees.map((f) => (f.id === id ? updated : f)));
      addToast('Payment recorded successfully', 'success');
    } catch (err) {
      addToast('Failed to record payment', 'error');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Invoice #',
      render: (row) => <strong>{row.id}</strong>,
    },
    {
      key: 'student',
      label: 'Student Name & USN',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.student}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>USN: {row.usn} • {row.course}</div>
        </div>
      ),
    },
    {
      key: 'term',
      label: 'Semester Term',
      render: (row) => <span>{row.term}</span>,
    },
    {
      key: 'amount',
      label: 'Amount (₹)',
      render: (row) => <strong>{row.amount}</strong>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.dueDate}</span>,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {row.status !== 'Paid' ? (
            <Button variant="secondary" size="sm" onClick={() => handleMarkPaid(row.id)}>
              Mark Paid
            </Button>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Settled</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addToast(`Reminder email sent to ${row.student}`, 'info')}
          >
            <Send size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College Semester Fee Accounts</h1>
          <p className="page-subtitle">Manage tuition fee collections, laboratory charges, and student receipts</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Create Fee Invoice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={fees}
        title="Fee Invoices & Dues"
        subtitle="Manage semester payment clearances"
        searchPlaceholder="Search by student name, USN, invoice..."
        searchKeys={['student', 'usn', 'id', 'course']}
        filters={[
          { key: 'status', label: 'Status', options: ['Paid', 'Pending', 'Overdue'] },
        ]}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Invoice"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Create Semester Invoice"
        subtitle="Issue billing dues for student"
      >
        <div className="grid-2">
          <Input
            label="Student Full Name"
            required
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
          />
          <Input
            label="USN"
            required
            value={formData.usn}
            onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Amount (₹)"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <Input
            label="Due Date"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}
