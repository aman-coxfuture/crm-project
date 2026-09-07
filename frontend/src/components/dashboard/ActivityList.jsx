import React from 'react';
import { Clock } from 'lucide-react';

export default function ActivityList({ activities = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {activities.map((act) => (
        <div
          key={act.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#111827',
              marginTop: '6px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {act.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <Clock size={11} />
              <span>{act.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
