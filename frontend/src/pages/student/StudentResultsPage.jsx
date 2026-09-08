import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import StatCard from '../../components/common/StatCard';
import { Award, Printer, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StudentResultsPage() {
  const { currentUser } = useAuth();
  const marksData = schoolDataService.getMarks();
  const studentId = currentUser?.id || 'STU001';
  const report = marksData[studentId] || marksData['STU001'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={26} color="var(--primary)" />
            Academic Examination Results
          </h1>
          <p className="page-subtitle">
            Term assessments, subject scores, computed grades and official report card
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print Report Card</span>
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard title="Overall Score" value={`${report.percentage}%`} icon={Award} color="emerald" trend="Distinction" trendPositive={true} />
        <StatCard title="Total Marks" value={`${report.totalObtained} / ${report.totalMax}`} icon={Award} color="indigo" />
        <StatCard title="Class Rank" value={`#${report.rank}`} icon={TrendingUp} color="sky" subtitle="In Class 10-A" />
        <StatCard title="Final Result" value={report.grade} icon={CheckCircle2} color="purple" subtitle={report.result} />
      </div>

      {/* Official Report Card View */}
      <div className="card" id="printable-student-report">
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '16px',
            borderBottom: '2px solid var(--border-color)',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            Greenwood International Public School
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Official Term Academic Performance Record • Academic Session 2025-2026
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '6px' }}>
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
                  <td><strong>{sub.name}</strong></td>
                  <td>{sub.maxMarks}</td>
                  <td><strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{sub.obtained}</strong></td>
                  <td><span className="badge badge-success">{sub.grade}</span></td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{sub.remarks}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 800 }}>
                <td>Cumulative Grand Total</td>
                <td>{report.totalMax}</td>
                <td style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{report.totalObtained}</td>
                <td><span className="badge badge-success">{report.grade}</span></td>
                <td>Pass Percentage: {report.percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
