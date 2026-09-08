import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const s = String(status).toLowerCase();
  let type = 'gray';

  if (['active', 'paid', 'present', 'approved', 'success', 'passed', 'published', 'completed'].includes(s)) {
    type = 'success';
  } else if (['pending', 'upcoming', 'partial', 'medium', 'planning'].includes(s)) {
    type = 'warning';
  } else if (['inactive', 'overdue', 'absent', 'rejected', 'danger', 'failed', 'maintenance', 'high'].includes(s)) {
    type = 'danger';
  } else if (['on leave', 'late', 'opted'].includes(s)) {
    type = 'warning';
  } else if (['term 1', 'science', 'math', 'info', 'submitted'].includes(s)) {
    type = 'info';
  } else if (['super-admin', 'principal', 'graded'].includes(s)) {
    type = 'purple';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';

  return (
    <span
      className={`badge badge-${type}`}
      style={{ padding, fontSize, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
        }}
      />
      {status}
    </span>
  );
}
