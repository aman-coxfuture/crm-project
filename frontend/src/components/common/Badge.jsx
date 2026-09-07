import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'active' | 'success' | 'pending' | 'warning' | 'inactive' | 'outline' | 'default'
  className = '',
  dot = false,
}) {
  const normVariant = variant ? variant.toLowerCase() : 'default';
  let badgeClass = 'badge';

  if (['active', 'success', 'paid', 'approved', 'published', 'completed'].includes(normVariant)) {
    badgeClass += ' badge-active';
  } else if (['pending', 'warning', 'partial', 'under review', 'waitlisted', 'scheduled', 'upcoming'].includes(normVariant)) {
    badgeClass += ' badge-pending';
  } else if (['inactive', 'danger', 'overdue', 'rejected', 'deleted', 'disabled'].includes(normVariant)) {
    badgeClass += ' badge-inactive';
  } else if (normVariant === 'outline') {
    badgeClass += ' badge-outline';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: ['active', 'success', 'paid', 'approved'].includes(normVariant) ? '#ffffff' : '#111827',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
