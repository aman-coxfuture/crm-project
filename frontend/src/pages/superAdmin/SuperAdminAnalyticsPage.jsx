import React from 'react';
import { BarChart, DonutChart, TrendLineChart } from '../../components/common/Charts';
import StatCard from '../../components/common/StatCard';
import { BarChart3, TrendingUp, Users, DollarSign, Award, School } from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataService';

export default function SuperAdminAnalyticsPage() {
  const schools = schoolDataService.getSchools();

  const multiSchoolBar = schools.map((s) => ({
    label: s.name.split(' ')[0],
    value: s.studentsCount,
    color: '#6366f1',
  }));

  const revenueBySchool = [
    { label: 'Greenwood', value: 450, color: '#10b981' },
    { label: 'St. Xavier', value: 380, color: '#0ea5e9' },
    { label: 'Oakridge', value: 520, color: '#f59e0b' },
    { label: 'Apex Future', value: 160, color: '#8b5cf6' },
  ];

  const retentionTrend = [
    { label: '2021', value: 92 },
    { label: '2022', value: 94 },
    { label: '2023', value: 95 },
    { label: '2024', value: 96 },
    { label: '2025', value: 98 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="var(--primary)" />
            Platform Multi-School Analytics
          </h1>
          <p className="page-subtitle">
            Cross-institutional benchmarks, growth trajectories and performance metrics
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard title="Platform Active Students" value="4,100" icon={Users} color="indigo" trend="+14%" />
        <StatCard title="Total Annual Revenue" value="$1.51M" icon={DollarSign} color="emerald" trend="+22%" />
        <StatCard title="Avg Retention Rate" value="97.2%" icon={TrendingUp} color="sky" subtitle="Across all schools" />
        <StatCard title="Avg Exam Pass Rate" value="95.8%" icon={Award} color="purple" trend="+3.2%" />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Enrollment Distribution by Institution</h3>
          </div>
          <BarChart data={multiSchoolBar} height={220} />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Revenue Contribution ($ in Thousands)</h3>
          </div>
          <DonutChart data={revenueBySchool} size={160} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historical Student Retention Benchmark (%)</h3>
          <span className="badge badge-success">5-Year Growth</span>
        </div>
        <TrendLineChart data={retentionTrend} height={180} color="#10b981" />
      </div>
    </div>
  );
}
