import React from 'react';
import Button from '../common/Button';

export default function QuickActions({ actions = [] }) {
  // actions: [{ label: 'Add Student', icon: UserPlus, onClick: () => ... }]
  return (
    <div className="card card-compact" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Actions
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {actions.map((act, idx) => (
          <Button
            key={idx}
            variant="secondary"
            size="sm"
            icon={act.icon}
            onClick={act.onClick}
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            {act.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
