import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DonorCard from '../components/DonorCard';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  Users,
  MapPin,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FindDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Direct Request Modal state
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [directPatientName, setDirectPatientName] = useState('');
  const [directHospital, setDirectHospital] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);

  const { success, error } = useNotification();

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBloodGroup !== 'All') params.append('bloodGroup', selectedBloodGroup);
      if (cityFilter.trim()) params.append('city', cityFilter.trim());
      if (availabilityFilter !== 'All') params.append('isAvailable', availabilityFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await api.get(`/donors?${params.toString()}`);
      if (res.data.success) {
        setDonors(res.data.donors || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Fetch donors error:', err);
      error(err.message || 'Failed to fetch donors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodGroup, availabilityFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const handleResetFilters = () => {
    setSelectedBloodGroup('All');
    setCityFilter('');
    setAvailabilityFilter('All');
    setSearchTerm('');
    setPage(1);
  };

  const handleOpenDirectRequest = (donor) => {
    setSelectedDonor(donor);
    setIsRequestModalOpen(true);
  };

  const handleSendDirectRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonor) return;

    setIsSubmittingDirect(true);
    try {
      // Create a blood request targeted for this area
      await api.post('/requests', {
        patientName: directPatientName,
        bloodGroup: selectedDonor.bloodGroup,
        unitsNeeded: 1,
        hospitalName: directHospital,
        city: selectedDonor.city,
        contactPerson: directPatientName + ' (Family)',
        contactPhone: directPhone,
        urgency: 'Urgent',
        additionalNotes: `Direct message to donor ${selectedDonor.name}: ${directMessage}`,
      });

      success(`Request submitted and notification dispatched to ${selectedDonor.name}!`);
      setIsRequestModalOpen(false);
      setDirectPatientName('');
      setDirectHospital('');
      setDirectPhone('');
      setDirectMessage('');
    } catch (err) {
      error(err.message || 'Failed to dispatch request');
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Page Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Users size={16} />
              <span>Verified Life Savers Directory</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0.25rem 0 0' }}>
              Find a Blood Donor
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
              Search across registered donors by blood group, location, and availability status.
            </p>
          </div>

          <Link to="/requests" className="btn btn-outline-crimson">
            <PlusCircle size={18} />
            <span>Post a Blood Request Instead</span>
          </Link>
        </div>

        {/* Filter Control Bar */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            background: '#ffffff',
          }}
        >
          {/* Blood Group Quick Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Select Blood Group
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  onClick={() => {
                    setSelectedBloodGroup(bg);
                    setPage(1);
                  }}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: selectedBloodGroup === bg ? '2px solid #dc2626' : '1px solid #e2e8f0',
                    background: selectedBloodGroup === bg ? '#dc2626' : '#ffffff',
                    color: selectedBloodGroup === bg ? '#ffffff' : '#334155',
                    transition: 'all 0.15s',
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Search Inputs */}
          <form onSubmit={handleSearchSubmit}>
            <div
              className="grid-4"
              style={{
                alignItems: 'flex-end',
                gap: '1rem',
              }}
            >
              <div>
                <label className="form-label">Search Name / Keyword</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="e.g., Sarah or New York..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">City / Region</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Filter by city..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => {
                    setAvailabilityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="true">Available Donors Only</option>
                  <option value="false">Unavailable / Resting</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                  title="Reset all filters"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Count Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          <span>
            Found <strong>{totalCount}</strong> {totalCount === 1 ? 'donor' : 'donors'} matching criteria
          </span>
          {selectedBloodGroup !== 'All' && (
            <span style={{ fontWeight: 600, color: '#dc2626' }}>
              Filtering by: {selectedBloodGroup}
            </span>
          )}
        </div>

        {/* Donors Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #fee2e2',
                borderTop: '4px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ color: '#64748b' }}>Searching donor database...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : donors.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
            }}
          >
            <Users size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              No Donors Found Matching Your Search
            </h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Try adjusting your blood group or city filters, or submit a public emergency request so nearby donors are alerted immediately.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={handleResetFilters} className="btn btn-secondary">
                Reset All Filters
              </button>
              <Link to="/requests" className="btn btn-primary">
                Post an Emergency Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            {donors.map((donor) => (
              <DonorCard
                key={donor._id}
                donor={donor}
                onRequestDirectly={handleOpenDirectRequest}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`btn btn-sm ${
                  page === num ? 'btn-primary' : 'btn-secondary'
                }`}
                style={{ minWidth: '36px' }}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Direct Contact Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={`Request Blood From ${selectedDonor?.name || 'Donor'}`}
      >
        {selectedDonor && (
          <form onSubmit={handleSendDirectRequest}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
              Contacting <strong>{selectedDonor.name}</strong> (Blood Group: <strong>{selectedDonor.bloodGroup}</strong>, City: <strong>{selectedDonor.city}</strong>).
            </div>

            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input
                type="text"
                required
                placeholder="Full name of recipient"
                value={directPatientName}
                onChange={(e) => setDirectPatientName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name & Ward *</label>
              <input
                type="text"
                required
                placeholder="e.g., St. Mary Memorial Hospital, Room 304"
                value={directHospital}
                onChange={(e) => setDirectHospital(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Contact Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={directPhone}
                onChange={(e) => setDirectPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Message / Notes</label>
              <textarea
                rows="3"
                placeholder="Describe the medical situation and time constraint..."
                value={directMessage}
                onChange={(e) => setDirectMessage(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDirect}
                className="btn btn-primary"
              >
                {isSubmittingDirect ? 'Dispatching...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default FindDonors;
