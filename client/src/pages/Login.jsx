import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Lock,
  Mail,
  Droplets,
  ShieldAlert,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password);

      // Redirect according to role
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/donor/dashboard', { replace: true });
      }
    } catch (err) {
      // Error is surfaced via notification context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin123@gmail.com');
    setPassword('admin123');
  };

  const handleFillDemoDonor = () => {
    setEmail('sarah.j@example.com');
    setPassword('password123');
  };

  return (
    <div className="main-content" style={{ background: 'var(--bg-secondary)', padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
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
                background: 'var(--crimson-gradient)',
                color: '#ffffff',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              }}
            >
              <Droplets size={28} />
            </div>
            <h1 style={{ fontSize: '1.85rem', color: '#0f172a', marginBottom: '0.4rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Log in to manage your donor profile or hospital administration.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1.5rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Quick Demo Login Helper Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.6rem' }}>
              <Sparkles size={14} color="#dc2626" />
              <span>Quick 1-Click Demo Credentials (Development)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'flex-start' }}
              >
                <ShieldAlert size={14} color="#dc2626" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={handleFillDemoDonor}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'flex-start' }}
              >
                <User size={14} color="#16a34a" />
                <span>Donor (Sarah)</span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            New to LifePulse?{' '}
            <Link to="/register" style={{ color: '#dc2626', fontWeight: 700 }}>
              Register as a donor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
