import React from 'react';
import BloodGroupBadge from './BloodGroupBadge';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const RequestCard = ({ request, onPledge, onDirectContact }) => {
  const urgencyBadgeClass = {
    Urgent: 'badge-urgent',
    Moderate: 'badge-moderate',
    Routine: 'badge-routine',
  }[request.urgency] || 'badge-routine';

  const totalPledgedUnits = (request.pledges || [])
    .filter((p) => p.status === 'Pledged' || p.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.unitsPledged || 1), 0);

  const isFulfilled =
    request.status === 'Fulfilled' || totalPledgedUnits >= request.unitsNeeded;

  const neededDate = request.neededByDate
    ? new Date(request.neededByDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Immediate';

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderLeft: request.urgency === 'Urgent' ? '4px solid #dc2626' : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BloodGroupBadge bloodGroup={request.bloodGroup} size="md" solid />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
              {request.patientName}
            </h4>
            <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700 }}>
              {request.unitsNeeded} {request.unitsNeeded === 1 ? 'Unit' : 'Units'} Needed
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <span className={`badge-status ${urgencyBadgeClass}`}>
            {request.urgency === 'Urgent' && <AlertTriangle size={12} />}
            {request.urgency}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: request.status === 'Fulfilled' ? '#16a34a' : '#64748b',
            }}
          >
            {request.status}
          </span>
        </div>
      </div>

      {/* Hospital & Location Details */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '10px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: '0.84rem',
          marginBottom: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
          <Building2 size={15} color="#dc2626" style={{ flexShrink: 0 }} />
          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.hospitalName}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          <MapPin size={15} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>
            {request.city} {request.hospitalAddress ? `• ${request.hospitalAddress}` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          <Clock size={15} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>Needed by: <strong>{neededDate}</strong></span>
        </div>
      </div>

      {/* Notes / Reason */}
      {(request.medicalReason || request.additionalNotes) && (
        <p
          style={{
            fontSize: '0.84rem',
            color: '#475569',
            marginBottom: '1rem',
            lineHeight: 1.4,
          }}
        >
          {request.medicalReason}
          {request.additionalNotes ? ` — ${request.additionalNotes}` : ''}
        </p>
      )}

      {/* Pledge Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '0.35rem',
          }}
        >
          <span>Pledged Donations</span>
          <span style={{ color: totalPledgedUnits > 0 ? '#16a34a' : '#64748b' }}>
            {totalPledgedUnits} / {request.unitsNeeded} Units
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (totalPledgedUnits / request.unitsNeeded) * 100)}%`,
              height: '100%',
              background: totalPledgedUnits >= request.unitsNeeded ? '#16a34a' : '#dc2626',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <a
            href={`tel:${request.contactPhone.replace(/[^0-9+]/g, '')}`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            <Phone size={14} color="#dc2626" />
            <span>Call Contact</span>
          </a>

          <button
            onClick={() => onPledge && onPledge(request)}
            disabled={isFulfilled}
            className={`btn btn-sm ${
              isFulfilled ? 'btn-secondary' : 'btn-primary'
            }`}
            style={{ fontSize: '0.82rem' }}
          >
            {isFulfilled ? (
              <>
                <CheckCircle2 size={14} color="#16a34a" />
                <span>Fulfilled</span>
              </>
            ) : (
              <>
                <HeartHandshake size={14} />
                <span>Pledge Blood</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
