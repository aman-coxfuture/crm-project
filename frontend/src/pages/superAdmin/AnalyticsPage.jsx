import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Server, Shield, Database, Download } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard, { BarChart, DonutChart, ProgressBar } from '../../components/dashboard/ChartCard';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { analyticsService } from '../../services';

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await analyticsService.getSuperAdminAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        addToast('Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const monthlyAdmissions = [
    { label: 'Jan', value: 1200, secondary: 850 },
    { label: 'Feb', value: 1450, secondary: 920 },
    { label: 'Mar', value: 2100, secondary: 1300 },
    { label: 'Apr', value: 3400, secondary: 2100 },
    { label: 'May', value: 5200, secondary: 3800 },
    { label: 'Jun', value: 6800, secondary: 4900 },
  ];

  const storageDistribution = [
    { label: 'Student Records', value: 45, color: '#111827' },
    { label: 'Exam Archives', value: 25, color: '#4b5563' },
    { label: 'Media & Documents', value: 20, color: '#9ca3af' },
    { label: 'Audit Backups', value: 10, color: '#d1d5db' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Analytics & Telemetry</h1>
          <p className="page-subtitle">Centralized platform usage metrics, storage distribution, and performance data</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={() => addToast('Analytics report exported as CSV', 'info')}>
          Export Report
        </Button>
      </div>

      <div className="stats-grid">
        <StatCard title="API Requests (24h)" value="1.84M" subtitle="99.98% success rate" icon={Server} change="+12.4%" />
        <StatCard title="Peak Concurrent Users" value="8,420" subtitle="Exam day peak" icon={Users} />
        <StatCard title="Storage Allocated" value="3.4 TB" subtitle="Across 8 database shards" icon={Database} />
        <StatCard title="Avg Server Latency" value="38 ms" subtitle="Global CDN edge" icon={TrendingUp} />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Monthly Admissions Flow (Multi-Tenant)"
          subtitle="Total verified admissions applications across schools & colleges"
        >
          <BarChart data={monthlyAdmissions} height={190} />
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#111827', borderRadius: 2 }} /> UG / School
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: 2 }} /> PG / Research
            </span>
          </div>
        </ChartCard>

        <ChartCard
          title="Tenant Resource Consumption"
          subtitle="Storage allocation by document and database categories"
        >
          <DonutChart data={storageDistribution} size={150} />
        </ChartCard>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>System Health & SLA Status</h2>
          <ProgressBar label="Database Read Replica Uptime" value={99.99} max={100} subtitle="All 4 clusters nominal" />
          <ProgressBar label="Nightly Backup Completion" value={100} max={100} subtitle="Last backup: 03:00 AM UTC" />
          <ProgressBar label="Email / SMS Gateway Delivery" value={98.8} max={100} subtitle="24k messages sent today" />
          <ProgressBar label="API Rate Limit Headroom" value={42} max={100} subtitle="Current peak load at 42% of cluster capacity" />
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Top Performing Institutions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Apex Central University', score: '99.4% Attendance Sync', desc: '18.5k active students' },
              { name: 'Heritage Valley College of Engg', score: '98.8% Fee Digital Collection', desc: '3.6k students' },
              { name: 'Delhi Public International School', score: '99.1% CBSE Roster Verification', desc: '2.4k students' },
              { name: 'National College of Arts & Sci', score: '97.6% Exam Publishing Time', desc: '4.2k students' },
            ].map((inst, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{inst.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inst.desc}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{inst.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
