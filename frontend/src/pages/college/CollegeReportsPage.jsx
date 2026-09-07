import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services';

export default function CollegeReportsPage() {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getCollegeReports();
      setReports(data || []);
    } catch (err) {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      addToast('Compiling new NAAC criteria report...', 'info');
      const newReport = await reportService.generateReport('college', 'NAAC Accreditation Dossier');
      setReports((prev) => [
        {
          ...newReport,
          category: 'Accreditation',
          date: newReport.generatedDate,
          format: 'PDF',
          size: '3.5 MB',
          status: 'Generated',
        },
        ...prev,
      ]);
      addToast('Report generated successfully', 'success');
    } catch (err) {
      addToast('Failed to generate report', 'error');
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
      label: 'Category',
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
          <h1 className="page-title">College Accreditation & Academic Reports</h1>
          <p className="page-subtitle">NAAC/NBA compliance archives, OBE attainment metrics, and exam result rollups</p>
        </div>
        <Button variant="primary" icon={FileText} onClick={handleGenerateReport}>
          Generate Custom Report
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        title="Institutional Archive"
        subtitle="Download official dossiers for regulatory submission"
        searchPlaceholder="Search reports..."
        searchKeys={['name', 'category', 'id']}
        filters={[
          { key: 'category', label: 'Category', options: ['Accreditation', 'Placement', 'Examinations', 'Research'] },
        ]}
        loading={loading}
      />
    </div>
  );
}
