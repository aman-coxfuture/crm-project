import React, { useState } from 'react';
import { schoolDataService, SCHOOL_CLASSES } from '../../services/schoolDataService';
import Tabs from '../../components/common/Tabs';
import { Clock, Layers, User, Printer, CheckCircle2, Coffee } from 'lucide-react';

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState('class');
  const [selectedClass, setSelectedClass] = useState('Class 5-A');
  const [selectedTeacher, setSelectedTeacher] = useState('Rahul Sharma');
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'

  const teachers = schoolDataService.getTeachers('SCH-001');

  // Retrieve 7-period timetable for selected class or teacher
  const scheduleRows =
    activeTab === 'class'
      ? schoolDataService.getTimetableForClass(selectedClass)
      : schoolDataService.getTimetableForTeacher(selectedTeacher);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            7-Period School Timetable Master
          </h1>
          <p className="page-subtitle">
            Strict 7-period daily structure: 4 Periods before lunch • Lunch Break • 3 Periods after lunch
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={15} />
          <span>Print Timetable</span>
        </button>
      </div>

      {/* Structure Information Alert */}
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
        <span style={{ fontSize: '1.2rem' }}>🍱</span>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <strong>Official Schedule Structure:</strong> Period 1 (08:00) ➔ Period 2 (08:40) ➔ Period 3 (09:20) ➔ Period 4 (10:00) ➔ <strong style={{ color: 'var(--primary)' }}>Lunch Break (10:40–11:10)</strong> ➔ Period 5 (11:10) ➔ Period 6 (11:50) ➔ Period 7 (12:30–01:10).
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Tabs
            tabs={[
              { id: 'class', label: 'Class Master (Nursery–Class 10)', icon: <Layers size={15} /> },
              { id: 'teacher', label: 'Teacher 7-Period Matrix', icon: <User size={15} /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />

          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setViewMode('weekly')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: viewMode === 'weekly' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'weekly' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Weekly Matrix
            </button>
            <button
              onClick={() => setViewMode('daily')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: viewMode === 'daily' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'daily' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Daily Period View
            </button>
          </div>
        </div>

        {activeTab === 'class' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Select Class & Section:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              style={{ width: '170px', height: '38px', fontSize: '0.85rem' }}
            >
              {SCHOOL_CLASSES.map((c) => (
                <option key={`${c}-A`} value={`${c}-A`}>
                  {c}-A
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Select Faculty Member:</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="form-select"
              style={{ width: '220px', height: '38px', fontSize: '0.85rem' }}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DAILY VIEW: Exact Table from Requirements (Period, Time, Subject, Teacher, Class) */}
      {viewMode === 'daily' ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="custom-table" style={{ textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Period</th>
                  <th style={{ width: '160px' }}>Time Slot</th>
                  <th>Subject</th>
                  <th>Assigned Teacher</th>
                  <th>Class & Room</th>
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
                          borderTop: '2px dashed #f59e0b',
                          borderBottom: '2px dashed #f59e0b',
                        }}
                      >
                        <td colSpan={5} style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                            <span>🍱</span>
                            <span>LUNCH BREAK ({row.time})</span>
                            <span>🍱</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={idx}>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                          }}
                        >
                          {row.period}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{row.time}</td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {row.subject || (activeTab === 'class' ? row.monday?.split('(')[0] : row.subject)}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: '0.8rem' }}>
                          {row.teacher || (activeTab === 'class' ? row.monday?.match(/\(([^)]+)\)/)?.[1] || 'Assigned Faculty' : selectedTeacher)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                          {row.class || selectedClass} • {row.room || 'Room 201'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* WEEKLY MATRIX VIEW (Period 1 to 4, Lunch, Period 5 to 7 across Mon-Fri) */
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
                        <div style={{ padding: '8px 10px', backgroundColor: row.monday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.monday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                          {row.monday}
                        </div>
                      </td>
                      <td>
                        <div style={{ padding: '8px 10px', backgroundColor: row.tuesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.tuesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                          {row.tuesday}
                        </div>
                      </td>
                      <td>
                        <div style={{ padding: '8px 10px', backgroundColor: row.wednesday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.wednesday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                          {row.wednesday}
                        </div>
                      </td>
                      <td>
                        <div style={{ padding: '8px 10px', backgroundColor: row.thursday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.thursday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
                          {row.thursday}
                        </div>
                      </td>
                      <td>
                        <div style={{ padding: '8px 10px', backgroundColor: row.friday?.includes('Free') ? 'var(--bg-tertiary)' : 'var(--primary-light)', color: row.friday?.includes('Free') ? 'var(--text-tertiary)' : 'var(--primary-text)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem' }}>
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
      )}
    </div>
  );
}
