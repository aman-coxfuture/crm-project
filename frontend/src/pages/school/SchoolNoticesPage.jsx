import React, { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, Eye, Send } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { noticeService } from '../../services';

export default function SchoolNoticesPage() {
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    author: 'Principal Office',
    audience: 'All Parents & Students',
    status: 'Published',
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getSchoolNotices();
      setNotices(data || []);
    } catch (err) {
      addToast('Failed to load notices', 'error');
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
      const newNotice = await noticeService.createNotice('school', formData);
      setNotices([newNotice, ...notices]);
      setIsAddOpen(false);
      addToast('Notice published and broadcast to audience', 'success');
    } catch (err) {
      addToast('Failed to publish notice', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Notice / Circular Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ID: {row.id} • Issued by: {row.author}</div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Target Audience',
      render: (row) => <span style={{ fontSize: '12.5px' }}>{row.audience}</span>,
    },
    {
      key: 'date',
      label: 'Published Date',
      render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.date}</span>,
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
          <h1 className="page-title">School Notices & Announcements</h1>
          <p className="page-subtitle">Publish official circulars, event invitations, and exam alerts</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Publish Notice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={notices}
        title="Notice Board"
        subtitle="Manage public circulars and targeted communications"
        searchPlaceholder="Search notice title, author..."
        searchKeys={['title', 'author', 'audience']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Create Notice"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Publish School Notice"
        subtitle="Broadcast to parents, students, or staff"
      >
        <Input
          label="Notice Title / Subject"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Schedule of Term 1 Parent Teacher Meeting"
        />
        <div className="grid-2">
          <Select
            label="Target Audience"
            value={formData.audience}
            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            options={['All School', 'All Parents & Students', 'Class 8 to 12', 'Teaching Staff Only']}
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
            label="Authoring Office"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
          <Input
            label="Publish Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  );
}
