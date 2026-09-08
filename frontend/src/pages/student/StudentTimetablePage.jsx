import React from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, Printer } from 'lucide-react';

export default function StudentTimetablePage() {
  const timetable = schoolDataService.getTimetable();
  const scheduleRows = timetable['10-A'] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            My Class Weekly Timetable
          </h1>
          <p className="page-subtitle">
            Class 10-A standard schedule for lectures, science laboratories and library sessions
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
                <th style={{ width: '120px', textAlign: 'left' }}>Period / Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {scheduleRows.map((row, idx) => {
                const isBreak = typeof row.period === 'string' && (row.period.includes('Break') || row.period.includes('Lunch'));

                if (isBreak) {
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <td style={{ textAlign: 'left' }}>
                        <div>{row.period}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{row.time}</div>
                      </td>
                      <td colSpan={5} style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {row.monday}
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
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.monday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.tuesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.wednesday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.thursday}
                      </div>
                    </td>
                    <td>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
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
