import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { attendanceService, studentService } from '../../services';

export default function SchoolAttendancePage() {
  const { addToast } = useToast();
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stuList, attMap] = await Promise.all([
          studentService.getSchoolStudents(),
          attendanceService.getSchoolDailyAttendance(selectedClass, selectedSection, attendanceDate),
        ]);
        setStudents(stuList || []);
        setAttendanceMap(attMap || {});
      } catch (err) {
        addToast('Failed to load attendance roster', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedClass, selectedSection, attendanceDate]);

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((stu) => {
      updated[stu.id] = status;
    });
    setAttendanceMap(updated);
    addToast(`Marked all students as ${status}`, 'info');
  };

  const setStudentStatus = (id, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      await attendanceService.saveSchoolAttendance(selectedClass, selectedSection, attendanceDate, attendanceMap);
      addToast(`Attendance for ${selectedClass}-${selectedSection} saved successfully`, 'success');
    } catch (err) {
      addToast('Failed to save attendance', 'error');
    }
  };

  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'Late' || s === 'Leave').length;
  const presentPct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance Register</h1>
          <p className="page-subtitle">Mark and track classroom presence, leaves, and daily reports</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSaveAttendance}>
          Save Attendance Record
        </Button>
      </div>

      {/* Filter & Toolbar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '160px' }}>
              <Input
                label="Date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            <div style={{ width: '140px' }}>
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
              />
            </div>
            <div style={{ width: '100px' }}>
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                options={['A', 'B', 'C']}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => handleMarkAll('Present')}>
              Mark All Present
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleMarkAll('Absent')}>
              Mark All Absent
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Summary Card */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="card card-compact">
          <span className="text-xs text-muted">Total Strength</span>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>{total} Students</div>
        </div>
        <div className="card card-compact">
          <span className="text-xs text-muted">Present Today</span>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: '#111827' }}>{presentCount} ({presentPct}%)</div>
        </div>
        <div className="card card-compact">
          <span className="text-xs text-muted">Absent</span>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: '#111827' }}>{absentCount} Students</div>
        </div>
        <div className="card card-compact">
          <span className="text-xs text-muted">Late / On Leave</span>
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>{lateCount} Students</div>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Guardian Contact</th>
                <th>Overall Avg</th>
                <th style={{ textAlign: 'center' }}>Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => {
                const currentStatus = attendanceMap[stu.id] || 'Present';
                return (
                  <tr key={stu.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{stu.rollNo}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stu.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stu.id}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{stu.guardian}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{stu.guardianPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{stu.attendance}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        {['Present', 'Absent', 'Late', 'Leave'].map((status) => {
                          const isActive = currentStatus === status;
                          return (
                            <button
                              key={status}
                              onClick={() => setStudentStatus(stu.id, status)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: isActive ? 700 : 500,
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isActive ? '#111827' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                              }}
                            >
                              {status}
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
