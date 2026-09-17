import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import staffService from "../../services/staffService";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FormInput, Select } from "../../components/common/FormInput";
import { Briefcase, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";

const initialStaff = {
  name: "",
  email: "",
  phone: "",
  department: "Administration",
  designation: "Office Executive",
  salary: "",
  joiningDate: "",
};

export default function StaffPage() {
  const { success, error } = useToast();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [newStaff, setNewStaff] = useState(initialStaff);
  const [editStaff, setEditStaff] = useState(initialStaff);

  const departments = [
    "Finance & Accounts",
    "Front Office",
    "Library",
    "Laboratories",
    "Security & Campus",
    "Administration",
  ];

  // -------------------------
  // LOAD STAFF
  // -------------------------
  const loadStaff = async () => {
    try {
      setLoading(true);

      const response = await staffService.getSchoolStaff();

      if (!response.success) {
        throw new Error(response.message || "Failed to load staff");
      }

      const mappedStaff = (response.staff || []).map((item) => ({
        id: item._id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        department: item.department || "",
        designation: item.designation || "",
        salary: item.salary || 0,
        joiningDate: item.joiningDate
          ? new Date(item.joiningDate).toISOString().split("T")[0]
          : "",
        status: item.isActive ? "Active" : "Inactive",
      }));

      setStaff(mappedStaff);
    } catch (err) {
      console.error("Failed to load staff:", err);
      error(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // -------------------------
  // ADD STAFF
  // -------------------------
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newStaff.name.trim()) {
      error("Please enter staff name");
      return;
    }

    if (!newStaff.department) {
      error("Please select department");
      return;
    }

    if (!newStaff.designation.trim()) {
      error("Please enter designation");
      return;
    }

    try {
      const payload = {
        name: newStaff.name.trim(),
        email: newStaff.email.trim()
          ? newStaff.email.trim().toLowerCase()
          : null,
        phone: newStaff.phone.trim() || null,
        department: newStaff.department,
        designation: newStaff.designation.trim(),
        salary: Number(newStaff.salary) || 0,
        joiningDate: newStaff.joiningDate || undefined,
      };

      const response = await staffService.createSchoolStaff(payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to create staff");
      }

      await loadStaff();

      setIsAddModalOpen(false);
      setNewStaff(initialStaff);

      success("Staff member added successfully!");
    } catch (err) {
      console.error("Failed to create staff:", err);
      error(err.message || "Failed to create staff");
    }
  };

  // -------------------------
  // OPEN EDIT
  // -------------------------
  const handleEditOpen = (row) => {
    setSelectedStaff(row);

    setEditStaff({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      department: row.department || "Administration",
      designation: row.designation || "",
      salary: row.salary || "",
      joiningDate: row.joiningDate || "",
    });

    setIsEditModalOpen(true);
  };

  // -------------------------
  // UPDATE STAFF
  // -------------------------
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStaff) return;

    if (!editStaff.name.trim()) {
      error("Please enter staff name");
      return;
    }

    if (!editStaff.department) {
      error("Please select department");
      return;
    }

    if (!editStaff.designation.trim()) {
      error("Please enter designation");
      return;
    }

    try {
      const payload = {
        name: editStaff.name.trim(),
        email: editStaff.email.trim()
          ? editStaff.email.trim().toLowerCase()
          : null,
        phone: editStaff.phone.trim() || null,
        department: editStaff.department,
        designation: editStaff.designation.trim(),
        salary: Number(editStaff.salary) || 0,
        joiningDate: editStaff.joiningDate || null,
      };

      const response = await staffService.updateSchoolStaff(
        selectedStaff.id,
        payload,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update staff");
      }

      await loadStaff();

      setIsEditModalOpen(false);
      setSelectedStaff(null);

      success("Staff member updated successfully!");
    } catch (err) {
      console.error("Failed to update staff:", err);
      error(err.message || "Failed to update staff");
    }
  };

  // -------------------------
  // DEACTIVATE
  // -------------------------
  const handleDeactivate = async () => {
    if (!staffToDelete) return;

    try {
      const response = await staffService.deleteSchoolStaff(staffToDelete.id);

      if (!response.success) {
        throw new Error(response.message || "Failed to deactivate staff");
      }

      await loadStaff();

      setStaffToDelete(null);

      success("Staff member deactivated successfully!");
    } catch (err) {
      console.error("Failed to deactivate staff:", err);
      error(err.message || "Failed to deactivate staff");
    }
  };

  // -------------------------
  // REACTIVATE
  // -------------------------
  const handleReactivate = async (row) => {
    try {
      const response = await staffService.reactivateSchoolStaff(row.id);

      if (!response.success) {
        throw new Error(response.message || "Failed to reactivate staff");
      }

      await loadStaff();

      success("Staff member reactivated successfully!");
    } catch (err) {
      console.error("Failed to reactivate staff:", err);
      error(err.message || "Failed to reactivate staff");
    }
  };

  // -------------------------
  // TABLE
  // -------------------------
  const columns = [
    {
      header: "Staff Member & ID",
      accessor: "name",
      sortable: true,
      render: (val, row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--primary)",
              fontWeight: 800,
            }}
          >
            {val?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {val}
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
              }}
            >
              {row.id} • {row.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Department",
      accessor: "department",
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },

    {
      header: "Designation / Role",
      accessor: "designation",
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },

    {
      header: "Contact Phone",
      accessor: "phone",
    },

    {
      header: "Joining Date",
      accessor: "joiningDate",
      sortable: true,
    },

    {
      header: "Annual Salary",
      accessor: "salary",
      sortable: true,
      render: (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`,
    },

    {
      header: "Status",
      accessor: "status",
      isStatus: true,
      sortable: true,
    },

    {
      header: "Actions",
      accessor: "id",
      render: (id, row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <button
            className="btn btn-icon btn-sm"
            onClick={() => handleEditOpen(row)}
            title="Edit Staff"
          >
            <Edit2 size={14} />
          </button>

          {row.status === "Active" ? (
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setStaffToDelete(row)}
              title="Deactivate Staff"
            >
              <Trash2 size={14} color="var(--danger)" />
            </button>
          ) : (
            <button
              className="btn btn-icon btn-sm"
              onClick={() => handleReactivate(row)}
              title="Reactivate Staff"
            >
              <CheckCircle2 size={14} color="var(--success)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase size={26} color="var(--primary)" />
            Staff & Non-Teaching Personnel Management
          </h1>

          <p className="page-subtitle">
            Manage accountants, librarians, receptionists, security, lab
            technicians and office staff
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      <DataTable
        title="Support Staff Directory"
        subtitle={`Total ${staff.length} staff members on campus`}
        columns={columns}
        data={staff}
        loading={loading}
        searchKeys={["name", "id", "email", "department", "designation"]}
        filterOptions={[
          {
            label: "Department",
            key: "department",
            options: departments,
          },
          {
            label: "Status",
            key: "status",
            options: ["Active", "Inactive"],
          },
        ]}
      />

      {/* ADD STAFF */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Staff Member"
        subtitle="Add non-teaching operational personnel to school records"
      >
        <form onSubmit={handleAddSubmit}>
          <FormInput
            label="Staff Full Name"
            required
            value={newStaff.name}
            onChange={(e) =>
              setNewStaff({
                ...newStaff,
                name: e.target.value,
              })
            }
            placeholder="e.g. Walter White"
          />

          <div className="grid-2">
            <FormInput
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  email: e.target.value,
                })
              }
              placeholder="staff@school.edu"
            />

            <FormInput
              label="Phone"
              value={newStaff.phone}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  phone: e.target.value,
                })
              }
              placeholder="9876543210"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={newStaff.department}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  department: e.target.value,
                })
              }
              options={departments}
            />

            <FormInput
              label="Designation"
              required
              value={newStaff.designation}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  designation: e.target.value,
                })
              }
              placeholder="e.g. Head Librarian"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Annual Salary"
              type="number"
              value={newStaff.salary}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  salary: e.target.value,
                })
              }
              placeholder="42000"
            />

            <FormInput
              label="Joining Date"
              type="date"
              value={newStaff.joiningDate}
              onChange={(e) =>
                setNewStaff({
                  ...newStaff,
                  joiningDate: e.target.value,
                })
              }
            />
          </div>

          <div
            className="modal-footer"
            style={{
              margin: "20px -24px -24px",
              padding: "16px 24px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Register Personnel
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff Member"
        subtitle="Update staff member information"
      >
        <form onSubmit={handleEditSubmit}>
          <FormInput
            label="Staff Full Name"
            required
            value={editStaff.name}
            onChange={(e) =>
              setEditStaff({
                ...editStaff,
                name: e.target.value,
              })
            }
          />

          <div className="grid-2">
            <FormInput
              label="Email"
              type="email"
              value={editStaff.email}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  email: e.target.value,
                })
              }
            />

            <FormInput
              label="Phone"
              value={editStaff.phone}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={editStaff.department}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  department: e.target.value,
                })
              }
              options={departments}
            />

            <FormInput
              label="Designation"
              required
              value={editStaff.designation}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  designation: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Annual Salary"
              type="number"
              value={editStaff.salary}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  salary: e.target.value,
                })
              }
            />

            <FormInput
              label="Joining Date"
              type="date"
              value={editStaff.joiningDate}
              onChange={(e) =>
                setEditStaff({
                  ...editStaff,
                  joiningDate: e.target.value,
                })
              }
            />
          </div>

          <div
            className="modal-footer"
            style={{
              margin: "20px -24px -24px",
              padding: "16px 24px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DEACTIVATE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Staff Member"
        message={`Are you sure you want to deactivate ${staffToDelete?.name}? The staff record will remain in the system.`}
        confirmText="Deactivate Staff"
        isDangerous={true}
      />
    </div>
  );
}
