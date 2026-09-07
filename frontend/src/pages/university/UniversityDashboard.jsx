import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Microscope,
  CreditCard,
  FileCheck,
  Award,
  Plus,
  ArrowRight,
  FlaskConical,
  Download,
  Calendar,
  Bell
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard, { BarChart, DonutChart } from '../../components/dashboard/ChartCard';
import QuickActions from '../../components/dashboard/QuickActions';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import {
  analyticsService,
  researchService,
  institutionService,
  noticeService
} from '../../services';

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [notices, setNotices] = useState([]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    pi: '',
    department: 'Department of Quantum Physics & Computing',
    fundingAgency: 'DST - Department of Science and Technology',
    grantAmount: '₹ 2,50,00,000',
    duration: '2026 - 2029 (3 Years)',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashData, prjList, colList, noticeList] = await Promise.all([
        analyticsService.getUniversityDashboardData(),
        researchService.getResearchProjects(),
        institutionService.getUniversityColleges(),
        noticeService.getUniversityNotices(),
      ]);
      setDashboardData(dashData);
      setProjects(prjList || []);
      setColleges(colList || []);
      setNotices(noticeList || []);
    } catch (err) {
      addToast('Failed to load university dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const created = await researchService.createResearchProject({
        ...projectForm,
        status: 'Active',
      });
      setProjects((prev) => [created, ...prev]);
      setIsAddProjectOpen(false);
      setProjectForm({
        title: '',
        pi: '',
        department: 'Department of Quantum Physics & Computing',
        fundingAgency: 'DST - Department of Science and Technology',
        grantAmount: '₹ 2,50,00,000',
        duration: '2026 - 2029 (3 Years)',
      });
      addToast(`Research project "${created.title}" registered`, 'success');
    } catch (err) {
      addToast('Failed to register research project', 'error');
    }
  };

  const universityProfile = dashboardData?.profile || {
    name: 'Apex Central University',
    type: 'Central University • NIRF Ranked Top 10',
    academicYear: '2026-2027',
  };

  const universityStats = dashboardData?.stats || {
    totalStudents: 18500,
    totalFaculty: 820,
    totalColleges: 32,
    totalPrograms: 48,
    activeResearchProjects: 42,
    totalGrants: '₹42.4 Cr',
  };

  const researchGrantsYearly = [
    { label: '2022', value: 18.2, secondary: 12.4 },
    { label: '2023', value: 24.5, secondary: 16.8 },
    { label: '2024', value: 31.0, secondary: 22.1 },
    { label: '2025', value: 35.8, secondary: 27.4 },
    { label: '2026', value: 42.4, secondary: 34.0 },
  ];

  const collegeDistribution = [
    { label: 'Engineering & Tech', value: 7200, color: '#111827' },
    { label: 'Medical & Health Sci', value: 3400, color: '#4b5563' },
    { label: 'Sciences & Research', value: 4100, color: '#9ca3af' },
    { label: 'Law & Management', value: 3800, color: '#d1d5db' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">University Central Portal</h1>
          <p className="page-subtitle">{universityProfile.name} • {universityProfile.type} • {universityProfile.academicYear}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={Download} onClick={() => navigate('/university/reports')}>
            NIRF Top Ranking Dossier
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddProjectOpen(true)}>
            New Research Grant
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Register Research Grant', icon: Microscope, onClick: () => setIsAddProjectOpen(true) },
          { label: 'Affiliated Colleges (32)', icon: Building2, onClick: () => navigate('/university/colleges') },
          { label: 'Academic Programs (48)', icon: BookOpen, onClick: () => navigate('/university/programs') },
          { label: 'Researchers & PhD', icon: FlaskConical, onClick: () => navigate('/university/researchers') },
          { label: 'Central Admissions Desk', icon: FileCheck, onClick: () => navigate('/university/admissions') },
          { label: 'Convocation Circulars', icon: Bell, onClick: () => navigate('/university/notices') },
        ]}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Enrolled Students" value={universityStats.totalStudents.toLocaleString()} subtitle="Across 32 constituent & affiliated institutes" icon={GraduationCap} change="+11.2%" />
        <StatCard title="Total Faculty & Deans" value={universityStats.totalFaculty} subtitle="Senior professors & guides" icon={Users} />
        <StatCard title="Colleges & Institutes" value={universityStats.totalColleges} subtitle="Constituent & affiliated" icon={Building2} />
        <StatCard title="Academic Programs" value={universityStats.totalPrograms} subtitle="Doctoral, UG & PG" icon={BookOpen} />
        <StatCard title="Funded Research Projects" value={universityStats.activeResearchProjects} subtitle="DST, DBT, ICMR & SERB" icon={Microscope} />
        <StatCard title="Total Research Grants" value={universityStats.totalGrants} subtitle="Active funding corpus" icon={CreditCard} change="+18.5% YoY" />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <ChartCard
          title="Sponsored Research Grant Inflow (₹ Crores)"
          subtitle="Government and Industry funded R&D grants comparison"
        >
          <BarChart data={researchGrantsYearly} height={170} />
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#111827', borderRadius: 2 }} /> Govt (DST/DBT/ICMR)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: 2 }} /> Industry Sponsored
            </span>
          </div>
        </ChartCard>

        <ChartCard
          title="Discipline-wise Student Strength"
          subtitle="18,500 students distributed across University faculties"
        >
          <DonutChart data={collegeDistribution} size={140} />
        </ChartCard>
      </div>

      {/* Research Projects & Constituent Institutes */}
      <div className="grid-2">
        {/* Research Projects Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Active High-Impact Research Grants
              </h2>
              <p className="text-xs text-muted">DST, DBT, SERB, and ICMR funded projects</p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/university/research')}>
              View All 42
            </Button>
          </div>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Principal Investigator</th>
                  <th>Grant Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 4).map((prj) => (
                  <tr key={prj.id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prj.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{prj.fundingAgency}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{prj.pi}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prj.department}</div>
                    </td>
                    <td><strong>{prj.grantAmount}</strong></td>
                    <td><Badge variant={prj.status}>{prj.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Constituent Campuses & Circulars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Campuses & Colleges */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} /> Constituent Campuses & Institutes
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/university/colleges')}>
                Directory
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {colleges.slice(0, 3).map((col) => (
                <div key={col.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{col.name}</span>
                    <Badge variant="outline">{col.accreditation.split(',')[0]}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    <span>Dean: {col.dean}</span>
                    <span>{col.students.toLocaleString()} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Circulars */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} /> University Gazettes & Circulars
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/university/notices')}>
                All Notices
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notices.map((not) => (
                <div key={not.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{not.title}</span>
                    <Badge variant="outline">{not.priority}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{not.audience}</span>
                    <span>{not.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      <FormModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onSubmit={handleSaveProject}
        title="Register Sponsored Research Project"
        subtitle="University Center for Advanced Research (UCAR)"
      >
        <Input
          label="Research Project Title"
          required
          value={projectForm.title}
          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
          placeholder="e.g. Quantum Key Distribution in High-Noise Satellite Networks"
        />
        <div className="grid-2">
          <Input
            label="Principal Investigator (PI)"
            required
            value={projectForm.pi}
            onChange={(e) => setProjectForm({ ...projectForm, pi: e.target.value })}
            placeholder="Prof. Dr. Name"
          />
          <Select
            label="Funding Agency"
            value={projectForm.fundingAgency}
            onChange={(e) => setProjectForm({ ...projectForm, fundingAgency: e.target.value })}
            options={['DST - Department of Science and Technology', 'DBT - Department of Biotechnology', 'ICMR - Indian Council of Medical Research', 'SERB & PowerGrid Industry Grant', 'CSIR Research Council']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Total Grant Sanctioned (₹)"
            required
            value={projectForm.grantAmount}
            onChange={(e) => setProjectForm({ ...projectForm, grantAmount: e.target.value })}
            placeholder="₹ 3,50,00,000"
          />
          <Input
            label="Duration Timeline"
            value={projectForm.duration}
            onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
            placeholder="2026 - 2029 (3 Years)"
          />
        </div>
      </FormModal>
    </div>
  );
}
