import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { feeService } from '../../services';

export default function UniversityFeesPage() {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    college: '',
    head: 'Annual Affiliation Fee',
    amount: '₹ 25,00,000',
    period: 'AY 2026-27',
    dueDate: '2026-10-15',
    status: 'Pending',
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await feeService.getUniversityFees();
      setAccounts(data || []);
    } catch (err) {
      addToast('Failed to load university fees', 'error');
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
      const newAcc = await feeService.createUniversityFee(formData);
      setAccounts([...accounts, newAcc]);
      setIsAddOpen(false);
      addToast(`University account demand note issued to ${formData.college}`, 'success');
    } catch (err) {
      addToast('Failed to generate demand note', 'error');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const updated = await feeService.markUniversityFeePaid(id);
      setAccounts(accounts.map((a) => (a.id === id ? updated : a)));
      addToast('Affiliation remittance verified', 'success');
    } catch (err) {
      addToast('Failed to verify remittance', 'error');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Demand Note #',
      render: (row) => <strong>{row.id}</strong>,
    },
    {
      key: 'college',
      label: 'Affiliated College / Institute',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.college}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.head}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Sanction Amount (₹)',
      render: (row) => <strong>{row.amount}</strong>,
    },
    {
      key: 'period',
      label: 'Academic Session',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.period}</span>,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.dueDate}</span>,
    },
    {
      key: 'status',
      label: 'Remittance Status',
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
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cleared</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Financial Accounts & Grants</h1>
          <p className="page-subtitle">Central affiliation dues, research funding accounts, and statutory fund governance</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Issue Demand Note
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        title="Institutional Dues Master"
        subtitle="Manage affiliation receipts and grant allocations"
        searchPlaceholder="Search institute..."
        searchKeys={['college', 'head', 'id']}
        filters={[
          { key: 'status', label: 'Status', options: ['Paid', 'Pending'] },
        ]}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Note"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Issue Financial Demand Note"
        subtitle="University Accounts Directorate"
      >
        <Input
          label="Affiliated Institute Name"
          required
          value={formData.college}
          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
          placeholder="Institute Name"
        />
        <div className="grid-2">
          <Input
            label="Accounting Head"
            required
            value={formData.head}
            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
            placeholder="Annual Affiliation & Exam Fee"
          />
          <Input
            label="Amount (₹)"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="₹ 25,00,000"
          />
        </div>
        <Input
          label="Due Date"
          type="date"
          required
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </FormModal>
    </div>
  );
}
