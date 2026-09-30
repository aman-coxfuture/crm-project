import React, { useEffect, useState } from "react";
import timetableService from "../../services/timetableService";
import Tabs from "../../components/common/Tabs";
import { Clock, Layers, User, Printer } from "lucide-react";
import facultyService from "../../services/facultyService";
import api from "../../services/api";

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState("class");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTimetable, setNewTimetable] = useState({
    day: "MONDAY",
    period: 1,
    startTime: "08:00",
    endTime: "08:40",
    classId: "",
    section: "",
    facultyId: "",
    subject: "",
    room: "",
  });

  const days = [
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
    { value: "SATURDAY", label: "Saturday" },
  ];

  const periodTimes = {
    1: ["08:00", "08:40"],
    2: ["08:40", "09:20"],
    3: ["09:20", "10:00"],
    4: ["10:00", "10:40"],
    5: ["11:10", "11:50"],
    6: ["11:50", "12:30"],
    7: ["12:30", "01:10"],
  };

  // ---------------------------------------------------------
  // LOAD TIMETABLE
  // ---------------------------------------------------------

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (activeTab === "class") {
        const [classId, section] = selectedClass.split("-");

        if (!classId || !section) {
          setTimetable([]);
          return;
        }

        response = await timetableService.getTimetable({
          classId,
          section,
          day: selectedDay,
        });
      } else {
        if (!selectedTeacher) {
          setTimetable([]);
          return;
        }

        response = await timetableService.getTimetable({
          facultyId: selectedTeacher,
          day: selectedDay,
        });
      }

      setTimetable(response.timetable || []);
    } catch (err) {
      console.error("Failed to load timetable:", err);
      setError(err.message || "Failed to load timetable");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever class or day changes
  useEffect(() => {
    if (activeTab === "class" && selectedClass) {
      loadTimetable();
    }

    if (activeTab === "teacher" && selectedTeacher) {
      loadTimetable();
    }
  }, [activeTab, selectedClass, selectedTeacher, selectedDay]);

  // ---------------------------------------------------------
  // LOAD CLASSES + FACULTY
  // ---------------------------------------------------------

  const loadClassAndFacultyData = async () => {
    try {
      const [classResponse, facultyResponse] = await Promise.all([
        api.get("/classes"),
        facultyService.getSchoolFaculty(),
      ]);

      const loadedClasses = classResponse.classes || [];
      const loadedFaculties = facultyResponse.faculty || [];

      setClasses(loadedClasses);
      setFaculties(loadedFaculties);

      // Select first class + first section by default
      if (loadedClasses.length > 0) {
        const firstClass = loadedClasses[0];
        const firstSection = firstClass.sections?.[0];

        if (firstSection) {
          setSelectedClass(`${firstClass._id}-${firstSection}`);
        }
      }

      // Select first teacher by default
      if (loadedFaculties.length > 0) {
        setSelectedTeacher(loadedFaculties[0]._id);
      }
    } catch (err) {
      console.error("Failed to load class/faculty data:", err);
    }
  };

  useEffect(() => {
    loadClassAndFacultyData();
  }, []);

  const teachers = faculties;

  // ---------------------------------------------------------
  // FORMAT API DATA
  // ---------------------------------------------------------

  const scheduleRows = timetable.map((row) => ({
    ...row,

    time: `${row.startTime} - ${row.endTime}`,

    teacher: row.facultyId?.name || "Assigned Faculty",

    class: row.classId?.name
      ? `${row.classId.name}-${row.section}`
      : `Class-${row.section}`,

    room: row.room || null,
  }));

  // ---------------------------------------------------------
  // PRINT
  // ---------------------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  const handleCreateTimetable = async () => {
    try {
      setError("");

      if (
        !newTimetable.day ||
        !newTimetable.period ||
        !newTimetable.startTime ||
        !newTimetable.endTime ||
        !newTimetable.classId ||
        !newTimetable.section ||
        !newTimetable.facultyId ||
        !newTimetable.subject.trim()
      ) {
        setError("Please fill all required timetable fields");
        return;
      }

      setLoading(true);

      await timetableService.createTimetable({
        day: newTimetable.day,
        period: Number(newTimetable.period),
        startTime: newTimetable.startTime,
        endTime: newTimetable.endTime,
        classId: newTimetable.classId,
        section: newTimetable.section,
        facultyId: newTimetable.facultyId,
        subject: newTimetable.subject.trim(),
        room: newTimetable.room.trim() || null,
      });

      setShowAddModal(false);

      setNewTimetable({
        day: "MONDAY",
        period: 1,
        startTime: "08:00",
        endTime: "08:40",
        classId: "",
        section: "",
        facultyId: "",
        subject: "",
        room: "",
      });

      await loadTimetable();
    } catch (err) {
      console.error("Failed to create timetable:", err);
      setError(err.message || "Failed to create timetable");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // GET PERIOD ENTRY
  // ---------------------------------------------------------

  const getPeriodEntry = (periodNumber) => {
    return scheduleRows.find((row) => Number(row.period) === periodNumber);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="page-header"
        style={{
          marginBottom: "28px",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            Class Timetable
          </h1>

          <p className="page-subtitle">
            7-period daily school timetable with lunch break
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Timetable Entry
          </button>

          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          columnGap: "20px",
          marginBottom: "24px",
          width: "100%",
        }}
      >
        {/* LEFT — MAIN TABS */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            minWidth: 0,
          }}
        >
          <Tabs
            tabs={[
              {
                id: "class",
                label: "Class Timetable",
                icon: <Layers size={15} />,
              },
              {
                id: "teacher",
                label: "Teacher Timetable",
                icon: <User size={15} />,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />
        </div>

        {/* CENTER — DAY SELECTOR */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <label
            style={{
              fontSize: "0.825rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Select Day:
          </label>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="form-select"
            style={{
              width: "150px",
              height: "40px",
              fontSize: "0.85rem",
            }}
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* RIGHT — CLASS / FACULTY */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          {activeTab === "class" ? (
            <>
              <label
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Select Class:
              </label>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
                style={{
                  width: "170px",
                  height: "40px",
                  fontSize: "0.85rem",
                }}
              >
                {classes.map((c) =>
                  (c.sections || []).map((section) => (
                    <option
                      key={`${c._id}-${section}`}
                      value={`${c._id}-${section}`}
                    >
                      {c.name}-{section}
                    </option>
                  )),
                )}
              </select>
            </>
          ) : (
            <>
              <label
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Select Faculty:
              </label>

              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="form-select"
                style={{
                  width: "220px",
                  height: "40px",
                  fontSize: "0.85rem",
                }}
              >
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.designation || "Faculty"})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="alert alert-danger"
          style={{
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          CLASS TIMETABLE
      ====================================================== */}

      {activeTab === "class" && (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {/* TABLE HEADER */}

          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 800,
                }}
              >
                {days.find((day) => day.value === selectedDay)?.label} Timetable
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                {selectedClass
                  ? selectedClass.split("-").slice(1).join("-")
                  : "Select a class"}
              </p>
            </div>

            <div
              className="badge badge-primary"
              style={{
                fontSize: "0.8rem",
                padding: "7px 12px",
              }}
            >
              7 Periods
            </div>
          </div>

          {/* TABLE */}

          <div
            className="table-container"
            style={{
              border: "none",
            }}
          >
            <table
              className="custom-table"
              style={{
                textAlign: "left",
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Period</th>

                  <th style={{ width: "160px" }}>Time Slot</th>

                  <th>Subject</th>

                  <th>Assigned Teacher</th>

                  <th style={{ width: "190px" }}>Room</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Loading timetable...
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: 7 }, (_, index) => {
                    const periodNumber = index + 1;

                    const entry = getPeriodEntry(periodNumber);

                    const [startTime, endTime] = periodTimes[periodNumber];

                    return (
                      <React.Fragment key={periodNumber}>
                        {/* LUNCH BREAK */}

                        {periodNumber === 5 && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                backgroundColor: "rgba(245, 158, 11, 0.10)",
                                color: "#b45309",
                                fontWeight: 800,
                                borderTop: "1px dashed #f59e0b",
                                borderBottom: "1px dashed #f59e0b",
                              }}
                            >
                              🍱 Lunch Break &nbsp; • &nbsp; 10:40 – 11:10
                            </td>
                          </tr>
                        )}

                        {/* PERIOD ROW */}

                        <tr>
                          {/* PERIOD */}

                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary-light)",
                                color: "var(--primary)",
                                fontWeight: 800,
                              }}
                            >
                              {periodNumber}
                            </span>
                          </td>

                          {/* TIME */}

                          <td
                            style={{
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {entry?.time || `${startTime} – ${endTime}`}
                          </td>

                          {/* SUBJECT */}

                          <td>
                            <strong
                              style={{
                                color: entry?.subject
                                  ? "var(--text-primary)"
                                  : "var(--text-tertiary)",
                                fontSize: "0.9rem",
                              }}
                            >
                              {entry?.subject || "Not Assigned"}
                            </strong>
                          </td>

                          {/* TEACHER */}

                          <td>
                            <span
                              className="badge badge-gray"
                              style={{
                                fontSize: "0.8rem",
                                opacity: entry?.teacher ? 1 : 0.65,
                              }}
                            >
                              {entry?.teacher || "Not Assigned"}
                            </span>
                          </td>

                          {/* ROOM */}

                          <td>
                            <span
                              className="badge badge-primary"
                              style={{
                                fontSize: "0.8rem",
                              }}
                            >
                              {entry?.room || "Room Not Assigned"}
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          TEACHER TIMETABLE
          TEMPORARILY SHOWS TEACHER SELECTION
      ====================================================== */}

      {activeTab === "teacher" && (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {/* TABLE HEADER */}
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 800,
                }}
              >
                {days.find((day) => day.value === selectedDay)?.label} Teacher
                Timetable
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                {teachers.find((teacher) => teacher._id === selectedTeacher)
                  ?.name || "Select Faculty"}
              </p>
            </div>

            <div
              className="badge badge-primary"
              style={{
                fontSize: "0.8rem",
                padding: "7px 12px",
              }}
            >
              7 Periods
            </div>
          </div>

          {/* TABLE */}
          <div
            className="table-container"
            style={{
              border: "none",
            }}
          >
            <table
              className="custom-table"
              style={{
                textAlign: "left",
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Period</th>

                  <th style={{ width: "160px" }}>Time Slot</th>

                  <th>Class & Section</th>

                  <th>Subject</th>

                  <th style={{ width: "190px" }}>Room</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Loading timetable...
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: 7 }, (_, index) => {
                    const periodNumber = index + 1;

                    const entry = getPeriodEntry(periodNumber);

                    const [startTime, endTime] = periodTimes[periodNumber];

                    return (
                      <React.Fragment key={periodNumber}>
                        {/* LUNCH BREAK */}
                        {periodNumber === 5 && (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                backgroundColor: "rgba(245, 158, 11, 0.10)",
                                color: "#b45309",
                                fontWeight: 800,
                                borderTop: "1px dashed #f59e0b",
                                borderBottom: "1px dashed #f59e0b",
                              }}
                            >
                              🍱 Lunch Break &nbsp; • &nbsp; 10:40 – 11:10
                            </td>
                          </tr>
                        )}

                        <tr>
                          {/* PERIOD */}
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary-light)",
                                color: "var(--primary)",
                                fontWeight: 800,
                              }}
                            >
                              {periodNumber}
                            </span>
                          </td>

                          {/* TIME */}
                          <td
                            style={{
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {entry?.time || `${startTime} – ${endTime}`}
                          </td>

                          {/* CLASS */}
                          <td>
                            <strong
                              style={{
                                color: entry?.class
                                  ? "var(--text-primary)"
                                  : "var(--text-tertiary)",
                                fontSize: "0.9rem",
                              }}
                            >
                              {entry?.class || "Not Assigned"}
                            </strong>
                          </td>

                          {/* SUBJECT */}
                          <td>
                            <span
                              className="badge badge-gray"
                              style={{
                                fontSize: "0.8rem",
                                opacity: entry?.subject ? 1 : 0.65,
                              }}
                            >
                              {entry?.subject || "Not Assigned"}
                            </span>
                          </td>

                          {/* ROOM */}
                          <td>
                            <span
                              className="badge badge-primary"
                              style={{
                                fontSize: "0.8rem",
                              }}
                            >
                              {entry?.room || "Room Not Assigned"}
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                  Add Timetable Entry
                </h2>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Assign a teacher and subject to a class period.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {/* DAY + PERIOD */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label className="form-label">Day *</label>
                <select
                  className="form-select"
                  value={newTimetable.day}
                  onChange={(e) =>
                    setNewTimetable((prev) => ({
                      ...prev,
                      day: e.target.value,
                    }))
                  }
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Period *</label>
                <select
                  className="form-select"
                  value={newTimetable.period}
                  onChange={(e) => {
                    const period = Number(e.target.value);
                    const [startTime, endTime] = periodTimes[period];

                    setNewTimetable((prev) => ({
                      ...prev,
                      period,
                      startTime,
                      endTime,
                    }));
                  }}
                >
                  {Object.keys(periodTimes).map((period) => (
                    <option key={period} value={period}>
                      Period {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TIME */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={newTimetable.startTime}
                  onChange={(e) =>
                    setNewTimetable((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={newTimetable.endTime}
                  onChange={(e) =>
                    setNewTimetable((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* CLASS */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Class *</label>

              <select
                className="form-select"
                value={newTimetable.classId}
                onChange={(e) => {
                  const classId = e.target.value;
                  const selectedClassData = classes.find(
                    (c) => c._id === classId,
                  );

                  setNewTimetable((prev) => ({
                    ...prev,
                    classId,
                    section: selectedClassData?.sections?.[0] || "",
                  }));
                }}
              >
                <option value="">Select Class</option>

                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Section *</label>

              <select
                className="form-select"
                value={newTimetable.section}
                onChange={(e) =>
                  setNewTimetable((prev) => ({
                    ...prev,
                    section: e.target.value,
                  }))
                }
                disabled={!newTimetable.classId}
              >
                <option value="">Select Section</option>

                {(
                  classes.find((c) => c._id === newTimetable.classId)
                    ?.sections || []
                ).map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* TEACHER */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Assigned Teacher *</label>

              <select
                className="form-select"
                value={newTimetable.facultyId}
                onChange={(e) =>
                  setNewTimetable((prev) => ({
                    ...prev,
                    facultyId: e.target.value,
                  }))
                }
              >
                <option value="">Select Teacher</option>

                {faculties.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                    {faculty.designation ? ` (${faculty.designation})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJECT */}
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Subject *</label>

              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mathematics"
                value={newTimetable.subject}
                onChange={(e) =>
                  setNewTimetable((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>

            {/* ROOM */}
            <div style={{ marginBottom: "22px" }}>
              <label className="form-label">Room</label>

              <input
                type="text"
                className="form-input"
                placeholder="e.g. Room 101"
                value={newTimetable.room}
                onChange={(e) =>
                  setNewTimetable((prev) => ({
                    ...prev,
                    room: e.target.value,
                  }))
                }
              />
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleCreateTimetable}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Timetable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
