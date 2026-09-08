import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import Tabs from '../../components/common/Tabs';
import StatCard from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Save,
  Users,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

export default function AttendancePage() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('student');

  // Filters for student attendance marking
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

  const teachers = schoolDataService.getTeachers();
  const staff = schoolDataService.getStaff();

  // Handle individual status change
  const handleStatusChange = (studentId, newStatus) => {
    setStudentRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setStudentRecords((prev) => prev.map((r) => ({ ...r, status: 'Present' })));
    info('Marked all students as Present');
  };

  const handleSaveAttendance = () => {
    schoolDataService.saveAttendance(classKey, studentRecords);
    success(`Attendance for Class ${classKey} saved for ${selectedDate}!`);
  };

  const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = studentRecords.filter((r) => r.status === 'Late').length;
  const leaveCount = studentRecords.filter((r) => r.status === 'Leave').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Attendance Management
          </h1>
          <p className="page-subtitle">
            Track and record daily attendance for students, faculty and staff
          </p>
        </div>

        {activeTab === 'student' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleMarkAllPresent}>
              <CheckCircle2 size={16} />
              <span>Mark All Present</span>
            </button>
            <button className="btn btn-primary" onClick={handleSaveAttendance}>
              <Save size={16} />
              <span>Save Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'student', label: 'Student Daily Register', icon: <Users size={15} /> },
          { id: 'teacher', label: 'Faculty Attendance Roster', icon: <GraduationCap size={15} /> },
          { id: 'staff', label: 'Staff Attendance Roster', icon: <Briefcase size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* TAB 1: Student Attendance Marker */}
      {activeTab === 'student' && (
        <div>
          {/* Quick Metrics Bar */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            <StatCard title="Total Enrolled" value={studentRecords.length} icon={Users} color="indigo" />
            <StatCard title="Present" value={presentCount} icon={CheckCircle2} color="emerald" />
            <StatCard title="Absent" value={absentCount} icon={XCircle} color="rose" />
            <StatCard title="Late / Leave" value={lateCount + leaveCount} icon={Clock} color="amber" />
          </div>

          {/* Selector Filter Card */}
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
                {['8', '9', '10', '11', '12'].map((c) => (
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
                {['A', 'B', 'C'].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Marking Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((record) => (
                    <tr key={record.studentId}>
                      <td><strong>{record.roll}</strong></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{record.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {record.studentId}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['Present', 'Absent', 'Late', 'Leave'].map((statusOption) => {
                            const isSelected = record.status === statusOption;
                            let activeBg = 'var(--primary)';
                            if (statusOption === 'Present') activeBg = 'var(--success)';
                            if (statusOption === 'Absent') activeBg = 'var(--danger)';
                            if (statusOption === 'Late' || statusOption === 'Leave') activeBg = 'var(--warning)';

                            return (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() => handleStatusChange(record.studentId, statusOption)}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: isSelected ? 800 : 500,
                                  borderRadius: 'var(--radius-sm)',
                                  border: `1px solid ${isSelected ? activeBg : 'var(--border-color)'}`,
                                  backgroundColor: isSelected ? activeBg : 'var(--bg-tertiary)',
                                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  transition: 'all var(--transition-fast)',
                                }}
                              >
                                {statusOption}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={record.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudentRecords((prev) =>
                              prev.map((r) => (r.studentId === record.studentId ? { ...r, remarks: val } : r))
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
      )}

      {/* TAB 2: Faculty Attendance Roster */}
      {activeTab === 'teacher' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Department</th>
                  <th>Assigned Subject</th>
                  <th>Daily Status</th>
                  <th>Check-In Time</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.email}</div>
                    </td>
                    <td>{t.department}</td>
                    <td><span className="badge badge-primary">{t.subject}</span></td>
                    <td>
                      <StatusBadge status={t.status === 'Active' ? 'Present' : 'On Leave'} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {t.status === 'Active' ? '08:15 AM' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Staff Attendance Roster */}
      {activeTab === 'staff' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Daily Status</th>
                  <th>Check-In Time</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.id}</div>
                    </td>
                    <td>{s.department}</td>
                    <td><strong>{s.designation}</strong></td>
                    <td><StatusBadge status="Present" /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>08:00 AM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
