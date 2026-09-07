import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  maxWidth = '560px',
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted" style={{ marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{ borderRadius: '50%', color: 'var(--text-tertiary)' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
            {children}
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
