import React from 'react';

export function BarChart({ data = [], height = 180 }) {
  // data: [{ label: 'Jan', value: 45, secondary: 30 }]
  const maxValue = Math.max(...data.flatMap((d) => [d.value || 0, d.secondary || 0]), 10);

  return (
    <div style={{ width: '100%', height: `${height}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '12px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {data.map((item, idx) => {
          const heightPct1 = (item.value / maxValue) * 100;
          const heightPct2 = item.secondary !== undefined ? (item.secondary / maxValue) * 100 : null;

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center', height: '100%' }}>
                <div
                  title={`${item.label}: ${item.value}`}
                  style={{
                    width: heightPct2 !== null ? '40%' : '60%',
                    maxWidth: '28px',
                    height: `${Math.max(heightPct1, 4)}%`,
                    backgroundColor: '#111827',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                {heightPct2 !== null && (
                  <div
                    title={`${item.label} (Secondary): ${item.secondary}`}
                    style={{
                      width: '40%',
                      maxWidth: '28px',
                      height: `${Math.max(heightPct2, 4)}%`,
                      backgroundColor: '#9ca3af',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({ data = [], size = 150 }) {
  // data: [{ label: 'School', value: 40, color: '#111827' }, { label: 'College', value: 35, color: '#6b7280' }, ...]
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth="12"
          />
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -(accumulated / total) * circumference;
            accumulated += item.value;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color || (idx === 0 ? '#111827' : idx === 1 ? '#6b7280' : idx === 2 ? '#9ca3af' : '#d1d5db')}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{total.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Total</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '130px' }}>
        {data.map((item, idx) => {
          const color = item.color || (idx === 0 ? '#111827' : idx === 1 ? '#6b7280' : idx === 2 ? '#9ca3af' : '#d1d5db');
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value.toLocaleString()}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressBar({ label, value, max = 100, subtitle }) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{value} / {max} ({pct}%)</span>
      </div>
      <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: '#111827',
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      {subtitle && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>{subtitle}</span>}
    </div>
  );
}

export default function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="text-xs text-muted" style={{ marginTop: '2px' }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
