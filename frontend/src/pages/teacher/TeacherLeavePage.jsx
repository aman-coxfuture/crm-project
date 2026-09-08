import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ClipboardList, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function TeacherLeavePage() {
  const { success } = useToast();
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState(() => schoolDataService.getLeaves());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [newLeave, setNewLeave] = useState({
    leaveType: 'Medical Leave',
    startDate: '2025-10-10',
    endDate: '2025-10-12',
    days: 3,
    reason: '',
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!newLeave.reason) return;
    const created = schoolDataService.applyLeave({
      applicantName: currentUser?.name || 'Sarah Jenkins',
      role: 'Teacher',
      applicantId: currentUser?.id || 'TCH-001',
      ...newLeave,
    });
    setLeaves(schoolDataService.getLeaves());
    setIsApplyModalOpen(false);
    setNewLeave({
      leaveType: 'Medical Leave',
      startDate: '2025-10-10',
      endDate: '2025-10-12',
      days: 3,
      reason: '',
    });
    success('Leave request submitted to Principal for approval!');
  };

  const myLeaves = leaves.filter((l) => l.role === 'Teacher');

  const columns = [
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      sortable: true,
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      sortable: true,
    },
    {
      header: 'Days',
      accessor: 'days',
      sortable: true,
      render: (val) => <strong>{val} Day(s)</strong>,
    },
    {
      header: 'Reason',
      accessor: 'reason',
    },
    {
      header: 'Applied Date',
      accessor: 'appliedOn',
      sortable: true,
    },
    {
      header: 'Approval Status',
      accessor: 'status',
      isStatus: true,
      sortable: true,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardList size={26} color="var(--primary)" />
            Faculty Leave Applications
          </h1>
          <p className="page-subtitle">
            Apply for casual, medical or academic leaves and monitor principal approval state
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      <DataTable
        title="My Leave History"
        subtitle="Submitted applications status log"
        columns={columns}
        data={myLeaves}
        searchKeys={['leaveType', 'reason', 'status']}
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        subtitle="Application will be sent directly to Principal inbox"
      >
        <form onSubmit={handleApplySubmit}>
          <Select
            label="Leave Category"
            value={newLeave.leaveType}
            onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
            options={['Medical Leave', 'Casual Leave', 'Academic Conference', 'Maternity / Paternity', 'Bereavement']}
          />

          <div className="grid-3">
            <FormInput
              label="Start Date"
              type="date"
              value={newLeave.startDate}
              onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
            />
            <FormInput
              label="End Date"
              type="date"
              value={newLeave.endDate}
              onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
            />
            <FormInput
              label="Total Days"
              type="number"
              value={newLeave.days}
              onChange={(e) => setNewLeave({ ...newLeave, days: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Reason for Absence"
            required
            value={newLeave.reason}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            placeholder="State detailed reason for leave..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
