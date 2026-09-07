import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  helperText,
  id,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className={Icon ? 'input-with-icon' : ''}>
        {Icon && <Icon size={16} />}
        <input
          id={inputId}
          className="form-input"
          style={{ borderColor: error ? '#111827' : undefined }}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium" style={{ color: '#111827', marginTop: '2px' }}>{error}</span>}
      {helperText && !error && <span className="text-xs text-muted" style={{ marginTop: '2px' }}>{helperText}</span>}
    </div>
  );
}
