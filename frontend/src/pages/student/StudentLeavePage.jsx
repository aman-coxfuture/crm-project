import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { ClipboardList, Plus } from 'lucide-react';

export default function StudentLeavePage() {
  const { success } = useToast();
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState(() => schoolDataService.getLeaves());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const studentName = currentUser?.name || 'Alex Johnson';
  const studentId = currentUser?.id || 'STU001';

  const [newLeave, setNewLeave] = useState({
    leaveType: 'Sick Leave',
    startDate: '2025-10-08',
    endDate: '2025-10-09',
    days: 2,
    reason: '',
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!newLeave.reason) return;
    schoolDataService.applyLeave({
      applicantName: studentName,
      role: 'Student',
      applicantId: studentId,
      ...newLeave,
    });
    setLeaves(schoolDataService.getLeaves());
    setIsApplyModalOpen(false);
    setNewLeave({
      leaveType: 'Sick Leave',
      startDate: '2025-10-08',
      endDate: '2025-10-09',
      days: 2,
      reason: '',
    });
    success('Leave application submitted to Principal office for sanctioning!');
  };

  const myLeaves = leaves.filter((l) => l.role === 'Student');

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
      header: 'Days Absent',
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
            Student Leave Applications
          </h1>
          <p className="page-subtitle">
            Submit sick leave or personal absence requests to school administration
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      <DataTable
        title="My Leave History"
        subtitle="Sanctioned and pending student leave records"
        columns={columns}
        data={myLeaves}
        searchKeys={['leaveType', 'reason', 'status']}
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Student Leave Application"
        subtitle="Will be forwarded to Class Teacher & Principal"
      >
        <form onSubmit={handleApplySubmit}>
          <Select
            label="Leave Type"
            value={newLeave.leaveType}
            onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
            options={['Sick Leave', 'Family Emergency', 'Religious Observance', 'Medical Appointment']}
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
              label="Days"
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
            placeholder="Explain why you are unable to attend classes..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
