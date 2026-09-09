import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService, SCHOOL_CLASSES } from '../../services/schoolDataService';
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
  Search,
  Check,
} from 'lucide-react';

export default function AttendancePage() {
  const { currentUser, selectedSchool } = useAuth();
  const schoolId = currentUser?.schoolId || selectedSchool?.id || 'SCH-001';
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState('teacher'); // Default to faculty or student

  // --- STUDENT ATTENDANCE STATE ---
  const [selectedClass, setSelectedClass] = useState('Class 9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(() => '2026-09-09');

  const allStudents = schoolDataService.getStudents(schoolId);
  const classStudents = allStudents.filter(
    (s) => s.class === selectedClass && s.section === selectedSection
  );

  const [studentAttendanceMap, setStudentAttendanceMap] = useState({});

  useEffect(() => {
    const saved = schoolDataService.getStudentAttendanceForClass({
      schoolId,
      className: selectedClass,
      section: selectedSection,
      date: selectedDate,
    });
    const map = {};
    if (saved && saved.length > 0) {
      saved.forEach((r) => {
        map[r.studentId] = r.status.toLowerCase();
      });
    } else {
      classStudents.forEach((s) => {
        map[s.id] = 'present';
      });
    }
    setStudentAttendanceMap(map);
  }, [selectedClass, selectedSection, selectedDate, schoolId]);

  const handleStudentStatusChange = (studentId, status) => {
    setStudentAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllStudentsPresent = () => {
    const map = {};
    classStudents.forEach((s) => {
      map[s.id] = 'present';
    });
    setStudentAttendanceMap(map);
    info('Marked all students as Present');
  };

  const handleSaveStudentAttendance = () => {
    const recordsToSave = classStudents.map((s) => ({
      studentId: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      status: studentAttendanceMap[s.id] || 'present',
    }));

    schoolDataService.saveStudentAttendance({
      schoolId,
      teacherId: 'ADMIN',
      className: selectedClass,
      section: selectedSection,
      date: selectedDate,
      records: recordsToSave,
    });
    success(`Attendance for ${selectedClass}-${selectedSection} saved for ${selectedDate}!`);
  };

  const studentPresentCount = classStudents.filter((s) => studentAttendanceMap[s.id] === 'present').length;
  const studentAbsentCount = classStudents.filter((s) => studentAttendanceMap[s.id] === 'absent').length;

  // --- FACULTY / TEACHER ATTENDANCE STATE (PART 14) ---
  const [facultyDate, setFacultyDate] = useState(() => '2026-09-09');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyStatusFilter, setFacultyStatusFilter] = useState('All');

  const [facultyRecords, setFacultyRecords] = useState(() => {
    return schoolDataService.getTeacherAttendance(schoolId, facultyDate);
  });

  const refreshFacultyAttendance = () => {
    setFacultyRecords(schoolDataService.getTeacherAttendance(schoolId, facultyDate));
  };

  useEffect(() => {
    refreshFacultyAttendance();
  }, [facultyDate, schoolId]);

  const handleToggleTeacherStatus = (teacherId, teacherName, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    schoolDataService.setTeacherStatus({
      schoolId,
      teacherId,
      teacherName,
      date: facultyDate,
      status: newStatus,
    });
    refreshFacultyAttendance();
    info(`Updated ${teacherName}'s status to ${newStatus.toUpperCase()}`);
  };

  const filteredFaculty = facultyRecords.filter((t) => {
    const matchesSearch =
      t.teacherName?.toLowerCase().includes(facultySearch.toLowerCase()) ||
      t.department?.toLowerCase().includes(facultySearch.toLowerCase()) ||
      t.subject?.toLowerCase().includes(facultySearch.toLowerCase());
    const matchesStatus =
      facultyStatusFilter === 'All' ||
      (facultyStatusFilter === 'Present' && t.status === 'present') ||
      (facultyStatusFilter === 'Absent' && t.status === 'absent');
    return matchesSearch && matchesStatus;
  });

  const facultyPresentCount = facultyRecords.filter((t) => t.status === 'present').length;
  const facultyAbsentCount = facultyRecords.filter((t) => t.status === 'absent').length;
  const facultyAttendanceRate =
    facultyRecords.length > 0
      ? ((facultyPresentCount / facultyRecords.length) * 100).toFixed(1)
      : '0.0';

  // --- STAFF ATTENDANCE ---
  const staff = schoolDataService.getStaff(schoolId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarCheck size={26} color="var(--primary)" />
            Attendance Management
          </h1>
          <p className="page-subtitle">
            School attendance registers for Students, Faculty (Punch In/Out), and Support Staff
          </p>
        </div>

        {activeTab === 'student' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleMarkAllStudentsPresent}>
              <CheckCircle2 size={16} />
              <span>Mark All Present</span>
            </button>
            <button className="btn btn-primary" onClick={handleSaveStudentAttendance}>
              <Save size={16} />
              <span>Save Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'teacher', label: 'Faculty Attendance Roster', icon: <GraduationCap size={15} /> },
          { id: 'student', label: 'Student Daily Register', icon: <Users size={15} /> },
          { id: 'staff', label: 'Staff Attendance Roster', icon: <Briefcase size={15} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* TAB 1: FACULTY ATTENDANCE ROSTER (PART 14) */}
      {activeTab === 'teacher' && (
        <div>
          {/* Faculty Attendance Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            <StatCard
              title="Total Teaching Faculty"
              value={facultyRecords.length}
              icon={GraduationCap}
              color="indigo"
              subtitle="All Departments"
            />
            <StatCard
              title="Present Faculty"
              value={facultyPresentCount}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Punched In"
            />
            <StatCard
              title="Absent Today"
              value={facultyAbsentCount}
              icon={XCircle}
              color="rose"
              subtitle="Not in attendance"
            />
            <StatCard
              title="Faculty Attendance"
              value={`${facultyAttendanceRate}%`}
              icon={CalendarCheck}
              color="amber"
              subtitle="Daily presence rate"
            />
          </div>

          {/* Filter Toolbar */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {/* Date filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Date:</label>
              <input
                type="date"
                value={facultyDate}
                onChange={(e) => setFacultyDate(e.target.value)}
                className="form-input"
                style={{ width: '160px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search teacher..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Status:</label>
              <select
                value={facultyStatusFilter}
                onChange={(e) => setFacultyStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: '130px', height: '38px', fontSize: '0.85rem' }}
              >
                <option value="All">All Status</option>
                <option value="Present">🟢 Present</option>
                <option value="Absent">🔴 Absent</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Showing {filteredFaculty.length} of {facultyRecords.length} faculty members
            </div>
          </div>

          {/* Faculty Attendance Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Department</th>
                    <th>Assigned Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th style={{ textAlign: 'center' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.map((t) => {
                    const isPresent = t.status === 'present';
                    const isAbsent = t.status === 'absent';

                    return (
                      <tr
                        key={t.id || t.teacherId}
                        style={{
                          backgroundColor: isPresent
                            ? 'rgba(16, 185, 129, 0.02)'
                            : isAbsent
                            ? 'rgba(239, 68, 68, 0.03)'
                            : 'transparent',
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={
                                t.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                              }
                              alt=""
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.teacherName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {t.teacherId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{t.department || 'General'}</td>
                        <td>
                          <span className="badge badge-primary">{t.subject || 'Faculty'}</span>
                        </td>
                        <td style={{ fontSize: '0.825rem', fontWeight: 600 }}>{t.date || facultyDate}</td>
                        <td>
                          <span
                            className={`badge ${
                              isPresent ? 'badge-success' : isAbsent ? 'badge-danger' : 'badge-gray'
                            }`}
                            style={{ fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            {isPresent ? '🟢 Present' : isAbsent ? '🔴 Absent' : '⚪ Not Marked'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: isPresent ? '#10b981' : 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {t.punchIn || '—'}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: t.punchOut && t.punchOut !== '—' ? '#4f46e5' : 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {t.punchOut || '—'}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleTeacherStatus(t.teacherId, t.teacherName, t.status)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderColor: isPresent ? '#ef4444' : '#10b981',
                              color: isPresent ? '#ef4444' : '#10b981',
                            }}
                          >
                            {isPresent ? 'Mark Absent' : 'Mark Present'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ATTENDANCE REGISTER */}
      {activeTab === 'student' && (
        <div>
          {/* Quick Metrics */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            <StatCard title="Total Enrolled" value={classStudents.length} icon={Users} color="indigo" />
            <StatCard title="Present" value={studentPresentCount} icon={CheckCircle2} color="emerald" />
            <StatCard title="Absent" value={studentAbsentCount} icon={XCircle} color="rose" />
            <StatCard
              title="Attendance %"
              value={classStudents.length > 0 ? `${((studentPresentCount / classStudents.length) * 100).toFixed(1)}%` : '0%'}
              icon={CalendarCheck}
              color="amber"
            />
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
              backgroundColor: 'var(--bg-secondary)',
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
                style={{ width: '150px', height: '38px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Section:</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="form-select"
                style={{ width: '120px', height: '38px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {['A', 'B', 'C'].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Marking Table (ONLY PRESENT & ABSENT) */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th style={{ textAlign: 'center' }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student, idx) => {
                    const isPresent = studentAttendanceMap[student.id] === 'present';
                    const isAbsent = studentAttendanceMap[student.id] === 'absent';

                    return (
                      <tr key={student.id}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={
                                student.profilePhoto ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                              }
                              alt=""
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{student.rollNumber}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(student.id, 'present')}
                              style={{
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                fontWeight: isPresent ? 800 : 500,
                                borderRadius: 'var(--radius-md)',
                                border: isPresent ? '2px solid #10b981' : '1px solid var(--border-color)',
                                backgroundColor: isPresent ? '#10b981' : 'var(--bg-tertiary)',
                                color: isPresent ? '#ffffff' : 'var(--text-primary)',
                                cursor: 'pointer',
                              }}
                            >
                              🟢 Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(student.id, 'absent')}
                              style={{
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                fontWeight: isAbsent ? 800 : 500,
                                borderRadius: 'var(--radius-md)',
                                border: isAbsent ? '2px solid #ef4444' : '1px solid var(--border-color)',
                                backgroundColor: isAbsent ? '#ef4444' : 'var(--bg-tertiary)',
                                color: isAbsent ? '#ffffff' : 'var(--text-primary)',
                                cursor: 'pointer',
                              }}
                            >
                              🔴 Absent
                            </button>
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
      )}

      {/* TAB 3: STAFF ATTENDANCE ROSTER */}
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
                    <td>
                      <strong>{s.designation}</strong>
                    </td>
                    <td>
                      <StatusBadge status="Present" />
                    </td>
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

