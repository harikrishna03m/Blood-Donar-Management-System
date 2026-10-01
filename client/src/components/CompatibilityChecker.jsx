import React, { useState } from 'react';
import BloodGroupBadge from './BloodGroupBadge';
import { ArrowRight, ArrowLeft, HeartHandshake, ShieldCheck } from 'lucide-react';

const compatibilityData = {
  'O-': {
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    note: 'Universal Red Blood Cell Donor. Critical in trauma and emergency units!',
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-'],
    note: 'Most common blood type in the world. Essential for general transfusions.',
  },
  'A-': {
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['A-', 'O-'],
    note: 'Can donate to all A and AB types regardless of Rh factor.',
  },
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-'],
    note: 'Second most common blood type. In continuous clinical demand.',
  },
  'B-': {
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['B-', 'O-'],
    note: 'Rare blood type. Donations are crucial for matched hospital reserves.',
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-'],
    note: 'Widely needed across surgical and chronic patient treatments.',
  },
  'AB-': {
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    note: 'Rarest blood type. Universal platelet and plasma donor.',
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    note: 'Universal Red Blood Cell Recipient. Can receive blood from any blood type!',
  },
};

const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const CompatibilityChecker = () => {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const info = compatibilityData[selectedGroup];

  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff7f7 100%)', border: '1.5px solid #fee2e2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#fee2e2', padding: '0.6rem', borderRadius: '12px', color: '#dc2626' }}>
          <HeartHandshake size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Blood Compatibility Matrix</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Select your blood group to check donor and recipient matching rules
          </p>
        </div>
      </div>

      {/* Selector pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {bloodGroups.map((bg) => (
          <button
            key={bg}
            onClick={() => setSelectedGroup(bg)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: selectedGroup === bg ? '2px solid #dc2626' : '1px solid #e2e8f0',
              background: selectedGroup === bg ? '#dc2626' : '#ffffff',
              color: selectedGroup === bg ? '#ffffff' : '#334155',
              boxShadow: selectedGroup === bg ? '0 4px 10px rgba(220, 38, 38, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Results grid */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Can Donate To */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <ArrowRight size={18} />
            <span>You Can Donate Red Blood Cells To:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {info.giveTo.map((bg) => (
              <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" solid={bg === selectedGroup} />
            ))}
          </div>
        </div>

        {/* Can Receive From */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <ArrowLeft size={18} />
            <span>You Can Receive Blood From:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {info.receiveFrom.map((bg) => (
              <BloodGroupBadge key={bg} bloodGroup={bg} size="sm" solid={bg === selectedGroup} />
            ))}
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid #dc2626', fontSize: '0.85rem', color: '#334155' }}>
        <ShieldCheck size={18} color="#dc2626" style={{ flexShrink: 0 }} />
        <span><strong>Fact:</strong> {info.note}</span>
      </div>
    </div>
  );
};

export default CompatibilityChecker;
