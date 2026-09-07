import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pills'
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: variant === 'pills' ? '6px' : '20px',
        borderBottom: variant === 'underline' ? '1px solid var(--border-subtle)' : 'none',
        paddingBottom: variant === 'underline' ? '0' : '0',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const count = typeof tab === 'object' ? tab.count : undefined;
        const isActive = activeTab === id;

        if (variant === 'pills') {
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--btn-primary-bg)' : 'transparent',
                color: isActive ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--btn-primary-bg)' : 'var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {label}
              {count !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-tertiary)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              padding: '10px 4px',
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            {label}
            {count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--bg-active)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
