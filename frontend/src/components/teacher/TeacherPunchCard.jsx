import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, CheckCircle2, AlertCircle, LogIn, LogOut, Check, Sparkles } from 'lucide-react';

export default function TeacherPunchCard({ compact = false }) {
  const { currentUser } = useAuth();
  const { success, info } = useToast();

  const teacherId = currentUser?.id || 'TCH-001';
  const teacherName = currentUser?.name || 'Rahul Sharma';
  const schoolId = currentUser?.schoolId || 'SCH-001';
  const todayDate = new Date().toISOString().split('T')[0];

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
      totalWorkingHours: '—',
    };
  });

  const [elapsedTimeStr, setElapsedTimeStr] = useState('00h 00m');
  const [is8HoursCompleted, setIs8HoursCompleted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Sync state from localStorage
  const refreshAttendance = () => {
    const current = schoolDataService.getTodayTeacherAttendance(teacherId, todayDate);
    if (current) {
      setTodayRecord(current);
    }
  };

  useEffect(() => {
    refreshAttendance();
  }, [teacherId]);

  // Live timer tick when punched in and not yet punched out
  useEffect(() => {
    const isPunchedIn = todayRecord.status === 'present' && todayRecord.punchIn && todayRecord.punchIn !== '—';
    const isPunchedOut = todayRecord.status === 'shift_completed' || (todayRecord.punchOut && todayRecord.punchOut !== '—');

    if (!isPunchedIn || isPunchedOut) {
      if (isPunchedOut && todayRecord.totalWorkingHours && todayRecord.totalWorkingHours !== '—') {
        setElapsedTimeStr(todayRecord.totalWorkingHours);
      }
      return;
    }

    const calculateElapsed = () => {
      let startMs = todayRecord.punchInTimestamp;
      if (!startMs && todayRecord.punchIn) {
        // Fallback: estimate from punchIn time string
        try {
          const parts = todayRecord.punchIn.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (parts) {
            let [_, h, m, mer] = parts;
            let hours = parseInt(h, 10);
            const mins = parseInt(m, 10);
            if (mer?.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (mer?.toUpperCase() === 'AM' && hours === 12) hours = 0;
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins, 0);
            startMs = start.getTime();
          }
        } catch (e) {}
      }

      if (startMs) {
        const diffMs = Math.max(0, Date.now() - startMs);
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const formatted = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
        setElapsedTimeStr(formatted);

        const targetShiftMinutes = 8 * 60; // 8 hours = 480 mins
        const percent = Math.min(100, Math.round((totalMinutes / targetShiftMinutes) * 100));
        setProgressPercent(percent);

        if (totalMinutes >= targetShiftMinutes) {
          setIs8HoursCompleted(true);
        } else {
          setIs8HoursCompleted(false);
        }
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [todayRecord]);

  // Handle Punch In (Dynamic Browser Time)
  const handlePunchIn = () => {
    if (todayRecord.punchIn && todayRecord.punchIn !== '—') return;

    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const nowTs = Date.now();

    const updated = schoolDataService.punchInTeacher({
      schoolId,
      teacherId,
      teacherName,
      date: todayDate,
      time: timeNow,
      timestamp: nowTs,
    });

    setTodayRecord(updated);
    success(`Punch In recorded at ${timeNow}! You are marked Present.`);
  };

  // Handle Punch Out (Dynamic Browser Time)
  const handlePunchOut = () => {
    if (!todayRecord.punchIn || todayRecord.punchIn === '—') return;
    if (todayRecord.status === 'shift_completed') return;

    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const nowTs = Date.now();

    const updated = schoolDataService.punchOutTeacher({
      teacherId,
      teacherName,
      date: todayDate,
      time: timeNow,
      timestamp: nowTs,
    });

    setTodayRecord(updated);
    success(`Punch Out recorded at ${timeNow}. Total working time: ${updated.totalWorkingHours}`);
  };

  const isPresent = todayRecord.status === 'present';
  const isShiftCompleted = todayRecord.status === 'shift_completed' || (todayRecord.punchOut && todayRecord.punchOut !== '—');
  const isNotPunchedIn = !isPresent && !isShiftCompleted;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isNotPunchedIn && (
          <button
            className="btn btn-primary"
            onClick={handlePunchIn}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              backgroundColor: '#10b981',
              borderColor: '#10b981',
            }}
          >
            <LogIn size={16} />
            <span>Punch In</span>
          </button>
        )}

        {isPresent && !isShiftCompleted && (
          <button
            className="btn btn-danger"
            onClick={handlePunchOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              backgroundColor: '#ef4444',
              borderColor: '#ef4444',
            }}
          >
            <LogOut size={16} />
            <span>Punch Out ({elapsedTimeStr})</span>
          </button>
        )}

        {isShiftCompleted && (
          <button
            className="btn btn-secondary"
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              opacity: 0.8,
              cursor: 'not-allowed',
            }}
          >
            <Check size={16} color="#10b981" />
            <span>Shift Completed ({todayRecord.totalWorkingHours || elapsedTimeStr})</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        border: isPresent
          ? '2px solid #10b981'
          : isShiftCompleted
          ? '2px solid var(--primary)'
          : '1px solid var(--border-color)',
        boxShadow: isPresent ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'var(--shadow-sm)',
      }}
    >
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
          <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800 }}>
            Today's Attendance
          </h3>
        </div>

        {isNotPunchedIn && (
          <span className="badge badge-gray" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
            ⚪ Not Punched In
          </span>
        )}

        {isPresent && !isShiftCompleted && (
          <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
            🟢 Present
          </span>
        )}

        {isShiftCompleted && (
          <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            🟢 Shift Completed
          </span>
        )}
      </div>

      <div style={{ padding: '18px 0' }}>
        {/* STATE 1: NOT PUNCHED IN */}
        {isNotPunchedIn && (
          <div>
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--text-tertiary)',
                }}
              >
                <Clock size={28} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                You haven't punched in yet.
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 0' }}>
                Record your arrival time for today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handlePunchIn}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <LogIn size={18} />
              <span>Punch In</span>
            </button>
          </div>
        )}

        {/* STATE 2: PRESENT & WORKING */}
        {isPresent && !isShiftCompleted && (
          <div>
            {/* Time Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punch In Time
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#10b981', marginTop: '2px' }}>
                  {todayRecord.punchIn}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Working Hours
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {elapsedTimeStr}
                </div>
              </div>
            </div>

            {/* Working Time Progress towards 8 hours */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {is8HoursCompleted ? (
                    <span style={{ color: '#10b981', fontWeight: 800 }}>🟢 8 Hours Completed</span>
                  ) : (
                    <span>Shift Progress: {elapsedTimeStr} / 08h 00m</span>
                  )}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>
                  {progressPercent}%
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-tertiary)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: is8HoursCompleted ? '#10b981' : 'var(--primary)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handlePunchOut}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              }}
            >
              <LogOut size={18} />
              <span>Punch Out</span>
            </button>
          </div>
        )}

        {/* STATE 3: SHIFT COMPLETED */}
        {isShiftCompleted && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punch In
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981', marginTop: '2px' }}>
                  {todayRecord.punchIn}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Punch Out
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444', marginTop: '2px' }}>
                  {todayRecord.punchOut}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Hours
                </div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
                  {todayRecord.totalWorkingHours || elapsedTimeStr}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '0.825rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Shift Completed & Recorded</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              disabled
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                opacity: 0.65,
                cursor: 'not-allowed',
              }}
            >
              <span>Shift Completed</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
