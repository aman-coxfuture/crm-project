import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export default function TeacherMarksPage() {
  const { success } = useToast();
  const [selectedExam, setSelectedExam] = useState('EXM-2025-01');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const [studentMarks, setStudentMarks] = useState([
    { studentId: 'STU001', name: 'Alex Johnson', roll: 'STU001', max: 100, obtained: 92, grade: 'A+', remarks: 'Outstanding analytical capability' },
    { studentId: 'STU002', name: 'Sophia Martinez', roll: 'STU002', max: 100, obtained: 78, grade: 'B+', remarks: 'Good, geometry needs practice' },
    { studentId: 'STU003', name: 'Ethan Williams', roll: 'STU003', max: 100, obtained: 88, grade: 'A', remarks: 'Very thorough solutions' },
    { studentId: 'STU008', name: 'Ava Wilson', roll: 'STU008', max: 100, obtained: 82, grade: 'A', remarks: 'Great conceptual clarity' },
  ]);

  const handleScoreChange = (id, score) => {
    const num = Math.min(100, Math.max(0, Number(score) || 0));
    let grade = 'C';
    if (num >= 90) grade = 'A+';
    else if (num >= 80) grade = 'A';
    else if (num >= 70) grade = 'B+';
    else if (num >= 60) grade = 'B';
    else if (num >= 50) grade = 'C+';

    setStudentMarks((prev) =>
      prev.map((s) => (s.studentId === id ? { ...s, obtained: num, grade } : s))
    );
  };

  const handleSaveMarks = () => {
    success(`Marks for ${selectedSubject} (${selectedClass}) saved to examination records!`);
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
            Enter marks, grades and teacher evaluation comments for term assessments
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSaveMarks}>
          <Save size={16} />
          <span>Save Marks Sheet</span>
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Examination:</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="form-select"
            style={{ width: '220px', height: '38px', fontSize: '0.85rem' }}
          >
            <option value="EXM-2025-01">Mid-Term Examination 2025-26</option>
            <option value="EXM-2025-02">Unit Test 2</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Class & Section:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ width: '130px', height: '38px', fontSize: '0.85rem' }}
          >
            {['10-A', '10-B', '11-Science'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-select"
            style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}
          >
            {['Mathematics', 'Physics', 'Calculus'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
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
              {studentMarks.map((s) => (
                <tr key={s.studentId}>
                  <td><strong>{s.roll}</strong></td>
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
                      onChange={(e) => handleScoreChange(s.studentId, e.target.value)}
                      className="form-input"
                      style={{ width: '80px', height: '34px', fontWeight: 800 }}
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
                          prev.map((x) => (x.studentId === s.studentId ? { ...x, remarks: val } : x))
                        );
                      }}
                      className="form-input"
                      style={{ height: '34px', fontSize: '0.8rem', maxWidth: '300px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
