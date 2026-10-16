import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import studentService from "../../services/studentService";
import api from "../../services/api";
import attendanceService from "../../services/attendanceService";
import feeService from "../../services/feeService";
import examService from "../../services/examService";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Tabs from "../../components/common/Tabs";
import { FormInput, Select, Textarea } from "../../components/common/FormInput";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Users,
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  BookOpen,
  CalendarCheck,
  DollarSign,
  Award,
  Bus,
  FileText,
  Clock,
  Mail,
  Phone,
  MapPin,
  Heart,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function StudentsPage() {
  const { success, error, info } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const mapStudent = (student) => ({
    id: student._id,
    name: student.name || "",
    email: student.email || "",
    admissionNumber: student.admissionNumber || "",
    rollNumber: student.rollNumber || "",
    dob: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender:
      student.gender === "MALE"
        ? "Male"
        : student.gender === "FEMALE"
          ? "Female"
          : "Other",
    class: student.classId?.name || student.className || "",
    classId: student.classId?._id || "",
    section: student.section || "",
    phone: student.phone || "",
    address: student.address || "",
    status: student.isActive ? "Active" : "Inactive",

    parentName: student.parentName || "",
    parentPhone: student.parentPhone || "",
    emergencyContact: student.emergencyContact || "",
    bloodGroup: student.bloodGroup || "",

    feeStatus: "Pending",
    totalFee: 0,
    paidFee: 0,
    attendance: 0,
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
      error(err.message || "Failed to load classes");
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await studentService.getSchoolStudents();

      if (!response.success) {
        throw new Error(response.message || "Failed to load students");
      }

      const backendStudents = response.students || [];

      const studentsWithFees = await Promise.all(
        backendStudents.map(async (student) => {
          try {
            const feeResponse = await feeService.getStudentFees(student._id);
            const attendanceResponse =
              await attendanceService.getStudentAttendanceSummary(student._id);
            const attendance = attendanceResponse?.summary?.percentage ?? 0;
            const fees = feeResponse?.fees || [];

            if (fees.length === 0) {
              return {
                ...mapStudent(student),
                feeStatus: "Not Assigned",
                totalFee: 0,
                paidFee: 0,
                attendance,
              };
            }

            const totalFee = fees.reduce(
              (sum, fee) => sum + Number(fee.totalAmount || 0),
              0,
            );

            const paidFee = fees.reduce(
              (sum, fee) => sum + Number(fee.paidAmount || 0),
              0,
            );

            const hasOverdue = fees.some((fee) => fee.status === "OVERDUE");

            const hasPending = fees.some(
              (fee) => fee.status === "PENDING" || fee.status === "PARTIAL",
            );

            let feeStatus = "Paid";

            if (hasOverdue) {
              feeStatus = "Overdue";
            } else if (hasPending) {
              feeStatus = "Pending";
            }

            return {
              ...mapStudent(student),
              feeStatus,
              totalFee,
              paidFee,
              attendance,
            };
          } catch (feeError) {
            console.error(
              `Failed to load fees for student ${student._id}:`,
              feeError,
            );

            return {
              ...mapStudent(student),
              feeStatus: "Not Assigned",
              totalFee: 0,
              paidFee: 0,
              attendance: 0,
            };
          }
        }),
      );

      setStudents(studentsWithFees);
    } catch (err) {
      console.error("Failed to load students:", err);
      error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentExamResults = async (studentId) => {
    try {
      setExamResultLoading(true);

      // Get all exams
      const examsResponse = await examService.getSchoolExams();

      if (!examsResponse?.success) {
        throw new Error(examsResponse?.message || "Failed to load exams");
      }

      const exams = examsResponse.exams || [];

      // Fetch this student's result for every exam
      const results = await Promise.all(
        exams.map(async (exam) => {
          try {
            const resultResponse = await examService.getStudentResult(
              exam._id,
              studentId,
            );

            if (!resultResponse?.success) {
              return null;
            }

            return {
              examId: exam._id,
              examName: exam.name || "Exam",
              ...resultResponse,
            };
          } catch (err) {
            console.warn(`No result found for exam ${exam._id}:`, err);
            return null;
          }
        }),
      );

      setExamResult(results.filter(Boolean));
    } catch (err) {
      console.error("Failed to load student exam results:", err);
      setExamResult([]);
    } finally {
      setExamResultLoading(false);
    }
  };

  const loadStudentAttendance = async (studentId) => {
    if (!studentId) {
      setAttendanceData(null);
      return;
    }

    try {
      setAttendanceLoading(true);

      const response =
        await attendanceService.getStudentAttendanceSummary(studentId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to load student attendance",
        );
      }

      setAttendanceData(response);
    } catch (err) {
      console.error("Failed to load student attendance:", err);
      setAttendanceData(null);
      error(err.message || "Failed to load student attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const loadStudentFees = async (studentId) => {
    if (!studentId) {
      setFeeData(null);
      return;
    }

    try {
      setFeeLoading(true);

      const response = await feeService.getStudentFees(studentId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load student fees");
      }

      setFeeData(response);
    } catch (err) {
      console.error("Failed to load student fees:", err);
      setFeeData(null);
      error(err.message || "Failed to load student fees");
    } finally {
      setFeeLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [examResult, setExamResult] = useState(null);
  const [examResultLoading, setExamResultLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [feeData, setFeeData] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    if (activeProfileTab === "attendance" && selectedStudent?.id) {
      loadStudentAttendance(selectedStudent.id);
    }
  }, [activeProfileTab, selectedStudent?.id]);

  useEffect(() => {
    if (activeProfileTab === "exams" && selectedStudent?.id) {
      loadStudentExamResults(selectedStudent.id);
    }
  }, [activeProfileTab, selectedStudent?.id]);

  useEffect(() => {
    if (activeProfileTab === "fees" && selectedStudent?.id) {
      loadStudentFees(selectedStudent.id);
    }
  }, [activeProfileTab, selectedStudent?.id]);
  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: "",
    admissionNumber: "",
    rollNumber: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    classId: "",
    section: "",
    phone: "",

    parentName: "",
    parentPhone: "",
    emergencyContact: "",
    bloodGroup: "",
    address: "",
  });

  const [editStudent, setEditStudent] = useState({
    name: "",
    admissionNumber: "",
    rollNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    classId: "",
    section: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    emergencyContact: "",
    bloodGroup: "",
    address: "",
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newStudent.name.trim()) {
      error("Please enter student name");
      return;
    }

    if (!newStudent.admissionNumber.trim()) {
      error("Please enter admission number");
      return;
    }

    if (!newStudent.email.trim()) {
      error("Please enter student email");
      return;
    }

    if (!newStudent.password) {
      error("Please enter student password");
      return;
    }

    try {
      const payload = {
        name: newStudent.name.trim(),
        email: newStudent.email.trim().toLowerCase(),
        password: newStudent.password,
        admissionNumber: newStudent.admissionNumber.trim(),
        rollNumber: newStudent.rollNumber.trim(),
        dateOfBirth: newStudent.dateOfBirth || null,
        gender: newStudent.gender || null,
        classId: newStudent.classId || null,
        section: newStudent.section || null,

        phone: newStudent.phone?.trim() || null,

        parentName: newStudent.parentName?.trim() || null,
        parentPhone: newStudent.parentPhone?.trim() || null,
        emergencyContact: newStudent.emergencyContact?.trim() || null,
        bloodGroup: newStudent.bloodGroup || null,

        address: newStudent.address?.trim() || null,
      };

      const response = await studentService.createSchoolStudent(payload);

      if (!response.success) {
        throw new Error(response.message || "Failed to create student");
      }

      await loadStudents();

      setIsAddModalOpen(false);

      setNewStudent({
        name: "",
        admissionNumber: "",
        rollNumber: "",
        email: "",
        password: "",
        dateOfBirth: "",
        gender: "",
        classId: "",
        section: "",
        phone: "",
        parentName: "",
        parentPhone: "",
        emergencyContact: "",
        bloodGroup: "",
        address: "",
      });

      success("Student admitted successfully!");
    } catch (err) {
      console.error("Failed to create student:", err);
      error(err.message || "Failed to create student");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      const response = await studentService.deleteSchoolStudent(
        studentToDelete.id,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to deactivate student");
      }

      await loadStudents();

      setStudentToDelete(null);

      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }

      success("Student deactivated successfully!");
    } catch (err) {
      console.error("Failed to deactivate student:", err);
      error(err.message || "Failed to deactivate student");
    }
  };

  const profileTabs = [
    { id: "personal", label: "Personal Info", icon: <User size={15} /> },
    { id: "academic", label: "Academic & Class", icon: <BookOpen size={15} /> },
    { id: "parent", label: "Parent Details", icon: <Users size={15} /> },
    {
      id: "attendance",
      label: `Attendance (${attendanceData?.summary?.attendancePercentage ?? 0}%)`,
      icon: <CalendarCheck size={15} />,
    },
    { id: "fees", label: "Fee Profile", icon: <DollarSign size={15} /> },
    { id: "exams", label: "Exams & Marks", icon: <Award size={15} /> },
    { id: "assignments", label: "Assignments", icon: <FileText size={15} /> },
    { id: "transport", label: "Transport Info", icon: <Bus size={15} /> },
    { id: "documents", label: "Documents", icon: <FileText size={15} /> },
    { id: "history", label: "Activity Logs", icon: <Clock size={15} /> },
  ];

  const columns = [
    {
      header: "Student Name & ID",
      accessor: "name",
      sortable: true,
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={
              row.profilePhoto ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            }
            alt={val}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid var(--border-color)",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {val}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              Roll: <strong>{row.rollNumber}</strong> • Admission No:{" "}
              {row.admissionNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Class / Sec",
      accessor: "class",
      sortable: true,
      render: (val, row) => (
        <span className="badge badge-primary">
          Class {val}-{row.section}
        </span>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      sortable: true,
    },
    {
      header: "Parent Contact",
      accessor: "parentName",
      render: (val, row) => (
        <div style={{ fontSize: "0.8rem" }}>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "0.725rem" }}>
            {row.parentPhone}
          </div>
        </div>
      ),
    },
    {
      header: "Attendance",
      accessor: "attendance",
      sortable: true,
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "45px",
              height: "6px",
              backgroundColor: "var(--bg-tertiary)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${val}%`,
                height: "100%",
                backgroundColor:
                  val >= 90
                    ? "var(--success)"
                    : val >= 75
                      ? "var(--warning)"
                      : "var(--danger)",
              }}
            />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.8rem" }}>{val}%</span>
        </div>
      ),
    },
    {
      header: "Fee Status",
      accessor: "feeStatus",
      isStatus: true,
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
              setSelectedStudent(row);
              setActiveProfileTab("personal");
              setAttendanceData(null);
              setFeeData(null);
            }}
            title="View Full Profile"
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>

          <button
            className="btn btn-icon btn-sm"
            onClick={() => {
              setSelectedStudent(row);

              setEditStudent({
                name: row.name || "",
                admissionNumber: row.admissionNumber || "",
                rollNumber: row.rollNumber || "",
                email: row.email || "",
                dateOfBirth: row.dob || "",
                gender:
                  row.gender === "Male"
                    ? "MALE"
                    : row.gender === "Female"
                      ? "FEMALE"
                      : "OTHER",
                classId: row.classId || "",
                section: row.section || "",
                phone: row.phone || "",
                parentName: row.parentName || "",
                parentPhone: row.parentPhone || "",
                emergencyContact: row.emergencyContact || "",
                bloodGroup: row.bloodGroup || "",
                address: row.address || "",
              });

              setIsEditModalOpen(true);
            }}
            title="Edit Student"
          >
            <Edit2 size={14} />
          </button>

          {row.status === "Active" ? (
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setStudentToDelete(row)}
              title="Deactivate Student"
            >
              <Trash2 size={13} color="var(--danger)" />
            </button>
          ) : (
            <button
              className="btn btn-icon btn-sm"
              onClick={async () => {
                try {
                  const response = await studentService.reactivateSchoolStudent(
                    row.id,
                  );

                  if (!response.success) {
                    throw new Error(
                      response.message || "Failed to reactivate student",
                    );
                  }

                  await loadStudents();
                  success("Student reactivated successfully!");
                } catch (err) {
                  console.error("Failed to reactivate student:", err);
                  error(err.message || "Failed to reactivate student");
                }
              }}
              title="Reactivate Student"
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
            <Users size={26} color="var(--primary)" />
            Student Management & Admissions
          </h1>
          <p className="page-subtitle">
            Manage comprehensive student rosters, admissions, academic records
            and profiles
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Student Admission</span>
        </button>
      </div>

      {/* Main Students Table */}
      <DataTable
        title="Enrolled Students Roster"
        subtitle={`Total ${students.length} registered students across all classes`}
        columns={columns}
        data={students}
        searchKeys={[
          "name",
          "rollNumber",
          "id",
          "email",
          "parentName",
          "parentPhone",
        ]}
        filterOptions={[
          {
            label: "Class",
            key: "class",
            options: classes.map((cls) => cls.name),
          },
          { label: "Gender", key: "gender", options: ["Male", "Female"] },
          {
            label: "Fee Status",
            key: "feeStatus",
            options: ["Paid", "Pending", "Overdue"],
          },
          { label: "Status", key: "status", options: ["Active", "Inactive"] },
        ]}
      />

      {/* DETAILED STUDENT PROFILE MODAL WITH 10 TABS */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={
          selectedStudent
            ? `${selectedStudent.name} (${selectedStudent.rollNumber})`
            : "Student Profile"
        }
        subtitle={`Class ${selectedStudent?.class}-${selectedStudent?.section} • Admission No: ${selectedStudent?.admissionNumber}`}
        size="xl"
      >
        {selectedStudent && (
          <div>
            {/* Top Student Header Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                padding: "16px 20px",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <img
                  src={
                    selectedStudent.profilePhoto ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={selectedStudent.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--bg-secondary)",
                  }}
                />
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                    {selectedStudent.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginTop: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="badge badge-primary">
                      Class {selectedStudent.class}-{selectedStudent.section}
                    </span>
                    <span className="badge badge-purple">
                      Roll No: {selectedStudent.rollNumber}
                    </span>
                    <StatusBadge status={selectedStudent.feeStatus} size="sm" />
                    <StatusBadge status={selectedStudent.status} size="sm" />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", textAlign: "right" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.725rem",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Attendance
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--success-text)",
                    }}
                  >
                    {attendanceData?.summary?.attendancePercentage ?? 0}%
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.725rem",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Total Fee Dues
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color:
                        selectedStudent.feeStatus === "Paid"
                          ? "var(--success-text)"
                          : "var(--danger-text)",
                    }}
                  >
                    ${selectedStudent.totalFee - selectedStudent.paidFee}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tab Switcher */}
            <Tabs
              tabs={profileTabs}
              activeTab={activeProfileTab}
              onChange={setActiveProfileTab}
              variant="underline"
            />

            {/* TAB CONTENTS */}
            <div style={{ minHeight: "260px" }}>
              {/* Tab 1: Personal Info */}
              {activeProfileTab === "personal" && (
                <div className="grid-2" style={{ gap: "14px" }}>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      FULL NAME
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.name}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      STUDENT EMAIL
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.email}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      DATE OF BIRTH
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.dob}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      GENDER & BLOOD GROUP
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.gender} • Blood Group:{" "}
                      <span className="badge badge-danger">
                        {selectedStudent.bloodGroup}
                      </span>
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{ padding: "14px", gridColumn: "span 2" }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      RESIDENTIAL ADDRESS
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        marginTop: "2px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {selectedStudent.address}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Academic Info */}
              {activeProfileTab === "academic" && (
                <div className="grid-2" style={{ gap: "14px" }}>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      CURRENT GRADE / CLASS
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      Class {selectedStudent.class} - Section{" "}
                      {selectedStudent.section}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      ADMISSION DATE
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.admissionDate}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      PREVIOUS INSTITUTION
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.previousSchool || "Greenwood Junior"}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      ACADEMIC HOUSE
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      Einstein House (Blue)
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Parent Info */}
              {activeProfileTab === "parent" && (
                <div className="grid-2" style={{ gap: "14px" }}>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      PRIMARY GUARDIAN NAME
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.parentName}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      PRIMARY PHONE NUMBER
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.parentPhone}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      EMERGENCY CONTACT PHONE
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.emergencyContact}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      COMMUNICATION LANGUAGE
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      English
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Attendance History */}
              {activeProfileTab === "attendance" && (
                <div>
                  {attendanceLoading ? (
                    <div style={{ padding: "30px", textAlign: "center" }}>
                      Loading attendance...
                    </div>
                  ) : !attendanceData ? (
                    <div style={{ padding: "30px", textAlign: "center" }}>
                      No attendance data available.
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>
                          Overall Cumulative Attendance Rate:{" "}
                          {attendanceData.summary?.attendancePercentage ?? 0}%
                        </span>

                        <span className="badge badge-success">
                          {attendanceData.summary?.totalDays > 0
                            ? "Attendance Available"
                            : "No Records"}
                        </span>
                      </div>

                      <div className="table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {attendanceData.records?.length > 0 ? (
                              attendanceData.records.map((record) => (
                                <tr key={record._id}>
                                  <td>
                                    {record.date
                                      ? new Date(
                                          record.date,
                                        ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                  <td>
                                    <StatusBadge
                                      status={record.status || "UNKNOWN"}
                                      size="sm"
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" style={{ textAlign: "center" }}>
                                  No attendance records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 5: Fee History */}
              {/* Tab 5: Fee History */}
              {activeProfileTab === "fees" && (
                <div>
                  {feeLoading ? (
                    <div style={{ padding: "30px", textAlign: "center" }}>
                      Loading fee details...
                    </div>
                  ) : !feeData ? (
                    <div style={{ padding: "30px", textAlign: "center" }}>
                      No fee data available.
                    </div>
                  ) : feeData.fees?.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center" }}>
                      No fee records found for this student.
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const latestFee = feeData.fees[0];

                        return (
                          <>
                            <div
                              className="grid-3"
                              style={{ marginBottom: "16px" }}
                            >
                              <div className="card" style={{ padding: "12px" }}>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-tertiary)",
                                  }}
                                >
                                  Total Fee
                                </div>

                                <div
                                  style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 800,
                                  }}
                                >
                                  ₹{latestFee.totalAmount ?? 0}
                                </div>
                              </div>

                              <div className="card" style={{ padding: "12px" }}>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-tertiary)",
                                  }}
                                >
                                  Amount Paid
                                </div>

                                <div
                                  style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 800,
                                    color: "var(--success-text)",
                                  }}
                                >
                                  ₹{latestFee.paidAmount ?? 0}
                                </div>
                              </div>

                              <div className="card" style={{ padding: "12px" }}>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-tertiary)",
                                  }}
                                >
                                  Pending Balance
                                </div>

                                <div
                                  style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 800,
                                    color: "var(--danger-text)",
                                  }}
                                >
                                  ₹{latestFee.pendingAmount ?? 0}
                                </div>
                              </div>
                            </div>

                            <StatusBadge
                              status={latestFee.status || "Pending"}
                            />
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Tab 6: Exams & Marks */}
              {activeProfileTab === "exams" && (
                <div>
                  {examResultLoading ? (
                    <div className="empty-state">
                      <p>Loading exam results...</p>
                    </div>
                  ) : !examResult || examResult.length === 0 ? (
                    <div className="empty-state">
                      <p>No exam results found for this student.</p>
                    </div>
                  ) : (
                    examResult.map((exam) => (
                      <div key={exam.examId} style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <h4 style={{ margin: 0 }}>{exam.examName}</h4>

                          <div>
                            <strong>{exam.percentage}%</strong>{" "}
                            <span className="badge badge-success">
                              {exam.grade}
                            </span>
                          </div>
                        </div>

                        <div className="table-container">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Max Marks</th>
                                <th>Marks Scored</th>
                                <th>Grade</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(exam.subjects || []).map((subject, index) => (
                                <tr key={`${exam.examId}-${index}`}>
                                  <td>{subject.subject}</td>
                                  <td>{subject.maxMarks}</td>
                                  <td>{subject.marksObtained}</td>
                                  <td>
                                    <span className="badge badge-success">
                                      {subject.grade}
                                    </span>
                                  </td>
                                  <td>{subject.remarks || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ marginTop: "12px" }}>
                          <strong>
                            Total: {exam.totalMarks} / {exam.totalMaxMarks}
                          </strong>
                          {" • "}
                          <strong>Percentage: {exam.percentage}%</strong>
                          {" • "}
                          <strong>Result: {exam.result}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 7: Assignments */}
              {activeProfileTab === "assignments" && (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Subject</th>
                        <th>Due Date</th>
                        <th>Submission Status</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Quadratic Equations Problem Set</td>
                        <td>Mathematics</td>
                        <td>2025-09-15</td>
                        <td>
                          <StatusBadge status="Graded" size="sm" />
                        </td>
                        <td>25/25</td>
                      </tr>
                      <tr>
                        <td>Faraday Induction Lab Report</td>
                        <td>Physics</td>
                        <td>2025-09-20</td>
                        <td>
                          <StatusBadge status="Submitted" size="sm" />
                        </td>
                        <td>Pending</td>
                      </tr>
                      <tr>
                        <td>Shakespeare Sonnet Analysis</td>
                        <td>English</td>
                        <td>2025-09-10</td>
                        <td>
                          <StatusBadge status="Graded" size="sm" />
                        </td>
                        <td>19/20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 8: Transport */}
              {activeProfileTab === "transport" && (
                <div className="grid-2" style={{ gap: "14px" }}>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      ASSIGNED BUS ROUTE
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.assignedRoute ||
                        "Route 1 - North Express"}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      DESIGNATED PICKUP STOP
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      {selectedStudent.routeStop || "Maple Street Crossing"}
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      DRIVER CONTACT
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginTop: "2px",
                      }}
                    >
                      Robert Clark • +1 (555) 901-4433
                    </div>
                  </div>
                  <div className="card" style={{ padding: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      TRANSPORT STATUS
                    </div>
                    <div style={{ marginTop: "2px" }}>
                      <span className="badge badge-success">
                        Subscribed & Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 9: Documents */}
              {activeProfileTab === "documents" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      name: "Birth Certificate.pdf",
                      size: "1.2 MB",
                      verified: true,
                    },
                    {
                      name: "Previous School Transfer Certificate (TC).pdf",
                      size: "850 KB",
                      verified: true,
                    },
                    {
                      name: "Immunization & Health Record.pdf",
                      size: "2.1 MB",
                      verified: true,
                    },
                    {
                      name: "Parent ID Proof (Passport).pdf",
                      size: "1.8 MB",
                      verified: true,
                    },
                  ].map((doc, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-tertiary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <FileText size={18} color="var(--primary)" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{doc.name}</div>
                          <div
                            style={{
                              fontSize: "0.725rem",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {doc.size}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-success">
                        Verified Document
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 10: History */}
              {activeProfileTab === "history" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      title: "Term 1 Tuition Fee Paid ($4,500)",
                      time: "2 weeks ago",
                      type: "finance",
                    },
                    {
                      title: "Full Attendance Badge awarded for August",
                      time: "1 month ago",
                      type: "academic",
                    },
                    {
                      title: "Admitted into Class 10-A",
                      time: "June 2025",
                      type: "system",
                    },
                  ].map((act, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 14px",
                        borderLeft: "3px solid var(--primary)",
                        backgroundColor: "var(--bg-tertiary)",
                        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                        fontSize: "0.825rem",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {act.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.725rem",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {act.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="modal-footer"
              style={{ margin: "24px -24px -24px", padding: "16px 24px" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD STUDENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Student Admission Form"
        subtitle="Enter student personal, guardian and academic details for registration"
        size="lg"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="grid-3">
            <FormInput
              label="Student Full Name"
              required
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value,
                })
              }
              placeholder=""
            />

            <FormInput
              label="Admission Number"
              required
              value={newStudent.admissionNumber}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  admissionNumber: e.target.value,
                })
              }
              placeholder=""
            />

            <FormInput
              label="Roll Number"
              required
              value={newStudent.rollNumber}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  rollNumber: e.target.value,
                })
              }
              placeholder=""
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Student Email Address"
              type="email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
              placeholder="liam.s@example.com"
            />

            <FormInput
              label="Password"
              type="password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({ ...newStudent, password: e.target.value })
              }
              placeholder="Enter student password"
              required
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Date of Birth"
              type="date"
              value={newStudent.dateOfBirth}
              onChange={(e) =>
                setNewStudent({ ...newStudent, dateOfBirth: e.target.value })
              }
            />
          </div>

          <div className="grid-3">
            <Select
              label="Class / Grade"
              value={newStudent.classId}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  classId: e.target.value,
                  section: "",
                })
              }
              options={classes.map((cls) => ({
                value: cls._id,
                label: cls.name,
              }))}
            />
            <Select
              label="Section"
              value={newStudent.section}
              onChange={(e) =>
                setNewStudent({ ...newStudent, section: e.target.value })
              }
              options={
                classes.find((cls) => cls._id === newStudent.classId)
                  ?.sections || []
              }
            />
            <Select
              label="Gender"
              value={newStudent.gender}
              onChange={(e) =>
                setNewStudent({ ...newStudent, gender: e.target.value })
              }
              options={["MALE", "FEMALE", "OTHER"]}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Student Phone"
              value={newStudent.phone}
              onChange={(e) =>
                setNewStudent({ ...newStudent, phone: e.target.value })
              }
              placeholder="Enter student phone number"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Parent / Guardian Name"
              value={newStudent.parentName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parentName: e.target.value })
              }
              placeholder="e.g. Gregory Smith"
            />

            <FormInput
              label="Parent Phone"
              value={newStudent.parentPhone}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parentPhone: e.target.value })
              }
              placeholder="Enter parent phone number"
            />
          </div>

          <div className="grid-2">
            <Select
              label="Blood Group"
              value={newStudent.bloodGroup}
              onChange={(e) =>
                setNewStudent({ ...newStudent, bloodGroup: e.target.value })
              }
              options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
            />
            <FormInput
              label="Emergency Contact Phone"
              value={newStudent.emergencyContact}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  emergencyContact: e.target.value,
                })
              }
              placeholder="+1 (555) 999-0000"
            />
          </div>

          <Textarea
            label="Residential Address"
            value={newStudent.address}
            onChange={(e) =>
              setNewStudent({ ...newStudent, address: e.target.value })
            }
            placeholder="Street address, apartment, city, zip"
            rows={2}
          />

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
              Admit Student
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student"
        subtitle="Update student personal, guardian and academic details"
        size="lg"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!selectedStudent) return;

            try {
              const payload = {
                name: editStudent.name.trim(),
                email: editStudent.email.trim().toLowerCase(),
                admissionNumber: editStudent.admissionNumber.trim(),
                rollNumber: editStudent.rollNumber.trim(),
                dateOfBirth: editStudent.dateOfBirth || null,
                gender: editStudent.gender || null,
                classId: editStudent.classId || null,
                section: editStudent.section || null,
                phone: editStudent.phone?.trim() || null,
                parentName: editStudent.parentName?.trim() || null,
                parentPhone: editStudent.parentPhone?.trim() || null,
                emergencyContact: editStudent.emergencyContact?.trim() || null,
                bloodGroup: editStudent.bloodGroup || null,
                address: editStudent.address?.trim() || null,
              };

              const response = await studentService.updateSchoolStudent(
                selectedStudent.id,
                payload,
              );

              if (!response.success) {
                throw new Error(response.message || "Failed to update student");
              }

              await loadStudents();

              setIsEditModalOpen(false);
              setSelectedStudent(null);

              success("Student updated successfully!");
            } catch (err) {
              console.error("Failed to update student:", err);
              error(err.message || "Failed to update student");
            }
          }}
        >
          <div className="grid-2">
            <FormInput
              label="Student Full Name"
              required
              value={editStudent.name}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  name: e.target.value,
                })
              }
            />

            <FormInput
              label="Admission Number"
              required
              value={editStudent.admissionNumber}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  admissionNumber: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Student Email Address"
              type="email"
              value={editStudent.email}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  email: e.target.value,
                })
              }
            />

            <FormInput
              label="Date of Birth"
              type="date"
              value={editStudent.dateOfBirth}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  dateOfBirth: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-3">
            <Select
              label="Class / Grade"
              value={editStudent.classId}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  classId: e.target.value,
                  section: "",
                })
              }
              options={classes.map((cls) => ({
                value: cls._id,
                label: cls.name,
              }))}
            />

            <Select
              label="Section"
              value={editStudent.section}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  section: e.target.value,
                })
              }
              options={
                classes.find((cls) => cls._id === editStudent.classId)
                  ?.sections || []
              }
            />

            <Select
              label="Gender"
              value={editStudent.gender}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  gender: e.target.value,
                })
              }
              options={["MALE", "FEMALE", "OTHER"]}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Student Phone"
              value={editStudent.phone}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  phone: e.target.value,
                })
              }
            />

            <Select
              label="Blood Group"
              value={editStudent.bloodGroup}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  bloodGroup: e.target.value,
                })
              }
              options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Parent / Guardian Name"
              value={editStudent.parentName}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  parentName: e.target.value,
                })
              }
            />

            <FormInput
              label="Parent Phone"
              value={editStudent.parentPhone}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  parentPhone: e.target.value,
                })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Emergency Contact Phone"
              value={editStudent.emergencyContact}
              onChange={(e) =>
                setEditStudent({
                  ...editStudent,
                  emergencyContact: e.target.value,
                })
              }
            />
          </div>

          <Textarea
            label="Residential Address"
            value={editStudent.address}
            onChange={(e) =>
              setEditStudent({
                ...editStudent,
                address: e.target.value,
              })
            }
            rows={2}
          />

          <div
            className="modal-footer"
            style={{ margin: "20px -24px -24px", padding: "16px 24px" }}
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

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${studentToDelete?.name} (${studentToDelete?.rollNumber})? The student record will be kept in the system but the account will become inactive.`}
        confirmText="Deactivate Student"
        isDangerous={true}
      />
    </div>
  );
}
