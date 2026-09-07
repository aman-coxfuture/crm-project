import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ customItems }) {
  const location = useLocation();

  if (customItems && customItems.length > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
        {customItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />}
            {item.path ? (
              <Link to={item.path} style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Generate automatically from path
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatLabel = (str) => {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <Home size={13} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            {isLast ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatLabel(name)}</span>
            ) : (
              <Link to={routeTo} style={{ color: 'var(--text-secondary)' }}>
                {formatLabel(name)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
