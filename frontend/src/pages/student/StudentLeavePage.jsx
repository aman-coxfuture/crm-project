import React, { useEffect, useState } from "react";
import attendanceService from "../../services/attendanceService";
import DataTable from "../../components/common/DataTable";
import { ClipboardList } from "lucide-react";

export default function StudentLeavePage() {
  const [absentDays, setAbsentDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCurrentMonth = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    const loadAbsentDays = async () => {
      try {
        setLoading(true);

        const response = await attendanceService.getStudentAttendance();

        if (!response.success) {
          throw new Error(
            response.message || "Failed to load attendance records",
          );
        }

        const attendanceRecords = response.attendance || [];

        const absentRecords = attendanceRecords
          .filter(
            (record) => String(record.status || "").toUpperCase() === "ABSENT",
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((record) => ({
            id: record._id,
            date: record.date,
            day: record.date
              ? new Date(record.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                })
              : "—",
            status: "Absent",
            days: 1,
          }));

        setAbsentDays(absentRecords);
      } catch (error) {
        console.error("Failed to load student absent days:", error);
        setAbsentDays([]);
      } finally {
        setLoading(false);
      }
    };

    loadAbsentDays();
  }, []);

  const monthlyAbsentDays = absentDays.filter((record) => {
    if (!record.date) return false;

    const date = new Date(record.date);

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    return monthKey === selectedMonth;
  });

  const totalAbsentDays = monthlyAbsentDays.length;

  const selectedMonthLabel = new Date(
    `${selectedMonth}-01T00:00:00`,
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const columns = [
    {
      header: "Date",
      accessor: "date",
      sortable: true,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      header: "Day",
      accessor: "day",
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status",
      isStatus: true,
    },
    {
      header: "Days Absent",
      accessor: "days",
      sortable: true,
      render: (val) => <strong>{val} Day</strong>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardList size={26} color="var(--primary)" />
            Student Leave / Absence
          </h1>

          <p className="page-subtitle">
            Absent days are automatically shown from your attendance records
          </p>
        </div>
      </div>
      <div
        className="card"
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-tertiary)",
              marginBottom: "4px",
            }}
          >
            Attendance Month
          </div>

          <strong>{selectedMonthLabel}</strong>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="form-input"
          style={{ width: "190px" }}
        />
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-tertiary)",
              marginBottom: "8px",
            }}
          >
            Absent Days in {selectedMonthLabel}
          </div>

          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {loading ? "—" : totalAbsentDays}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            This section is read-only. No leave application is required from
            students. Every recorded <strong>Absent</strong> attendance entry
            appears here automatically.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "var(--text-tertiary)",
            }}
          >
            Loading absence records...
          </div>
        </div>
      ) : (
        <DataTable
          title="My Absent Days"
          subtitle="Attendance-based absence history for the selected month"
          columns={columns}
          data={monthlyAbsentDays}
          searchKeys={["date", "day", "status"]}
        />
      )}

      {!loading && absentDays.length === 0 && (
        <div
          className="card"
          style={{
            marginTop: "16px",
            textAlign: "center",
            padding: "28px",
            color: "var(--text-tertiary)",
          }}
        >
          No absent attendance records found.
        </div>
      )}
    </div>
  );
}
