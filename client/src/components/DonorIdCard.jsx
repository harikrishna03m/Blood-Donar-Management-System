import React from 'react';
import BloodGroupBadge from './BloodGroupBadge';
import { Droplets, ShieldCheck, Printer } from 'lucide-react';

const DonorIdCard = ({ donor }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!donor) return null;

  const donorId = `LPD-${(donor._id || donor.id || '000000').substring(0, 8).toUpperCase()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      {/* The Physical Card Simulation */}
      <div
        id="donor-card-print"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Subtle decorative background watermarks */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            opacity: 0.08,
            color: '#ffffff',
            pointerEvents: 'none',
          }}
        >
          <Droplets size={180} />
        </div>

        {/* Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                background: 'var(--crimson-gradient)',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              <Droplets size={16} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                Life<span style={{ color: '#ef4444' }}>Pulse</span>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Official Donor Identity
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'rgba(22, 163, 74, 0.2)',
              border: '1px solid #16a34a',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              color: '#4ade80',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={12} />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Donor Full Name
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
              {donor.name}
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginTop: '2px' }}>
              {donor.city} {donor.state ? `, ${donor.state}` : ''}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>
              {donor.phone}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <BloodGroupBadge bloodGroup={donor.bloodGroup} size="lg" solid />
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
              BLOOD GROUP
            </span>
          </div>
        </div>

        {/* Card Footer Details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', display: 'block' }}>Donor ID</span>
            <strong style={{ color: '#f8fafc', letterSpacing: '0.05em' }}>{donorId}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block' }}>Lifetime Donations</span>
            <strong style={{ color: '#ef4444' }}>{donor.totalDonations || 0} Saved Lives</strong>
          </div>
        </div>
      </div>

      {/* Print Action */}
      <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
        <Printer size={15} />
        <span>Print Donor ID Card</span>
      </button>
    </div>
  );
};

export default DonorIdCard;
