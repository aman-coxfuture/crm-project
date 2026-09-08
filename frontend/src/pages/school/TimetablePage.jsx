import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import Tabs from '../../components/common/Tabs';
import { Clock, BookOpen, User, Calendar, Layers, Printer } from 'lucide-react';

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState('class');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedTeacher, setSelectedTeacher] = useState('Sarah Jenkins');

  const timetable = schoolDataService.getTimetable();
  const scheduleRows = timetable['10-A'] || [];
  const teacherRows = timetable['Teacher-Sarah'] || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Clock size={26} color="var(--primary)" />
            School Timetable & Schedule Matrix
          </h1>
          <p className="page-subtitle">
            Manage period distributions, room allocations and faculty schedules
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={15} />
          <span>Print Timetable</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <Tabs
          tabs={[
            { id: 'class', label: 'Class Master Timetable', icon: <Layers size={15} /> },
            { id: 'teacher', label: 'Teacher Schedule Matrix', icon: <User size={15} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />

        {activeTab === 'class' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Select Class & Section:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}
            >
              {['10-A', '10-B', '9-A', '11-Science', '12-Science'].map((c) => (
                <option key={c} value={c}>Class {c}</option>
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
              style={{ width: '180px', height: '38px', fontSize: '0.85rem' }}
            >
              {['Sarah Jenkins', 'David Reynolds', 'Elena Rostova', 'Marcus Brody', 'Dr. Anita Patel'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid Schedule */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="custom-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ width: '100px', textAlign: 'left' }}>Period / Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'class' ? scheduleRows : teacherRows).map((row, idx) => {
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
                      <td style={{ textAlign: 'left', fontWeight: 700 }}>
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
