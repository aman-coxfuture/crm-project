import React from 'react';

export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  helperText,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              display: 'flex',
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="form-input"
          style={{
            paddingLeft: Icon ? '38px' : '12px',
            borderColor: error ? 'var(--danger)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{helperText}</span>
      )}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Select option...',
  disabled = false,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        className="form-select"
        style={{ borderColor: error ? 'var(--danger)' : undefined }}
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
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
  required = false,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="form-textarea"
        style={{ borderColor: error ? 'var(--danger)' : undefined }}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
