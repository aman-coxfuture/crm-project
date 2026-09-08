import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Tabs from '../../components/common/Tabs';
import { BarChart, DonutChart, TrendLineChart } from '../../components/common/Charts';
import StatCard from '../../components/common/StatCard';
import {
  BarChart3,
  Download,
  Printer,
  Users,
  CalendarCheck,
  Award,
  DollarSign,
  Bus,
  Briefcase,
  FileSpreadsheet,
} from 'lucide-react';

export default function ReportsPage() {
  const { success } = useToast();
  const [activeReport, setActiveReport] = useState('student');

  const handleExport = (format) => {
    success(`Report exported as ${format.toUpperCase()} successfully!`);
  };

  const studentPerformanceData = [
    { label: 'Class 8', value: 84 },
    { label: 'Class 9', value: 81 },
    { label: 'Class 10', value: 88 },
    { label: 'Class 11', value: 79 },
    { label: 'Class 12', value: 92 },
  ];

  const attendanceMonthlyTrend = [
    { label: 'May', value: 94 },
    { label: 'Jun', value: 91 },
    { label: 'Jul', value: 96 },
    { label: 'Aug', value: 95 },
    { label: 'Sep', value: 93 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="var(--primary)" />
            School Reports & Statistical Analytics
          </h1>
          <p className="page-subtitle">
            Generate and export comprehensive audits across admissions, attendance, marks and finance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')}>
            <Download size={15} />
            <span>Export PDF Audit</span>
          </button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'student', label: 'Student Admissions Report', icon: <Users size={14} /> },
          { id: 'attendance', label: 'Attendance Audit', icon: <CalendarCheck size={14} /> },
          { id: 'academic', label: 'Academic & Exam Results', icon: <Award size={14} /> },
          { id: 'fees', label: 'Financial & Fee Audit', icon: <DollarSign size={14} /> },
          { id: 'transport', label: 'Fleet & Logistics Report', icon: <Bus size={14} /> },
        ]}
        activeTab={activeReport}
        onChange={setActiveReport}
        variant="pills"
      />

      {activeReport === 'student' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '20px' }}>
            <StatCard title="Total Enrolled" value="1,250" icon={Users} color="indigo" />
            <StatCard title="New Admissions (2025)" value="215" icon={Users} color="emerald" trend="+14%" />
            <StatCard title="Graduation Rate" value="98.5%" icon={Award} color="sky" subtitle="Class of 2024" />
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Average Class Academic Score (%)</h3>
            </div>
            <BarChart data={studentPerformanceData} height={220} />
          </div>
        </div>
      )}

      {activeReport === 'attendance' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '20px' }}>
            <StatCard title="Overall Attendance Rate" value="94.2%" icon={CalendarCheck} color="emerald" />
            <StatCard title="Best Performing Class" value="Class 12-Sci" icon={Award} color="indigo" subtitle="98% Average" />
            <StatCard title="Chronic Absentees" value="4 Students" icon={Users} color="rose" subtitle="< 75% attendance" />
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Monthly Institutional Attendance Trend (%)</h3>
            </div>
            <TrendLineChart data={attendanceMonthlyTrend} height={200} color="#10b981" />
          </div>
        </div>
      )}

      {activeReport === 'academic' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Term 1 Examination Grade Distribution</h3>
          </div>
          <DonutChart
            data={[
              { label: 'A+ (90-100%)', value: 42, color: '#10b981' },
              { label: 'A (80-89%)', value: 58, color: '#0ea5e9' },
              { label: 'B+ (70-79%)', value: 34, color: '#6366f1' },
              { label: 'B (60-69%)', value: 18, color: '#f59e0b' },
              { label: 'Below Pass', value: 4, color: '#ef4444' },
            ]}
            size={160}
          />
        </div>
      )}

      {activeReport === 'fees' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Term 1 Revenue Realization</h3>
          </div>
          <DonutChart
            data={[
              { label: 'Realized Collections', value: 185000, color: '#10b981' },
              { label: 'Pending Receivables', value: 24000, color: '#f59e0b' },
              { label: 'Overdue Dues', value: 12000, color: '#ef4444' },
            ]}
            size={160}
          />
        </div>
      )}

      {activeReport === 'transport' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fleet Route Capacity Utilization</h3>
          </div>
          <BarChart
            data={[
              { label: 'Route 1 (North)', value: 82, color: '#4f46e5' },
              { label: 'Route 2 (West)', value: 86, color: '#0ea5e9' },
              { label: 'Route 3 (South)', value: 88, color: '#10b981' },
              { label: 'Route 4 (East)', value: 75, color: '#f59e0b' },
            ]}
            height={200}
          />
        </div>
      )}
    </div>
  );
}
