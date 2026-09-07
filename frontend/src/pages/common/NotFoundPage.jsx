import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '12px',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', maxWidth: '400px', marginBottom: '24px' }}>
        The requested CRM module or route does not exist or has been relocated within the navigation structure.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" icon={Home} onClick={() => navigate(`/${role}/dashboard`)}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
