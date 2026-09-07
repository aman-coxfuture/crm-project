import React, { useState, useEffect } from 'react';
import { UserCheck, Save, Calendar, Filter } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { attendanceService, studentService } from '../../services';

export default function CollegeAttendancePage() {
  const { addToast } = useToast();
  const [selectedDept, setSelectedDept] = useState('Computer Science & Engineering');
  const [selectedSem, setSelectedSem] = useState('Semester 5');
  const [subject, setSubject] = useState('CS501 - Distributed Algorithms');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stuList, attMap] = await Promise.all([
          studentService.getCollegeStudents(),
          attendanceService.getCollegeLectureAttendance(selectedDept, selectedSem, subject, date),
        ]);
        setStudents(stuList || []);
        setStatusMap(attMap || {});
      } catch (err) {
        addToast('Failed to load college attendance roster', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedDept, selectedSem, subject, date]);

  const setStatus = (id, st) => {
    setStatusMap((prev) => ({ ...prev, [id]: st }));
  };

  const handleSave = async () => {
    try {
      await attendanceService.saveCollegeLectureAttendance(selectedDept, selectedSem, subject, date, statusMap);
      addToast(`Attendance for ${selectedSem} (${subject}) submitted successfully`, 'success');
    } catch (err) {
      addToast('Failed to submit attendance', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lecture & Lab Attendance Registry</h1>
          <p className="page-subtitle">Track course lecture presence and semester-end minimum 75% eligibility</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Submit Lecture Attendance
        </Button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select
            label="Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Electronics & Communication']}
          />
          <Select
            label="Semester"
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            options={['Semester 1', 'Semester 3', 'Semester 5', 'Semester 7']}
          />
          <Input
            label="Subject / Lab Code"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Cumulative Att %</th>
                <th style={{ textAlign: 'center' }}>Lecture Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => {
                const current = statusMap[stu.id] || 'Present';
                return (
                  <tr key={stu.id}>
                    <td><strong>{stu.usn}</strong></td>
                    <td>{stu.name}</td>
                    <td>{stu.course}</td>
                    <td><span style={{ fontWeight: 600 }}>{stu.attendance}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        {['Present', 'Absent', 'OD / Medical'].map((st) => {
                          const isActive = current === st;
                          return (
                            <button
                              key={st}
                              onClick={() => setStatus(stu.id, st)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: isActive ? 700 : 500,
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isActive ? '#111827' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
