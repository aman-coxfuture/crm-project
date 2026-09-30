import React, { useEffect, useState } from "react";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Users, Eye, Mail, Phone, BookOpen } from "lucide-react";

export default function TeacherStudentsPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const loadTeacherStudents = async () => {
      try {
        setLoading(true);

        const facultyResponse = await api.get("/faculty/me");
        const facultyId = facultyResponse?.faculty?._id;

        if (!facultyId) {
          throw new Error("Faculty profile not found.");
        }

        const timetableResponse = await api.get("/timetable", {
          params: { facultyId },
        });

        const timetable = timetableResponse?.timetable || [];

        const uniqueAssignments = Array.from(
          new Map(
            timetable.map((item) => [
              `${item.classId?._id}-${item.section}`,
              {
                classId: item.classId?._id,
                className: item.classId?.name,
                section: item.section,
              },
            ]),
          ).values(),
        );

        setAssignedClasses(uniqueAssignments);

        if (uniqueAssignments.length > 0) {
          setSelectedClass(uniqueAssignments[0].className);
          setSelectedSection(uniqueAssignments[0].section);
        }

        const response = await api.get("/students");
        setAllStudents(response?.students || []);
      } catch (error) {
        console.error("Failed to load teacher students:", error);
        setAllStudents([]);
        setAssignedClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherStudents();
  }, []);

  const filteredStudents = allStudents.filter(
    (student) =>
      student.className === selectedClass &&
      student.section === selectedSection,
  );

  const getAttendancePercentage = (studentId) => {
    const studentRecords = attendanceRecords.filter((record) => {
      const recordStudentId = record.studentId?._id || record.studentId;

      return recordStudentId === studentId;
    });

    if (studentRecords.length === 0) {
      return null;
    }

    const presentCount = studentRecords.filter(
      (record) => record.status === "PRESENT",
    ).length;

    return Math.round((presentCount / studentRecords.length) * 100);
  };

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        if (!filteredStudents.length) {
          setAttendanceRecords([]);
          return;
        }

        const response = await api.get("/student-attendance", {
          params: {
            classId: filteredStudents[0]?.classId?._id,
            section: selectedSection,
          },
        });

        setAttendanceRecords(response?.attendance || []);
      } catch (error) {
        console.error("Failed to load student attendance:", error);
        setAttendanceRecords([]);
      }
    };

    loadAttendance();
  }, [selectedClass, selectedSection, allStudents]);

  const columns = [
    {
      header: "Student Name & Roll",
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
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{val}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
              }}
            >
              Admission No: {row.admissionNumber} • {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Section",
      accessor: "section",
      sortable: true,
      render: (val) => (
        <span className="badge badge-primary">Section {val}</span>
      ),
    },
    {
      header: "Parent Contact",
      accessor: "parentName",
      render: (val, row) => (
        <div style={{ fontSize: "0.8rem" }}>
          <div style={{ fontWeight: 600 }}>{val || "Not Available"}</div>
          <div style={{ color: "var(--text-tertiary)" }}>
            {row.parentPhone || "Contact not available"}
          </div>
        </div>
      ),
    },
    {
      header: "Attendance Rate",
      accessor: "attendance",
      sortable: true,
      render: (val, row) => {
        const attendance = getAttendancePercentage(row._id);

        return (
          <span
            style={{
              fontWeight: 700,
              color:
                attendance !== null && attendance >= 90
                  ? "var(--success-text)"
                  : "var(--warning-text)",
            }}
          >
            {attendance !== null ? `${attendance}%` : "N/A"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "isActive",
      sortable: true,
      render: (val) => (
        <span className={`badge ${val ? "badge-success" : "badge-danger"}`}>
          {val ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={26} color="var(--primary)" />
            My Assigned Students
          </h1>
          <p className="page-subtitle">
            Students enrolled in your Mathematics and Science teaching sections
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
            Select Class:
          </label>
          <select
            value={`${selectedClass}-${selectedSection}`}
            onChange={(e) => {
              const [className, section] = e.target.value.split("-");
              setSelectedClass(className);
              setSelectedSection(section);
            }}
            className="form-select"
            style={{ width: "130px", height: "38px", fontSize: "0.85rem" }}
          >
            {assignedClasses.map((assignment) => (
              <option
                key={`${assignment.classId}-${assignment.section}`}
                value={`${assignment.className}-${assignment.section}`}
              >
                Class {assignment.className} - Section {assignment.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        title={`Class ${selectedClass} Students Roster`}
        subtitle="Active students in your subject curriculum"
        columns={columns}
        data={loading ? [] : filteredStudents}
        searchKeys={["name", "admissionNumber", "email", "parentName"]}
      />
    </div>
  );
}
