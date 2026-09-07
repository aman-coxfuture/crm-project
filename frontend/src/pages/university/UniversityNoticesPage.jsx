import React, { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { noticeService } from '../../services';

export default function UniversityNoticesPage() {
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    author: 'Registrar Office',
    audience: 'All Affiliated Colleges',
    status: 'Published',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getUniversityNotices();
      setNotices(data || []);
    } catch (err) {
      addToast('Failed to load university notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newNot = await noticeService.createNotice('university', formData);
      setNotices([newNot, ...notices]);
      setIsAddOpen(false);
      addToast('University official gazette/notification published', 'success');
    } catch (err) {
      addToast('Failed to publish notification', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'University Gazette / Decree Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • Issued by: {row.author}</div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Circulation Scope',
      render: (row) => <span>{row.audience}</span>,
    },
    {
      key: 'date',
      label: 'Promulgation Date',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.date}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge variant={row.priority === 'High' ? 'danger' : 'outline'}>{row.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant="success">{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">University Gazettes & Statutory Notices</h1>
          <p className="page-subtitle">Publish Senate resolutions, research grant calls, and convocation orders</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Promulgate Gazette
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={notices}
        title="Official University Gazette"
        subtitle="Manage statutory orders and circulars"
        searchPlaceholder="Search notices..."
        searchKeys={['title', 'author', 'audience']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Gazette"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Promulgate University Gazette"
        subtitle="Central Registrar Publication"
      >
        <Input
          label="Gazette Order / Notice Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Mandatory National Academic Depository (NAD) Credit Verification"
        />
        <div className="grid-2">
          <Select
            label="Circulation Target"
            value={formData.audience}
            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            options={['All Affiliated Colleges', 'Graduating Batches & Faculty', 'All Faculty & Ph.D. Supervisors', 'University Senate & Academic Council']}
          />
          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={['Low', 'Medium', 'High', 'Urgent']}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Issuing Office"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
          <Input
            label="Promulgation Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}
