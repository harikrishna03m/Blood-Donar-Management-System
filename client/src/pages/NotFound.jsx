import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
      }}
    >
      <div className="container" style={{ maxWidth: '520px' }}>
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Droplets size={32} />
          </div>

          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            404
          </h1>
          <h2 style={{ fontSize: '1.4rem', color: '#334155', marginBottom: '0.75rem' }}>
            Page Not Found
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
            The blood management page or resource you are looking for might have been moved or is temporarily unavailable.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to="/" className="btn btn-primary">
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
            <Link to="/donors" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Find Donors</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
