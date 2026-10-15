import React, { useEffect, useState } from "react";
import { studentService } from "../../services/studentService";
import attendanceService from "../../services/attendanceService";
import facultyService from "../../services/facultyService";
import staffService from "../../services/staffService";
import staffFeeService from "../../services/staffFeeService";
import classService from "../../services/classService";
import { useNavigate } from "react-router-dom";
import feeService from "../../services/feeService";
import { useAuth } from "../../context/AuthContext";
import { schoolDataService } from "../../services/schoolDataService";
import StatCard from "../../components/common/StatCard";
import transportService from "../../services/transportService";
import examService from "../../services/examService";
import {
  BarChart,
  ComparisonBarChart,
  DonutChart,
  TrendLineChart,
} from "../../components/common/Charts";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Users,
  GraduationCap,
  Briefcase,
  Bus,
  Layers,
  CalendarCheck,
  DollarSign,
  Award,
  Plus,
  Clock,
  Bell,
  CheckCircle2,
  Wallet,
} from "lucide-react";

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { selectedSchool, currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffFeeLedgers, setStaffFeeLedgers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceWeekly, setAttendanceWeekly] = useState([]);
  const [feeStatusData, setFeeStatusData] = useState([]);
  const [feeMonthlyTrend, setFeeMonthlyTrend] = useState([]);
  const schoolId = currentUser?.schoolId || selectedSchool?.id || "SCH-001";

  // Scoped strictly to current school
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await studentService.getSchoolStudents();
        const backendStudents = data.students || [];

        const studentsWithFeesAndAttendance = await Promise.all(
          backendStudents.map(async (student) => {
            try {
              const [feeResponse, attendanceResponse] = await Promise.all([
                feeService.getStudentFees(student._id),
                attendanceService.getStudentAttendanceSummary(student._id),
              ]);

              // -------------------------
              // FEE DATA
              // -------------------------
              const fees = feeResponse?.fees || [];

              let feeStatus = "Not Assigned";
              let totalFee = 0;
              let paidFee = 0;

              if (fees.length > 0) {
                totalFee = fees.reduce(
                  (sum, fee) => sum + Number(fee.totalAmount || 0),
                  0,
                );

                paidFee = fees.reduce(
                  (sum, fee) => sum + Number(fee.paidAmount || 0),
                  0,
                );

                const hasOverdue = fees.some((fee) => fee.status === "OVERDUE");

                const hasPending = fees.some(
                  (fee) => fee.status === "PENDING" || fee.status === "PARTIAL",
                );

                feeStatus = "Paid";

                if (hasOverdue) {
                  feeStatus = "Overdue";
                } else if (hasPending) {
                  feeStatus = "Pending";
                }
              }

              // -------------------------
              // ATTENDANCE DATA
              // -------------------------
              const attendance = attendanceResponse?.summary?.percentage ?? 0;

              return {
                ...mapStudent(student),
                feeStatus,
                totalFee,
                paidFee,
                attendance,
              };
            } catch (studentError) {
              console.error(
                `Failed to load fee/attendance for student ${student._id}:`,
                studentError,
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

        setStudents(studentsWithFeesAndAttendance);
      } catch (error) {
        console.error("Failed to load students:", error);
        setStudents([]);
      }
    };

    loadStudents();
  }, []);
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await facultyService.getSchoolFaculty();

        if (!response.success) {
          throw new Error(response.message || "Failed to load faculty");
        }

        setTeachers(response.faculty || []);
      } catch (error) {
        console.error("Failed to load faculty:", error);
        setTeachers([]);
      }
    };

    loadTeachers();
  }, []);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await staffService.getSchoolStaff();

        if (!response.success) {
          throw new Error(response.message || "Failed to load staff");
        }

        setStaff(response.staff || []);
      } catch (error) {
        console.error("Failed to load staff:", error);
        setStaff([]);
      }
    };

    loadStaff();
  }, []);

  useEffect(() => {
    const loadStaffFees = async () => {
      try {
        const response = await staffFeeService.getStaffFees({
          academicSession: "2026-27",
          paymentMonth: "September 2026",
        });

        setStaffFeeLedgers(response.staffFees || []);
      } catch (error) {
        console.error("Failed to load staff fee ledgers:", error);
        setStaffFeeLedgers([]);
      }
    };

    loadStaffFees();
  }, []);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const response = await transportService.getDrivers();

        const data = response?.data || response;

        setDrivers(Array.isArray(data) ? data : data?.drivers || []);
      } catch (error) {
        console.error("Failed to load transport drivers:", error);
        setDrivers([]);
      }
    };

    loadDrivers();
  }, []);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const response = await examService.getSchoolExams();

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load examinations");
        }

        setExams(response.exams || []);
      } catch (error) {
        console.error("Failed to load examinations:", error);
        setExams([]);
      }
    };

    loadExams();
  }, []);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classService.getSchoolClasses();

        if (!response.success) {
          throw new Error(response.message || "Failed to load classes");
        }

        setClasses(response.classes || []);
      } catch (error) {
        console.error("Failed to load classes:", error);
        setClasses([]);
      }
    };

    loadClasses();
  }, []);

  const notices = schoolDataService.getNotices(schoolId);
  const leaves = schoolDataService.getLeaves(schoolId);
  const feeTransactions = schoolDataService.getFeeTransactions(schoolId);

  // Staff Fee Metrics (Current Month: September 2026)
  const staffPaidCount = staffFeeLedgers.filter(
    (s) => s.status === "PAID",
  ).length;

  const staffPendingCount = staffFeeLedgers.filter(
    (s) => s.status === "PENDING",
  ).length;

  const staffPartialCount = staffFeeLedgers.filter(
    (s) => s.status === "PARTIAL",
  ).length;
  const staffOutstandingAmount = staffFeeLedgers.reduce(
    (sum, s) => sum + (Number(s.pendingAmount) || 0),
    0,
  );

  // Teacher Attendance (Scoped to current school)
  const todayDate = new Date().toISOString().split("T")[0];
  const teacherAttendanceList = schoolDataService.getTeacherAttendance(
    schoolId,
    todayDate,
  );
  const teacherActivities = schoolDataService.getTeacherActivities();
  const presentTeachers = teacherAttendanceList.filter(
    (t) => t.status === "present" || t.status === "shift_completed",
  );
  const absentTeachers = teacherAttendanceList.filter(
    (t) => t.status === "absent",
  );
  const notPunchedTeachers = teacherAttendanceList.filter(
    (t) => t.status === "not_marked" || !t.punchIn || t.punchIn === "—",
  );
  const teacherAttendanceRate =
    teachers.length > 0
      ? ((presentTeachers.length / teachers.length) * 100).toFixed(1)
      : "0.0";

  // Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = staff.length;
  const totalDrivers = drivers.length;

  const presentCount = students.filter((s) => s.attendance >= 85).length;
  const absentCount = totalStudents - presentCount;

  const pendingFeeStudents = students.filter(
    (s) => s.feeStatus !== "Paid",
  ).length;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  useEffect(() => {
    const loadWeeklyAttendance = async () => {
      try {
        const dates = [];
        const date = new Date(`${todayDate}T00:00:00`);

        while (dates.length < 5) {
          const day = date.getDay();

          if (day !== 0 && day !== 6) {
            dates.unshift(new Date(date));
          }

          date.setDate(date.getDate() - 1);
        }

        const results = await Promise.all(
          dates.map(async (item) => {
            const formattedDate = item.toLocaleDateString("en-CA");
            const response = await attendanceService.getAttendance({
              date: formattedDate,
            });

            if (!response.success) {
              throw new Error(response.message || "Failed to load attendance");
            }

            const records = response.attendance || [];

            return {
              day: item.toLocaleDateString("en-IN", {
                weekday: "short",
              }),
              value1: records.filter(
                (record) => record.status?.toLowerCase() === "present",
              ).length,
              value2: records.filter(
                (record) => record.status?.toLowerCase() === "absent",
              ).length,
            };
          }),
        );

        setAttendanceWeekly(results);
      } catch (error) {
        console.error("Failed to load weekly attendance:", error);
        setAttendanceWeekly([]);
      }
    };

    loadWeeklyAttendance();
  }, [todayDate]);

  const genderData = [
    {
      label: "Boys",
      value: students.filter((s) => s.gender === "Male").length,
      color: "#4f46e5",
    },
    {
      label: "Girls",
      value: students.filter((s) => s.gender === "Female").length,
      color: "#ec4899",
    },
  ];

  useEffect(() => {
    const loadFeeStatus = async () => {
      try {
        const response = await feeService.getSchoolFees();

        if (!response.success) {
          throw new Error(response.message || "Failed to load fee records");
        }

        const fees = response.fees || [];

        const paid = fees.filter((fee) => fee.status === "PAID").length;

        const pending = fees.filter(
          (fee) => fee.status === "PENDING" || fee.status === "PARTIAL",
        ).length;

        const overdue = fees.filter((fee) => fee.status === "OVERDUE").length;

        setFeeStatusData([
          {
            label: "Fully Paid",
            value: paid,
            color: "#10b981",
          },
          {
            label: "Pending Dues",
            value: pending,
            color: "#f59e0b",
          },
          {
            label: "Overdue",
            value: overdue,
            color: "#ef4444",
          },
        ]);
      } catch (error) {
        console.error("Failed to load fee status:", error);
        setFeeStatusData([]);
      }
    };

    loadFeeStatus();
  }, []);

  const classWiseStudents = classes.map((cls, index) => {
    const classId = cls._id || cls.id;

    const studentCount = students.filter((student) => {
      const studentClassId = student.classId?._id || student.classId || "";

      return String(studentClassId) === String(classId);
    }).length;

    const colors = ["#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"];

    return {
      label: cls.name,
      value: studentCount,
      color: colors[index % colors.length],
    };
  });

  useEffect(() => {
    const loadMonthlyFeeCollection = async () => {
      try {
        const response = await feeService.getSchoolPayments();

        if (!response.success) {
          throw new Error(response.message || "Failed to load fee payments");
        }

        const payments = response.payments || [];
        const months = [];

        const today = new Date();

        for (let i = 4; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

          const month = date.getMonth();
          const year = date.getFullYear();

          const total = payments
            .filter((payment) => {
              const paymentDate = new Date(
                payment.paymentDate || payment.createdAt,
              );

              return (
                paymentDate.getMonth() === month &&
                paymentDate.getFullYear() === year
              );
            })
            .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

          months.push({
            label: date.toLocaleString("en-IN", {
              month: "short",
            }),
            value: total,
          });
        }

        setFeeMonthlyTrend(months);
      } catch (error) {
        console.error("Failed to load monthly fee collection:", error);
        setFeeMonthlyTrend([]);
      }
    };

    loadMonthlyFeeCollection();
  }, []);

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>{selectedSchool?.logo || "🏫"}</span>
            <span>{selectedSchool?.name || "Greenwood Public School"}</span>
          </h1>
          <p className="page-subtitle">
            Principal Control Center • Academic Session{" "}
            {selectedSchool?.academicSession || "2025-2026"} • Affiliated with{" "}
            {selectedSchool?.affiliation || "CBSE Board"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/school-admin/teachers")}
          >
            <GraduationCap size={16} />
            <span>Assign Teachers</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/school-admin/students")}
          >
            <Plus size={16} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* PART 15: TEACHER ATTENDANCE ALERT (Visible to School Admin / Principal ONLY) */}
      {absentTeachers.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            borderRadius: "var(--radius-lg)",
            marginBottom: "20px",
            color: "#b91c1c",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Teacher Attendance Alert</span>
                <span
                  className="badge badge-danger"
                  style={{ fontSize: "0.7rem" }}
                >
                  Action Notice
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#dc2626",
                  marginTop: "3px",
                }}
              >
                🔴{" "}
                <strong>
                  {absentTeachers.map((t) => t.teacherName).join(", ")}
                </strong>{" "}
                {absentTeachers.length === 1 ? "is" : "are"} absent today.
                <span
                  style={{ marginLeft: "8px", opacity: 0.85, fontWeight: 500 }}
                >
                  (Date: 09 September 2026)
                </span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "#ef4444", color: "#b91c1c" }}
            onClick={() => navigate("/school-admin/attendance")}
          >
            View Faculty Attendance
          </button>
        </div>
      )}

      {/* Primary Top Metric Cards (Scoped to this school only) */}
      <div className="grid-4" style={{ marginBottom: "20px" }}>
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="indigo"
          trend="+8%"
          trendPositive={true}
          onClick={() => navigate("/school-admin/students")}
        />
        <StatCard
          title="Teaching Faculty"
          value={totalTeachers}
          icon={GraduationCap}
          color="sky"
          subtitle="Nursery to Class 10"
          onClick={() => navigate("/school-admin/teachers")}
        />
        <StatCard
          title="Support Staff"
          value={totalStaff}
          icon={Briefcase}
          color="purple"
          subtitle="Non-teaching personnel"
          onClick={() => navigate("/school-admin/staff")}
        />
        <StatCard
          title="School Drivers & Fleet"
          value={`${totalDrivers} Drivers`}
          icon={Bus}
          color="amber"
          subtitle="3 Active bus routes"
          onClick={() => navigate("/school-admin/transport")}
        />
      </div>

      {/* Secondary Operational Metric Cards */}
      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Present Today"
          value={`${presentCount} Students`}
          icon={CalendarCheck}
          color="emerald"
          trend="92% Rate"
          trendPositive={true}
          onClick={() => navigate("/school-admin/attendance")}
        />
        <StatCard
          title="Absent / On Leave"
          value={`${absentCount} Students`}
          icon={Clock}
          color="rose"
          subtitle="Medical & Casual leaves"
          onClick={() => navigate("/school-admin/attendance")}
        />
        <StatCard
          title="Fee Defaulters"
          value={`${pendingFeeStudents} Students`}
          icon={DollarSign}
          color="amber"
          subtitle="Pending balance notice"
          onClick={() => navigate("/school-admin/fees")}
        />
        <StatCard
          title="Upcoming Exams"
          value={exams.length}
          icon={Award}
          color="indigo"
          subtitle="Mid-Term Series"
          onClick={() => navigate("/school-admin/exams")}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid-3" style={{ marginBottom: "24px" }}>
        {/* Weekly Attendance */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Daily Student Attendance Breakdown</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                Recent 5 School Days • Present vs Absent
              </p>
            </div>
            <span className="badge badge-success">This Week</span>
          </div>
          <ComparisonBarChart data={attendanceWeekly} height={200} />
        </div>

        {/* Today's Teacher Attendance Widget (Real-time synced) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Teacher Attendance</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                • Faculty Roster
              </p>
            </div>
            <span className="badge badge-primary">
              {teacherAttendanceRate}% Present
            </span>
          </div>

          <div className="grid-3" style={{ marginBottom: "14px" }}>
            <div
              style={{
                padding: "8px 10px",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.675rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Total Teachers
              </div>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginTop: "2px",
                }}
              >
                {totalTeachers}
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.675rem",
                  color: "#10b981",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                🟢 Present
              </div>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#10b981",
                  marginTop: "2px",
                }}
              >
                {presentTeachers.length}
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                backgroundColor: "rgba(100, 116, 139, 0.1)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.675rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                ⚪ Not Punched
              </div>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  marginTop: "2px",
                }}
              >
                {notPunchedTeachers.length}
              </div>
            </div>
          </div>

          {/* Teacher List with Punch Status */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              marginBottom: "14px",
            }}
          >
            {teacherAttendanceList.map((t) => {
              const isPunched =
                (t.status === "present" || t.status === "shift_completed") &&
                t.punchIn &&
                t.punchIn !== "—";
              const isCompleted =
                t.status === "shift_completed" ||
                (t.punchOut && t.punchOut !== "—");

              return (
                <div
                  key={t.id || t.teacherId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isCompleted
                      ? "rgba(99, 102, 241, 0.08)"
                      : isPunched
                        ? "rgba(16, 185, 129, 0.08)"
                        : "var(--bg-tertiary)",
                    border: `1px solid ${
                      isCompleted
                        ? "rgba(99, 102, 241, 0.2)"
                        : isPunched
                          ? "rgba(16, 185, 129, 0.25)"
                          : "var(--border-color)"
                    }`,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.825rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {isCompleted ? "🟢 " : isPunched ? "🟢 " : "⚪ "}
                      {t.teacherName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {isCompleted ? (
                        <span>
                          Punch In: <strong>{t.punchIn}</strong> • Out:{" "}
                          <strong>{t.punchOut}</strong> ({t.totalWorkingHours})
                        </span>
                      ) : isPunched ? (
                        <span>
                          Punch In: <strong>{t.punchIn}</strong> • Working
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-tertiary)" }}>
                          Not Punched In
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      isCompleted
                        ? "badge-purple"
                        : isPunched
                          ? "badge-success"
                          : "badge-gray"
                    }`}
                    style={{ fontSize: "0.675rem" }}
                  >
                    {isCompleted
                      ? "Shift Done"
                      : isPunched
                        ? "Present"
                        : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Activity / Notification Feed on Principal Dashboard */}
          {teacherActivities.length > 0 && (
            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Latest Teacher Activity
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {teacherActivities.slice(0, 2).map((act, i) => (
                  <div
                    key={act.id || i}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>📢 {act.text}</span>
                    <span
                      style={{
                        color: "var(--text-tertiary)",
                        fontSize: "0.7rem",
                      }}
                    >
                      {act.punchIn || act.punchOut || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts & Operations Row */}
      <div className="grid-3" style={{ marginBottom: "24px" }}>
        {/* Class-wise enrollment */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Grade-Wise Student Count</h3>
          </div>
          <BarChart data={classWiseStudents} height={190} />
        </div>

        {/* Monthly Fee Collection Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Fee Collection (₹)</h3>
            <span className="badge badge-primary">Term 1</span>
          </div>
          <TrendLineChart data={feeMonthlyTrend} height={170} color="#10b981" />
        </div>

        {/* Fee Collection Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Payment Status</h3>
          </div>
          <DonutChart data={feeStatusData} size={145} />
        </div>
      </div>

      {/* Quick Action & Bulletin Feeds */}
      <div className="grid-3">
        {/* Pending Leave Requests */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 className="card-title">Pending Leave Requests</h3>
              {pendingLeaves > 0 && (
                <span className="badge badge-danger">
                  {pendingLeaves} Action Required
                </span>
              )}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/school-admin/leave")}
            >
              View All
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {leaves.slice(0, 3).map((leave) => (
              <div
                key={leave.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.825rem",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, color: "var(--text-primary)" }}
                  >
                    {leave.applicantName}{" "}
                    <span
                      style={{ fontWeight: 400, color: "var(--text-tertiary)" }}
                    >
                      ({leave.role})
                    </span>
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      marginTop: "2px",
                    }}
                  >
                    {leave.leaveType} • {leave.days} Day(s) • {leave.startDate}
                  </div>
                </div>
                <StatusBadge status={leave.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bulletins & Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">School Notice Bulletin</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/school-admin/notices")}
            >
              Create Notice
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.825rem",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 700, color: "var(--text-primary)" }}
                  >
                    {notice.title}
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      marginTop: "2px",
                    }}
                  >
                    Audience: <strong>{notice.audience}</strong> • {notice.date}
                  </div>
                </div>
                <span
                  className={`badge ${notice.priority === "High" ? "badge-danger" : "badge-info"}`}
                >
                  {notice.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Payments Summary (Section 18) */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(99, 102, 241, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <Wallet size={16} />
              </div>
              <h3 className="card-title">Staff Payments</h3>
            </div>
            <span className="badge badge-primary">Sep 2026</span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-tertiary)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Employees
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {staffFeeLedgers.length}
                </div>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#dc2626",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Outstanding
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#dc2626",
                    marginTop: "2px",
                  }}
                >
                  ₹{staffOutstandingAmount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
              }}
            >
              <span>
                Paid:{" "}
                <strong style={{ color: "#10b981" }}>{staffPaidCount}</strong>
              </span>
              <span>
                Pending:{" "}
                <strong style={{ color: "#ef4444" }}>
                  {staffPendingCount}
                </strong>
              </span>
              <span>
                Partial:{" "}
                <strong style={{ color: "#f59e0b" }}>
                  {staffPartialCount}
                </strong>
              </span>
            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{
                width: "100%",
                marginTop: "4px",
                justifyContent: "center",
              }}
              onClick={() => navigate("/school-admin/staff-fees")}
            >
              <Wallet size={14} />
              <span>View Staff Payments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
