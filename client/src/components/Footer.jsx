import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, PhoneCall, Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#f8fafc',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        borderTop: '4px solid #dc2626',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          className="grid-4"
          style={{
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  background: 'var(--crimson-gradient)',
                  color: '#ffffff',
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplets size={20} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Life<span style={{ color: '#ef4444' }}>Pulse</span>
              </span>
            </div>
            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              Connecting willing voluntary blood donors directly with emergency patients and regional hospitals. A single donation can save up to 3 lives.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} color="#ef4444" />
              <span>100% Free & Voluntary</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                marginBottom: '1.2rem',
                fontWeight: 700,
              }}
            >
              Quick Navigation
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
                fontSize: '0.9rem',
                color: '#94a3b8',
              }}
            >
              <li>
                <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/donors" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Find Verified Donors
                </Link>
              </li>
              <li>
                <Link to="/requests" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Emergency Blood Requests
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Register as a Donor
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Donor Guidelines */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                marginBottom: '1.2rem',
                fontWeight: 700,
              }}
            >
              Donation Guidelines
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
                fontSize: '0.85rem',
                color: '#94a3b8',
              }}
            >
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#ef4444' }}>•</span> Age between 18 to 65 years
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#ef4444' }}>•</span> Weight 50 kg (110 lbs) or above
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#ef4444' }}>•</span> Minimum 90 days gap between donations
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#ef4444' }}>•</span> Good general health & pulse stability
              </li>
            </ul>
          </div>

          {/* Col 4: 24/7 Emergency Support */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                marginBottom: '1.2rem',
                fontWeight: 700,
              }}
            >
              Emergency Hotline
            </h4>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.25rem' }}>
                <PhoneCall size={18} />
                <span>24/7 Blood Line</span>
              </div>
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                1-800-BLOOD-HELP
              </p>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                (Toll Free across all regions)
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#ef4444" />
                <span>support@lifepulseblood.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#ef4444" />
                <span>Central Blood Bank & Registry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#64748b',
          }}
        >
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} LifePulse Blood Management System. Built with MERN Stack.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Made with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>to connect heroes with those in need</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
