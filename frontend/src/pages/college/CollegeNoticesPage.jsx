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

export default function CollegeNoticesPage() {
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    author: 'Principal Office',
    audience: 'All Students & Faculty',
    status: 'Published',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getCollegeNotices();
      setNotices(data || []);
    } catch (err) {
      addToast('Failed to load college notices', 'error');
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
      const newNot = await noticeService.createNotice('college', formData);
      setNotices([newNot, ...notices]);
      setIsAddOpen(false);
      addToast('College circular published to campus notice board', 'success');
    } catch (err) {
      addToast('Failed to publish notice', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Circular / Notification Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • Issued by: {row.author}</div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Audience Scope',
      render: (row) => <span>{row.audience}</span>,
    },
    {
      key: 'date',
      label: 'Published Date',
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
          <h1 className="page-title">College Notices & Circulars</h1>
          <p className="page-subtitle">Publish placement drives, examination alerts, and academic deadlines</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Publish Circular
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={notices}
        title="Official Circulars"
        subtitle="Manage college notices and communications"
        searchPlaceholder="Search notices..."
        searchKeys={['title', 'author', 'audience']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Notice"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Publish Campus Circular"
        subtitle="Issue official college notification"
      >
        <Input
          label="Circular Subject"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Technical Seminar on Generative AI by Industry Experts"
        />
        <div className="grid-2">
          <Select
            label="Target Audience"
            value={formData.audience}
            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            options={['All Students & Faculty', 'Final & Pre-Final Year B.Tech', 'Faculty & PG Scholars', 'Department of CSE & AI']}
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
            label="Issuing Authority"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}
