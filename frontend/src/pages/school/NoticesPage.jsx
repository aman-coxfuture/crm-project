import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Bell, Plus, Users, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NoticesPage() {
  const { success } = useToast();
  const [notices, setNotices] = useState(() => schoolDataService.getNotices());
  const [activeAudience, setActiveAudience] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    audience: 'All',
    priority: 'High',
    author: 'Principal Office',
    content: '',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    const created = schoolDataService.addNotice(newNotice);
    setNotices(schoolDataService.getNotices());
    setIsAddModalOpen(false);
    setNewNotice({
      title: '',
      audience: 'All',
      priority: 'High',
      author: 'Principal Office',
      content: '',
    });
    success(`Notice broadcasted to ${created.audience}!`);
  };

  const filtered = notices.filter((n) => activeAudience === 'All' || n.audience === activeAudience || n.audience === 'All');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={26} color="var(--primary)" />
            Notice Board & Broadcast Communication
          </h1>
          <p className="page-subtitle">
            Publish announcements, urgent circulars and broadcasts to school community
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Publish Notice</span>
        </button>
      </div>

      <Tabs
        tabs={[
          { id: 'All', label: 'All Broadcasts', icon: <Bell size={14} /> },
          { id: 'Students', label: 'For Students', icon: <Users size={14} /> },
          { id: 'Teachers', label: 'For Faculty', icon: <Users size={14} /> },
          { id: 'Parents', label: 'For Parents', icon: <Users size={14} /> },
          { id: 'Staff', label: 'For Support Staff', icon: <Users size={14} /> },
        ]}
        activeTab={activeAudience}
        onChange={setActiveAudience}
        variant="pills"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((notice) => (
          <div key={notice.id} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{notice.title}</h3>
                  <span className={`badge ${notice.priority === 'High' ? 'badge-danger' : notice.priority === 'Medium' ? 'badge-warning' : 'badge-info'}`}>
                    {notice.priority} Priority
                  </span>
                  <span className="badge badge-primary">Audience: {notice.audience}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Published by <strong>{notice.author}</strong> on {notice.date}
                </div>
              </div>

              <StatusBadge status={notice.status} size="sm" />
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {notice.content}
            </p>
          </div>
        ))}
      </div>

      {/* Create Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Broadcast New Notice"
        subtitle="Publish institutional circular to targeted audience"
      >
        <form onSubmit={handleAddSubmit}>
          <FormInput
            label="Notice Title"
            required
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            placeholder="e.g. Annual School Bus Route Update"
          />

          <div className="grid-2">
            <Select
              label="Target Audience"
              value={newNotice.audience}
              onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
              options={['All', 'Students', 'Teachers', 'Parents', 'Staff']}
            />
            <Select
              label="Priority Level"
              value={newNotice.priority}
              onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
              options={['High', 'Medium', 'Low']}
            />
          </div>

          <Textarea
            label="Notice Announcement Content"
            required
            rows={4}
            value={newNotice.content}
            onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
            placeholder="Write complete notice message..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Broadcast Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
