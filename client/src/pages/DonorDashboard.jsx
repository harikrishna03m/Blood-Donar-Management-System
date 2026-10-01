import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import DonorIdCard from '../components/DonorIdCard';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import {
  User,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Building2,
} from 'lucide-react';

const DonorDashboard = () => {
  const { user, updateProfile, logout } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    age: user?.age || 25,
    gender: user?.gender || 'Prefer not to say',
    bio: user?.bio || '',
    emergencyContact: user?.emergencyContact || '',
    isAvailable: user?.isAvailable ?? true,
    lastDonationDate: user?.lastDonationDate ? user.lastDonationDate.split('T')[0] : '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Log Donation Modal
  const [isLogDonationModalOpen, setIsLogDonationModalOpen] = useState(false);
  const [donationFormData, setDonationFormData] = useState({
    hospitalName: '',
    city: user?.city || '',
    recipientName: '',
    units: 1,
    donationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  // Load donor donations and pledges
  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [donationsRes, pledgesRes] = await Promise.all([
        api.get('/donors/me/donations').catch(() => ({ data: { donations: [] } })),
        api.get('/donors/me/pledges').catch(() => ({ data: { requests: [] } })),
      ]);

      if (donationsRes.data?.success) {
        setDonations(donationsRes.data.donations || []);
      }
      if (pledgesRes.data?.success) {
        setPledges(pledgesRes.data.requests || []);
      }
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        age: user.age || 25,
        gender: user.gender || 'Prefer not to say',
        bio: user.bio || '',
        emergencyContact: user.emergencyContact || '',
        isAvailable: user.isAvailable ?? true,
        lastDonationDate: user.lastDonationDate ? user.lastDonationDate.split('T')[0] : '',
      });
      loadDashboardData();
    }
  }, [user]);

  // Eligibility calculation
  const getEligibilityInfo = () => {
    if (!user?.lastDonationDate) {
      return {
        isEligible: true,
        daysSince: 999,
        daysRemaining: 0,
        text: 'Eligible to Donate Right Now!',
      };
    }
    const daysSince = Math.floor(
      (new Date() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 90) {
      return {
        isEligible: true,
        daysSince,
        daysRemaining: 0,
        text: `Eligible to Donate (${daysSince} days since last donation)`,
      };
    } else {
      const remaining = 90 - daysSince;
      return {
        isEligible: false,
        daysSince,
        daysRemaining: remaining,
        text: `Resting (${remaining} days until next donation is recommended)`,
      };
    }
  };

  const eligibility = getEligibilityInfo();

  // Toggle availability directly
  const handleToggleAvailability = async () => {
    try {
      const newStatus = !user.isAvailable;
      await updateProfile({ isAvailable: newStatus });
      success(
        newStatus
          ? 'You are now marked as AVAILABLE for urgent requests!'
          : 'You are now marked as resting/temporarily unavailable.'
      );
    } catch (err) {
      error(err.message || 'Failed to toggle availability');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(editFormData);
      setIsEditModalOpen(false);
    } catch (err) {
      // handled
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogDonationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingDonation(true);
    try {
      const res = await api.post('/donors/me/donations', donationFormData);
      if (res.data.success) {
        // Trigger celebratory confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#ef4444', '#16a34a', '#ffd700'],
        });

        success(res.data.message || 'Donation logged! Thank you for saving a life.');
        setIsLogDonationModalOpen(false);
        setDonationFormData({
          hospitalName: '',
          city: user?.city || '',
          recipientName: '',
          units: 1,
          donationDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      error(err.message || 'Failed to log donation');
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Welcome Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Sparkles size={16} />
              <span>Donor Member Portal</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0.25rem 0 0' }}>
              Hello, {user?.name || 'Donor'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
              Manage your blood donation records, readiness status, and emergency response pledges.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsLogDonationModalOpen(true)}
              className="btn btn-primary"
            >
              <Heart size={18} />
              <span>Log New Donation</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Top Status & Metrics Grid */}
        <div className="grid-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Blood & Readiness Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#ffffff' }}>
            <BloodGroupBadge bloodGroup={user?.bloodGroup || 'O+'} size="lg" solid />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Your Blood Group
              </span>
              <h3 style={{ fontSize: '1.3rem', margin: '0.1rem 0 0.3rem', color: '#0f172a' }}>
                Group {user?.bloodGroup}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: user?.isAvailable ? '#16a34a' : '#94a3b8',
                  }}
                />
                <span style={{ fontWeight: 600, color: user?.isAvailable ? '#16a34a' : '#64748b' }}>
                  {user?.isAvailable ? 'Available to Donate' : 'Temporarily Resting'}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility Indicator */}
          <div className="card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Donation Interval
              </span>
              <Calendar size={18} color="#dc2626" />
            </div>
            <h4
              style={{
                fontSize: '1.1rem',
                margin: '0 0 0.4rem',
                color: eligibility.isEligible ? '#16a34a' : '#ea580c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {eligibility.isEligible ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              {eligibility.isEligible ? 'Eligible Now' : `${eligibility.daysRemaining} Days Remaining`}
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {eligibility.text}
            </span>
          </div>

          {/* Lifetime Impact Card */}
          <div className="card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Life Impact
              </span>
              <Award size={20} color="#dc2626" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>
                {user?.totalDonations || donations.length || 0}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                Donations Completed
              </span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              Estimated up to {(user?.totalDonations || donations.length || 0) * 3} lives supported
            </span>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid-2" style={{ gap: '2rem', marginBottom: '2.5rem', gridTemplateColumns: '1fr 1.3fr' }}>
          {/* Left Column: Profile Card & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Donor Profile Details</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <User size={16} color="#dc2626" />
                  <span style={{ color: '#64748b', width: '110px' }}>Name:</span>
                  <strong style={{ color: '#0f172a' }}>{user?.name}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Mail size={16} color="#dc2626" />
                  <span style={{ color: '#64748b', width: '110px' }}>Email:</span>
                  <span style={{ color: '#0f172a' }}>{user?.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Phone size={16} color="#dc2626" />
                  <span style={{ color: '#64748b', width: '110px' }}>Phone:</span>
                  <span style={{ color: '#0f172a' }}>{user?.phone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <MapPin size={16} color="#dc2626" />
                  <span style={{ color: '#64748b', width: '110px' }}>Location:</span>
                  <span style={{ color: '#0f172a' }}>{user?.city}{user?.state ? `, ${user.state}` : ''}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={16} color="#dc2626" />
                  <span style={{ color: '#64748b', width: '110px' }}>Age & Gender:</span>
                  <span style={{ color: '#0f172a' }}>{user?.age} yrs • {user?.gender}</span>
                </div>
              </div>

              {user?.bio && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Donor Bio / Statement
                  </span>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#334155', fontStyle: 'italic' }}>
                    "{user.bio}"
                  </p>
                </div>
              )}

              {/* Direct Availability Toggle Control */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                    Emergency Availability
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Allow hospitals and patients to contact you
                  </span>
                </div>

                <button
                  onClick={handleToggleAvailability}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: user?.isAvailable ? '1.5px solid #16a34a' : '1.5px solid #94a3b8',
                    color: user?.isAvailable ? '#16a34a' : '#64748b',
                    background: user?.isAvailable ? '#f0fdf4' : '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user?.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{user?.isAvailable ? 'Active' : 'Resting'}</span>
                </button>
              </div>
            </div>

            {/* Digital Donor ID Card Preview */}
            <div className="card" style={{ background: '#ffffff', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                Your Digital Donor ID
              </h3>
              <DonorIdCard donor={user} />
            </div>
          </div>

          {/* Right Column: Donation History & Active Pledges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Active Pledges */}
            <div className="card" style={{ background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Heart size={18} color="#dc2626" />
                  <span>My Active Pledges</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {pledges.length} Pledged Needs
                </span>
              </div>

              {pledges.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', margin: 0, padding: '1rem 0' }}>
                  You have no pending pledges. Check the{' '}
                  <span
                    onClick={() => navigate('/requests')}
                    style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Blood Requests
                  </span>{' '}
                  page to respond to local patients.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pledges.map((req) => (
                    <div
                      key={req._id}
                      style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                            {req.patientName}
                          </strong>
                          <BloodGroupBadge bloodGroup={req.bloodGroup} size="sm" solid />
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {req.hospitalName} ({req.city})
                        </span>
                      </div>
                      <span className="badge-status badge-urgent" style={{ fontSize: '0.75rem' }}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Donation History Table */}
            <div className="card" style={{ background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#dc2626" />
                  <span>Donation History Records</span>
                </h3>
                <button
                  onClick={() => setIsLogDonationModalOpen(true)}
                  className="btn btn-outline-crimson btn-sm"
                >
                  <PlusCircle size={14} />
                  <span>Log Donation</span>
                </button>
              </div>

              {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <Calendar size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                    No donation records logged yet. Click "Log New Donation" after donating at a hospital to record your contribution!
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hospital / Clinic</th>
                        <th>City</th>
                        <th>Units</th>
                        <th>Certificate #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((d) => (
                        <tr key={d._id}>
                          <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                          <td>
                            <strong>{d.hospitalName}</strong>
                            {d.recipientName && (
                              <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                                For: {d.recipientName}
                              </span>
                            )}
                          </td>
                          <td>{d.city}</td>
                          <td>{d.units || 1} Unit</td>
                          <td>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              {d.certificateNumber || 'CERT-VERIFIED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Donor Profile"
      >
        <form onSubmit={handleProfileSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                required
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Region</label>
              <input
                type="text"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                min="18"
                max="65"
                value={editFormData.age}
                onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                value={editFormData.gender}
                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                className="form-select"
              >
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Last Donation Date</label>
              <input
                type="date"
                value={editFormData.lastDonationDate}
                onChange={(e) => setEditFormData({ ...editFormData, lastDonationDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Donor Bio / Availability Notes</label>
            <textarea
              rows="2"
              value={editFormData.bio}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn btn-primary"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Donation Modal */}
      <Modal
        isOpen={isLogDonationModalOpen}
        onClose={() => setIsLogDonationModalOpen(false)}
        title="Record a Completed Blood Donation"
      >
        <form onSubmit={handleLogDonationSubmit}>
          <div className="form-group">
            <label className="form-label">Hospital / Blood Bank Center Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., St. Jude Regional Medical Center"
              value={donationFormData.hospitalName}
              onChange={(e) => setDonationFormData({ ...donationFormData, hospitalName: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={donationFormData.city}
                onChange={(e) => setDonationFormData({ ...donationFormData, city: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Donation Date *</label>
              <input
                type="date"
                required
                value={donationFormData.donationDate}
                onChange={(e) => setDonationFormData({ ...donationFormData, donationDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Units Donated</label>
              <input
                type="number"
                min="1"
                max="3"
                value={donationFormData.units}
                onChange={(e) => setDonationFormData({ ...donationFormData, units: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Name (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank if general blood drive"
                value={donationFormData.recipientName}
                onChange={(e) => setDonationFormData({ ...donationFormData, recipientName: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Personal Notes / Memory</label>
            <textarea
              rows="2"
              placeholder="e.g., Annual charity blood drive with colleagues."
              value={donationFormData.notes}
              onChange={(e) => setDonationFormData({ ...donationFormData, notes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsLogDonationModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingDonation}
              className="btn btn-primary"
            >
              {isSubmittingDonation ? 'Logging...' : 'Save & Generate Certificate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonorDashboard;
