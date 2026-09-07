import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle2, Download, Eye, Send } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { feeService } from '../../services';

export default function SchoolFeesPage() {
  const { addToast } = useToast();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    student: '',
    class: 'Class 10-A',
    amount: '₹ 24,500',
    term: 'Quarter 2 (Jul - Sep)',
    dueDate: '2026-09-30',
    status: 'Pending',
    method: 'Awaiting Payment',
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await feeService.getSchoolFees();
      setFees(data || []);
    } catch (err) {
      addToast('Failed to load fee invoices', 'error');
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
      const newInvoice = await feeService.createSchoolFee(formData);
      setFees([newInvoice, ...fees]);
      setIsAddOpen(false);
      addToast(`Invoice generated for ${formData.student}`, 'success');
    } catch (err) {
      addToast('Failed to generate invoice', 'error');
    }
  };

  const handleMarkPaid = async (inv) => {
    try {
      const updated = await feeService.markSchoolFeePaid(inv.id);
      setFees(fees.map((f) => (f.id === inv.id ? updated : f)));
      addToast(`Invoice ${inv.id} marked as Paid`, 'success');
    } catch (err) {
      addToast('Failed to update invoice', 'error');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Invoice #',
      render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.id}</span>,
    },
    {
      key: 'student',
      label: 'Student & Class',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.student}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.class}</div>
        </div>
      ),
    },
    {
      key: 'term',
      label: 'Academic Term / Quarter',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.term}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <strong>{row.amount}</strong>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.dueDate}</span>,
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
            <Button variant="secondary" size="sm" onClick={() => handleMarkPaid(row)}>
              Mark Paid
            </Button>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Settled</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addToast(`Payment reminder SMS dispatched to ${row.student}'s guardian`, 'info')}
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
          <h1 className="page-title">Fee & Invoice Management</h1>
          <p className="page-subtitle">Track tuition fee collections, quarterly dues, and receipts</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Create Invoice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={fees}
        title="Fee Invoices Register"
        subtitle="Manage student billing, remittances, and reminders"
        searchPlaceholder="Search by student name, invoice #..."
        searchKeys={['student', 'id', 'class', 'term']}
        filters={[
          { key: 'status', label: 'Status', options: ['Paid', 'Pending', 'Overdue'] },
          { key: 'class', label: 'Class', options: ['Class 10-A', 'Class 10-B', 'Class 12-A', 'Class 12-B', 'Class 8-B'] },
        ]}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Generate Invoice"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Generate Fee Invoice"
        subtitle="Issue billing dues for student"
      >
        <div className="grid-2">
          <Input
            label="Student Full Name"
            required
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            placeholder="Student Name"
          />
          <Select
            label="Class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            options={['Class 10-A', 'Class 10-B', 'Class 12-A', 'Class 12-B', 'Class 8-B']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Total Amount (₹)"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="₹ 24,500"
          />
          <Input
            label="Due Date"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <Input
          label="Billing Term"
          value={formData.term}
          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          placeholder="Quarter 2 (Jul - Sep)"
        />
      </FormModal>
    </div>
  );
}
