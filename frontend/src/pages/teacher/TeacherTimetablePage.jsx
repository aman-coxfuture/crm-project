import React from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { Clock, Printer } from 'lucide-react';

export default function TeacherTimetablePage() {
  const timetable = schoolDataService.getTimetable();
  const scheduleRows = timetable['Teacher-Sarah'] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            My Teaching Schedule Matrix
          </h1>
          <p className="page-subtitle">
            Weekly personal lecture allocations, lab sessions and planning periods
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={15} />
          <span>Print Schedule</span>
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
              {scheduleRows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Period {row.period}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>{row.time}</div>
                  </td>
                  <td>
                    <div style={{ padding: '8px 10px', backgroundColor: row.monday.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.monday.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.monday}
                    </div>
                  </td>
                  <td>
                    <div style={{ padding: '8px 10px', backgroundColor: row.tuesday.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.tuesday.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.tuesday}
                    </div>
                  </td>
                  <td>
                    <div style={{ padding: '8px 10px', backgroundColor: row.wednesday.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.wednesday.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.wednesday}
                    </div>
                  </td>
                  <td>
                    <div style={{ padding: '8px 10px', backgroundColor: row.thursday.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.thursday.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.thursday}
                    </div>
                  </td>
                  <td>
                    <div style={{ padding: '8px 10px', backgroundColor: row.friday.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.friday.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {row.friday}
                    </div>
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
