import React, { useEffect, useState } from "react";
import facultyService from "../../services/facultyService";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/common/DataTable";
import { assignmentService } from "../../services/assignmentService";
import Modal from "../../components/common/Modal";
import Tabs from "../../components/common/Tabs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FormInput, Select } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import api from "../../services/api";
import {
  GraduationCap,
  Plus,
  Eye,
  Trash2,
  BookOpen,
  User,
  Award,
  Layers,
  CheckCircle2,
  CalendarCheck,
  Clock,
  UserCheck,
} from "lucide-react";

export default function TeachersPage() {
  const { success, info } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editTeacher, setEditTeacher] = useState({
    name: "",
    email: "",
    employeeId: "",
    phone: "",
    department: "",
    designation: "",
    experience: "",
    qualification: "",
    salary: "",
  });

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes");

      if (!response.success) {
        throw new Error(response.message || "Failed to load classes");
      }

      setClasses(response.classes || []);
    } catch (err) {
      console.error("Failed to load classes:", err);
      info(err.message || "Failed to load classes");
    }
  };

  const loadFaculty = async () => {
    try {
      setLoading(true);

      const [facultyResponse, assignmentResponse] = await Promise.all([
        facultyService.getSchoolFaculty(),
        assignmentService.getAssignments(),
      ]);

      if (!facultyResponse.success) {
        throw new Error(facultyResponse.message || "Failed to load faculty");
      }

      const mappedAssignments = (assignmentResponse.assignments || []).map(
        (assignment) => ({
          id: assignment._id,
          facultyId: assignment.facultyId?._id || "",
          teacherId: assignment.facultyId?._id || "",
          teacherName: assignment.facultyId?.name || "",
          classId: assignment.classId?._id || "",
          class: assignment.classId?.name || "",
          section: assignment.section || "",
          subject: assignment.subject || "",
          room: assignment.room || "",
          status: assignment.isActive ? "Active" : "Inactive",
        }),
      );

      setAssignments(mappedAssignments);

      setTeachers(
        (facultyResponse.faculty || []).map((faculty) => {
          const teacherAssignments = mappedAssignments.filter(
            (assignment) =>
              assignment.facultyId === faculty._id &&
              assignment.status === "Active",
          );

          return {
            id: faculty.employeeId || faculty._id,
            name: faculty.name || "",
            email: faculty.email || "",
            phone: faculty.phone || "",
            department: faculty.department || "",
            subject: faculty.designation || "",
            experience: faculty.experience || "",
            joiningDate: faculty.createdAt
              ? new Date(faculty.createdAt).toLocaleDateString()
              : "",
            status: faculty.isActive ? "Active" : "Inactive",
            classes: teacherAssignments.map(
              (assignment) => `${assignment.class} - ${assignment.section}`,
            ),
            qualification: faculty.qualification || "",
            salary: faculty.salary || "",
            facultyId: faculty._id,
          };
        }),
      );
    } catch (err) {
      console.error("Failed to load faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await assignmentService.getAssignments();

      const mappedAssignments = (response.assignments || []).map(
        (assignment) => ({
          id: assignment._id,
          facultyId: assignment.facultyId?._id || "",
          teacherId: assignment.facultyId?._id || "",
          teacherName: assignment.facultyId?.userId?.name || "",
          classId: assignment.classId?._id || "",
          class: assignment.classId?.name || "",
          section: assignment.section || "",
          subject: assignment.subject || "",
          room: assignment.room || "",
          status: assignment.isActive ? "Active" : "Inactive",
        }),
      );

      setAssignments(mappedAssignments);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadFaculty();
    loadClasses();
  }, []);

  // New Faculty Member Form State
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    subject: "",
    department: "",
    classes: [],
    experience: "",
    qualification: "",
    salary: "",
  });

  // New Class Assignment Form State (Principal -> Teacher -> Class & Subject)
  const [assignmentForm, setAssignmentForm] = useState({
    teacherId: "",
    classId: "",
    section: "A",
    subject: "Mathematics",
    room: "Room 201",
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      info("Name, email and password are required");
      return;
    }

    try {
      const payload = {
        name: newTeacher.name.trim(),
        email: newTeacher.email.trim().toLowerCase(),
        password: newTeacher.password.trim(),
        employeeId: `EMP-${Date.now()}`,
        phone: newTeacher.phone?.trim() || null,
        department: newTeacher.department || null,
        designation: newTeacher.subject || null,
        experience: newTeacher.experience?.trim() || null,
        qualification: newTeacher.qualification?.trim() || null,
        salary: newTeacher.salary?.trim() || null,
      };

      const response = await facultyService.createSchoolFaculty(payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to create faculty");
      }

      await loadFaculty();

      setIsAddModalOpen(false);

      setNewTeacher({
        name: "",
        email: "",
        password: "",
        phone: "",
        subject: "",
        department: "",
        classes: [],
        experience: "",
        qualification: "",
        salary: "",
      });

      success(`Teacher ${newTeacher.name} added successfully!`);
    } catch (err) {
      console.error("Failed to add teacher:", err);
      info(err.message || "Failed to add teacher");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    const teacherObj = teachers.find(
      (t) => t.facultyId === assignmentForm.teacherId,
    );

    if (!teacherObj) {
      info("Please select a teacher");
      return;
    }

    if (!assignmentForm.classId) {
      info("Please select a class");
      return;
    }

    try {
      const payload = {
        facultyId: teacherObj.facultyId,
        classId: assignmentForm.classId,
        section: assignmentForm.section,
        subject: assignmentForm.subject,
        room: assignmentForm.room?.trim() || null,
      };

      const response = await assignmentService.createAssignment(payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to assign teacher");
      }

      // Refresh faculty + assigned classes from backend
      await loadFaculty();

      setIsAssignModalOpen(false);

      success(
        `Assigned ${teacherObj.name} to selected class (${assignmentForm.section}) for ${assignmentForm.subject}!`,
      );
    } catch (err) {
      console.error("Failed to assign teacher:", err);
      info(err.message || "Failed to assign teacher");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;

    try {
      const response = await facultyService.deleteSchoolFaculty(
        teacherToDelete.facultyId,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to deactivate teacher");
      }

      await loadFaculty();

      setTeacherToDelete(null);

      if (selectedTeacher?.id === teacherToDelete.id) {
        setSelectedTeacher(null);
      }

      success("Teacher deactivated successfully!");
    } catch (err) {
      console.error("Failed to deactivate teacher:", err);
      info(err.message || "Failed to deactivate teacher");
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      const response = await assignmentService.deleteAssignment(id);

      if (!response.success) {
        throw new Error(
          response.message || "Failed to remove class allocation",
        );
      }

      await loadFaculty();

      info("Class allocation removed successfully");
    } catch (err) {
      console.error("Failed to remove class allocation:", err);
      info(err.message || "Failed to remove class allocation");
    }
  };

  const columns = [
    {
      header: "Teacher Name & ID",
      accessor: "name",
      sortable: true,
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={
              row.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            }
            alt={val}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {val}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {row.id} • {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Primary Subject & Dept",
      accessor: "subject",
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            {row.department}
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Classes",
      accessor: "classes",
      render: (classes) => (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {classes?.map((c, i) => (
            <span
              key={i}
              className="badge badge-primary"
              style={{ fontSize: "0.7rem" }}
            >
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Experience",
      accessor: "experience",
      sortable: true,
    },
    {
      header: "Joining Date",
      accessor: "joiningDate",
      sortable: true,
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSelectedTeacher(row);
              setActiveTab("profile");
            }}
            title="View Teacher Profile"
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEditTeacher({
                name: row.name || "",
                email: row.email || "",
                employeeId: row.id || "",
                phone: row.phone || "",
                department: row.department || "",
                designation: row.subject || "",
                experience: row.experience || "",
                qualification: row.qualification || "",
                salary: row.salary || "",
              });

              setSelectedTeacher(row);
              setIsEditModalOpen(true);
            }}
            title="Edit Teacher"
          >
            Edit
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setAssignmentForm((prev) => ({
                ...prev,
                teacherId: row.facultyId,
              }));
              setIsAssignModalOpen(true);
            }}
            title="Assign Classes to Teacher"
          >
            <Layers size={13} />
            <span>Assign</span>
          </button>
          {row.status === "Active" ? (
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setTeacherToDelete(row)}
              title="Deactivate Teacher"
            >
              <Trash2 size={13} color="var(--danger)" />
            </button>
          ) : (
            <button
              className="btn btn-icon btn-sm"
              onClick={async () => {
                try {
                  const response = await facultyService.reactivateSchoolFaculty(
                    row.facultyId,
                  );

                  if (!response.success) {
                    throw new Error(
                      response.message || "Failed to reactivate teacher",
                    );
                  }

                  await loadFaculty();
                  success("Teacher reactivated successfully!");
                } catch (err) {
                  console.error("Failed to reactivate teacher:", err);
                  info(err.message || "Failed to reactivate teacher");
                }
              }}
              title="Reactivate Teacher"
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
            <GraduationCap size={26} color="var(--primary)" />
            Faculty & Teacher Management
          </h1>
          <p className="page-subtitle">
            Assign educators to Nursery–Class 10, manage subject curriculums and
            schedules
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <Layers size={16} />
            <span>Assign Teacher to Class</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      <DataTable
        title="Teaching Faculty Roster"
        subtitle={`Total ${teachers.length} certified educators in school`}
        columns={columns}
        data={teachers}
        searchKeys={["name", "id", "email", "subject", "department"]}
        filterOptions={[
          {
            label: "Department",
            key: "department",
            options: [
              "Mathematics & Computing",
              "Languages & Arts",
              "Science",
              "Social Sciences",
              "Sports & Wellness",
            ],
          },
          {
            label: "Status",
            key: "status",
            options: ["Active", "Inactive"],
          },
        ]}
      />

      {/* EDIT TEACHER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeacher(null);
        }}
        title="Edit Faculty Member"
        subtitle="Update teacher's faculty information"
        size="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!selectedTeacher) return;

            try {
              const payload = {
                name: editTeacher.name.trim(),
                email: editTeacher.email.trim().toLowerCase(),
                employeeId: editTeacher.employeeId.trim(),
                phone: editTeacher.phone?.trim() || null,
                department: editTeacher.department?.trim() || null,
                designation: editTeacher.designation?.trim() || null,
                experience: editTeacher.experience?.trim() || null,
                qualification: editTeacher.qualification?.trim() || null,
                salary: editTeacher.salary?.trim() || null,
              };

              const response = await facultyService.updateSchoolFaculty(
                selectedTeacher.facultyId,
                payload,
              );

              if (!response.success) {
                throw new Error(response.message || "Failed to update teacher");
              }

              await loadFaculty();

              setIsEditModalOpen(false);
              setSelectedTeacher(null);

              success("Teacher updated successfully!");
            } catch (err) {
              console.error("Failed to update teacher:", err);
              info(err.message || "Failed to update teacher");
            }
          }}
        >
          <div className="grid-2">
            <FormInput
              label="Teacher Full Name"
              required
              value={editTeacher.name}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  name: e.target.value,
                })
              }
            />

            <FormInput
              label="Official Email"
              type="email"
              required
              value={editTeacher.email}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Employee ID"
              required
              value={editTeacher.employeeId}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  employeeId: e.target.value,
                })
              }
            />

            <FormInput
              label="Contact Phone"
              value={editTeacher.phone}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Department"
              value={editTeacher.department}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  department: e.target.value,
                })
              }
            />

            <FormInput
              label="Designation / Subject"
              value={editTeacher.designation}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  designation: e.target.value,
                })
              }
            />

            <FormInput
              label="Teaching Experience"
              value={editTeacher.experience}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  experience: e.target.value,
                })
              }
              placeholder="e.g. 5 Years"
            />

            <FormInput
              label="Academic Qualification"
              value={editTeacher.qualification}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  qualification: e.target.value,
                })
              }
              placeholder="e.g. M.Sc, B.Ed"
            />

            <FormInput
              label="Annual Salary"
              value={editTeacher.salary}
              onChange={(e) =>
                setEditTeacher({
                  ...editTeacher,
                  salary: e.target.value,
                })
              }
              placeholder="e.g. 50000"
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

      {/* PRINCIPAL -> TEACHER -> CLASS ASSIGNMENT MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Teacher to Class & Subject"
        subtitle="Principal allocation: Select faculty, target grade (Nursery–Class 10) and subject"
        size="md"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Teacher</label>
            <select
              className="form-select"
              value={assignmentForm.teacherId}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  teacherId: e.target.value,
                })
              }
              required
            >
              {teachers.map((t) => (
                <option key={t.facultyId} value={t.facultyId}>
                  {t.name} — {t.subject} ({t.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Class (Nursery to 10)</label>
              <select
                className="form-select"
                value={assignmentForm.classId}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    classId: e.target.value,
                  })
                }
                required
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Section</label>
              <select
                className="form-select"
                value={assignmentForm.section}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    section: e.target.value,
                  })
                }
                required
              >
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={assignmentForm.subject}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    subject: e.target.value,
                  })
                }
                required
              >
                {[
                  "Mathematics",
                  "English",
                  "Science",
                  "Hindi",
                  "Social Science",
                  "Computer",
                  "PT",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "Art & Craft",
                  "General Awareness",
                ].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Assigned Classroom / Lab"
              value={assignmentForm.room}
              onChange={(e) =>
                setAssignmentForm({ ...assignmentForm, room: e.target.value })
              }
              placeholder="e.g. Room 201 or Lab 1"
            />
          </div>

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Teacher
            </button>
          </div>
        </form>
      </Modal>

      {/* TEACHER PROFILE MODAL */}
      <Modal
        isOpen={!!selectedTeacher && !isEditModalOpen}
        onClose={() => setSelectedTeacher(null)}
        title={
          selectedTeacher
            ? `${selectedTeacher.name} - Profile`
            : "Teacher Profile"
        }
        subtitle={`Department of ${selectedTeacher?.department} • ${selectedTeacher?.id}`}
        size="lg"
      >
        {selectedTeacher && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <img
                src={
                  selectedTeacher.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                }
                alt={selectedTeacher.name}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  {selectedTeacher.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  <span className="badge badge-primary">
                    {selectedTeacher.subject} Specialist
                  </span>
                  <StatusBadge status={selectedTeacher.status} size="sm" />
                </div>
              </div>
            </div>

            <Tabs
              tabs={[
                {
                  id: "profile",
                  label: "Faculty Information",
                  icon: <User size={14} />,
                },
                {
                  id: "schedule",
                  label: "Class Allocations",
                  icon: <Clock size={14} />,
                },
                {
                  id: "qualification",
                  label: "Qualifications & Salary",
                  icon: <Award size={14} />,
                },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "profile" && (
              <div className="grid-2" style={{ gap: "14px" }}>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    EMAIL
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.email}
                  </div>
                </div>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    PHONE
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.phone}
                  </div>
                </div>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    DEPARTMENT
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.department}
                  </div>
                </div>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    TEACHING EXPERIENCE
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.experience}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: "10px" }}>
                  Assigned Classes & Subjects
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedTeacher.classes?.map((c, i) => (
                    <span
                      key={i}
                      className="badge badge-primary"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                  Assigned Subjects
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(
                    selectedTeacher.assignedSubjects || [
                      selectedTeacher.subject,
                    ]
                  ).map((sub, i) => (
                    <span key={i} className="badge badge-purple">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "qualification" && (
              <div className="grid-2" style={{ gap: "14px" }}>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    ACADEMIC QUALIFICATIONS
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.qualification}
                  </div>
                </div>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    ANNUAL COMPENSATION
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.salary}
                  </div>
                </div>
                <div className="card" style={{ padding: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    JOINING DATE
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      marginTop: "2px",
                    }}
                  >
                    {selectedTeacher.joiningDate}
                  </div>
                </div>
              </div>
            )}

            <div
              className="modal-footer"
              style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTeacher(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD TEACHER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Register teacher qualifications and subject department"
        size="lg"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="grid-2">
            <FormInput
              label="Teacher Full Name"
              required
              value={newTeacher.name}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, name: e.target.value })
              }
              placeholder="e.g. Rahul Sharma"
            />
            <FormInput
              label="Official Email"
              type="email"
              required
              value={newTeacher.email}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, email: e.target.value })
              }
              placeholder="rahul@example.com"
            />
            <FormInput
              label="Password"
              type="password"
              value={newTeacher.password}
              onChange={(e) =>
                setNewTeacher({
                  ...newTeacher,
                  password: e.target.value,
                })
              }
              placeholder="Enter login password"
              required
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Contact Phone"
              value={newTeacher.phone}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, phone: e.target.value })
              }
              placeholder="+1 (555) 789-0123"
            />
            <FormInput
              label="Primary Subject"
              value={newTeacher.subject}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, subject: e.target.value })
              }
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Department"
              value={newTeacher.department}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, department: e.target.value })
              }
              options={[
                "Mathematics & Computing",
                "Languages & Arts",
                "Science",
                "Social Sciences",
                "Sports & Wellness",
              ]}
            />
            <FormInput
              label="Experience"
              value={newTeacher.experience}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, experience: e.target.value })
              }
              placeholder="e.g. 7 Years"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Academic Qualification"
              value={newTeacher.qualification}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, qualification: e.target.value })
              }
              placeholder="e.g. M.Sc Mathematics, B.Ed"
            />
            <FormInput
              label="Annual Salary"
              value={newTeacher.salary}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, salary: e.target.value })
              }
              placeholder="$58,000/yr"
            />
          </div>

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Teacher
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Teacher"
        message={`Are you sure you want to deactivate ${teacherToDelete?.name} from the school faculty roster? The teacher record will be kept in the system.`}
        confirmText="Deactivate Teacher"
        isDangerous={true}
      />
    </div>
  );
}
