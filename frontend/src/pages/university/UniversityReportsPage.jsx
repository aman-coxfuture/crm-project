import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services';

export default function UniversityReportsPage() {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getUniversityReports();
      setReports(data || []);
    } catch (err) {
      addToast('Failed to load university reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      addToast('Compiling new NIRF ranking data package...', 'info');
      const newReport = await reportService.generateReport('university', 'NIRF Ranking Data Package');
      setReports((prev) => [
        {
          ...newReport,
          category: 'NIRF / Ministry',
          date: newReport.generatedDate,
          format: 'PDF & CSV',
          size: '12.5 MB',
          status: 'Generated',
        },
        ...prev,
      ]);
      addToast('Ranking dossier compiled successfully', 'success');
    } catch (err) {
      addToast('Failed to compile dossier', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Report Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • {row.format} ({row.size})</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Regulatory Domain',
      render: (row) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.date}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant="success">{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={() => addToast(`Downloading ${row.name}...`, 'info')}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Regulatory & NIRF Reports</h1>
          <p className="page-subtitle">Download institutional metrics for NIRF Top Rankings, NAAC A+++, and Central Ministry audits</p>
        </div>
        <Button variant="primary" icon={FileText} onClick={handleGenerateReport}>
          Compile Ranking Dossier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        title="Central Statistical Dossiers"
        subtitle="Manage government and accreditation submissions"
        searchPlaceholder="Search reports..."
        searchKeys={['name', 'category', 'id']}
        filters={[
          { key: 'category', label: 'Domain', options: ['NIRF / Ministry', 'Accreditation', 'Research', 'Admissions', 'Doctoral'] },
        ]}
        loading={loading}
      />
    </div>
  );
}
