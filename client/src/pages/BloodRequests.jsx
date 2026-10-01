import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RequestCard from '../components/RequestCard';
import Modal from '../components/Modal';
import {
  AlertCircle,
  PlusCircle,
  Filter,
  RefreshCw,
  Search,
  Building2,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyOptions = ['All', 'Urgent', 'Moderate', 'Routine'];

const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Request Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    hospitalName: '',
    hospitalAddress: '',
    city: '',
    contactPerson: '',
    contactPhone: '',
    urgency: 'Urgent',
    neededByDate: '',
    medicalReason: 'Emergency surgery / transfusion',
    additionalNotes: '',
  });

  // Pledge Modal State
  const [selectedRequestForPledge, setSelectedRequestForPledge] = useState(null);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [pledgeUnits, setPledgeUnits] = useState(1);
  const [pledgeNote, setPledgeNote] = useState('');
  const [submittingPledge, setSubmittingPledge] = useState(false);

  const { isAuthenticated, isDonor, user } = useAuth();
  const { success, error } = useNotification();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBloodGroup !== 'All') params.append('bloodGroup', selectedBloodGroup);
      if (selectedUrgency !== 'All') params.append('urgency', selectedUrgency);
      if (cityFilter.trim()) params.append('city', cityFilter.trim());
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
      error(err.message || 'Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedBloodGroup, selectedUrgency, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const handleResetFilters = () => {
    setSelectedBloodGroup('All');
    setSelectedUrgency('All');
    setCityFilter('');
    setSearchTerm('');
    setPage(1);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    try {
      const res = await api.post('/requests', formData);
      if (res.data.success) {
        success('Blood request published successfully!');
        setIsCreateModalOpen(false);
        setFormData({
          patientName: '',
          bloodGroup: 'O+',
          unitsNeeded: 1,
          hospitalName: '',
          hospitalAddress: '',
          city: '',
          contactPerson: '',
          contactPhone: '',
          urgency: 'Urgent',
          neededByDate: '',
          medicalReason: 'Emergency surgery / transfusion',
          additionalNotes: '',
        });
        fetchRequests();
      }
    } catch (err) {
      error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenPledge = (req) => {
    if (!isAuthenticated) {
      error('Please log in as a donor to submit a pledge.');
      return;
    }
    if (!isDonor) {
      error('Only registered donors can submit pledges.');
      return;
    }
    setSelectedRequestForPledge(req);
    setIsPledgeModalOpen(true);
  };

  const handleSubmitPledge = async (e) => {
    e.preventDefault();
    if (!selectedRequestForPledge) return;

    setSubmittingPledge(true);
    try {
      const res = await api.post(
        `/requests/${selectedRequestForPledge._id}/pledge`,
        {
          unitsPledged: pledgeUnits,
          note: pledgeNote,
        }
      );

      if (res.data.success) {
        success('Thank you! Your pledge has been registered.');
        setIsPledgeModalOpen(false);
        setPledgeNote('');
        fetchRequests();
      }
    } catch (err) {
      error(err.message || 'Failed to submit pledge');
    } finally {
      setSubmittingPledge(false);
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
              <AlertCircle size={16} />
              <span>Live Emergency Transfusion Board</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0.25rem 0 0' }}>
              Blood Requests
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
              View live blood requirements from regional hospitals or post an immediate request for a patient.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Create Blood Request</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', background: '#ffffff' }}>
          {/* Blood Group Quick Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Filter by Blood Group
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

          {/* Form Search Controls */}
          <form onSubmit={handleFilterSubmit}>
            <div className="grid-4" style={{ alignItems: 'flex-end', gap: '1rem' }}>
              <div>
                <label className="form-label">Search Patient / Hospital</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search name or hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Urgency Level</label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => {
                    setSelectedUrgency(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  {urgencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All' ? 'All Urgencies' : `${opt} Priority`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="form-input"
                />
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

        {/* Status Count Summary */}
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
            Displaying <strong>{totalCount}</strong> active blood requirements
          </span>
        </div>

        {/* Requests Grid */}
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
            <p style={{ color: '#64748b' }}>Loading blood requests...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : requests.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
            }}
          >
            <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              No Blood Requests Found
            </h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              There are currently no active requests matching your criteria.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Post a New Blood Request
            </button>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            {requests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                onPledge={handleOpenPledge}
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

      {/* Create Blood Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post an Emergency Blood Request"
      >
        <form onSubmit={handleCreateRequest}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Robert Anderson"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group Needed *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="form-select"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Units of Blood Needed (Pints) *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.unitsNeeded}
                onChange={(e) => setFormData({ ...formData, unitsNeeded: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="form-select"
              >
                <option value="Urgent">Urgent (Within 24 Hours)</option>
                <option value="Moderate">Moderate (Within 48-72 Hours)</option>
                <option value="Routine">Routine (Planned Procedure)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., City General Hospital"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                placeholder="e.g., Chicago"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Person Name *</label>
              <input
                type="text"
                required
                placeholder="Doctor, Nurse, or Relative"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Medical Reason / Treatment</label>
            <input
              type="text"
              placeholder="e.g., Cardiovascular surgery, Thalassemia care, Trauma"
              value={formData.medicalReason}
              onChange={(e) => setFormData({ ...formData, medicalReason: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Instructions for Donors</label>
            <textarea
              rows="2"
              placeholder="e.g., Blood bank counter open 9 AM - 7 PM on 2nd Floor."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingCreate}
              className="btn btn-primary"
            >
              {isSubmittingCreate ? 'Publishing...' : 'Publish Blood Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pledge Modal */}
      <Modal
        isOpen={isPledgeModalOpen}
        onClose={() => setIsPledgeModalOpen(false)}
        title="Pledge Blood Donation"
      >
        {selectedRequestForPledge && (
          <form onSubmit={handleSubmitPledge}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
              Pledging for <strong>{selectedRequestForPledge.patientName}</strong> at <strong>{selectedRequestForPledge.hospitalName}</strong> in <strong>{selectedRequestForPledge.city}</strong>.
            </div>

            <div className="form-group">
              <label className="form-label">Units You Pledge to Donate</label>
              <input
                type="number"
                min="1"
                max={selectedRequestForPledge.unitsNeeded || 4}
                value={pledgeUnits}
                onChange={(e) => setPledgeUnits(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note for Hospital / Patient Family</label>
              <textarea
                rows="3"
                placeholder="Let them know your expected arrival time..."
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
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
                {submittingPledge ? 'Confirming...' : 'Submit Official Pledge'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default BloodRequests;
