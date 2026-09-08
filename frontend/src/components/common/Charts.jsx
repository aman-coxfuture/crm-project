import React from 'react';

// 1. Simple Bar Chart
export function BarChart({ data = [], height = 200, color = '#4f46e5' }) {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 10);

  return (
    <div style={{ width: '100%', height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '20px' }}>
      {data.map((item, idx) => {
        const pct = (item.value / maxValue) * 100;
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {item.value}
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: '42px',
                height: `${Math.max(pct, 6)}%`,
                backgroundColor: item.color || color,
                borderRadius: '6px 6px 2px 2px',
                transition: 'all 0.4s ease',
              }}
              title={`${item.label}: ${item.value}`}
            />
            <div
              style={{
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '65px',
                textAlign: 'center',
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 2. Comparison Double Bar Chart
export function ComparisonBarChart({ data = [], height = 220 }) {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.flatMap((d) => [d.value1 || 0, d.value2 || 0]), 10);

  return (
    <div style={{ width: '100%', height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '24px' }}>
      {data.map((item, idx) => {
        const pct1 = ((item.value1 || 0) / maxValue) * 100;
        const pct2 = ((item.value2 || 0) / maxValue) * 100;
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '80%', width: '100%', justifyContent: 'center' }}>
              <div
                style={{
                  width: '45%',
                  maxWidth: '18px',
                  height: `${Math.max(pct1, 5)}%`,
                  backgroundColor: '#10b981',
                  borderRadius: '4px 4px 1px 1px',
                  transition: 'height 0.4s ease',
                }}
                title={`${item.label1 || 'Present'}: ${item.value1}`}
              />
              <div
                style={{
                  width: '45%',
                  maxWidth: '18px',
                  height: `${Math.max(pct2, 5)}%`,
                  backgroundColor: '#ef4444',
                  borderRadius: '4px 4px 1px 1px',
                  transition: 'height 0.4s ease',
                }}
                title={`${item.label2 || 'Absent'}: ${item.value2}`}
              />
            </div>
            <div
              style={{
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                marginTop: '8px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {item.day || item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. Donut / Pie Chart
export function DonutChart({ data = [], size = 160, strokeWidth = 24 }) {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || '#4f46e5'}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
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
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {total}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Total
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px' }}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color || '#4f46e5',
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.value} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Trend Line Chart
export function TrendLineChart({ data = [], height = 180, color = '#6366f1' }) {
  if (!data || data.length === 0) return null;
  const width = 500;
  const padding = 20;
  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const minValue = Math.min(...data.map((d) => d.value), 0);

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points.join(' L ')} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill={`url(#grad-${color})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => {
          const [x, y] = points[i].split(',').map(Number);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4.5" fill="var(--bg-secondary)" stroke={color} strokeWidth="2.5" />
              <text
                x={x}
                y={height - 2}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-tertiary)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
