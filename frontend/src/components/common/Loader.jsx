import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading data...', size = 24 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: '12px',
      }}
    >
      <Loader2
        size={size}
        style={{
          color: 'var(--text-primary)',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
