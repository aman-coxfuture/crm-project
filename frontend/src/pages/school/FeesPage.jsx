import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { FormInput, Select } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  DollarSign,
  Plus,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Layers,
  TrendingUp,
} from 'lucide-react';

export default function FeesPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState('transactions');

  const [feeStructure] = useState(() => schoolDataService.getFeeStructure());
  const [transactions, setTransactions] = useState(() => schoolDataService.getFeeTransactions());
  const [students, setStudents] = useState(() => schoolDataService.getStudents());

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [newPayment, setNewPayment] = useState({
    studentId: 'STU002',
    studentName: 'Sophia Martinez',
    class: '10-A',
    amount: 1500,
    mode: 'Credit Card (Mock)',
    feeHead: 'Term 1 Tuition Balance',
  });

  const handleCollectSubmit = (e) => {
    e.preventDefault();
    const createdTxn = schoolDataService.recordFeePayment(newPayment);
    setTransactions(schoolDataService.getFeeTransactions());
    setStudents(schoolDataService.getStudents());
    setIsCollectModalOpen(false);
    setSelectedReceipt(createdTxn);
    success(`Payment of $${createdTxn.amount} recorded! Receipt: ${createdTxn.receiptNo}`);
  };

  const totalCollected = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalPending = students.reduce((acc, s) => acc + Math.max(0, s.totalFee - s.paidFee), 0);

  const txnColumns = [
    {
      header: 'Receipt # & Date',
      accessor: 'receiptNo',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.paidDate}</div>
        </div>
      ),
    },
    {
      header: 'Student Name & Class',
      accessor: 'studentName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class {row.class} • ID: {row.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Fee Head',
      accessor: 'feeHead',
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      sortable: true,
      render: (val) => <strong style={{ color: 'var(--success-text)', fontSize: '0.95rem' }}>${Number(val).toLocaleString()}</strong>,
    },
    {
      header: 'Payment Mode',
      accessor: 'mode',
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
    {
      header: 'Receipt',
      accessor: 'id',
      render: (id, row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedReceipt(row)}
        >
          <Receipt size={13} />
          <span>Receipt</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <DollarSign size={26} color="var(--primary)" />
            Fee Collection & Financial Ledgers
          </h1>
          <p className="page-subtitle">
            Manage fee heads, record payments, generate receipts and track dues
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCollectModalOpen(true)}>
          <Plus size={16} />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Term Collections"
          value={`$${totalCollected.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend="+18%"
          trendPositive={true}
        />
        <StatCard
          title="Outstanding / Pending Dues"
          value={`$${totalPending.toLocaleString()}`}
          icon={AlertCircle}
          color="amber"
          subtitle="Across 3 enrolled students"
        />
        <StatCard
          title="Total Transactions Logged"
          value={transactions.length}
          icon={Receipt}
          color="indigo"
          subtitle="Mock verified payments"
        />
      </div>

      <Tabs
        tabs={[
          { id: 'transactions', label: 'Payment Receipts & Transactions', icon: <Receipt size={15} /> },
          { id: 'structure', label: 'Fee Structure Master', icon: <Layers size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === 'transactions' && (
        <DataTable
          title="Fee Collection History"
          subtitle="Real-time ledger of recorded payments"
          columns={txnColumns}
          data={transactions}
          searchKeys={['receiptNo', 'studentName', 'studentId', 'feeHead', 'mode']}
        />
      )}

      {activeTab === 'structure' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fee Category / Head</th>
                  <th>Applicability</th>
                  <th>Frequency</th>
                  <th>Standard Amount</th>
                  <th>Mandatory</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((f) => (
                  <tr key={f.id}>
                    <td><strong>{f.head}</strong></td>
                    <td><span className="badge badge-primary">{f.class}</span></td>
                    <td>{f.frequency}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>${f.amount}</strong></td>
                    <td>
                      <span className={`badge ${f.mandatory ? 'badge-success' : 'badge-gray'}`}>
                        {f.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Fee Payment Receipt"
        subtitle={`Receipt No: ${selectedReceipt?.receiptNo}`}
      >
        {selectedReceipt && (
          <div>
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '14px',
                borderBottom: '2px solid var(--border-color)',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                Greenwood International Public School
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accounts & Bursar Department • Official Payment Voucher
              </div>
            </div>

            <div className="grid-2" style={{ gap: '12px', marginBottom: '18px' }}>
              <div className="card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>STUDENT</div>
                <div style={{ fontWeight: 700 }}>{selectedReceipt.studentName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Class {selectedReceipt.class}</div>
              </div>
              <div className="card" style={{ padding: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>PAYMENT DATE & MODE</div>
                <div style={{ fontWeight: 700 }}>{selectedReceipt.paidDate}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{selectedReceipt.mode}</div>
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Fee Description:</span>
                <strong>{selectedReceipt.feeHead}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount Paid:</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success-text)' }}>
                  ${Number(selectedReceipt.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Record Fee Payment"
        subtitle="Collect and issue receipt for student fees"
      >
        <form onSubmit={handleCollectSubmit}>
          <Select
            label="Select Student"
            value={newPayment.studentId}
            onChange={(e) => {
              const st = students.find((s) => s.id === e.target.value);
              setNewPayment({
                ...newPayment,
                studentId: e.target.value,
                studentName: st?.name || '',
                class: `${st?.class}-${st?.section}`,
              });
            }}
            options={students.map((s) => ({ value: s.id, label: `${s.name} (${s.rollNumber}) - Class ${s.class}-${s.section}` }))}
          />

          <div className="grid-2">
            <FormInput
              label="Amount to Collect ($)"
              type="number"
              required
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
            />
            <Select
              label="Payment Mode"
              value={newPayment.mode}
              onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value })}
              options={['Credit Card (Mock)', 'Bank Transfer (Mock)', 'Cash Deposit', 'UPI / Online (Mock)']}
            />
          </div>

          <FormInput
            label="Fee Head / Term"
            value={newPayment.feeHead}
            onChange={(e) => setNewPayment({ ...newPayment, feeHead: e.target.value })}
            placeholder="e.g. Term 1 Tuition Fee"
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Receipt & Collect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
