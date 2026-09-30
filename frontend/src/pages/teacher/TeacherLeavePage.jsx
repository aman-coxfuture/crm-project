import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { FormInput, Select, Textarea } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ClipboardList, Plus, CheckCircle2, Clock } from "lucide-react";

export default function TeacherLeavePage() {
  const { success } = useToast();
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const loadMyLeaves = async () => {
      try {
        setLoadingLeaves(true);

        const response = await api.get("/leaves/me");

        setLeaves(response?.leaves || []);
      } catch (error) {
        console.error("Failed to load leave applications:", error);
        setLeaves([]);
      } finally {
        setLoadingLeaves(false);
      }
    };

    loadMyLeaves();
  }, []);

  const [newLeave, setNewLeave] = useState({
    leaveType: "Medical Leave",
    startDate: "",
    endDate: "",
    days: 0,
    reason: "",
  });

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!newLeave.reason.trim()) {
      return;
    }

    if (!newLeave.startDate || !newLeave.endDate) {
      return;
    }

    if (new Date(newLeave.endDate) < new Date(newLeave.startDate)) {
      return;
    }

    try {
      const response = await api.post("/leaves", {
        leaveType: newLeave.leaveType,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        days: newLeave.days,
        reason: newLeave.reason,
      });

      if (response?.success) {
        setLeaves((prev) => [response.leave, ...prev]);

        setIsApplyModalOpen(false);

        setNewLeave({
          leaveType: "Medical Leave",
          startDate: "",
          endDate: "",
          days: 1,
          reason: "",
        });

        success("Leave request submitted to Principal for approval!");
      }
    } catch (error) {
      console.error("Apply Leave Error:", error);
    }
  };
  const myLeaves = leaves;

  const columns = [
    {
      header: "Leave Type",
      accessor: "leaveType",
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: "Start Date",
      accessor: "startDate",
      sortable: true,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "End Date",
      accessor: "endDate",
      sortable: true,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Days",
      accessor: "days",
      sortable: true,
      render: (val) => <strong>{val} Day(s)</strong>,
    },
    {
      header: "Reason",
      accessor: "reason",
    },
    {
      header: "Applied Date",
      accessor: "createdAt",
      sortable: true,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Approval Status",
      accessor: "status",
      isStatus: true,
      sortable: true,
    },

    {
      header: "Review Remarks",
      accessor: "reviewRemarks",
      render: (val) => (
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          {val || "-"}
        </span>
      ),
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
            Apply for casual, medical or academic leaves and monitor principal
            approval state
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsApplyModalOpen(true)}
        >
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      <DataTable
        title="My Leave History"
        subtitle="Submitted applications status log"
        columns={columns}
        data={myLeaves}
        searchKeys={["leaveType", "reason", "status"]}
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
            onChange={(e) =>
              setNewLeave({ ...newLeave, leaveType: e.target.value })
            }
            options={[
              "Medical Leave",
              "Casual Leave",
              "Academic Conference",
              "Maternity / Paternity",
              "Bereavement",
            ]}
          />

          <div className="grid-3">
            <FormInput
              label="Start Date"
              type="date"
              value={newLeave.startDate}
              onChange={(e) => {
                const startDate = e.target.value;

                let days = 0;

                if (startDate && newLeave.endDate) {
                  const start = new Date(startDate);
                  const end = new Date(newLeave.endDate);

                  if (end >= start) {
                    days =
                      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  }
                }

                setNewLeave({
                  ...newLeave,
                  startDate,
                  days,
                });
              }}
            />
            <FormInput
              label="End Date"
              type="date"
              min={newLeave.startDate}
              value={newLeave.endDate}
              onChange={(e) => {
                const endDate = e.target.value;

                let days = 0;

                if (newLeave.startDate && endDate) {
                  const start = new Date(newLeave.startDate);
                  const end = new Date(endDate);

                  if (end >= start) {
                    days =
                      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  }
                }

                setNewLeave({
                  ...newLeave,
                  endDate,
                  days,
                });
              }}
            />
            <FormInput
              label="Total Days"
              type="number"
              value={newLeave.days}
              readOnly
            />
          </div>

          <Textarea
            label="Reason for Absence"
            required
            value={newLeave.reason}
            onChange={(e) =>
              setNewLeave({ ...newLeave, reason: e.target.value })
            }
            placeholder="State detailed reason for leave..."
          />

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsApplyModalOpen(false)}
            >
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
