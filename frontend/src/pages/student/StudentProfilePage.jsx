import React from "react";
import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  User,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  Bus,
  Award,
} from "lucide-react";

export default function StudentProfilePage() {
  const { currentUser } = useAuth();

  const [student, setStudent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [attendanceRate, setAttendanceRate] = React.useState(0);
  React.useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);

        const response = await api.get("/students/me");

        setStudent(response.student);
      } catch (error) {
        console.error("Failed to fetch student profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get("/student-attendance");

        const attendance = response?.attendance || [];

        if (attendance.length === 0) {
          setAttendanceRate(0);
          return;
        }

        const presentCount = attendance.filter(
          (record) => record.status === "PRESENT",
        ).length;

        const percentage = Math.round((presentCount / attendance.length) * 100);

        setAttendanceRate(percentage);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceRate(0);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!student) {
    return <div>Student profile not found.</div>;
  }

  return (
    <div style={{ maxWidth: "960px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={26} color="var(--primary)" />
            Student Academic Profile
          </h1>
          <p className="page-subtitle">
            Your official student record, class enrollment, guardian details and
            transport info
          </p>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <img
              src={
                student.profilePhoto ||
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
              }
              alt={student.name}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--primary)",
              }}
            />
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                {student.name}
              </h2>
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
                  Class {student.className}-{student.section}
                </span>
                <span className="badge badge-purple">
                  Roll No: {student.rollNumber}
                </span>
                <span className="badge badge-danger">
                  Blood Group: {student.bloodGroup}
                </span>
                <StatusBadge
                  status={student.isActive ? "Active" : "Inactive"}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Attendance Score
            </div>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "var(--success-text)",
              }}
            >
              {attendanceRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Personal & Academic Details Grid */}
      <div className="grid-2" style={{ gap: "20px", marginBottom: "24px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal & Contact Info</h3>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>Email:</span>{" "}
              <strong>{student.email}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Date of Birth:
              </span>
              <strong>
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString("en-IN")
                  : "—"}
              </strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>Gender:</span>{" "}
              <strong>{student.gender}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Residential Address:
              </span>{" "}
              <strong>{student.address}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Parent & Guardian Details</h3>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Parent Name:
              </span>{" "}
              <strong>{student.parentName}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Primary Phone:
              </span>{" "}
              <strong>{student.parentPhone}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Emergency Contact:
              </span>{" "}
              <strong>{student.emergencyContact}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transport & School Info */}
      <div className="grid-2" style={{ gap: "20px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transport & Bus Assignment</h3>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Assigned Route:
              </span>{" "}
              <strong>{student.assignedRoute || "Not Assigned"}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                Pickup Stop:
              </span>{" "}
              <strong>{student.routeStop || "Not Assigned"}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Institutional Affiliation</h3>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                School Name:
              </span>{" "}
              <strong>{student.tenantId?.name || "—"}</strong>
            </div>

            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                School Code:
              </span>{" "}
              <strong>{student.tenantId?.code || "—"}</strong>
            </div>

            <div>
              <span style={{ color: "var(--text-tertiary)" }}>
                School Address:
              </span>{" "}
              <strong>{student.tenantId?.address || "—"}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
