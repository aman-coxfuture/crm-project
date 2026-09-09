import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, Printer } from 'lucide-react';

export default function StudentTimetablePage() {
  const { currentUser } = useAuth();
  const studentClass = currentUser?.class ? `${currentUser.class}-${currentUser.section || 'A'}` : 'Class 10-A';
  const scheduleRows = schoolDataService.getTimetableForClass(studentClass);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            Class Timetable ({studentClass})
          </h1>
          <p className="page-subtitle">
            7-Period Schedule: 4 Periods before lunch • 30-Minute Lunch Break • 3 Periods after lunch
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={15} />
          <span>Print Timetable</span>
        </button>
      </div>

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
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.monday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.tuesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.wednesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.thursday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
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
