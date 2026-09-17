import React, { useEffect, useState } from "react";
import examService from "../../services/examService";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Tabs from "../../components/common/Tabs";
import { FormInput, Select } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Award,
  Plus,
  Calendar,
  Eye,
  FileText,
  CheckCircle2,
  Printer,
  Percent,
} from "lucide-react";

export default function ExaminationsPage() {
  const { success, info } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isExamDetailsModalOpen, setIsExamDetailsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);

  // New Exam Form
  const [newExam, setNewExam] = useState({
    name: "Term 2 Final Assessments",
    term: "Term 2",
    academicYear: "2025-2026",
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    classesIncluded: selectedClasses,
  });

  const sampleMarksList = [];

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes");

      setClasses(response.classes || []);
    } catch (error) {
      console.error("Failed to load classes:", error);

      info(error.message || "Failed to load classes");
    }
  };
  useEffect(() => {
    loadClasses();
    loadExams();
  }, []);

  const toggleClass = (classId) => {
    setSelectedClasses((prev) => {
      const exists = prev.find((item) => item.classId === classId);

      if (exists) {
        return prev.filter((item) => item.classId !== classId);
      }

      const selectedClass = classes.find((item) => item._id === classId);

      return [
        ...prev,
        {
          classId,
          sections: selectedClass?.sections || [],
        },
      ];
    });
  };

  const toggleSection = (classId, section) => {
    setSelectedClasses((prev) =>
      prev.map((item) => {
        if (item.classId !== classId) {
          return item;
        }

        const sectionExists = item.sections.includes(section);

        return {
          ...item,
          sections: sectionExists
            ? item.sections.filter((s) => s !== section)
            : [...item.sections, section],
        };
      }),
    );
  };

  const addScheduleRow = () => {
    setExamSchedule((prev) => [
      ...prev,
      {
        date: "",
        subject: "",
        startTime: "",
        endTime: "",
        maxMarks: 100,
        passMarks: 40,
        room: "",
      },
    ]);
  };

  const updateScheduleRow = (index, field, value) => {
    setExamSchedule((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const removeScheduleRow = (index) => {
    setExamSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const loadExams = async () => {
    try {
      setLoading(true);

      const response = await examService.getSchoolExams();

      setExams(response.exams || []);
    } catch (error) {
      console.error("Failed to load examinations:", error);

      info(error.message || "Failed to load examinations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const created = await examService.createSchoolExam({
        name: newExam.name,
        term: newExam.term,
        academicYear: newExam.academicYear,
        startDate: newExam.startDate,
        endDate: newExam.endDate,
        classesIncluded: selectedClasses,
        schedule: examSchedule,
        status: "DRAFT",
      });

      setExams((prev) => [created.exam, ...prev]);

      setIsCreateModalOpen(false);

      success(`Examination "${created.exam.name}" created successfully!`);
    } catch (error) {
      console.error("Failed to create examination:", error);

      info(error.message || "Failed to create examination");
    } finally {
      setLoading(false);
    }
  };

  const examColumns = [
    {
      header: "Exam Name",
      accessor: "name",
      sortable: true,
      render: (val, row) => (
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
            {row.term} • Academic Year {row.academicYear}
          </div>
        </div>
      ),
    },

    {
      header: "Exam Period",
      accessor: "startDate",
      sortable: true,
      render: (val, row) => {
        const formatDate = (date) => {
          if (!date) return "-";

          return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };

        return (
          <div
            style={{
              fontSize: "0.825rem",
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(val)} → {formatDate(row.endDate)}
          </div>
        );
      },
    },

    {
      header: "Grades Participating",
      accessor: "classesIncluded",

      render: (classItems) => (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {classItems?.length > 0 ? (
            classItems.map((item, index) => {
              // Supports both populated classId object
              // and normal classId string
              const className =
                typeof item.classId === "object"
                  ? item.classId?.name
                  : classes.find((c) => c._id === item.classId)?.name;

              return (
                <span
                  key={`${item.classId?._id || item.classId}-${index}`}
                  className="badge badge-primary"
                  style={{
                    fontSize: "0.72rem",
                    padding: "6px 9px",
                  }}
                >
                  Class {className || "Unknown"}
                  {item.sections?.length > 0 &&
                    ` • ${item.sections.join(", ")}`}
                </span>
              );
            })
          ) : (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-tertiary)",
              }}
            >
              No classes selected
            </span>
          )}
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
      accessor: "_id",
      render: (val, row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setSelectedExam(row);
            setIsExamDetailsModalOpen(true);
          }}
        >
          <Eye size={14} />
          <span>View Details</span>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={26} color="var(--primary)" />
            Examinations, Marks & Report Cards
          </h1>
          <p className="page-subtitle">
            Schedule examinations, enter subject marks, generate academic ranks
            and report cards
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} />
          <span>Create New Examination</span>
        </button>
      </div>

      <Tabs
        tabs={[
          {
            id: "list",
            label: "Examination Series",
            icon: <Calendar size={15} />,
          },
          {
            id: "results",
            label: "Student Results & Report Cards",
            icon: <FileText size={15} />,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === "list" && (
        <div>
          <DataTable
            title="Scheduled Examinations"
            subtitle="Central examination timetable and status"
            columns={examColumns}
            data={exams}
            searchKeys={["name", "term", "academicYear", "status"]}
          />

          {/* Exam Schedule Preview Card */}
          <div className="card" style={{ marginTop: "24px" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  Mid-Term Examination Schedule Matrix (Class 10-A)
                </h3>
                <p
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Official hall allocation and timing
                </p>
              </div>
              <span className="badge badge-success">Approved Timetable</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Time Slot</th>
                    <th>Max Marks</th>
                    <th>Pass Marks</th>
                    <th>Exam Hall</th>
                  </tr>
                </thead>
                <tbody>
                  {exams[0]?.schedule?.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{item.date}</strong>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {item.subject}
                        </span>
                      </td>
                      <td>
                        {item.startTime} – {item.endTime}
                      </td>
                      <td>{item.maxMarks}</td>
                      <td>{item.passMarks}</td>
                      <td>
                        <strong>{item.room}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div
            className="table-container"
            style={{ border: "none", borderRadius: "0" }}
          >
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Total Scored</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sampleMarksList.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {m.studentName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {m.examName}
                      </div>
                    </td>
                    <td>
                      <strong>{m.roll}</strong>
                    </td>
                    <td>
                      <span className="badge badge-primary">{m.class}</span>
                    </td>
                    <td>
                      <strong>{m.totalObtained}</strong> / {m.totalMax}
                    </td>
                    <td>
                      <span
                        style={{ fontWeight: 800, color: "var(--primary)" }}
                      >
                        {m.percentage}%
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">{m.grade}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{m.result}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedReportCard(m)}
                      >
                        <Eye size={13} />
                        <span>View Report Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXAM DETAILS MODAL */}
      <Modal
        isOpen={isExamDetailsModalOpen}
        onClose={() => {
          setIsExamDetailsModalOpen(false);
          setSelectedExam(null);
        }}
        title={selectedExam?.name || "Examination Details"}
        subtitle={
          selectedExam
            ? `${selectedExam.term} • Academic Year ${selectedExam.academicYear}`
            : ""
        }
        size="lg"
      >
        {selectedExam && (
          <div>
            {/* BASIC EXAM DETAILS */}
            <div
              className="grid-3"
              style={{
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div className="card" style={{ padding: "12px" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "5px",
                  }}
                >
                  EXAMINATION
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {selectedExam.name}
                </div>
              </div>

              <div className="card" style={{ padding: "12px" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "5px",
                  }}
                >
                  EXAM PERIOD
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {new Date(selectedExam.startDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                  {" → "}
                  {new Date(selectedExam.endDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: "12px" }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "5px",
                  }}
                >
                  STATUS
                </div>

                <StatusBadge status={selectedExam.status} />
              </div>
            </div>

            {/* PARTICIPATING CLASSES */}
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Participating Classes & Sections
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {selectedExam.classesIncluded?.length > 0 ? (
                  selectedExam.classesIncluded.map((item, index) => {
                    const className =
                      typeof item.classId === "object"
                        ? item.classId?.name
                        : classes.find((c) => c._id === item.classId)?.name;

                    return (
                      <span
                        key={`${item.classId?._id || item.classId}-${index}`}
                        className="badge badge-primary"
                        style={{
                          padding: "7px 10px",
                        }}
                      >
                        Class {className || "Unknown"}
                        {item.sections?.length > 0 &&
                          ` • ${item.sections.join(", ")}`}
                      </span>
                    );
                  })
                ) : (
                  <span
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    No classes selected
                  </span>
                )}
              </div>
            </div>

            {/* EXAM SCHEDULE */}
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Examination Schedule
              </div>

              {selectedExam.schedule?.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Timing</th>
                        <th>Max Marks</th>
                        <th>Pass Marks</th>
                        <th>Exam Hall</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedExam.schedule.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>
                              {new Date(item.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </strong>
                          </td>

                          <td>
                            <span className="badge badge-primary">
                              {item.subject}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {item.startTime} – {item.endTime}
                            </strong>
                          </td>

                          <td>{item.maxMarks}</td>

                          <td>{item.passMarks}</td>

                          <td>
                            {item.room || (
                              <span
                                style={{
                                  color: "var(--text-tertiary)",
                                }}
                              >
                                Not Assigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-tertiary)",
                    border: "1px dashed var(--border-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  No examination schedule available.
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="modal-footer"
              style={{
                margin: "20px -24px -24px",
                padding: "16px 24px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsExamDetailsModalOpen(false);
                  setSelectedExam(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PRINTABLE REPORT CARD MODAL */}
      <Modal
        isOpen={!!selectedReportCard}
        onClose={() => setSelectedReportCard(null)}
        title="Official Academic Term Report Card"
        subtitle={`Student: ${selectedReportCard?.studentName} • ${selectedReportCard?.roll}`}
        size="lg"
      >
        {selectedReportCard && (
          <div id="printable-report-card">
            {/* School Header */}
            <div
              style={{
                textAlign: "center",
                paddingBottom: "16px",
                borderBottom: "2px solid var(--border-color)",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                Greenwood International Public School
              </div>
              <div
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                Affiliated with CBSE Board • Academic Session 2025-2026
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  marginTop: "8px",
                  color: "var(--text-primary)",
                }}
              >
                {selectedReportCard.examName}
              </div>
            </div>

            {/* Student Info Details */}
            <div
              className="grid-3"
              style={{ gap: "12px", marginBottom: "20px" }}
            >
              <div className="card" style={{ padding: "10px" }}>
                <div
                  style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}
                >
                  STUDENT NAME
                </div>
                <div style={{ fontWeight: 700 }}>
                  {selectedReportCard.studentName}
                </div>
              </div>
              <div className="card" style={{ padding: "10px" }}>
                <div
                  style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}
                >
                  ROLL NUMBER & CLASS
                </div>
                <div style={{ fontWeight: 700 }}>
                  {selectedReportCard.roll} • Class {selectedReportCard.class}
                </div>
              </div>
              <div className="card" style={{ padding: "10px" }}>
                <div
                  style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}
                >
                  CLASS RANK
                </div>
                <div style={{ fontWeight: 700, color: "var(--primary)" }}>
                  Rank #{selectedReportCard.rank} in Section
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="table-container" style={{ marginBottom: "20px" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Marks Obtained</th>
                    <th>Grade</th>
                    <th>Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReportCard.subjects.map((sub, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{sub.name}</strong>
                      </td>
                      <td>{sub.maxMarks}</td>
                      <td>
                        <strong>{sub.obtained}</strong>
                      </td>
                      <td>
                        <span className="badge badge-success">{sub.grade}</span>
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {sub.remarks}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      fontWeight: 800,
                    }}
                  >
                    <td>Grand Total</td>
                    <td>{selectedReportCard.totalMax}</td>
                    <td style={{ color: "var(--primary)" }}>
                      {selectedReportCard.totalObtained}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {selectedReportCard.grade}
                      </span>
                    </td>
                    <td>Percentage: {selectedReportCard.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className="modal-footer"
              style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedReportCard(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE EXAM MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Examination"
        subtitle="Set term details and participating classes"
      >
        <form onSubmit={handleCreateExam}>
          <FormInput
            label="Examination Title"
            required
            value={newExam.name}
            onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
            placeholder="e.g. Annual Final Board Examinations"
          />
          <div className="grid-2">
            <Select
              label="Academic Term"
              value={newExam.term}
              onChange={(e) => setNewExam({ ...newExam, term: e.target.value })}
              options={[
                "Term 1",
                "Term 2",
                "Unit Test 1",
                "Unit Test 2",
                "Pre-Board",
              ]}
            />
            <FormInput
              label="Academic Year"
              value={newExam.academicYear}
              onChange={(e) =>
                setNewExam({ ...newExam, academicYear: e.target.value })
              }
            />
          </div>
          <div className="grid-2">
            <FormInput
              label="Start Date"
              type="date"
              value={newExam.startDate}
              onChange={(e) =>
                setNewExam({ ...newExam, startDate: e.target.value })
              }
            />
            <FormInput
              label="End Date"
              type="date"
              value={newExam.endDate}
              onChange={(e) =>
                setNewExam({ ...newExam, endDate: e.target.value })
              }
            />
          </div>

          {/* PARTICIPATING CLASSES & SECTIONS */}
          <div
            style={{
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              Participating Classes & Sections
            </label>

            <details
              style={{
                position: "relative",
              }}
            >
              <summary
                style={{
                  listStyle: "none",
                  cursor: "pointer",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                {selectedClasses.length === 0
                  ? "Select classes and sections..."
                  : `${selectedClasses.reduce(
                      (total, item) => total + item.sections.length,
                      0,
                    )} section(s) selected`}
                <span style={{ float: "right" }}>▼</span>
              </summary>

              <div
                style={{
                  marginTop: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-primary)",
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                {/* SEARCH */}
                <input
                  type="text"
                  placeholder="Search class..."
                  className="form-input"
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                  }}
                />

                {/* CLASSES */}
                {classes.map((schoolClass) => {
                  const selectedClass = selectedClasses.find(
                    (item) => item.classId === schoolClass._id,
                  );

                  const isSelected = !!selectedClass;

                  return (
                    <div
                      key={schoolClass._id}
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleClass(schoolClass._id)}
                        />

                        {schoolClass.name}
                      </label>

                      {isSelected && schoolClass.sections?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: "8px",
                            marginLeft: "26px",
                          }}
                        >
                          {schoolClass.sections.map((section) => (
                            <label
                              key={section}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedClass.sections.includes(
                                  section,
                                )}
                                onChange={() =>
                                  toggleSection(schoolClass._id, section)
                                }
                              />

                              {section}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>

            {/* SELECTED ITEMS */}

            {selectedClasses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                {selectedClasses.map((item) => {
                  const selectedClass = classes.find(
                    (c) => c._id === item.classId,
                  );

                  return item.sections.map((section) => (
                    <span
                      key={`${item.classId}-${section}`}
                      className="badge badge-primary"
                      style={{
                        fontSize: "0.75rem",
                        padding: "6px 9px",
                      }}
                    >
                      {selectedClass?.name} - {section}
                    </span>
                  ));
                })}
              </div>
            )}
          </div>

          {/* EXAM SCHEDULE */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.825rem",
                    fontWeight: 700,
                  }}
                >
                  Exam Schedule
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "3px",
                  }}
                >
                  Add subjects, dates, timings and marks
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addScheduleRow}
              >
                <Plus size={14} />
                Add Subject
              </button>
            </div>

            {/* SCHEDULE ROWS */}

            {examSchedule.length === 0 ? (
              <div
                style={{
                  border: "1px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                No subjects added yet.
                <br />
                Click <strong>Add Subject</strong> to create the examination
                schedule.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  maxHeight: "260px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {examSchedule.map((row, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                      backgroundColor: "var(--bg-tertiary)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.4fr 0.9fr 0.9fr",
                        gap: "10px",
                        alignItems: "end",
                      }}
                    >
                      {/* DATE */}

                      <FormInput
                        label="Exam Date"
                        type="date"
                        value={row.date}
                        min={newExam.startDate}
                        max={newExam.endDate}
                        required
                        onChange={(e) =>
                          updateScheduleRow(index, "date", e.target.value)
                        }
                      />

                      {/* SUBJECT */}

                      <FormInput
                        label="Subject"
                        value={row.subject}
                        required
                        placeholder="e.g. Mathematics"
                        onChange={(e) =>
                          updateScheduleRow(index, "subject", e.target.value)
                        }
                      />

                      {/* START TIME */}

                      <FormInput
                        label="Start Time"
                        type="time"
                        value={row.startTime}
                        required
                        onChange={(e) =>
                          updateScheduleRow(index, "startTime", e.target.value)
                        }
                      />

                      {/* END TIME */}

                      <FormInput
                        label="End Time"
                        type="time"
                        value={row.endTime}
                        required
                        onChange={(e) =>
                          updateScheduleRow(index, "endTime", e.target.value)
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr auto",
                        gap: "10px",
                        alignItems: "end",
                        marginTop: "10px",
                      }}
                    >
                      {/* MAX MARKS */}

                      <FormInput
                        label="Max Marks"
                        type="number"
                        min="1"
                        value={row.maxMarks}
                        required
                        onChange={(e) =>
                          updateScheduleRow(index, "maxMarks", e.target.value)
                        }
                      />

                      {/* PASS MARKS */}

                      <FormInput
                        label="Pass Marks"
                        type="number"
                        min="0"
                        max={row.maxMarks}
                        value={row.passMarks}
                        required
                        onChange={(e) =>
                          updateScheduleRow(index, "passMarks", e.target.value)
                        }
                      />

                      {/* ROOM */}

                      <FormInput
                        label="Exam Hall / Room"
                        value={row.room}
                        placeholder="e.g. Hall 101"
                        onChange={(e) =>
                          updateScheduleRow(index, "room", e.target.value)
                        }
                      />

                      {/* DELETE */}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeScheduleRow(index)}
                        style={{
                          height: "38px",
                          padding: "0 12px",
                        }}
                        title="Remove subject"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
