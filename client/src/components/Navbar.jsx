import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BloodGroupBadge from './BloodGroupBadge';
import {
  Droplets,
  Search,
  AlertCircle,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  HeartHandshake,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: isActive ? '#dc2626' : '#334155',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    background: isActive ? '#fff1f2' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            style={{
              background: 'var(--crimson-gradient)',
              color: '#ffffff',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)',
            }}
          >
            <Droplets size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                }}
              >
                Life<span style={{ color: '#dc2626' }}>Pulse</span>
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '-3px',
              }}
            >
              Blood Donor Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="desktop-nav"
        >
          <NavLink to="/" style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/donors" style={navLinkStyle}>
            <Search size={16} />
            Find Donors
          </NavLink>
          <NavLink to="/requests" style={navLinkStyle}>
            <AlertCircle size={16} />
            Blood Requests
          </NavLink>

          {/* Role specific links */}
          {isAuthenticated && (
            <>
              {isAdmin ? (
                <NavLink to="/admin" style={navLinkStyle}>
                  <ShieldAlert size={16} color="#dc2626" />
                  Admin Console
                </NavLink>
              ) : (
                <NavLink to="/donor/dashboard" style={navLinkStyle}>
                  <User size={16} />
                  My Dashboard
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Auth CTA / User Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          className="desktop-auth"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user?.bloodGroup && (
                <BloodGroupBadge bloodGroup={user.bloodGroup} size="sm" solid />
              )}
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: user?.role === 'admin' ? '#dc2626' : '#16a34a',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.5rem 0.8rem', gap: '0.4rem' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <HeartHandshake size={16} />
                <span>Register as Donor</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-toggle"
          style={{
            display: 'none',
            padding: '0.5rem',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink
            to="/"
            style={navLinkStyle}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/donors"
            style={navLinkStyle}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Search size={16} />
            Find Donors
          </NavLink>
          <NavLink
            to="/requests"
            style={navLinkStyle}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <AlertCircle size={16} />
            Blood Requests
          </NavLink>

          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  style={navLinkStyle}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldAlert size={16} />
                  Admin Console
                </NavLink>
              ) : (
                <NavLink
                  to="/donor/dashboard"
                  style={navLinkStyle}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={16} />
                  My Dashboard
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register as Donor
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive media styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-auth {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
