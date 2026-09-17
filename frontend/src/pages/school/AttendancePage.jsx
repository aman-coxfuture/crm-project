import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import attendanceService from "../../services/attendanceService";
import studentService from "../../services/studentService";
import facultyService from "../../services/facultyService";
import staffService from "../../services/staffService";
import Tabs from "../../components/common/Tabs";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Save,
  Users,
  GraduationCap,
  Briefcase,
  Search,
  Check,
} from "lucide-react";

const getTodayDate = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return localDate.toISOString().split("T")[0];
};

export default function AttendancePage() {
  const { currentUser, selectedSchool } = useAuth();
  const schoolId = currentUser?.schoolId || selectedSchool?.id || "SCH-001";
  const { success, info, error } = useToast();
  const [activeTab, setActiveTab] = useState("teacher"); // Default to faculty or student

  // --- STUDENT ATTENDANCE STATE ---
  const [selectedClass, setSelectedClass] = useState("Class 9");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState(getTodayDate);

  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [studentResponse, classResponse] = await Promise.all([
          studentService.getSchoolStudents(),
          api.get("/classes"),
        ]);

        if (!studentResponse.success) {
          throw new Error(studentResponse.message || "Failed to load students");
        }

        if (!classResponse.success) {
          throw new Error(classResponse.message || "Failed to load classes");
        }

        setAllStudents(studentResponse.students || []);
        setClasses(classResponse.classes || []);
      } catch (err) {
        console.error("Failed to load student attendance data:", err);
        error(err.message || "Failed to load students and classes");
      }
    };

    loadStudentData();
  }, []);

  useEffect(() => {
    if (!classes.length) return;

    const currentClassExists = classes.some(
      (schoolClass) => schoolClass.name === selectedClass,
    );

    if (!currentClassExists) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    const currentClass = classes.find(
      (schoolClass) => schoolClass.name === selectedClass,
    );

    if (!currentClass) return;

    const sections = currentClass.sections || [];

    if (!sections.includes(selectedSection)) {
      setSelectedSection(sections[0] || "");
    }
  }, [classes, selectedClass, selectedSection]);

  useEffect(() => {
    const loadStudentAttendance = async () => {
      try {
        if (!classStudents.length) {
          setStudentAttendanceMap({});
          return;
        }

        const response = await attendanceService.getAttendance({
          date: selectedDate,
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to load attendance");
        }

        const records = response.attendance || [];

        const map = {};

        classStudents.forEach((student) => {
          const studentId = student._id;

          const attendanceRecord = records.find(
            (record) =>
              record.studentId?._id === studentId ||
              record.studentId === studentId,
          );

          map[studentId] = attendanceRecord
            ? attendanceRecord.status.toLowerCase()
            : "not_marked";
        });

        setStudentAttendanceMap(map);
      } catch (err) {
        console.error("Failed to load student attendance:", err);
        error(err.message || "Failed to load attendance");
      }
    };

    loadStudentAttendance();
  }, [classStudents, selectedDate]);

  useEffect(() => {
    const filtered = allStudents.filter((student) => {
      const className = student.classId?.name || student.className || "";

      return className === selectedClass && student.section === selectedSection;
    });

    setClassStudents(filtered);
  }, [allStudents, selectedClass, selectedSection]);

  const [studentAttendanceMap, setStudentAttendanceMap] = useState({});

  const handleStudentStatusChange = (studentId, status) => {
    setStudentAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllStudentsPresent = () => {
    const map = {};
    classStudents.forEach((s) => {
      map[s._id] = "present";
    });
    setStudentAttendanceMap(map);
    info("Marked all students as Present");
  };

  const handleSaveStudentAttendance = async () => {
    try {
      if (!classStudents.length) {
        info("No students found for this class and section.");
        return;
      }

      for (const student of classStudents) {
        const studentId = student._id;

        const status = studentAttendanceMap[studentId] || "present";

        await attendanceService.markAttendance({
          studentId,
          date: selectedDate,
          status: status.toUpperCase(),
        });
      }

      success("Student attendance saved successfully.");
    } catch (err) {
      console.error("Failed to save student attendance:", err);
      error(err.message || "Failed to save attendance");
    }
  };

  const studentPresentCount = classStudents.filter(
    (s) => studentAttendanceMap[s._id] === "present",
  ).length;
  const studentAbsentCount = classStudents.filter(
    (s) => studentAttendanceMap[s._id] === "absent",
  ).length;

  // --- FACULTY / TEACHER ATTENDANCE STATE ---

  const [facultyDate, setFacultyDate] = useState(getTodayDate);
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyStatusFilter, setFacultyStatusFilter] = useState("All");

  const [facultyRecords, setFacultyRecords] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);

  const loadFacultyAttendance = async () => {
    try {
      setFacultyLoading(true);

      const [facultyResponse, attendanceResponse] = await Promise.all([
        facultyService.getSchoolFaculty(),
        attendanceService.getFacultyAttendance({
          date: facultyDate,
        }),
      ]);

      if (!facultyResponse.success) {
        throw new Error(facultyResponse.message || "Failed to load faculty");
      }

      if (!attendanceResponse.success) {
        throw new Error(
          attendanceResponse.message || "Failed to load faculty attendance",
        );
      }

      const faculty = facultyResponse.faculty || [];
      const attendance = attendanceResponse.attendance || [];

      const records = faculty.map((teacher) => {
        const attendanceRecord = attendance.find(
          (record) =>
            record.facultyId?._id === teacher._id ||
            record.facultyId === teacher._id,
        );

        return {
          id: teacher._id,
          teacherId: teacher._id,
          teacherName: teacher.name,
          department: teacher.department,
          subject: teacher.designation || "Faculty",
          date: facultyDate,
          status: attendanceRecord
            ? attendanceRecord.status.toLowerCase()
            : "not_marked",
          punchIn: attendanceRecord?.checkInTime || null,
          punchOut: attendanceRecord?.checkOutTime || null,
          attendanceId: attendanceRecord?._id || null,
        };
      });

      setFacultyRecords(records);
    } catch (err) {
      console.error("Failed to load faculty attendance:", err);
      error(err.message || "Failed to load faculty attendance");
    } finally {
      setFacultyLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyAttendance();
  }, [facultyDate]);

  const handleFacultyAttendanceAction = async (
    teacherId,
    teacherName,
    attendanceRecord,
  ) => {
    try {
      const now = new Date();

      const currentTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // No actual attendance record yet = Punch In
      if (!attendanceRecord?.attendanceId) {
        await attendanceService.markFacultyAttendance({
          facultyId: teacherId,
          date: facultyDate,
          status: "PRESENT",
          checkInTime: currentTime,
          checkOutTime: null,
        });

        success(`Punch In recorded at ${currentTime}`);
      }
      // Attendance exists but Punch Out is pending
      else if (!attendanceRecord.punchOut) {
        await attendanceService.updateFacultyAttendance(
          attendanceRecord.attendanceId,
          {
            checkOutTime: currentTime,
          },
        );

        success(`Punch Out recorded at ${currentTime}`);
      }

      await loadFacultyAttendance();
    } catch (err) {
      console.error("Failed to update faculty attendance:", err);

      error(err.message || "Failed to update faculty attendance");
    }
  };

  const filteredFaculty = facultyRecords.filter((t) => {
    const matchesSearch =
      t.teacherName?.toLowerCase().includes(facultySearch.toLowerCase()) ||
      t.department?.toLowerCase().includes(facultySearch.toLowerCase()) ||
      t.subject?.toLowerCase().includes(facultySearch.toLowerCase());

    const matchesStatus =
      facultyStatusFilter === "All" ||
      (facultyStatusFilter === "Present" && t.status === "present") ||
      (facultyStatusFilter === "Absent" && t.status === "absent");

    return matchesSearch && matchesStatus;
  });

  const facultyPresentCount = facultyRecords.filter(
    (t) => t.status === "present",
  ).length;

  const facultyAbsentCount = facultyRecords.filter(
    (t) => t.status === "absent",
  ).length;

  const facultyAttendanceRate =
    facultyRecords.length > 0
      ? ((facultyPresentCount / facultyRecords.length) * 100).toFixed(1)
      : "0.0";

  // --- STAFF ATTENDANCE ---
  const [staffDate, setStaffDate] = useState(getTodayDate);
  const [staff, setStaff] = useState([]);
  const [staffAttendanceRecords, setStaffAttendanceRecords] = useState([]);
  const [staffAttendanceLoading, setStaffAttendanceLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffStatusFilter, setStaffStatusFilter] = useState("All");
  const loadStaffAttendance = async () => {
    try {
      setStaffAttendanceLoading(true);

      const [staffResponse, attendanceResponse] = await Promise.all([
        staffService.getSchoolStaff(),
        attendanceService.getStaffAttendance({
          date: staffDate,
        }),
      ]);

      if (!staffResponse.success) {
        throw new Error(staffResponse.message || "Failed to load staff");
      }

      if (!attendanceResponse.success) {
        throw new Error(
          attendanceResponse.message || "Failed to load staff attendance",
        );
      }

      setStaff(staffResponse.staff || []);
      setStaffAttendanceRecords(attendanceResponse.attendance || []);
    } catch (err) {
      console.error("Failed to load staff attendance:", err);

      error(err.message || "Failed to load staff attendance");
    } finally {
      setStaffAttendanceLoading(false);
    }
  };

  const getStaffAttendanceRecord = (staffId) => {
    return staffAttendanceRecords.find(
      (record) => record.staffId?._id === staffId || record.staffId === staffId,
    );
  };

  const getStaffStatus = (staffMember) => {
    const record = getStaffAttendanceRecord(staffMember._id);

    return record?.status ? record.status.toLowerCase() : "not_marked";
  };

  const staffPresentCount = staff.filter(
    (staffMember) => getStaffStatus(staffMember) === "present",
  ).length;

  const staffAbsentCount = staff.filter(
    (staffMember) => getStaffStatus(staffMember) === "absent",
  ).length;

  const filteredStaff = staff.filter((staffMember) => {
    const search = staffSearch.toLowerCase();

    const matchesSearch =
      staffMember.name?.toLowerCase().includes(search) ||
      staffMember.department?.toLowerCase().includes(search) ||
      staffMember.designation?.toLowerCase().includes(search);

    const status = getStaffStatus(staffMember);

    const matchesStatus =
      staffStatusFilter === "All" ||
      (staffStatusFilter === "Present" && status === "present") ||
      (staffStatusFilter === "Absent" && status === "absent") ||
      (staffStatusFilter === "Not Marked" && status === "not_marked");

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadStaffAttendance();
  }, [staffDate]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Attendance Management
          </h1>
          <p className="page-subtitle">
            School attendance registers for Students, Faculty (Punch In/Out),
            and Support Staff
          </p>
        </div>

        {activeTab === "student" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn btn-secondary"
              onClick={handleMarkAllStudentsPresent}
            >
              <CheckCircle2 size={16} />
              <span>Mark All Present</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveStudentAttendance}
            >
              <Save size={16} />
              <span>Save Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: "teacher",
            label: "Faculty Attendance Roster",
            icon: <GraduationCap size={15} />,
          },
          {
            id: "student",
            label: "Student Daily Register",
            icon: <Users size={15} />,
          },
          {
            id: "staff",
            label: "Staff Attendance Roster",
            icon: <Briefcase size={15} />,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* TAB 1: FACULTY ATTENDANCE ROSTER (PART 14) */}
      {activeTab === "teacher" && (
        <div>
          {/* Faculty Attendance Stat Cards */}
          <div className="grid-4" style={{ marginBottom: "20px" }}>
            <StatCard
              title="Total Teaching Faculty"
              value={facultyRecords.length}
              icon={GraduationCap}
              color="indigo"
              subtitle="All Departments"
            />
            <StatCard
              title="Present Faculty"
              value={facultyPresentCount}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Punched In"
            />
            <StatCard
              title="Absent Today"
              value={facultyAbsentCount}
              icon={XCircle}
              color="rose"
              subtitle="Not in attendance"
            />
            <StatCard
              title="Faculty Attendance"
              value={`${facultyAttendanceRate}%`}
              icon={CalendarCheck}
              color="amber"
              subtitle="Daily presence rate"
            />
          </div>

          {/* Filter Toolbar */}
          <div
            className="card"
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Date filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                Date:
              </label>
              <input
                type="date"
                value={facultyDate}
                max={getTodayDate()}
                onChange={(e) => setFacultyDate(e.target.value)}
                className="form-input"
                style={{ width: "160px", height: "38px", fontSize: "0.85rem" }}
              />
            </div>

            {/* Search */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type="text"
                placeholder="Search teacher..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: "36px",
                  height: "38px",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                Status:
              </label>
              <select
                value={facultyStatusFilter}
                onChange={(e) => setFacultyStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: "130px", height: "38px", fontSize: "0.85rem" }}
              >
                <option value="All">All Status</option>
                <option value="Present">🟢 Present</option>
                <option value="Absent">🔴 Absent</option>
              </select>
            </div>

            <div
              style={{
                marginLeft: "auto",
                fontSize: "0.8rem",
                color: "var(--text-tertiary)",
              }}
            >
              Showing {filteredFaculty.length} of {facultyRecords.length}{" "}
              faculty members
            </div>
          </div>

          {/* Faculty Attendance Table */}
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div
              className="table-container"
              style={{ border: "none", borderRadius: "0" }}
            >
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Department</th>
                    <th>Assigned Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th style={{ textAlign: "center" }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.map((t) => {
                    const isPresent = t.status === "present";
                    const isAbsent = t.status === "absent";

                    const attendanceRecord = facultyRecords.find(
                      (record) => record.teacherId === t.teacherId,
                    );

                    return (
                      <tr
                        key={t.id || t.teacherId}
                        style={{
                          backgroundColor: isPresent
                            ? "rgba(16, 185, 129, 0.02)"
                            : isAbsent
                              ? "rgba(239, 68, 68, 0.03)"
                              : "transparent",
                        }}
                      >
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                t.avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                              }
                              alt=""
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                }}
                              >
                                {t.teacherName}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-tertiary)",
                                }}
                              >
                                ID: {t.teacherId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{t.department || "General"}</td>
                        <td>
                          <span className="badge badge-primary">
                            {t.subject || "Faculty"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.825rem", fontWeight: 600 }}>
                          {t.date || facultyDate}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPresent
                                ? "badge-success"
                                : isAbsent
                                  ? "badge-danger"
                                  : "badge-gray"
                            }`}
                            style={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            {isPresent
                              ? "🟢 Present"
                              : isAbsent
                                ? "🔴 Absent"
                                : "⚪ Not Marked"}
                          </span>
                        </td>
                        <td>
                          <strong
                            style={{
                              color: isPresent
                                ? "#10b981"
                                : "var(--text-tertiary)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {t.punchIn || "—"}
                          </strong>
                        </td>
                        <td>
                          <strong
                            style={{
                              color:
                                t.punchOut && t.punchOut !== "—"
                                  ? "#4f46e5"
                                  : "var(--text-tertiary)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {t.punchOut || "—"}
                          </strong>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                              handleFacultyAttendanceAction(
                                t.teacherId,
                                t.teacherName,
                                attendanceRecord,
                              )
                            }
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 10px",
                              borderColor: attendanceRecord?.checkOutTime
                                ? "#6b7280"
                                : attendanceRecord?.checkInTime
                                  ? "#ef4444"
                                  : "#10b981",
                              color: attendanceRecord?.checkOutTime
                                ? "#6b7280"
                                : attendanceRecord?.checkInTime
                                  ? "#ef4444"
                                  : "#10b981",
                            }}
                            disabled={Boolean(attendanceRecord?.punchOut)}
                          >
                            {attendanceRecord?.punchOut
                              ? "Completed"
                              : attendanceRecord?.punchIn
                                ? "Punch Out"
                                : "Punch In"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ATTENDANCE REGISTER */}
      {activeTab === "student" && (
        <div>
          {/* Quick Metrics */}
          <div className="grid-4" style={{ marginBottom: "20px" }}>
            <StatCard
              title="Total Enrolled"
              value={classStudents.length}
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Present"
              value={studentPresentCount}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Absent"
              value={studentAbsentCount}
              icon={XCircle}
              color="rose"
            />
            <StatCard
              title="Attendance %"
              value={
                classStudents.length > 0
                  ? `${((studentPresentCount / classStudents.length) * 100).toFixed(1)}%`
                  : "0%"
              }
              icon={CalendarCheck}
              color="amber"
            />
          </div>

          {/* Selector Filter Card */}
          <div
            className="card"
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                max={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
                style={{ width: "160px", height: "38px", fontSize: "0.85rem" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                Class:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
                style={{
                  width: "150px",
                  height: "38px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {classes.map((schoolClass) => (
                  <option key={schoolClass._id} value={schoolClass.name}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
                Section:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="form-select"
                style={{
                  width: "120px",
                  height: "38px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {(
                  classes.find(
                    (schoolClass) => schoolClass.name === selectedClass,
                  )?.sections || []
                ).map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Marking Table (ONLY PRESENT & ABSENT) */}
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div
              className="table-container"
              style={{ border: "none", borderRadius: "0" }}
            >
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>#</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th style={{ textAlign: "center" }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student, idx) => {
                    const isPresent =
                      studentAttendanceMap[student._id] === "present";
                    const isAbsent =
                      studentAttendanceMap[student._id] === "absent";

                    return (
                      <tr key={student._id}>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                student.profilePhoto ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                              }
                              alt=""
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
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
                          <strong>{student.admissionNumber}</strong>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleStudentStatusChange(
                                  student._id,
                                  "present",
                                )
                              }
                              style={{
                                padding: "6px 16px",
                                fontSize: "0.8rem",
                                fontWeight: isPresent ? 800 : 500,
                                borderRadius: "var(--radius-md)",
                                border: isPresent
                                  ? "2px solid #10b981"
                                  : "1px solid var(--border-color)",
                                backgroundColor: isPresent
                                  ? "#10b981"
                                  : "var(--bg-tertiary)",
                                color: isPresent
                                  ? "#ffffff"
                                  : "var(--text-primary)",
                                cursor: "pointer",
                              }}
                            >
                              🟢 Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStudentStatusChange(student._id, "absent")
                              }
                              style={{
                                padding: "6px 16px",
                                fontSize: "0.8rem",
                                fontWeight: isAbsent ? 800 : 500,
                                borderRadius: "var(--radius-md)",
                                border: isAbsent
                                  ? "2px solid #ef4444"
                                  : "1px solid var(--border-color)",
                                backgroundColor: isAbsent
                                  ? "#ef4444"
                                  : "var(--bg-tertiary)",
                                color: isAbsent
                                  ? "#ffffff"
                                  : "var(--text-primary)",
                                cursor: "pointer",
                              }}
                            >
                              🔴 Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF ATTENDANCE ROSTER */}
      {activeTab === "staff" && (
        <div>
          <div className="grid-4" style={{ marginBottom: "20px" }}>
            <StatCard
              title="Total Staff"
              value={staff.length}
              icon={Briefcase}
              color="indigo"
              subtitle="All Support Staff"
            />

            <StatCard
              title="Present"
              value={staffPresentCount}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Present Today"
            />

            <StatCard
              title="Absent"
              value={staffAbsentCount}
              icon={XCircle}
              color="rose"
              subtitle="Absent Today"
            />

            <StatCard
              title="Not Marked"
              value={staff.length - staffPresentCount - staffAbsentCount}
              icon={Clock}
              color="amber"
              subtitle="Attendance Pending"
            />
          </div>
          <div
            className="card"
            style={{
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Date Filter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 700,
                }}
              >
                Date:
              </label>

              <input
                type="date"
                value={staffDate}
                max={getTodayDate()}
                onChange={(e) => setStaffDate(e.target.value)}
                className="form-input"
                style={{
                  width: "160px",
                  height: "38px",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            {/* Search */}
            <div
              style={{
                position: "relative",
                minWidth: "220px",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />

              <input
                type="text"
                placeholder="Search staff..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: "36px",
                  height: "38px",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            {/* Status Filter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 700,
                }}
              >
                Status:
              </label>

              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value)}
                className="form-select"
                style={{
                  width: "130px",
                  height: "38px",
                  fontSize: "0.85rem",
                }}
              >
                <option value="All">All Status</option>
                <option value="Present">🟢 Present</option>
                <option value="Absent">🔴 Absent</option>
                <option value="Not Marked">⚪ Not Marked</option>
              </select>
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: "0.8rem",
                color: "var(--text-tertiary)",
              }}
            >
              Showing {filteredStaff.length} of {staff.length} staff members
            </div>
          </div>

          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div
              className="table-container"
              style={{ border: "none", borderRadius: "0" }}
            >
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Daily Status</th>
                    <th>Check-In Time</th>
                    <th>Check-Out Time</th>
                    <th style={{ textAlign: "center" }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staffAttendanceLoading ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Loading staff attendance...
                      </td>
                    </tr>
                  ) : staff.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        No staff members found.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => {
                      const attendanceRecord = getStaffAttendanceRecord(s._id);
                      const status = getStaffStatus(s);

                      return (
                        <tr key={s._id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{s.name}</div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {s._id}
                            </div>
                          </td>

                          <td>{s.department || "—"}</td>

                          <td>
                            <strong>{s.designation || "—"}</strong>
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                status === "not_marked"
                                  ? "Not Marked"
                                  : status.toUpperCase()
                              }
                            />
                          </td>

                          <td
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {attendanceRecord?.checkInTime || "—"}
                          </td>

                          <td
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {attendanceRecord?.checkOutTime || "—"}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                try {
                                  const now = new Date();

                                  const currentTime = now.toLocaleTimeString(
                                    "en-IN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    },
                                  );

                                  const attendanceRecord =
                                    getStaffAttendanceRecord(s._id);

                                  if (!attendanceRecord) {
                                    // First click = Punch In
                                    await attendanceService.markStaffAttendance(
                                      {
                                        staffId: s._id,
                                        date: staffDate,
                                        status: "PRESENT",
                                        checkInTime: currentTime,
                                        checkOutTime: null,
                                      },
                                    );

                                    success(
                                      `Punch In recorded at ${currentTime}`,
                                    );
                                  } else if (!attendanceRecord.checkOutTime) {
                                    await attendanceService.updateStaffAttendance(
                                      attendanceRecord._id,
                                      {
                                        checkOutTime: currentTime,
                                      },
                                    );

                                    success(
                                      `Punch Out recorded at ${currentTime}`,
                                    );
                                  }

                                  await loadStaffAttendance();
                                } catch (err) {
                                  console.error(err);
                                  error(
                                    err.message ||
                                      "Failed to update attendance",
                                  );
                                }
                              }}
                              style={{
                                fontSize: "0.75rem",
                                padding: "4px 10px",
                                borderColor:
                                  status === "present" ? "#ef4444" : "#10b981",
                                color:
                                  status === "present" ? "#ef4444" : "#10b981",
                              }}
                            >
                              {getStaffAttendanceRecord(s._id)?.checkOutTime
                                ? "Completed"
                                : getStaffAttendanceRecord(s._id)?.checkInTime
                                  ? "Punch Out"
                                  : "Punch In"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
