import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import { CalendarCheck, Save, CheckCircle2, XCircle, Users, Check, AlertCircle } from 'lucide-react';

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();

  const schoolId = currentUser?.schoolId || 'SCH-001';
  const teacherId = currentUser?.id || 'TCH-001';
  const teacherName = currentUser?.name || 'Rahul Sharma';

  // PART 1: The teacher should ONLY be able to select classes that are assigned to that teacher
  const teacherAssignments = schoolDataService.getTeacherAssignments(schoolId).filter(
    (a) => a.teacherId === teacherId || a.teacherName?.toLowerCase() === teacherName.toLowerCase()
  );

  const assignedClasses = Array.from(
    new Set([
      ...(currentUser?.classes || []),
      ...teacherAssignments.map((a) => a.class),
    ])
  ).filter(Boolean);

  // Fallback if no classes found
  const availableClasses = assignedClasses.length > 0 ? assignedClasses : ['Class 7', 'Class 8', 'Class 9'];

  const [selectedClass, setSelectedClass] = useState(availableClasses[0] || 'Class 9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(() => '2026-09-09');

  // Load students belonging to this class & section
  const allStudents = schoolDataService.getStudents(schoolId);
  const classStudents = allStudents.filter(
    (s) => s.class === selectedClass && s.section === selectedSection
  );

  // Student Attendance state: map of { [studentId]: 'present' | 'absent' }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [validationError, setValidationError] = useState('');

  // PART 8: Load previous saved attendance if it exists for Class + Section + Date
  useEffect(() => {
    const savedRecords = schoolDataService.getStudentAttendanceForClass({
      schoolId,
      className: selectedClass,
      section: selectedSection,
      date: selectedDate,
    });

    const initialMap = {};
    if (savedRecords && savedRecords.length > 0) {
      savedRecords.forEach((r) => {
        initialMap[r.studentId] = r.status.toLowerCase();
      });
    } else {
      // Check legacy format fallback
      const legacy = schoolDataService.getAttendanceRecords();
      const legacyClassRecords = legacy[`${selectedClass}-${selectedSection}`];
      if (legacyClassRecords && legacyClassRecords.length > 0) {
        legacyClassRecords.forEach((r) => {
          initialMap[r.studentId] = (r.status || '').toLowerCase() === 'absent' ? 'absent' : 'present';
        });
      }
    }
    setAttendanceMap(initialMap);
    setValidationError('');
  }, [selectedClass, selectedSection, selectedDate, schoolId]);

  // Handle Mark Single Student
  const handleMarkStudent = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setValidationError('');
  };

  // Quick Action: Mark All Present
  const handleMarkAllPresent = () => {
    const newMap = {};
    classStudents.forEach((s) => {
      newMap[s.id] = 'present';
    });
    setAttendanceMap(newMap);
    setValidationError('');
    info('Marked all students as Present');
  };

  // PART 6: Save Attendance with strict validation
  const handleSaveAttendance = () => {
    if (classStudents.length === 0) {
      error('No students in this class section.');
      return;
    }

    // Validate that every student has an attendance status
    const unmarkedStudents = classStudents.filter((s) => !attendanceMap[s.id]);
    if (unmarkedStudents.length > 0) {
      setValidationError(`Please mark attendance for all students. (${unmarkedStudents.length} remaining)`);
      error(`Please mark attendance for all ${classStudents.length} students before saving.`);
      return;
    }

    const recordsToSave = classStudents.map((s) => ({
      studentId: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      status: attendanceMap[s.id],
    }));

    schoolDataService.saveStudentAttendance({
      schoolId,
      teacherId,
      className: selectedClass,
      section: selectedSection,
      date: selectedDate,
      records: recordsToSave,
    });

    setValidationError('');
    success('Attendance saved successfully.');
  };

  // PART 7: Summary statistics
  const totalStudents = classStudents.length;
  const presentCount = classStudents.filter((s) => attendanceMap[s.id] === 'present').length;
  const absentCount = classStudents.filter((s) => attendanceMap[s.id] === 'absent').length;
  const attendancePercentage =
    totalStudents > 0 && (presentCount + absentCount > 0)
      ? ((presentCount / totalStudents) * 100).toFixed(1)
      : '0.0';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Student Attendance Register
          </h1>
          <p className="page-subtitle">
            Mark daily attendance for your assigned classrooms • Faculty: <strong>{teacherName}</strong>
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

      {/* PART 7: SUMMARY CARDS */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="indigo"
          subtitle={`${selectedClass} - Section ${selectedSection}`}
        />
        <StatCard
          title="Present"
          value={presentCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Marked Present"
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon={XCircle}
          color="rose"
          subtitle="Marked Absent"
        />
        <StatCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          color="amber"
          subtitle="Class attendance rate"
        />
      </div>

      {/* Validation Message Banner */}
      {validationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            color: '#dc2626',
            fontWeight: 700,
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}

      {/* FILTER & SELECTOR TOOLBAR */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Attendance Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: '160px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>

        {/* PART 1: Assigned Classes ONLY Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Select Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ width: '150px', height: '38px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Section Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Section:
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="form-select"
            style={{ width: '130px', height: '38px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {['A', 'B', 'C'].map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Assigned to: <strong style={{ color: 'var(--primary)' }}>{teacherName}</strong>
        </div>
      </div>

      {/* PART 2, 3, 4, 23, 24: STUDENT ATTENDANCE TABLE (ONLY PRESENT & ABSENT) */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              {selectedClass} — Section {selectedSection}
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginLeft: '10px' }}>
              ({classStudents.length} Students Registered)
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Date: <strong>{selectedDate}</strong>
          </div>
        </div>

        {classStudents.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Users size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p>No students enrolled in {selectedClass} - Section {selectedSection}.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Student Name</th>
                  <th style={{ width: '130px' }}>Roll Number</th>
                  <th style={{ width: '260px', textAlign: 'center' }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, idx) => {
                  const status = attendanceMap[student.id];
                  const isPresent = status === 'present';
                  const isAbsent = status === 'absent';

                  return (
                    <tr
                      key={student.id}
                      style={{
                        backgroundColor: isPresent
                          ? 'rgba(16, 185, 129, 0.03)'
                          : isAbsent
                          ? 'rgba(239, 68, 68, 0.03)'
                          : 'transparent',
                      }}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={
                              student.profilePhoto ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              ID: {student.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {student.rollNumber}
                        </strong>
                      </td>
                      <td>
                        {/* PART 3 & 4: ONLY PRESENT AND ABSENT BUTTONS */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          {/* PRESENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleMarkStudent(student.id, 'present')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 18px',
                              fontSize: '0.825rem',
                              fontWeight: isPresent ? 800 : 600,
                              borderRadius: 'var(--radius-md)',
                              border: isPresent ? '2px solid #10b981' : '1px solid var(--border-color)',
                              backgroundColor: isPresent ? '#10b981' : 'var(--bg-tertiary)',
                              color: isPresent ? '#ffffff' : 'var(--text-primary)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              minWidth: '100px',
                              boxShadow: isPresent ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                            }}
                          >
                            <span>🟢</span>
                            <span>Present</span>
                            {isPresent && <Check size={14} />}
                          </button>

                          {/* ABSENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleMarkStudent(student.id, 'absent')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 18px',
                              fontSize: '0.825rem',
                              fontWeight: isAbsent ? 800 : 600,
                              borderRadius: 'var(--radius-md)',
                              border: isAbsent ? '2px solid #ef4444' : '1px solid var(--border-color)',
                              backgroundColor: isAbsent ? '#ef4444' : 'var(--bg-tertiary)',
                              color: isAbsent ? '#ffffff' : 'var(--text-primary)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              minWidth: '100px',
                              boxShadow: isAbsent ? '0 2px 8px rgba(239, 68, 68, 0.35)' : 'none',
                            }}
                          >
                            <span>🔴</span>
                            <span>Absent</span>
                            {isAbsent && <Check size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with Save Button */}
        {classStudents.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Marked: <strong>{presentCount + absentCount}</strong> of <strong>{totalStudents}</strong> students
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleSaveAttendance}>
              <Save size={18} />
              <span>Save Attendance</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

