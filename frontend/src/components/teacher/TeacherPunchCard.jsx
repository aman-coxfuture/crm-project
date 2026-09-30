import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import attendanceService from "../../services/attendanceService";
import {
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function TeacherPunchCard({ compact = false }) {
  const { currentUser } = useAuth();
  const { success, info } = useToast();

  const teacherId = currentUser?.id || "TCH-001";
  const teacherName = currentUser?.name || "Rahul Sharma";
  const schoolId = currentUser?.schoolId || "SCH-001";
  const todayDate = new Date().toISOString().split("T")[0];

  const [todayRecord, setTodayRecord] = useState({
    status: "not_marked",
    punchIn: null,
    punchOut: null,
  });

  const [history, setHistory] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(todayDate);

  const selectedHistoryRecord = history.find((row) => {
    if (!row.date) return false;

    const recordDate = new Date(row.date).toLocaleDateString("en-CA");

    return recordDate === selectedHistoryDate;
  });

  const refreshAttendance = async () => {
    try {
      const response = await attendanceService.getFacultyAttendance({
        date: todayDate,
        facultyId: teacherId,
      });

      const record = response?.attendance?.[0];

      if (record) {
        setTodayRecord({
          status: record.status?.toLowerCase() || "not_marked",
          punchIn: record.checkInTime || null,
          punchOut: record.checkOutTime || null,
        });
      } else {
        setTodayRecord({
          status: "not_marked",
          punchIn: null,
          punchOut: null,
        });
      }

      const historyResponse = await attendanceService.getFacultyAttendance({
        facultyId: teacherId,
      });

      const attendanceHistory = historyResponse?.attendance || [];

      setHistory(
        attendanceHistory.map((item) => ({
          id: item._id,
          date: item.date,
          punchIn: item.checkInTime || null,
          punchOut: item.checkOutTime || null,
          status: item.status?.toLowerCase() || "not_marked",
        })),
      );
    } catch (error) {
      console.error("Failed to load faculty attendance:", error);
    }
  };

  useEffect(() => {
    refreshAttendance();
  }, [teacherId, todayDate]);

  // Handle Punch In
  const handlePunchIn = async () => {
    const timeNow =
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) || "08:02 AM";

    const checkInTime = timeNow === "Invalid Date" ? "08:02 AM" : timeNow;

    try {
      const response = await attendanceService.markFacultyAttendance({
        facultyId: teacherId,
        date: todayDate,
        status: "PRESENT",
        checkInTime,
      });

      const record = response?.attendance;

      setTodayRecord({
        status: record?.status?.toLowerCase() || "present",
        punchIn: record?.checkInTime || checkInTime,
        punchOut: record?.checkOutTime || null,
      });

      success("You are marked Present today! Punch In recorded.");
    } catch (error) {
      console.error("Punch In failed:", error);
      info(error.message || "Failed to record Punch In.");
    }
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    const timeNow =
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) || "04:15 PM";

    const checkOutTime = timeNow === "Invalid Date" ? "04:15 PM" : timeNow;

    try {
      const response = await attendanceService.getFacultyAttendance({
        date: todayDate,
        facultyId: teacherId,
      });

      const record = response?.attendance?.[0];

      if (!record?._id) {
        info("Please Punch In first.");
        return;
      }

      const updatedResponse = await attendanceService.updateFacultyAttendance(
        record._id,
        {
          checkOutTime,
        },
      );

      const updated = updatedResponse?.attendance;

      setTodayRecord({
        status: updated?.status?.toLowerCase() || "present",
        punchIn: updated?.checkInTime || null,
        punchOut: updated?.checkOutTime || checkOutTime,
      });

      success("Punch Out recorded successfully.");
    } catch (error) {
      console.error("Punch Out failed:", error);
      info(error.message || "Failed to record Punch Out.");
    }
  };

  const isPresent = todayRecord.status === "present";
  const isAbsent = todayRecord.status === "absent";
  const isNotMarked = !isPresent && !isAbsent;
  const hasPunchedIn =
    isPresent && todayRecord.punchIn && todayRecord.punchIn !== "—";
  const hasPunchedOut =
    isPresent && todayRecord.punchOut && todayRecord.punchOut !== "—";

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        className="card-header"
        style={{
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={18} color="var(--primary)" />
          <h3 className="card-title" style={{ fontSize: "1rem", margin: 0 }}>
            Today's Faculty Attendance
          </h3>
        </div>
        <span
          className={`badge ${
            isPresent
              ? "badge-success"
              : isAbsent
                ? "badge-danger"
                : "badge-gray"
          }`}
          style={{ fontSize: "0.75rem", fontWeight: 800 }}
        >
          {isPresent
            ? "🟢 Present Today"
            : isAbsent
              ? "🔴 Absent Today"
              : "⚪ Not Marked"}
        </span>
      </div>

      <div style={{ padding: "16px 0" }}>
        {/* Profile / Date Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "14px",
            fontSize: "0.825rem",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--text-tertiary)",
                fontSize: "0.725rem",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Teacher Name
            </div>
            <div
              style={{
                fontWeight: 800,
                color: "var(--text-primary)",
                marginTop: "2px",
              }}
            >
              {teacherName}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "var(--text-tertiary)",
                fontSize: "0.725rem",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Date
            </div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--text-primary)",
                marginTop: "2px",
              }}
            >
              {new Date(todayDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Status Display Box */}
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: isPresent
              ? "rgba(16, 185, 129, 0.08)"
              : isAbsent
                ? "rgba(239, 68, 68, 0.08)"
                : "var(--bg-tertiary)",
            border: `1px solid ${
              isPresent
                ? "#10b981"
                : isAbsent
                  ? "#ef4444"
                  : "var(--border-color)"
            }`,
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.725rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Punch In Time
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: hasPunchedIn ? "#10b981" : "var(--text-tertiary)",
                  marginTop: "2px",
                }}
              >
                {todayRecord.punchIn || "—"}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 0' }}>
                Record your arrival time for today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.725rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Punch Out Time
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: hasPunchedOut ? "#4f46e5" : "var(--text-tertiary)",
                  marginTop: "2px",
                }}
              >
                {todayRecord.punchOut || "—"}
              </div>
            </div>
          </div>
        )}

          {isPresent && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px dashed var(--border-color)",
                fontSize: "0.75rem",
                color: "#10b981",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <CheckCircle2 size={13} />
              <span>You are marked Present for today.</span>
            </div>
          )}

          {isAbsent && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px dashed var(--border-color)",
                fontSize: "0.75rem",
                color: "#ef4444",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <AlertCircle size={13} />
              <span>You are currently recorded as Absent today.</span>
            </div>

        {/* Action Buttons (Punch In / Punch Out / Mark Absent Demo) */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {isNotMarked && (
            <>
              <button
                className="btn btn-primary"
                onClick={handlePunchIn}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <LogIn size={15} />
                <span>Punch In</span>
              </button>
            </>
          )}

          {isPresent && !hasPunchedOut && (
            <>
              <button
                className="btn btn-primary"
                onClick={handlePunchOut}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#4f46e5",
                }}
              >
                <LogOut size={15} />
                <span>Punch Out</span>
              </button>
            </>
          )}

          {isPresent && hasPunchedOut && (
            <div style={{ width: "100%", display: "flex", gap: "8px" }}>
              <div
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#10b981",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: is8HoursCompleted ? '#10b981' : 'var(--primary)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePunchIn}
                title="Re-punch In"
                style={{ fontSize: "0.75rem" }}
              >
                Update Punch In
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handlePunchIn}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <LogOut size={18} />
              <span>Punch Out</span>
            </button>
          )}
        </div>
      </div>

      {/* PART 13: ATTENDANCE HISTORY */}
      {showHistory && (
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "14px",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "var(--text-secondary)",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Calendar size={14} />
            <span>My Attendance History</span>
          </div>
        )}

        {/* STATE 3: SHIFT COMPLETED */}
        {isShiftCompleted && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punch In
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981', marginTop: '2px' }}>
                  {todayRecord.punchIn}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punch Out
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444', marginTop: '2px' }}>
                  {todayRecord.punchOut}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Hours
                </div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
                  {todayRecord.totalWorkingHours || elapsedTimeStr}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '0.825rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Shift Completed & Recorded</span>
            </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
              padding: "10px 12px",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Calendar size={17} color="var(--primary)" />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  marginBottom: "3px",
                }}
              >
                SELECT DATE
              </div>

              <input
                type="date"
                value={selectedHistoryDate}
                onChange={(e) => setSelectedHistoryDate(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          <div
            className="table-container"
            style={{ border: "none", borderRadius: "0" }}
          >
            <table className="custom-table" style={{ fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedHistoryRecord ? (
                  <tr>
                    <td>
                      <strong>
                        {new Date(
                          selectedHistoryRecord.date,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </td>

                    <td>{selectedHistoryRecord.punchIn || "—"}</td>

                    <td>{selectedHistoryRecord.punchOut || "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          selectedHistoryRecord.status === "present"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {selectedHistoryRecord.status === "present"
                          ? "🟢 Present"
                          : "🔴 Absent"}
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      No attendance record found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
