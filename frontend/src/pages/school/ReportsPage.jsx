import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Tabs from "../../components/common/Tabs";
import {
  BarChart,
  DonutChart,
  TrendLineChart,
} from "../../components/common/Charts";
import StatCard from "../../components/common/StatCard";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const tableHeaderStyle = {
  padding: "14px 20px",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tableCellStyle = {
  padding: "16px 20px",
  color: "#cbd5e1",
  fontSize: "14px",
};
import {
  BarChart3,
  Download,
  Printer,
  Users,
  CalendarCheck,
  Award,
  DollarSign,
  Bus,
  Briefcase,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportsPage() {
  const { success } = useToast();
  const [activeReport, setActiveReport] = useState("student");
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const response = await api.get("/reports");

        console.log("REPORTS API DATA:", response);

        setReports(response?.reports || {});
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setReports({});
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleExport = (format) => {
    if (!reports) {
      success("No report data available to export.");
      return;
    }

    // ================= CSV EXPORT =================
    if (format === "csv") {
      const rows = [];

      rows.push(["SCHOOL REPORTS & STATISTICAL ANALYTICS"]);
      rows.push([]);

      rows.push(["STUDENT REPORT"]);
      rows.push(["Total Enrolled", reports?.student?.totalEnrolled ?? 0]);
      rows.push(["New Admissions", reports?.student?.newAdmissions ?? 0]);
      rows.push(["Graduation Rate", reports?.student?.graduationRate ?? "N/A"]);
      rows.push([]);

      rows.push(["ATTENDANCE REPORT"]);
      rows.push([
        "Overall Attendance Rate",
        `${reports?.attendance?.overallAttendanceRate ?? 0}%`,
      ]);
      rows.push([
        "Chronic Absentees",
        reports?.attendance?.chronicAbsentees ?? 0,
      ]);
      rows.push([]);

      rows.push(["ACADEMIC REPORT"]);
      rows.push([
        "Total Marks Recorded",
        reports?.academic?.totalMarksRecorded ?? 0,
      ]);
      rows.push([]);

      rows.push(["FINANCIAL & FEE REPORT"]);
      rows.push(["Total Fee Amount", reports?.fee?.totalFeeAmount ?? 0]);
      rows.push([
        "Realized Collections",
        reports?.fee?.realizedCollections ?? 0,
      ]);
      rows.push(["Pending Receivables", reports?.fee?.pendingReceivables ?? 0]);
      rows.push(["Overdue Dues", reports?.fee?.overdueDues ?? 0]);
      rows.push([]);

      rows.push(["FLEET & LOGISTICS REPORT"]);
      rows.push(["Total Routes", reports?.transport?.totalRoutes ?? 0]);
      rows.push(["Total Vehicles", reports?.transport?.totalVehicles ?? 0]);

      const transportRoutes = reports?.transport?.routeUtilization || [];

      rows.push([]);
      rows.push(["Route", "Vehicle", "Students", "Capacity", "Utilization"]);

      transportRoutes.forEach((route) => {
        rows.push([
          route.routeName || "",
          route.vehicleNumber || "",
          route.totalStudents ?? 0,
          route.vehicleCapacity ?? 0,
          `${Number(route.utilization || 0).toFixed(1)}%`,
        ]);
      });

      const csvContent = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell ?? "");
              return `"${value.replace(/"/g, '""')}"`;
            })
            .join(","),
        )
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `school-reports-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      success("CSV report downloaded successfully!");
      return;
    }

    // ================= PDF EXPORT =================
    if (format === "pdf") {
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("School Reports & Statistical Analytics", pageWidth / 2, 18, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Comprehensive Institutional Audit Report", pageWidth / 2, 25, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-IN")}`,
        pageWidth / 2,
        31,
        { align: "center" },
      );

      let currentY = 40;

      // ================= STUDENT REPORT =================
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Student Admissions Report", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Metric", "Value"]],
        body: [
          ["Total Enrolled", reports?.student?.totalEnrolled ?? 0],
          ["New Admissions", reports?.student?.newAdmissions ?? 0],
          [
            "Graduation Rate",
            reports?.student?.graduationRate !== null &&
            reports?.student?.graduationRate !== undefined
              ? `${reports.student.graduationRate}%`
              : "N/A",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // ================= ATTENDANCE REPORT =================
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Attendance Audit", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Metric", "Value"]],
        body: [
          [
            "Overall Attendance Rate",
            `${reports?.attendance?.overallAttendanceRate ?? 0}%`,
          ],
          ["Chronic Absentees", reports?.attendance?.chronicAbsentees ?? 0],
          [
            "Best Performing Class",
            reports?.attendance?.bestPerformingClass
              ? `Class ${reports.attendance.bestPerformingClass.className}`
              : "N/A",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // ================= ACADEMIC REPORT =================
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("3. Academic & Examination Report", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Metric", "Value"]],
        body: [
          ["Total Marks Recorded", reports?.academic?.totalMarksRecorded ?? 0],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // ================= FEE REPORT =================
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("4. Financial & Fee Audit", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Metric", "Amount"]],
        body: [
          [
            "Total Fee Amount",
            `₹${Number(reports?.fee?.totalFeeAmount ?? 0).toLocaleString(
              "en-IN",
            )}`,
          ],
          [
            "Realized Collections",
            `₹${Number(reports?.fee?.realizedCollections ?? 0).toLocaleString(
              "en-IN",
            )}`,
          ],
          [
            "Pending Receivables",
            `₹${Number(reports?.fee?.pendingReceivables ?? 0).toLocaleString(
              "en-IN",
            )}`,
          ],
          [
            "Overdue Dues",
            `₹${Number(reports?.fee?.overdueDues ?? 0).toLocaleString(
              "en-IN",
            )}`,
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // ================= TRANSPORT REPORT =================
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("5. Fleet & Logistics Report", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Metric", "Value"]],
        body: [
          ["Total Routes", reports?.transport?.totalRoutes ?? 0],
          ["Total Vehicles", reports?.transport?.totalVehicles ?? 0],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fontStyle: "bold",
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;

      const transportRoutes = reports?.transport?.routeUtilization || [];

      if (transportRoutes.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Route", "Vehicle", "Students", "Capacity", "Utilization"]],
          body: transportRoutes.map((route) => [
            route.routeName || "",
            route.vehicleNumber || "",
            route.totalStudents ?? 0,
            route.vehicleCapacity ?? 0,
            `${Number(route.utilization || 0).toFixed(1)}%`,
          ]),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fontStyle: "bold",
          },
        });
      }

      // Footer on every page
      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          `School Reports Audit | Page ${page} of ${totalPages}`,
          pageWidth / 2,
          290,
          { align: "center" },
        );
      }

      doc.save(
        `school-reports-audit-${new Date().toISOString().slice(0, 10)}.pdf`,
      );

      success("PDF audit downloaded successfully!");
    }
  };

  const attendanceMonthlyTrend =
    reports?.attendance?.monthlyAttendanceTrend || [];
  const academicGradeDistribution = reports?.academic?.gradeDistribution || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="var(--primary)" />
            School Reports & Statistical Analytics
          </h1>
          <p className="page-subtitle">
            Generate and export comprehensive audits across admissions,
            attendance, marks and finance
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport("csv")}
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleExport("pdf")}
          >
            <Download size={15} />
            <span>Export PDF Audit</span>
          </button>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "student",
            label: "Student Admissions Report",
            icon: <Users size={14} />,
          },
          {
            id: "attendance",
            label: "Attendance Audit",
            icon: <CalendarCheck size={14} />,
          },
          {
            id: "academic",
            label: "Academic & Exam Results",
            icon: <Award size={14} />,
          },
          {
            id: "fees",
            label: "Financial & Fee Audit",
            icon: <DollarSign size={14} />,
          },
          {
            id: "transport",
            label: "Fleet & Logistics Report",
            icon: <Bus size={14} />,
          },
        ]}
        activeTab={activeReport}
        onChange={setActiveReport}
        variant="pills"
      />

      {activeReport === "student" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "20px",
              width: "100%",
              marginBottom: "20px",
              alignItems: "stretch",
            }}
          >
            <StatCard
              title="Total Enrolled"
              value={reports?.student?.totalEnrolled ?? 0}
              icon={Users}
              color="indigo"
            />

            <StatCard
              title={`New Admissions (${new Date().getFullYear()})`}
              value={reports?.student?.newAdmissions ?? 0}
              icon={Users}
              color="emerald"
            />

            <StatCard
              title="Graduation Rate"
              value={
                reports?.student?.graduationRate !== null &&
                reports?.student?.graduationRate !== undefined
                  ? `${reports.student.graduationRate}%`
                  : "N/A"
              }
              icon={Award}
              color="sky"
              subtitle="Not available"
            />
          </div>
          <div className="card" style={{ marginTop: "20px" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Students by Class</h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Distribution of enrolled students across classes
                </p>
              </div>
            </div>

            {reports?.student?.classWiseStudents?.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "10px",
                }}
              >
                {reports.student.classWiseStudents.map((item, index) => {
                  const totalStudents = reports.student.totalEnrolled || 1;

                  const percentage = Math.round(
                    (item.count / totalStudents) * 100,
                  );

                  const colors = [
                    "#6366f1",
                    "#06b6d4",
                    "#10b981",
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                  ];

                  const color = colors[index % colors.length];

                  return (
                    <div key={item.className}>
                      {/* Class information */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {/* Class badge */}
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `${color}20`,
                              color: color,
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            {item.className}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--text-primary)",
                              }}
                            >
                              Class {item.className}
                            </div>

                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {percentage}% of total students
                            </div>
                          </div>
                        </div>

                        {/* Student count */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "5px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}
                          >
                            {item.count}
                          </span>

                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            students
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          borderRadius: "999px",
                          background: "var(--bg-tertiary)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(percentage, 8)}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                No class-wise student data available.
              </div>
            )}
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div>
          {/* Attendance Summary */}
          <div className="grid-3" style={{ marginBottom: "20px" }}>
            <StatCard
              title="Overall Attendance Rate"
              value={`${reports?.attendance?.overallAttendanceRate ?? 0}%`}
              icon={CalendarCheck}
              color="emerald"
            />

            <StatCard
              title="Best Performing Class"
              value={
                reports?.attendance?.bestPerformingClass
                  ? `Class ${reports.attendance.bestPerformingClass.className}`
                  : "N/A"
              }
              icon={Award}
              color="indigo"
              subtitle={
                reports?.attendance?.bestPerformingClass
                  ? `${reports.attendance.bestPerformingClass.attendanceRate}% Average`
                  : "No attendance data"
              }
            />

            <StatCard
              title="Chronic Absentees"
              value={`${reports?.attendance?.chronicAbsentees ?? 0} Students`}
              icon={Users}
              color="rose"
              subtitle={`< ${
                reports?.attendance?.chronicAbsenteeThreshold ?? 75
              }% attendance`}
            />
          </div>

          {/* Monthly Attendance Trend */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  Monthly Institutional Attendance Trend (%)
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Attendance performance based on recorded student attendance
                </p>
              </div>
            </div>

            {attendanceMonthlyTrend.length > 0 ? (
              <TrendLineChart
                data={attendanceMonthlyTrend}
                height={220}
                color="#10b981"
              />
            ) : (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                No monthly attendance data available.
              </div>
            )}
          </div>

          {/* Class-wise Attendance */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Class-wise Attendance</h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Attendance rate across classes based on recorded attendance
                </p>
              </div>
            </div>

            {reports?.attendance?.classWiseAttendance?.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "10px",
                }}
              >
                {reports.attendance.classWiseAttendance.map((item, index) => {
                  const colors = [
                    "#6366f1",
                    "#06b6d4",
                    "#10b981",
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                  ];

                  const color = colors[index % colors.length];

                  const attendanceRate = Number(item.attendanceRate || 0);

                  return (
                    <div key={item.className}>
                      {/* Class information */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
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
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `${color}20`,
                              color: color,
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            {item.className}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--text-primary)",
                              }}
                            >
                              Class {item.className}
                            </div>

                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              Attendance performance
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}
                          >
                            {attendanceRate}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          borderRadius: "999px",
                          background: "var(--bg-tertiary)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(attendanceRate, 100)}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                No class-wise attendance data available.
              </div>
            )}
          </div>
        </div>
      )}

      {activeReport === "academic" && (
        <div>
          <div className="card">
            <div
              className="card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3 className="card-title">Examination Grade Distribution</h3>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Grade distribution based on recorded examination marks
                </p>
              </div>

              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-tertiary)",
                }}
              >
                {reports?.academic?.totalMarksRecorded ?? 0} marks recorded
              </div>
            </div>

            {academicGradeDistribution.length > 0 ? (
              <DonutChart
                data={academicGradeDistribution.map((item) => {
                  const gradeColors = {
                    "A+": "#10b981",
                    A: "#0ea5e9",
                    "B+": "#6366f1",
                    B: "#f59e0b",
                    "Below Pass": "#ef4444",
                  };

                  return {
                    label:
                      item.label === "Below Pass"
                        ? "Below Pass"
                        : `${item.label} Grade`,
                    value: item.value,
                    color: gradeColors[item.label] || "#8b5cf6",
                  };
                })}
                size={220}
              />
            ) : (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                No examination marks recorded yet.
              </div>
            )}
          </div>

          {reports?.academic?.subjectPerformance?.length > 0 && (
            <div className="card" style={{ marginTop: "20px" }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Subject-wise Performance</h3>

                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.85rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Average performance based on recorded examination marks
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "10px",
                }}
              >
                {reports.academic.subjectPerformance.map((item, index) => {
                  const colors = [
                    "#6366f1",
                    "#06b6d4",
                    "#10b981",
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                  ];

                  const color = colors[index % colors.length];

                  return (
                    <div key={item.subject}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
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
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `${color}20`,
                              color,
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            {item.subject.charAt(0)}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--text-primary)",
                              }}
                            >
                              {item.subject}
                            </div>

                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              Average examination performance
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.averagePercentage}%
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          borderRadius: "999px",
                          background: "var(--bg-tertiary)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              Math.max(item.averagePercentage, 5),
                              100,
                            )}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeReport === "fees" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "20px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <StatCard
              title="Total Fee Amount"
              value={`₹${Number(
                reports?.fee?.totalFeeAmount ?? 0,
              ).toLocaleString("en-IN")}`}
              icon={DollarSign}
              color="indigo"
            />

            <StatCard
              title="Realized Collections"
              value={`₹${Number(
                reports?.fee?.realizedCollections ?? 0,
              ).toLocaleString("en-IN")}`}
              icon={Award}
              color="emerald"
            />

            <StatCard
              title="Pending Receivables"
              value={`₹${Number(
                reports?.fee?.pendingReceivables ?? 0,
              ).toLocaleString("en-IN")}`}
              icon={DollarSign}
              color="amber"
            />
            <StatCard
              title="Overdue Dues"
              value={`₹${Number(reports?.fee?.overdueDues ?? 0).toLocaleString(
                "en-IN",
              )}`}
              icon={DollarSign}
              color="rose"
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Fee Collection Audit</h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.85rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Financial summary based on recorded student fee data
                </p>
              </div>
            </div>

            <DonutChart
              data={[
                {
                  label: "Realized Collections",
                  value: Number(reports?.fee?.realizedCollections ?? 0),
                  color: "#10b981",
                },
                {
                  label: "Pending Receivables",
                  value: Number(reports?.fee?.pendingReceivables ?? 0),
                  color: "#f59e0b",
                },
              ]}
              size={200}
            />
          </div>
        </div>
      )}

      {activeReport === "transport" && (
        <div style={{ width: "100%" }}>
          {/* ================= FLEET SUMMARY ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Total Routes */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Total Routes
              </p>

              <h3
                style={{
                  margin: "8px 0 0",
                  color: "#f8fafc",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                {reports?.transport?.totalRoutes ?? 0}
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Active school routes
              </p>
            </div>

            {/* Total Vehicles */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Total Vehicles
              </p>

              <h3
                style={{
                  margin: "8px 0 0",
                  color: "#f8fafc",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                {reports?.transport?.totalVehicles ?? 0}
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Active fleet vehicles
              </p>
            </div>

            {/* Average Utilization */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "22px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Average Utilization
              </p>

              <h3
                style={{
                  margin: "8px 0 0",
                  color: "#f8fafc",
                  fontSize: "30px",
                  fontWeight: 700,
                }}
              >
                {(() => {
                  const routes = reports?.transport?.routeUtilization || [];

                  if (!routes.length) return "0%";

                  const average =
                    routes.reduce(
                      (sum, route) => sum + Number(route.utilization || 0),
                      0,
                    ) / routes.length;

                  return `${average.toFixed(1)}%`;
                })()}
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Average capacity utilization
              </p>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                Fleet Route Capacity Utilization
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Percentage of available vehicle capacity currently utilized
              </p>
            </div>

            <div style={{ width: "100%" }}>
              <BarChart
                data={(reports?.transport?.routeUtilization || []).map(
                  (route, index) => ({
                    label: route.routeName,
                    value: Number(route.utilization || 0),
                    color: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"][
                      index % 4
                    ],
                  }),
                )}
                height={260}
              />
            </div>
          </div>

          {/* ================= ROUTE DETAILS ================= */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Route Utilization Details
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Vehicle capacity and student allocation by route
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: "#1a2332", textAlign: "left" }}>
                    <th style={tableHeaderStyle}>Route</th>
                    <th style={tableHeaderStyle}>Vehicle</th>
                    <th style={tableHeaderStyle}>Students</th>
                    <th style={tableHeaderStyle}>Capacity</th>
                    <th style={tableHeaderStyle}>Utilization</th>
                  </tr>
                </thead>

                <tbody>
                  {(reports?.transport?.routeUtilization || []).map(
                    (route, index) => (
                      <tr
                        key={`${route.routeName}-${index}`}
                        style={{
                          borderTop: "1px solid #1f2937",
                        }}
                      >
                        <td style={tableCellStyle}>{route.routeName}</td>

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: "6px",
                              background: "#1e293b",
                              color: "#cbd5e1",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {route.vehicleNumber}
                          </span>
                        </td>

                        <td style={tableCellStyle}>{route.totalStudents}</td>

                        <td style={tableCellStyle}>{route.vehicleCapacity}</td>

                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              minWidth: "150px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: "7px",
                                borderRadius: "10px",
                                background: "#1e293b",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(
                                    Number(route.utilization || 0),
                                    100,
                                  )}%`,
                                  height: "100%",
                                  borderRadius: "10px",
                                  background:
                                    Number(route.utilization || 0) >= 90
                                      ? "#ef4444"
                                      : Number(route.utilization || 0) >= 75
                                        ? "#f59e0b"
                                        : "#10b981",
                                }}
                              />
                            </div>

                            <span
                              style={{
                                color: "#f8fafc",
                                fontWeight: 700,
                                fontSize: "13px",
                                minWidth: "45px",
                              }}
                            >
                              {Number(route.utilization || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {!(reports?.transport?.routeUtilization || []).length && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        No transport route data available
                      </td>
                    </tr>
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
