import React from 'react';

export default function Select({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  value,
  onChange,
  placeholder = 'Select option...',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && <label htmlFor={selectId} className="form-label">{label}</label>}
      <select
        id={selectId}
        className="form-select"
        value={value}
        onChange={onChange}
        style={{ borderColor: error ? '#111827' : undefined }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs font-medium" style={{ color: '#111827', marginTop: '2px' }}>{error}</span>}
      {helperText && !error && <span className="text-xs text-muted" style={{ marginTop: '2px' }}>{helperText}</span>}
    </div>
  );
}
