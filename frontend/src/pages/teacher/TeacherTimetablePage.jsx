import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, Printer } from 'lucide-react';

export default function TeacherTimetablePage() {
  const { currentUser } = useAuth();
  const teacherName = currentUser?.name || 'Rahul Sharma';
  const scheduleRows = schoolDataService.getTimetableForTeacher(teacherName);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            My 7-Period Teaching Schedule Matrix
          </h1>
          <p className="page-subtitle">
            Personal timetable: 4 Periods before lunch • 30-Min Lunch Break • 3 Periods after lunch
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={15} />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Structure indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <strong>Faculty Schedule for {teacherName}:</strong> Displaying weekly personal allocations for Nursery to Class 10 divisions and designated planning periods.
        </div>
      </div>

      {/* 7-Period Schedule Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="custom-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ width: '130px', textAlign: 'left' }}>Period / Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {scheduleRows.map((row, idx) => {
                const isBreak = row.isBreak || row.period === 'Lunch';

                if (isBreak) {
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        fontWeight: 800,
                        color: '#d97706',
                        borderTop: '2px dashed #f59e0b',
                        borderBottom: '2px dashed #f59e0b',
                      }}
                    >
                      <td style={{ textAlign: 'left', fontWeight: 800 }}>
                        <div>🍱 Lunch Break</div>
                        <div style={{ fontSize: '0.7rem', color: '#b45309' }}>{row.time}</div>
                      </td>
                      <td colSpan={5} style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        🍱 30-MINUTE SCHOOL LUNCH BREAK 🍱
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Period {row.period}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>{row.time}</div>
                    </td>
                    <td>
                      <div
                        style={{
                          padding: '8px 10px',
                          backgroundColor: row.monday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                          color: row.monday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.monday}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          padding: '8px 10px',
                          backgroundColor: row.tuesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                          color: row.tuesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.tuesday}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          padding: '8px 10px',
                          backgroundColor: row.wednesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                          color: row.wednesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.wednesday}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          padding: '8px 10px',
                          backgroundColor: row.thursday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                          color: row.thursday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.thursday}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          padding: '8px 10px',
                          backgroundColor: row.friday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)',
                          color: row.friday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {row.friday}
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
