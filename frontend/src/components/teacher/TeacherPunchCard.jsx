import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, CheckCircle2, XCircle, LogIn, LogOut, Calendar, AlertCircle } from 'lucide-react';

export default function TeacherPunchCard({ showHistory = false }) {
  const { currentUser } = useAuth();
  const { success, info } = useToast();

  const teacherId = currentUser?.id || 'TCH-001';
  const teacherName = currentUser?.name || 'Rahul Sharma';
  const schoolId = currentUser?.schoolId || 'SCH-001';
  const todayDate = '2026-09-09';

  const [todayRecord, setTodayRecord] = useState(() => {
    return schoolDataService.getTodayTeacherAttendance(teacherId, todayDate) || {
      id: `TA-${teacherId}-${todayDate}`,
      schoolId,
      teacherId,
      teacherName,
      date: todayDate,
      status: 'not_marked',
      punchIn: '—',
      punchOut: '—',
    };
  });

  const [history, setHistory] = useState(() => {
    return schoolDataService.getTeacherAttendanceHistory(teacherId);
  });

  const refreshAttendance = () => {
    const current = schoolDataService.getTodayTeacherAttendance(teacherId, todayDate);
    if (current) {
      setTodayRecord(current);
    }
    setHistory(schoolDataService.getTeacherAttendanceHistory(teacherId));
  };

  useEffect(() => {
    refreshAttendance();
  }, [teacherId]);

  // Handle Punch In
  const handlePunchIn = () => {
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) || '08:02 AM';

    const updated = schoolDataService.punchInTeacher({
      schoolId,
      teacherId,
      teacherName,
      date: todayDate,
      time: timeNow === 'Invalid Date' ? '08:02 AM' : timeNow,
    });
    setTodayRecord(updated);
    setHistory(schoolDataService.getTeacherAttendanceHistory(teacherId));
    success('You are marked Present today! Punch In recorded.');
  };

  // Handle Punch Out
  const handlePunchOut = () => {
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) || '04:15 PM';

    const updated = schoolDataService.punchOutTeacher({
      teacherId,
      date: todayDate,
      time: timeNow === 'Invalid Date' ? '04:15 PM' : timeNow,
    });
    setTodayRecord(updated);
    setHistory(schoolDataService.getTeacherAttendanceHistory(teacherId));
    success('Punch Out recorded successfully.');
  };

  // Handle Mark Absent (Demo state mechanism)
  const handleMarkAbsent = () => {
    const updated = schoolDataService.setTeacherStatus({
      schoolId,
      teacherId,
      teacherName,
      date: todayDate,
      status: 'absent',
    });
    setTodayRecord(updated);
    setHistory(schoolDataService.getTeacherAttendanceHistory(teacherId));
    info('Marked as Absent for today.');
  };

  const isPresent = todayRecord.status === 'present';
  const isAbsent = todayRecord.status === 'absent';
  const isNotMarked = !isPresent && !isAbsent;
  const hasPunchedIn = isPresent && todayRecord.punchIn && todayRecord.punchIn !== '—';
  const hasPunchedOut = isPresent && todayRecord.punchOut && todayRecord.punchOut !== '—';

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        className="card-header"
        style={{
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--primary)" />
          <h3 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>
            Today's Faculty Attendance
          </h3>
        </div>
        <span
          className={`badge ${
            isPresent ? 'badge-success' : isAbsent ? 'badge-danger' : 'badge-gray'
          }`}
          style={{ fontSize: '0.75rem', fontWeight: 800 }}
        >
          {isPresent ? '🟢 Present Today' : isAbsent ? '🔴 Absent Today' : '⚪ Not Marked'}
        </span>
      </div>

      <div style={{ padding: '16px 0' }}>
        {/* Profile / Date Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.825rem' }}>
          <div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Teacher Name
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {teacherName}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Date
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              09 September 2026
            </div>
          </div>
        </div>

        {/* Status Display Box */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isPresent
              ? 'rgba(16, 185, 129, 0.08)'
              : isAbsent
              ? 'rgba(239, 68, 68, 0.08)'
              : 'var(--bg-tertiary)',
            border: `1px solid ${
              isPresent ? '#10b981' : isAbsent ? '#ef4444' : 'var(--border-color)'
            }`,
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Punch In Time
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: hasPunchedIn ? '#10b981' : 'var(--text-tertiary)', marginTop: '2px' }}>
                {todayRecord.punchIn || '—'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Punch Out Time
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: hasPunchedOut ? '#4f46e5' : 'var(--text-tertiary)', marginTop: '2px' }}>
                {todayRecord.punchOut || '—'}
              </div>
            </div>
          </div>

          {isPresent && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} />
              <span>You are marked Present for today.</span>
            </div>
          )}

          {isAbsent && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} />
              <span>You are currently recorded as Absent today.</span>
            </div>
          )}
        </div>

        {/* Action Buttons (Punch In / Punch Out / Mark Absent Demo) */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isNotMarked && (
            <>
              <button
                className="btn btn-primary"
                onClick={handlePunchIn}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <LogIn size={15} />
                <span>Punch In</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleMarkAbsent}
                title="Mark Absent for demo"
                style={{ color: '#ef4444' }}
              >
                Mark Absent
              </button>
            </>
          )}

          {isPresent && !hasPunchedOut && (
            <>
              <button
                className="btn btn-primary"
                onClick={handlePunchOut}
                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#4f46e5' }}
              >
                <LogOut size={15} />
                <span>Punch Out</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleMarkAbsent}
                title="Toggle Absent"
                style={{ fontSize: '0.75rem' }}
              >
                Mark Absent
              </button>
            </>
          )}

          {isPresent && hasPunchedOut && (
            <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                ✓ Day Completed (Punched Out)
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePunchIn}
                title="Re-punch In"
                style={{ fontSize: '0.75rem' }}
              >
                Update Punch In
              </button>
            </div>
          )}

          {isAbsent && (
            <button
              className="btn btn-primary"
              onClick={handlePunchIn}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <LogIn size={15} />
              <span>Punch In (Mark Present)</span>
            </button>
          )}
        </div>
      </div>

      {/* PART 13: ATTENDANCE HISTORY */}
      {showHistory && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '6px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>My Attendance History</span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.date}</strong>
                    </td>
                    <td>{row.punchIn || '—'}</td>
                    <td>{row.punchOut || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === 'present' ? 'badge-success' : 'badge-danger'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {row.status === 'present' ? '🟢 Present' : '🔴 Absent'}
                      </span>
                    </td>
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
