import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Award, Save, CheckCircle2 } from "lucide-react";

export default function TeacherMarksPage() {
  const { success } = useToast();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoadingExams(true);

        const response = await api.get("/exams");

        setExams(response?.exams || []);
      } catch (error) {
        console.error("Failed to load exams:", error);
      } finally {
        setLoadingExams(false);
      }
    };

    loadExams();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoadingAssignments(true);

        const response = await api.get("/students/my-students");

        setFacultyAssignments(response?.assignments || []);
        setAssignedStudents(response?.students || []);
      } catch (error) {
        console.error("Failed to load faculty assignments:", error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, []);

  const handleClassChange = (value) => {
    setSelectedClass(value);

    const [classId, section] = value.split("-");

    const subjects = facultyAssignments.filter(
      (assignment) =>
        assignment.classId === classId && assignment.section === section,
    );

    setSelectedSubject(subjects[0]?.subject || "");
  };

  const getSelectedStudents = () => {
    if (!selectedClass) {
      return [];
    }

    const [classId, section] = selectedClass.split("-");

    return assignedStudents.filter((student) => {
      const studentClassId =
        typeof student.classId === "object"
          ? student.classId?._id?.toString()
          : student.classId?.toString();

      const studentSection = student.section?.trim().toUpperCase();
      const selectedSection = section?.trim().toUpperCase();

      return studentClassId === classId && studentSection === selectedSection;
    });
  };

  useEffect(() => {
    const loadExistingMarks = async () => {
      if (!selectedExam || !selectedClass || !selectedSubject) {
        return;
      }

      try {
        const response = await api.get("/exam-marks", {
          params: {
            examId: selectedExam,
            subject: selectedSubject,
          },
        });

        const existingMarks = response?.marks || [];

        setStudentMarks((prev) =>
          prev.map((student) => {
            const savedMark = existingMarks.find(
              (mark) =>
                (mark.studentId?._id || mark.studentId)?.toString() ===
                student.studentId?.toString(),
            );

            if (!savedMark) {
              return student;
            }

            return {
              ...student,
              max: savedMark.maxMarks,
              obtained: savedMark.marksObtained,
              grade: savedMark.grade || "C",
              remarks: savedMark.remarks || "",
              markId: savedMark._id,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load existing marks:", error);
      }
    };

    loadExistingMarks();
  }, [selectedExam, selectedClass, selectedSubject]);

  useEffect(() => {
    const students = getSelectedStudents();

    if (!selectedClass) {
      setStudentMarks([]);
      return;
    }

    setStudentMarks(
      students.map((student) => ({
        studentId: student._id,
        name: student.name,
        roll: student.admissionNumber || student.rollNumber || "-",
        max: 100,
        obtained: 0,
        grade: "C",
        remarks: "",
      })),
    );
  }, [selectedClass, assignedStudents]);

  const classSections = Array.from(
    new Map(
      facultyAssignments.map((assignment) => [
        `${assignment.classId}-${assignment.section}`,
        assignment,
      ]),
    ).values(),
  );

  const [studentMarks, setStudentMarks] = useState([]);

  const handleScoreChange = (id, score) => {
    const num = Math.min(100, Math.max(0, Number(score) || 0));
    let grade = "C";
    if (num >= 90) grade = "A+";
    else if (num >= 80) grade = "A";
    else if (num >= 70) grade = "B+";
    else if (num >= 60) grade = "B";
    else if (num >= 50) grade = "C+";

    setStudentMarks((prev) =>
      prev.map((s) =>
        s.studentId === id ? { ...s, obtained: num, grade } : s,
      ),
    );
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) {
      alert("Please select an examination.");
      return;
    }

    if (!selectedClass) {
      alert("Please select a class and section.");
      return;
    }

    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    if (!studentMarks.length) {
      alert("No students found for this class and section.");
      return;
    }

    try {
      setSavingMarks(true);

      for (const student of studentMarks) {
        const payload = {
          examId: selectedExam,
          studentId: student.studentId,
          subject: selectedSubject,
          maxMarks: student.max,
          marksObtained: student.obtained,
          grade: student.grade,
          remarks: student.remarks,
        };

        if (student.markId) {
          await api.put(`/exam-marks/${student.markId}`, {
            marksObtained: student.obtained,
            grade: student.grade,
            remarks: student.remarks,
          });
        } else {
          const response = await api.post("/exam-marks", payload);

          setStudentMarks((prev) =>
            prev.map((item) =>
              item.studentId === student.studentId
                ? {
                    ...item,
                    markId: response?.mark?._id,
                  }
                : item,
            ),
          );
        }
      }

      success(
        `Marks for ${selectedSubject} (${selectedClass}) saved successfully!`,
      );
    } catch (error) {
      console.error("Failed to save marks:", error);
      alert(error.message || "Failed to save marks.");
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={26} color="var(--primary)" />
            Subject Examination Marks Entry Sheet
          </h1>
          <p className="page-subtitle">
            Enter marks, grades and teacher evaluation comments for term
            assessments
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSaveMarks}
          disabled={savingMarks}
        >
          <Save size={16} />
          <span>{savingMarks ? "Saving..." : "Save Marks Sheet"}</span>
        </button>
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
            Examination:
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="form-select"
            style={{ width: "220px", height: "38px", fontSize: "0.85rem" }}
            disabled={loadingExams}
          >
            <option value="">
              {loadingExams ? "Loading exams..." : "Select Examination"}
            </option>

            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
            Class & Section:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="form-select"
            style={{ width: "130px", height: "38px", fontSize: "0.85rem" }}
          >
            <option value="">
              {loadingAssignments
                ? "Loading classes..."
                : "Select Class & Section"}
            </option>

            {classSections.map((assignment) => {
              const value = `${assignment.classId}-${assignment.section}`;

              return (
                <option key={value} value={value}>
                  Class {assignment.className}-{assignment.section}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.825rem", fontWeight: 700 }}>
            Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-select"
            style={{ width: "150px", height: "38px", fontSize: "0.85rem" }}
          >
            {facultyAssignments
              .filter((assignment) => {
                const [classId, section] = selectedClass.split("-");

                return (
                  assignment.classId === classId &&
                  assignment.section === section
                );
              })
              .map((assignment) => (
                <option key={assignment.id} value={assignment.subject}>
                  {assignment.subject}
                </option>
              ))}
          </select>
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
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Maximum Marks</th>
                <th>Marks Obtained</th>
                <th>Calculated Grade</th>
                <th>Evaluator Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loadingStudents ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    Loading students...
                  </td>
                </tr>
              ) : studentMarks.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    No students found for this class and section.
                  </td>
                </tr>
              ) : (
                studentMarks.map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <strong>{s.roll}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                    </td>
                    <td>{s.max}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.obtained}
                        onChange={(e) =>
                          handleScoreChange(s.studentId, e.target.value)
                        }
                        className="form-input"
                        style={{
                          width: "80px",
                          height: "34px",
                          fontWeight: 800,
                        }}
                      />
                    </td>
                    <td>
                      <span className="badge badge-success">{s.grade}</span>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={s.remarks}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudentMarks((prev) =>
                            prev.map((x) =>
                              x.studentId === s.studentId
                                ? { ...x, remarks: val }
                                : x,
                            ),
                          );
                        }}
                        className="form-input"
                        style={{
                          height: "34px",
                          fontSize: "0.8rem",
                          maxWidth: "300px",
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
