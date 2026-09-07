import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

export default function ViewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  data = {},
  fields = [], // [{ label: 'Email', key: 'email', render: (val) => ... }]
  maxWidth = '560px',
  actions,
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
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {fields.map((field) => {
              const val = data[field.key];
              return (
                <div
                  key={field.key}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>
                    {field.label}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {field.render ? field.render(val, data) : val ?? '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          {actions}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
