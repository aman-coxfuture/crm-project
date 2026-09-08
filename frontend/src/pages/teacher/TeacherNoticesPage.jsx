import React from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { Bell, Calendar } from 'lucide-react';

export default function TeacherNoticesPage() {
  const notices = schoolDataService.getNotices();
  const relevantNotices = notices.filter((n) => n.audience === 'Teachers' || n.audience === 'All');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={26} color="var(--primary)" />
            Faculty Notice Bulletin
          </h1>
          <p className="page-subtitle">
            Academic directives, staff circulars and institutional announcements
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {relevantNotices.map((notice) => (
          <div key={notice.id} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{notice.title}</h3>
                  <span className={`badge ${notice.priority === 'High' ? 'badge-danger' : 'badge-info'}`}>
                    {notice.priority}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                  Issued by <strong>{notice.author}</strong> on {notice.date}
                </div>
              </div>
              <span className="badge badge-primary">Audience: {notice.audience}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {notice.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
