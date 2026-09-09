import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last term',
  trendPositive = true,
  color = 'indigo',
  subtitle,
  onClick,
}) {
  const colorMap = {
    indigo: { bg: 'rgba(99, 102, 241, 0.12)', text: '#4f46e5', border: 'rgba(99, 102, 241, 0.2)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
    sky: { bg: 'rgba(14, 165, 233, 0.12)', text: '#0ea5e9', border: 'rgba(14, 165, 233, 0.2)' },
    purple: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
    rose: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="card card-hover"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentTheme.bg,
              color: currentTheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', marginTop: '6px' }}>
          {trend !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 700,
                color: trendPositive ? 'var(--success-text)' : 'var(--danger-text)',
                backgroundColor: trendPositive ? 'var(--success-light)' : 'var(--danger-light)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {trendPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {trend}
            </span>
          )}
          <span style={{ color: 'var(--text-tertiary)' }}>{subtitle || trendLabel}</span>
        </div>
      )}
    </div>
  );
}
