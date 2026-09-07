import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria. Try adjusting your filters or add a new record.',
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)',
        border: '1px dashed var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--text-secondary)',
        }}
      >
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '380px', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>
      {actionLabel && (
        <Button variant="primary" size="sm" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
