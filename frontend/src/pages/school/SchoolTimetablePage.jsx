import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Download, Printer } from 'lucide-react';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { classService } from '../../services';

export default function SchoolTimetablePage() {
  const { addToast } = useToast();
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        const data = await classService.getSchoolTimetable(selectedClass);
        setTimetable(data || []);
      } catch (err) {
        addToast('Failed to load timetable', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, [selectedClass]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Class Timetable</h1>
          <p className="page-subtitle">Period allocation, teacher slot mapping, and bell schedule</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Timetable
          </Button>
          <Button variant="primary" icon={Download} onClick={() => addToast('Timetable PDF downloaded', 'info')}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Class:</span>
            <div style={{ width: '180px' }}>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={['Class 10-A', 'Class 10-B', 'Class 12-A', 'Class 12-B', 'Class 9-A']}
                placeholder=""
              />
            </div>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Effective from: Academic Session 2026-27
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Time Period</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((slot, idx) => {
                const isBreak = slot.period.includes('Break');
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isBreak ? 'var(--bg-tertiary)' : undefined,
                      fontWeight: isBreak ? 600 : 'normal',
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {slot.period}
                    </td>
                    <td>{slot.mon}</td>
                    <td>{slot.tue}</td>
                    <td>{slot.wed}</td>
                    <td>{slot.thu}</td>
                    <td>{slot.fri}</td>
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
