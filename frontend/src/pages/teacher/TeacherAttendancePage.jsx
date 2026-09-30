import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { schoolDataService } from "../../services/schoolDataService";
import attendanceService from "../../services/attendanceService";
import { useToast } from "../../context/ToastContext";
import StatCard from "../../components/common/StatCard";
import {
  CalendarCheck,
  Save,
  CheckCircle2,
  XCircle,
  Users,
  Check,
  AlertCircle,
} from "lucide-react";

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();

  const teacherName = currentUser?.name || "Faculty";

  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    const loadFacultyAssignments = async () => {
      try {
        setLoadingAssignments(true);

        const response = await api.get("/students/my-students");

        setFacultyAssignments(response?.assignments || []);
        setAllStudents(response?.students || []);
      } catch (err) {
        console.error("Failed to load faculty assignments:", err);
        error(err.message || "Failed to load assigned classes");
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadFacultyAssignments();
  }, []);
  const classSections = Array.from(
    new Map(
      facultyAssignments.map((assignment) => [
        `${assignment.classId}-${assignment.section}`,
        assignment,
      ]),
    ).values(),
  );

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const assignedSections = Array.from(
    new Set(
      facultyAssignments
        .filter((assignment) => assignment.className === selectedClass)
        .map((assignment) => assignment.section),
    ),
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [allStudents, setAllStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await api.get("/students/my-students");

        const students = response?.students || [];

        setAllStudents(students);

        const filteredStudents = students.filter(
          (student) =>
            student.className === selectedClass &&
            student.section === selectedSection,
        );

        setClassStudents(filteredStudents);
      } catch (err) {
        console.error("Failed to load students:", err);
        setAllStudents([]);
        setClassStudents([]);
        error(err.message || "Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClass, selectedSection]);

  // Student Attendance state: map of { [studentId]: 'present' | 'absent' }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const isPastDate = selectedDate < today;
  const isFutureDate = selectedDate > today;
  const isToday = selectedDate === today;

  const [validationError, setValidationError] = useState("");

  // PART 8: Load previous saved attendance if it exists for Class + Section + Date
  useEffect(() => {
    const loadSavedAttendance = async () => {
      try {
        setAttendanceMap({});
        setValidationError("");

        setAttendanceLoaded(false);

        if (classStudents.length === 0) {
          return;
        }

        const classId = classStudents[0]?.classId?._id;

        if (!classId) {
          console.error("Class ID not found for selected students");
          return;
        }

        const response = await attendanceService.getStudentAttendance({
          date: selectedDate,
          classId,
          section: selectedSection,
        });

        const savedRecords = response?.attendance || [];

        setAttendanceSaved(savedRecords.length > 0);
        setAttendanceLoaded(true);

        const initialMap = {};

        savedRecords.forEach((record) => {
          const studentId = record.studentId?._id || record.studentId;

          if (studentId) {
            initialMap[studentId] = record.status?.toLowerCase() || "";
          }
        });

        setAttendanceMap(initialMap);
      } catch (err) {
        console.error("Failed to load saved attendance:", err);
        setAttendanceMap({});
      }
    };

    loadSavedAttendance();
  }, [classStudents, selectedSection, selectedDate]);

  // Handle Mark Single Student
  const handleMarkStudent = (studentId, status) => {
    if (attendanceSaved) {
      return;
    }

    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));

    setValidationError("");
  };
  // Quick Action: Mark All Present
  const handleMarkAllPresent = () => {
    const newMap = {};
    classStudents.forEach((s) => {
      newMap[s._id] = "present";
    });

    setAttendanceMap(newMap);
    setValidationError("");
    info("Marked all students as Present");
  };

  // PART 6: Save Attendance with strict validation
  const handleSaveAttendance = async () => {
    if (attendanceSaved) {
      info("Attendance already marked for this date.");
      return;
    }

    if (classStudents.length === 0) {
      error("No students in this class section.");
      return;
    }

    const unmarkedStudents = classStudents.filter((s) => !attendanceMap[s._id]);

    if (unmarkedStudents.length > 0) {
      setValidationError(
        `Please mark attendance for all students. (${unmarkedStudents.length} remaining)`,
      );
      error(
        `Please mark attendance for all ${classStudents.length} students before saving.`,
      );
      return;
    }

    const classId = classStudents[0]?.classId?._id;

    if (!classId) {
      error("Class information not found.");
      return;
    }

    try {
      for (const student of classStudents) {
        await attendanceService.markStudentAttendance({
          studentId: student._id,
          classId,
          section: selectedSection,
          date: selectedDate,
          status: attendanceMap[student._id].toUpperCase(),
        });
      }

      setAttendanceSaved(true);
      setValidationError("");
      success("Attendance saved successfully.");
    } catch (err) {
      console.error("Save Attendance Error:", err);
      error(err.message || "Failed to save attendance.");
    }
  };

  // PART 7: Summary statistics
  const totalStudents = classStudents.length;
  const presentCount = classStudents.filter(
    (s) => attendanceMap[s._id] === "present",
  ).length;
  const absentCount = classStudents.filter(
    (s) => attendanceMap[s._id] === "absent",
  ).length;
  const attendancePercentage =
    totalStudents > 0 && presentCount + absentCount > 0
      ? ((presentCount / totalStudents) * 100).toFixed(1)
      : "0.0";

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Student Attendance Register
          </h1>
          <p className="page-subtitle">
            Mark daily attendance for your assigned classrooms • Faculty:{" "}
            <strong>{teacherName}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={handleMarkAllPresent}>
            <CheckCircle2 size={16} />
            <span>Mark All Present</span>
          </button>
          {isToday && (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveAttendance}
              disabled={attendanceSaved}
            >
              <Save size={16} />
              <span>
                {attendanceSaved ? "Attendance Saved" : "Save Attendance"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* PART 7: SUMMARY CARDS */}
      <div className="grid-4" style={{ marginBottom: "20px" }}>
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="indigo"
          subtitle={`${selectedClass} - Section ${selectedSection}`}
        />
        <StatCard
          title="Present"
          value={presentCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Marked Present"
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon={XCircle}
          color="rose"
          subtitle="Marked Absent"
        />
        <StatCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          color="amber"
          subtitle="Class attendance rate"
        />
      </div>

      {/* Validation Message Banner */}
      {validationError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            borderRadius: "var(--radius-md)",
            color: "#dc2626",
            fontWeight: 700,
            fontSize: "0.875rem",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}

      {/* FILTER & SELECTOR TOOLBAR */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        {/* Date Picker */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "0.825rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Attendance Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: "160px", height: "38px", fontSize: "0.85rem" }}
          />
        </div>

        {/* PART 1: Assigned Classes ONLY Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "0.825rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Select Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const value = e.target.value;

              if (!value) {
                setSelectedClass("");
                setSelectedSection("");
                return;
              }

              const [classId, section] = value.split("__");

              const assignment = classSections.find(
                (item) => item.classId === classId && item.section === section,
              );

              setSelectedClass(assignment?.className || "");
              setSelectedSection(section || "");
            }}
            className="form-select"
            style={{
              width: "150px",
              height: "38px",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
            disabled={loadingAssignments}
          >
            <option value="">
              {loadingAssignments ? "Loading classes..." : "Select Class"}
            </option>

            {classSections.map((assignment) => {
              const value = `${assignment.classId}__${assignment.section}`;

              return (
                <option key={value} value={value}>
                  Class {assignment.className}-{assignment.section}
                </option>
              );
            })}
          </select>
        </div>

        {/* Section Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              fontSize: "0.825rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Section:
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Select Section</option>

            {assignedSections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            marginLeft: "auto",
            fontSize: "0.8rem",
            color: "var(--text-tertiary)",
          }}
        >
          Assigned to:{" "}
          <strong style={{ color: "var(--primary)" }}>{teacherName}</strong>
        </div>
      </div>

      {/* PART 2, 3, 4, 23, 24: STUDENT ATTENDANCE TABLE (ONLY PRESENT & ABSENT) */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "var(--bg-tertiary)",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
              {selectedClass} — Section {selectedSection}
            </span>
            <span
              style={{
                color: "var(--text-tertiary)",
                fontSize: "0.8rem",
                marginLeft: "10px",
              }}
            >
              ({classStudents.length} Students Registered)
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Date: <strong>{selectedDate}</strong>
          </div>
        </div>

        {isPastDate && attendanceLoaded && !attendanceSaved && (
          <div
            style={{
              padding: "16px 20px",
              marginBottom: "16px",
              backgroundColor: "rgba(245, 158, 11, 0.10)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            No attendance was marked for this date.
          </div>
        )}

        {isFutureDate && (
          <div
            style={{
              padding: "16px 20px",
              marginBottom: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.30)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            Attendance cannot be marked for a future date.
          </div>
        )}

        {classStudents.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <Users size={36} style={{ marginBottom: "10px", opacity: 0.5 }} />
            <p>
              No students enrolled in {selectedClass} - Section{" "}
              {selectedSection}.
            </p>
          </div>
        ) : (
          <div
            className="table-container"
            style={{ border: "none", borderRadius: "0" }}
          >
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th>Student Name</th>
                  <th style={{ width: "130px" }}>Roll Number</th>
                  <th style={{ width: "260px", textAlign: "center" }}>
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, idx) => {
                  const status = attendanceMap[student._id];
                  const isPresent = status === "present";
                  const isAbsent = status === "absent";

                  return (
                    <tr
                      key={student.id}
                      style={{
                        backgroundColor: isPresent
                          ? "rgba(16, 185, 129, 0.03)"
                          : isAbsent
                            ? "rgba(239, 68, 68, 0.03)"
                            : "transparent",
                      }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 600,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <img
                            src={
                              student.profilePhoto ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                            }
                            alt=""
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                              }}
                            >
                              {student.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              ID: {student._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {student.rollNumber || "-"}
                        </strong>
                      </td>
                      <td>
                        {isToday ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              justifyContent: "center",
                            }}
                          >
                            {/* PRESENT BUTTON */}
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkStudent(student._id, "present")
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "7px 16px",
                                fontSize: "0.8rem",
                                fontWeight: isPresent ? 600 : 500,
                                borderRadius: "8px",
                                border: isPresent
                                  ? "1px solid #10b981"
                                  : "1px solid #d1d5db",
                                backgroundColor: isPresent
                                  ? "rgba(16, 185, 129, 0.10)"
                                  : "#ffffff",
                                color: isPresent ? "#059669" : "#6b7280",
                                cursor: "pointer",
                                minWidth: "92px",
                              }}
                            >
                              <span>🟢</span>
                              <span>Present</span>
                              {isPresent && <Check size={14} />}
                            </button>

                            {/* ABSENT BUTTON */}
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkStudent(student._id, "absent")
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "7px 16px",
                                fontSize: "0.8rem",
                                fontWeight: isAbsent ? 600 : 500,
                                borderRadius: "8px",
                                border: isAbsent
                                  ? "1px solid #ef4444"
                                  : "1px solid #d1d5db",
                                backgroundColor: isAbsent
                                  ? "rgba(239, 68, 68, 0.08)"
                                  : "#ffffff",
                                color: isAbsent ? "#dc2626" : "#6b7280",
                                cursor: "pointer",
                                minWidth: "92px",
                              }}
                            >
                              <span>🔴</span>
                              <span>Absent</span>
                              {isAbsent && <Check size={14} />}
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`badge ${
                              isPresent ? "badge-success" : "badge-danger"
                            }`}
                            style={{
                              fontWeight: 700,
                              minWidth: "85px",
                              textAlign: "center",
                            }}
                          >
                            {isPresent
                              ? "PRESENT"
                              : isAbsent
                                ? "ABSENT"
                                : "NOT MARKED"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with Save Button */}
        {classStudents.length > 0 && isToday && (
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "var(--bg-secondary)",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}
            >
              Marked: <strong>{presentCount + absentCount}</strong> of{" "}
              <strong>{totalStudents}</strong> students
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveAttendance}
            >
              <Save size={18} />
              <span>Save Attendance</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
