import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import { DollarSign, CreditCard, CheckCircle2, AlertCircle, Receipt, Printer } from 'lucide-react';

export default function StudentFeesPage() {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const students = schoolDataService.getStudents();
  const student = students.find((s) => s.id === currentUser?.id || s.rollNumber === currentUser?.rollNumber) || students[0];

  const transactions = schoolDataService.getFeeTransactions().filter((t) => t.studentId === student.id || t.studentName === student.name);
  const pendingAmount = Math.max(0, student.totalFee - student.paidFee);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const handleMockPay = (e) => {
    e.preventDefault();
    schoolDataService.recordFeePayment({
      studentId: student.id,
      studentName: student.name,
      class: `${student.class}-${student.section}`,
      amount: pendingAmount || 500,
      mode: 'Online Card (Demo)',
      feeHead: 'Term Fee Clearance',
    });
    setIsPayModalOpen(false);
    success('Mock payment processed successfully! Receipt voucher generated.');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <DollarSign size={26} color="var(--primary)" />
            Student Fee Account & Payment Receipts
          </h1>
          <p className="page-subtitle">
            View fee ledgers, outstanding balances and download verified payment receipts
          </p>
        </div>

        {pendingAmount > 0 && (
          <button className="btn btn-primary" onClick={() => setIsPayModalOpen(true)}>
            <CreditCard size={16} />
            <span>Pay Pending Fee (${pendingAmount})</span>
          </button>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Annual Fee" value={`$${student.totalFee}`} icon={DollarSign} color="indigo" />
        <StatCard title="Total Paid to Date" value={`$${student.paidFee}`} icon={CheckCircle2} color="emerald" />
        <StatCard
          title="Outstanding Balance"
          value={`$${pendingAmount}`}
          icon={AlertCircle}
          color={pendingAmount > 0 ? 'amber' : 'emerald'}
          subtitle={pendingAmount > 0 ? 'Due for Term 1' : 'All fees fully settled'}
        />
      </div>

      {/* Payment History Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Payment Receipts History</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Paid Date</th>
                <th>Fee Head / Description</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td><strong style={{ color: 'var(--primary)' }}>{t.receiptNo}</strong></td>
                  <td>{t.paidDate}</td>
                  <td>{t.feeHead}</td>
                  <td><strong style={{ color: 'var(--success-text)' }}>${t.amount}</strong></td>
                  <td><span className="badge badge-info">{t.mode}</span></td>
                  <td><span className="badge badge-success">Success</span></td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                    No prior transaction history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Pay Outstanding School Dues"
        subtitle="Frontend mock checkout demonstration"
      >
        <form onSubmit={handleMockPay}>
          <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Student:</span> <strong>{student.name} ({student.rollNumber})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span style={{ fontWeight: 800 }}>Amount Payable:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>${pendingAmount}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            ℹ️ This is a frontend demo sandbox. No actual credit card charge will be made.
          </p>

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Authorize Mock Payment (${pendingAmount})
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
