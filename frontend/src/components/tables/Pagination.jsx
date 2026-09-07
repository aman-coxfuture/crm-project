import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize && totalPages === 1) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '13px',
          color: 'var(--text-tertiary)',
        }}
      >
        <span>Showing all {totalItems} entries</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> to{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
