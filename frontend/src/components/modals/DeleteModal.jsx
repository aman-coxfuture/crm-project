import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  itemName,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <AlertTriangle size={16} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{ borderRadius: '50%', color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
          {itemName && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {itemName}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
