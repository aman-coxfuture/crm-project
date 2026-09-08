import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import { CalendarCheck, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function TeacherAttendancePage() {
  const { success, info } = useToast();
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const classKey = `${selectedClass}-${selectedSection}`;
  const allAttendance = schoolDataService.getAttendanceRecords();

  const [studentRecords, setStudentRecords] = useState(() => {
    return (
      allAttendance[classKey] || [
        { studentId: 'STU001', name: 'Alex Johnson', roll: 'STU001', status: 'Present', remarks: '' },
        { studentId: 'STU002', name: 'Sophia Martinez', roll: 'STU002', status: 'Present', remarks: '' },
        { studentId: 'STU003', name: 'Ethan Williams', roll: 'STU003', status: 'Present', remarks: '' },
        { studentId: 'STU008', name: 'Ava Wilson', roll: 'STU008', status: 'Late', remarks: '' },
      ]
    );
  });

  const handleStatusChange = (studentId, newStatus) => {
    setStudentRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setStudentRecords((prev) => prev.map((r) => ({ ...r, status: 'Present' })));
    info('Marked all students as Present');
  };

  const handleSaveAttendance = () => {
    schoolDataService.saveAttendance(classKey, studentRecords);
    success(`Class ${classKey} attendance recorded for ${selectedDate}!`);
  };

  const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Mark Class Attendance
          </h1>
          <p className="page-subtitle">
            Daily roll call register for your assigned classroom sections
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleMarkAllPresent}>
            <CheckCircle2 size={16} />
            <span>Mark All Present</span>
          </button>
          <button className="btn btn-primary" onClick={handleSaveAttendance}>
            <Save size={16} />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <StatCard title="Total Students" value={studentRecords.length} icon={CalendarCheck} color="indigo" />
        <StatCard title="Present Today" value={presentCount} icon={CheckCircle2} color="emerald" />
        <StatCard title="Absent" value={absentCount} icon={XCircle} color="rose" />
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
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: '160px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ width: '120px', height: '38px', fontSize: '0.85rem' }}
          >
            {['10', '11'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Section:</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="form-select"
            style={{ width: '120px', height: '38px', fontSize: '0.85rem' }}
          >
            {['A', 'B'].map((s) => (
              <option key={s} value={s}>Section {s}</option>
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
                <th>Attendance State</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentRecords.map((r) => (
                <tr key={r.studentId}>
                  <td><strong>{r.roll}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['Present', 'Absent', 'Late', 'Leave'].map((st) => {
                        const isSelected = r.status === st;
                        let activeBg = 'var(--primary)';
                        if (st === 'Present') activeBg = 'var(--success)';
                        if (st === 'Absent') activeBg = 'var(--danger)';
                        if (st === 'Late' || st === 'Leave') activeBg = 'var(--warning)';

                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, st)}
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 800 : 500,
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${isSelected ? activeBg : 'var(--border-color)'}`,
                              backgroundColor: isSelected ? activeBg : 'var(--bg-tertiary)',
                              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Optional notes..."
                      value={r.remarks || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setStudentRecords((prev) =>
                          prev.map((x) => (x.studentId === r.studentId ? { ...x, remarks: v } : x))
                        );
                      }}
                      className="form-input"
                      style={{ height: '32px', fontSize: '0.8rem', maxWidth: '240px' }}
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
