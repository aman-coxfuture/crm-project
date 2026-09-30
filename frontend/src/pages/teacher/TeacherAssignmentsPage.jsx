import React, { useEffect, useState } from "react";
import { schoolDataService } from "../../services/schoolDataService";
import api from "../../services/api";
import { assignmentService } from "../../services/assignmentService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import { FormInput, Select, Textarea } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import { BookOpen, Plus, Eye, CheckCircle2, Award } from "lucide-react";

export default function TeacherAssignmentsPage() {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsn, setSelectedAsn] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [newAsn, setNewAsn] = useState({
    title: "",
    subject: "",
    classId: "",
    class: "",
    section: "",
    dueDate: "",
    maxMarks: 25,
    description: "",
  });

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await assignmentService.getMyCourseworkAssignments();

        console.log("Coursework assignments response:", response);

        setAssignments(
          (response.assignments || []).map((assignment) => ({
            ...assignment,
            id: assignment._id,
            class: assignment.classId?.name || assignment.className || "—",
          })),
        );
      } catch (error) {
        console.error("Failed to load assignments:", error);
      }
    };

    loadAssignments();
  }, []);

  useEffect(() => {
    const loadAssignedClasses = async () => {
      try {
        const response = await api.get("/students/my-students");

        setAssignedClasses(response?.assignments || []);
      } catch (error) {
        console.error("Failed to load assigned classes:", error);
        setAssignedClasses([]);
      }
    };

    loadAssignedClasses();
  }, []);

  const handleSaveGrade = async () => {
    if (!selectedAsn || !selectedSubmission) return;

    try {
      const marks = Number(gradeMarks);

      if (
        gradeMarks === "" ||
        Number.isNaN(marks) ||
        marks < 0 ||
        marks > selectedAsn.maxMarks
      ) {
        return;
      }

      await api.patch(
        `/coursework-assignments/${selectedAsn.id}/submissions/${selectedSubmission.studentId._id}/grade`,
        {
          marks,
          feedback: selectedSubmission.feedback || "",
        },
      );

      success("Grade saved successfully!");

      setSelectedSubmission(null);

      const response = await assignmentService.getMyCourseworkAssignments();

      setAssignments(
        (response.assignments || []).map((assignment) => ({
          ...assignment,
          id: assignment._id,
          class: assignment.classId?.name || assignment.className || "—",
        })),
      );
    } catch (error) {
      console.error("Failed to save grade:", error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (
      !newAsn.title ||
      !newAsn.classId ||
      !newAsn.section ||
      !newAsn.subject
    ) {
      return;
    }

    try {
      const response = await assignmentService.createCourseworkAssignment({
        title: newAsn.title,
        subject: newAsn.subject,
        classId: newAsn.classId,
        section: newAsn.section,
        dueDate: newAsn.dueDate,
        maxMarks: Number(newAsn.maxMarks),
        description: newAsn.description,
      });

      const created = response.assignment;

      setAssignments((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);

      success(
        `Assignment "${created.title}" published to Class ${newAsn.class}-${newAsn.section}!`,
      );
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const columns = [
    {
      header: "Assignment Title",
      accessor: "title",
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {val}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Class {row.class}-{row.section} • Max Marks: {row.maxMarks}
          </div>
        </div>
      ),
    },
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: "Submission Due Date",
      accessor: "dueDate",
      sortable: true,
      render: (val) => <strong>{formatDate(val)}</strong>,
    },
    {
      header: "Submissions",
      accessor: "submissions",
      sortable: true,
      render: (val, row) => (
        <div>
          <strong>{row.submissions?.length || 0}</strong> /{" "}
          {row.totalStudents || "—"} Submissions
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      isStatus: true,
      sortable: true,
    },
    {
      header: "Action",
      accessor: "id",
      render: (id, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setSelectedAsn(row)}
        >
          <Eye size={13} />
          <span>Review Submissions</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={26} color="var(--primary)" />
            Assignments & Coursework Grading
          </h1>
          <p className="page-subtitle">
            Create homework tasks, inspect student submissions and assign marks
            & qualitative feedback
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} />
          <span>Create New Assignment</span>
        </button>
      </div>

      <DataTable
        title="My Active Coursework Tasks"
        subtitle="Assignments created for your classes"
        columns={columns}
        data={assignments}
        searchKeys={["title", "subject", "class", "dueDate"]}
      />

      {/* Review Submissions Modal */}
      <Modal
        isOpen={!!selectedAsn}
        onClose={() => setSelectedAsn(null)}
        title={selectedAsn?.title || "Review Submissions"}
        subtitle={`Class ${selectedAsn?.class}-${selectedAsn?.section} • Max Score: ${selectedAsn?.maxMarks}`}
        size="lg"
      >
        {selectedAsn && (
          <div>
            <div
              className="card"
              style={{ padding: "12px", marginBottom: "16px" }}
            >
              <div
                style={{
                  fontSize: "0.725rem",
                  color: "var(--text-tertiary)",
                  fontWeight: 700,
                }}
              >
                PROMPT:
              </div>
              <p
                style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
              >
                {selectedAsn.description}
              </p>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Attachment</th>
                    <th>Feedback Given</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAsn.submissions?.map((sub, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{sub.studentId?.name || "—"}</strong>
                      </td>
                      <td>
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                      <td>
                        <strong>{sub.marks ?? "Ungraded"}</strong> /{" "}
                        {selectedAsn.maxMarks}
                      </td>
                      <td>
                        {sub.file?.fileUrl ? (
                          <a
                            href={`${api.baseUrl}${sub.file.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            View PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {sub.feedback || "—"}
                      </td>
                      <td>
                        {sub.status !== "GRADED" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setGradeMarks(sub.marks ?? "");
                            }}
                          >
                            Grade
                          </button>
                        )}

                        {sub.status === "GRADED" && (
                          <span
                            style={{
                              color: "var(--text-tertiary)",
                              fontSize: "0.8rem",
                            }}
                          >
                            Graded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!selectedAsn.submissions ||
                    selectedAsn.submissions.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        No submissions received from students yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="modal-footer"
              style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAsn(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Grade Submission"
        subtitle={selectedSubmission?.studentId?.name || "Student Submission"}
      >
        {selectedSubmission && (
          <div>
            <FormInput
              label={`Marks (out of ${selectedAsn?.maxMarks})`}
              type="number"
              min="0"
              max={selectedAsn?.maxMarks}
              value={gradeMarks}
              onChange={(e) => setGradeMarks(e.target.value)}
              required
            />

            <Textarea
              label="Feedback"
              rows={4}
              value={selectedSubmission.feedback || ""}
              onChange={(e) =>
                setSelectedSubmission({
                  ...selectedSubmission,
                  feedback: e.target.value,
                })
              }
              placeholder="Write feedback for the student..."
            />

            <div
              className="modal-footer"
              style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveGrade}
              >
                Save Grade
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedAssignment(null);
        }}
        title="Create Class Assignment"
        subtitle="Set homework prompt and deadline for students"
      >
        <form onSubmit={handleCreateSubmit}>
          <FormInput
            label="Assignment Title"
            required
            value={newAsn.title}
            onChange={(e) => setNewAsn({ ...newAsn, title: e.target.value })}
            placeholder="e.g. Chapter 4 Quadratic Formula Exercises"
          />
          <div className="grid-2">
            <Select
              label="Assigned Class & Subject"
              value={
                selectedAssignment
                  ? `${selectedAssignment.classId}-${selectedAssignment.section}-${selectedAssignment.subject}`
                  : ""
              }
              onChange={(e) => {
                const selected = assignedClasses.find(
                  (item) =>
                    `${item.classId}-${item.section}-${item.subject}` ===
                    e.target.value,
                );

                setSelectedAssignment(selected || null);

                if (selected) {
                  setNewAsn((prev) => ({
                    ...prev,
                    classId: selected.classId,
                    class: selected.className,
                    section: selected.section,
                    subject: selected.subject,
                  }));
                }
              }}
              options={assignedClasses.map((item) => ({
                label: `Class ${item.className} - Section ${item.section} - ${item.subject}`,
                value: `${item.classId}-${item.section}-${item.subject}`,
              }))}
              placeholder="Select assigned class..."
              required
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Due Date"
              type="date"
              value={newAsn.dueDate}
              onChange={(e) =>
                setNewAsn({ ...newAsn, dueDate: e.target.value })
              }
            />
            <FormInput
              label="Max Marks"
              type="number"
              value={newAsn.maxMarks}
              onChange={(e) =>
                setNewAsn({ ...newAsn, maxMarks: e.target.value })
              }
            />
          </div>

          <Textarea
            label="Assignment Instructions"
            value={newAsn.description}
            onChange={(e) =>
              setNewAsn({ ...newAsn, description: e.target.value })
            }
            placeholder="Write clear instructions for students..."
          />

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedAssignment(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Distribute Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
