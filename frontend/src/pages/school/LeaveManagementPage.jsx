import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function LeaveManagementPage() {
  const { success, error, info } = useToast();
  const [leaves, setLeaves] = useState(() => schoolDataService.getLeaves());
  const [activeTab, setActiveTab] = useState('All');

  const handleApprove = (id, name) => {
    const updated = schoolDataService.updateLeaveStatus(id, 'Approved');
    setLeaves(updated);
    success(`Leave request for ${name} has been approved!`);
  };

  const handleReject = (id, name) => {
    const updated = schoolDataService.updateLeaveStatus(id, 'Rejected');
    setLeaves(updated);
    error(`Leave request for ${name} was rejected.`);
  };

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const filteredLeaves = leaves.filter((l) => activeTab === 'All' || l.status === activeTab);

  const columns = [
    {
      header: 'Applicant Name & Role',
      accessor: 'applicantName',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Role: <strong>{row.role}</strong> • ID: {row.applicantId}
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Duration',
      accessor: 'startDate',
      sortable: true,
      render: (val, row) => (
        <div style={{ fontSize: '0.825rem' }}>
          <div><strong>{row.days} Day(s)</strong></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{val} to {row.endDate}</div>
        </div>
      ),
    },
    {
      header: 'Reason / Justification',
      accessor: 'reason',
      render: (val) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      header: 'Applied On',
      accessor: 'appliedOn',
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
    {
      header: 'Principal Action',
      accessor: 'id',
      render: (id, row) => (
        row.status === 'Pending' ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleApprove(id, row.applicantName)}
              title="Approve Leave"
            >
              <Check size={14} />
              <span>Approve</span>
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleReject(id, row.applicantName)}
              title="Reject Leave"
            >
              <X size={14} />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Decided</span>
        )
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardList size={26} color="var(--primary)" />
            Leave Management & Approvals
          </h1>
          <p className="page-subtitle">
            Review and grant leave applications submitted by faculty, students and operational staff
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard title="Pending Approvals" value={pendingCount} icon={Clock} color="amber" subtitle="Awaiting Principal review" />
        <StatCard title="Approved Leaves" value={approvedCount} icon={CheckCircle2} color="emerald" subtitle="Active sanction" />
        <StatCard title="Rejected Requests" value={rejectedCount} icon={XCircle} color="rose" subtitle="Declined with cause" />
      </div>

      <Tabs
        tabs={[
          { id: 'All', label: 'All Requests', icon: <ClipboardList size={14} />, count: leaves.length },
          { id: 'Pending', label: 'Pending Review', icon: <Clock size={14} />, count: pendingCount },
          { id: 'Approved', label: 'Approved', icon: <CheckCircle2 size={14} />, count: approvedCount },
          { id: 'Rejected', label: 'Rejected', icon: <XCircle size={14} />, count: rejectedCount },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      <DataTable
        title="Leave Applications Inbox"
        subtitle="Principal authorization ledger"
        columns={columns}
        data={filteredLeaves}
        searchKeys={['applicantName', 'role', 'leaveType', 'reason', 'status']}
      />
    </div>
  );
}
