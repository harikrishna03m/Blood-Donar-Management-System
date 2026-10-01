import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CompatibilityChecker from '../components/CompatibilityChecker';
import RequestCard from '../components/RequestCard';
import Modal from '../components/Modal';
import {
  Search,
  HeartHandshake,
  Droplets,
  ShieldCheck,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Home = () => {
  const [stats, setStats] = useState({
    totalDonors: 120,
    availableDonors: 95,
    activeRequests: 8,
    fulfilledRequests: 64,
    totalDonations: 180,
  });
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Quick Pledge Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [pledgeUnits, setPledgeUnits] = useState(1);
  const [pledgeNote, setPledgeNote] = useState('');
  const [submittingPledge, setSubmittingPledge] = useState(false);

  const { isAuthenticated, isDonor } = useAuth();
  const { success, error } = useNotification();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, urgentRes] = await Promise.all([
          api.get('/donors/stats').catch(() => null),
          api.get('/requests/urgent').catch(() => null),
        ]);

        if (statsRes?.data?.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }

        if (urgentRes?.data?.success) {
          setUrgentRequests(urgentRes.data.requests || []);
        }
      } catch (err) {
        console.warn('Home data load notice:', err.message);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleOpenPledge = (request) => {
    if (!isAuthenticated) {
      error('Please log in as a donor to submit an official pledge.');
      return;
    }
    if (!isDonor) {
      error('Only registered donors can submit pledges.');
      return;
    }
    setSelectedRequest(request);
    setIsPledgeModalOpen(true);
  };

  const handleSubmitPledge = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmittingPledge(true);
    try {
      const res = await api.post(`/requests/${selectedRequest._id}/pledge`, {
        unitsPledged: pledgeUnits,
        note: pledgeNote,
      });

      if (res.data.success) {
        success('Thank you! Your pledge has been registered.');
        setIsPledgeModalOpen(false);
        setPledgeNote('');
        // Refresh urgent requests
        const updated = await api.get('/requests/urgent');
        if (updated.data.success) {
          setUrgentRequests(updated.data.requests);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to submit pledge');
    } finally {
      setSubmittingPledge(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(circle at 50% 10%, #fff5f5 0%, #ffffff 70%, #f8fafc 100%)',
          padding: '4rem 0 3.5rem',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {/* Mission Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#fee2e2',
                color: '#dc2626',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} />
              <span>Free, Fast & Direct Blood Donation Registry</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                color: '#0f172a',
                lineHeight: 1.18,
                marginBottom: '1.25rem',
                fontWeight: 800,
              }}
            >
              Every Drop Counts. <br />
              <span style={{ color: '#dc2626' }}>Connect With Donors</span> in Minutes.
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '2.25rem',
                maxWidth: '680px',
                marginInline: 'auto',
              }}
            >
              LifePulse bridges the gap between voluntary blood donors and families facing critical medical emergencies. Fast, verified, and free.
            </p>

            {/* Primary Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '3rem',
              }}
            >
              <Link to="/register" className="btn btn-primary btn-lg">
                <HeartHandshake size={20} />
                <span>Register as a Donor</span>
              </Link>
              <Link to="/donors" className="btn btn-secondary btn-lg">
                <Search size={20} color="#dc2626" />
                <span>Find a Donor</span>
              </Link>
              <Link to="/requests" className="btn btn-outline-crimson btn-lg">
                <Activity size={20} />
                <span>Browse Blood Requests</span>
              </Link>
            </div>

            {/* Live Stats Row */}
            <div
              className="grid-4"
              style={{
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', display: 'block' }}>
                  {stats.totalDonors || 120}+
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Registered Donors
                </span>
              </div>
              <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', display: 'block' }}>
                  {stats.availableDonors || 95}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Currently Available
                </span>
              </div>
              <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', display: 'block' }}>
                  {stats.activeRequests || 4}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Active Emergency Needs
                </span>
              </div>
              <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                  {stats.fulfilledRequests + stats.totalDonations || 150}+
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Lives Touched
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Emergency Requests Section */}
      {urgentRequests.length > 0 && (
        <section style={{ padding: '3.5rem 0', background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
          <div className="container">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', animation: 'pulse-border 1.5s infinite' }} />
                  <span>Immediate Life-Saving Assistance Required</span>
                </div>
                <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginTop: '0.35rem' }}>
                  Urgent Blood Requests
                </h2>
              </div>
              <Link to="/requests" className="btn btn-outline-crimson btn-sm">
                <span>View All Requests</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid-3">
              {urgentRequests.slice(0, 3).map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  onPledge={handleOpenPledge}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simple 3-Step Process
            </span>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.35rem' }}>
              How LifePulse Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
              Designed to connect donors and families directly without intermediaries or delays.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            {/* Step 1 */}
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#dc2626',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                1
              </div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#fee2e2',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: '#dc2626',
                }}
              >
                <Users size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Register or Search</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Create a verified donor account with your blood group and city, or quickly search for available donors in your area.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#dc2626',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                2
              </div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#fee2e2',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: '#dc2626',
                }}
              >
                <PhoneCall size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Direct Contact</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Connect directly via phone call, email, or pledge donation response to reach hospital patients right on time.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#dc2626',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              >
                3
              </div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#fee2e2',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: '#dc2626',
                }}
              >
                <Award size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>Save a Life</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Complete the donation at the hospital or blood center, receive your verified donor certificate, and track your impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility Matrix & Educational Section */}
      <section style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Medical Guidance
              </span>
              <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.35rem 0 1rem' }}>
                Understand Blood Types & Compatibility
              </h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Knowing compatibility is critical during emergency transfusions. Transfusing incompatible red blood cells can cause adverse immunological reactions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '8px', color: '#dc2626', marginTop: '2px' }}>
                    <Droplets size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#0f172a' }}>O- Negative: Universal Red Cell Donor</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Can safely donate to any human regardless of their blood type.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ background: '#fee2e2', padding: '0.4rem', borderRadius: '8px', color: '#dc2626', marginTop: '2px' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#0f172a' }}>AB+ Positive: Universal Recipient</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Can receive red blood cells from any blood group during emergencies.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/donors" className="btn btn-primary">
                <span>Find Compatible Donors</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div>
              <CompatibilityChecker />
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials & Impact */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Community Stories
            </span>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.35rem' }}>
              Voices from the LifePulse Network
            </h2>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem', background: '#f8fafc' }}>
              <p style={{ color: '#334155', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "When my brother had an urgent surgery requiring rare O- negative blood, we found 2 active donors in our city within 20 minutes through LifePulse. Truly a lifesaver."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  DL
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>David Lawson</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Recipient Family Member, NYC</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem', background: '#f8fafc' }}>
              <p style={{ color: '#334155', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "I have donated 6 times over the past two years. Being able to see direct hospital requests and download my donor ID card gives me tremendous pride."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  SJ
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Sarah Jenkins</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Active O- Donor (6 Donations)</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem', background: '#f8fafc' }}>
              <p style={{ color: '#334155', fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "As a hospital coordinator, having a clean portal where we can verify available donors in real time significantly reduces patient waiting times in critical emergencies."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  DR
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Dr. Raymond Ortiz</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emergency Blood Coordinator</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: '4rem 0', background: 'var(--crimson-gradient)', color: '#ffffff' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '1rem', fontWeight: 800 }}>
            Ready to Become Someone's Hero?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#fecdd3', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Joining takes less than 2 minutes. Your willingness to donate can save a parent, child, or neighbor in need.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: '#dc2626', fontWeight: 700 }}>
              Register as Donor Today
            </Link>
            <Link to="/requests" className="btn btn-outline-crimson btn-lg" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
              Browse Blood Needs
            </Link>
          </div>
        </div>
      </section>

      {/* Pledge Modal */}
      <Modal
        isOpen={isPledgeModalOpen}
        onClose={() => setIsPledgeModalOpen(false)}
        title="Pledge Blood Donation"
      >
        {selectedRequest && (
          <form onSubmit={handleSubmitPledge}>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.75rem' }}>
                You are pledging to donate blood for <strong>{selectedRequest.patientName}</strong> at <strong>{selectedRequest.hospitalName}</strong> ({selectedRequest.city}).
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Units Pledged</label>
              <input
                type="number"
                min="1"
                max={selectedRequest.unitsNeeded || 4}
                value={pledgeUnits}
                onChange={(e) => setPledgeUnits(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Optional Note for Patient / Hospital</label>
              <textarea
                rows="3"
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
                placeholder="e.g., I can visit the hospital today afternoon between 2 PM - 4 PM."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsPledgeModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPledge}
                className="btn btn-primary"
              >
                {submittingPledge ? 'Submitting...' : 'Confirm Pledge'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Home;
