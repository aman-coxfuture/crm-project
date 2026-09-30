import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";
import { Award, Printer, CheckCircle2, TrendingUp } from "lucide-react";

export default function StudentResultsPage() {
  const { currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);

        const [profileResponse, resultsResponse] = await Promise.all([
          api.get("/students/me"),
          api.get("/exam-marks/my-results"),
        ]);

        setStudent(profileResponse.student);
        setResults(resultsResponse.results || []);
      } catch (error) {
        console.error("Failed to load student results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const latestResult = results[0];

  const report = latestResult
    ? {
        percentage: latestResult.percentage,
        totalObtained: latestResult.totalMarks,
        totalMax: latestResult.totalMaxMarks,
        rank: "—",
        grade: latestResult.grade,
        result: latestResult.result,
        examName: latestResult.exam?.name || "Examination",
        class: `${student?.className || "—"}-${student?.section || "—"}`,
        academicYear: latestResult.exam?.academicYear || "—",
        subjects: latestResult.subjects.map((sub) => ({
          name: sub.subject,
          maxMarks: sub.maxMarks,
          obtained: sub.marksObtained,
          grade: sub.grade,
          remarks: sub.remarks || "—",
        })),
      }
    : {
        percentage: 0,
        totalObtained: 0,
        totalMax: 0,
        rank: "—",
        grade: "—",
        result: "No Result",
        examName: "No Examination Result",
        class: `${student?.className || "—"}-${student?.section || "—"}`,
        academicYear: "—",
        subjects: [],
      };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">Loading examination results...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={26} color="var(--primary)" />
            Academic Examination Results
          </h1>
          <p className="page-subtitle">
            Term assessments, subject scores, computed grades and official
            report card
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print Report Card</span>
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Overall Score"
          value={`${report.percentage}%`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Total Marks"
          value={`${report.totalObtained} / ${report.totalMax}`}
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Class Rank"
          value={`#${report.rank}`}
          icon={TrendingUp}
          color="sky"
          subtitle={`Class ${report.class}`}
        />
        <StatCard
          title="Final Result"
          value={report.grade}
          icon={CheckCircle2}
          color="purple"
          subtitle={report.result}
        />
      </div>

      {/* Official Report Card View */}
      <div className="card" id="printable-student-report">
        <div
          style={{
            textAlign: "center",
            paddingBottom: "16px",
            borderBottom: "2px solid var(--border-color)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--primary)",
            }}
          >
            Greenwood International Public School
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Official Term Academic Performance Record • Academic Session{" "}
            {report.academicYear}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, marginTop: "6px" }}>
            {report.examName} (Class {report.class})
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Maximum Marks</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((sub, i) => (
                <tr key={i}>
                  <td>
                    <strong>{sub.name}</strong>
                  </td>
                  <td>{sub.maxMarks}</td>
                  <td>
                    <strong
                      style={{ color: "var(--primary)", fontSize: "0.95rem" }}
                    >
                      {sub.obtained}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-success">{sub.grade}</span>
                  </td>
                  <td
                    style={{
                      fontSize: "0.825rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {sub.remarks}
                  </td>
                </tr>
              ))}
              <tr
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  fontWeight: 800,
                }}
              >
                <td>Cumulative Grand Total</td>
                <td>{report.totalMax}</td>
                <td style={{ color: "var(--primary)", fontSize: "1.05rem" }}>
                  {report.totalObtained}
                </td>
                <td>
                  <span className="badge badge-success">{report.grade}</span>
                </td>
                <td>Pass Percentage: {report.percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
