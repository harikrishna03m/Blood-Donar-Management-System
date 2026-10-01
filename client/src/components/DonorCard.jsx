import React from 'react';
import BloodGroupBadge from './BloodGroupBadge';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

const DonorCard = ({ donor, onRequestDirectly }) => {
  const getEligibility = (lastDate) => {
    if (!lastDate) {
      return { eligible: true, text: 'Eligible to Donate (Never or >90 days)' };
    }
    const diffDays = Math.floor(
      (new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 90) {
      return { eligible: true, text: `Eligible (Last donation: ${diffDays}d ago)` };
    } else {
      const remaining = 90 - diffDays;
      return {
        eligible: false,
        text: `Resting (${remaining} days until next donation)`,
      };
    }
  };

  const eligibility = getEligibility(donor.lastDonationDate);
  const cleanPhone = donor.phone ? donor.phone.replace(/[^0-9+]/g, '') : '';

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BloodGroupBadge bloodGroup={donor.bloodGroup} size="md" solid />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{donor.name}</h4>
              {donor.isVerified && (
                <CheckCircle size={15} color="#16a34a" title="Verified Donor" />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              <MapPin size={13} color="#dc2626" />
              <span>{donor.city}{donor.state ? `, ${donor.state}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Availability Badge */}
        <span
          className={`badge-status ${
            donor.isAvailable ? 'badge-available' : 'badge-busy'
          }`}
        >
          {donor.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Bio / Quote if available */}
      {donor.bio && (
        <p
          style={{
            fontSize: '0.85rem',
            color: '#475569',
            fontStyle: 'italic',
            marginBottom: '1rem',
            lineHeight: 1.4,
          }}
        >
          "{donor.bio}"
        </p>
      )}

      {/* Info Pills */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '10px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          fontSize: '0.82rem',
          color: '#334155',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
            <Award size={14} color="#dc2626" />
            Total Donations:
          </span>
          <strong style={{ color: '#0f172a' }}>{donor.totalDonations || 0} times</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
            <Calendar size={14} color="#dc2626" />
            Status:
          </span>
          <span
            style={{
              fontWeight: 600,
              color: eligibility.eligible ? '#16a34a' : '#ea580c',
            }}
          >
            {eligibility.text}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <a
            href={`tel:${cleanPhone}`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem', padding: '0.5rem' }}
          >
            <Phone size={14} color="#dc2626" />
            <span>Call Donor</span>
          </a>
          <a
            href={`mailto:${donor.email}?subject=Urgent Blood Request from LifePulse&body=Hello ${donor.name}, I found your contact on LifePulse Blood Donor Network regarding an urgent blood requirement.`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem', padding: '0.5rem' }}
          >
            <Mail size={14} color="#dc2626" />
            <span>Email</span>
          </a>
        </div>

        {onRequestDirectly && (
          <button
            onClick={() => onRequestDirectly(donor)}
            className="btn btn-outline-crimson btn-sm"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <MessageSquare size={14} />
            <span>Request Assistance Directly</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DonorCard;
