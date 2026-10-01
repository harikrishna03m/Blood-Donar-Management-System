import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import {
  HeartHandshake,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: 'O+',
    phone: '',
    city: '',
    state: '',
    age: 25,
    gender: 'Prefer not to say',
    lastDonationDate: '',
    bio: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required for emergency contact';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (formData.age < 18 || formData.age > 65) {
      errors.age = 'Donors must be between 18 and 65 years old';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        lastDonationDate: formData.lastDonationDate || null,
        bio: formData.bio.trim(),
      });

      navigate('/donor/dashboard');
    } catch (err) {
      // Error handled by AuthContext notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ background: 'var(--bg-secondary)', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div
          className="card"
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <HeartHandshake size={28} />
            </div>
            <h1 style={{ fontSize: '1.85rem', color: '#0f172a', marginBottom: '0.4rem' }}>
              Donor Registration
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Join our network of voluntary life savers. It takes only 2 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Blood Group Selector Buttons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Select Your Blood Group *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      fontFamily: 'var(--font-heading)',
                      border: formData.bloodGroup === bg ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      background: formData.bloodGroup === bg ? 'var(--crimson-gradient)' : '#ffffff',
                      color: formData.bloodGroup === bg ? '#ffffff' : '#1e293b',
                      boxShadow: formData.bloodGroup === bg ? '0 4px 10px rgba(220, 38, 38, 0.25)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Email */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.name && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.email && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Password and Confirm */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.password && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* Contact & Location */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.phone && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g., New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {formErrors.city && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.city}
                  </span>
                )}
              </div>
            </div>

            {/* Age, Gender & Last Donation Date */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Age (18-65) *</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="form-input"
                />
                {formErrors.age && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {formErrors.age}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                  value={formData.lastDonationDate}
                  onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                  className="form-input"
                  title="Leave blank if this is your first time donating"
                />
              </div>
            </div>

            {/* Optional Bio */}
            <div className="form-group">
              <label className="form-label">Donor Note / Availability Bio</label>
              <textarea
                rows="2"
                placeholder="e.g., Universal O- donor. Happy to help in urgent emergency surgeries."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="form-textarea"
              />
            </div>

            {/* Safety & Consent notice */}
            <div
              style={{
                background: '#f8fafc',
                padding: '0.9rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#475569',
                marginBottom: '1.5rem',
              }}
            >
              <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <span>
                By registering, you confirm that you are physically fit and willing to be contacted in times of blood emergency.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </form>

          {/* Footer link to Login */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#dc2626', fontWeight: 700 }}>
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
