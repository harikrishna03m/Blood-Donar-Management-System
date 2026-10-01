import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BloodGroupBadge from '../components/BloodGroupBadge';
import Modal from '../components/Modal';
import {
  ShieldAlert,
  Users,
  AlertCircle,
  Award,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  RefreshCw,
  Droplets,
  Filter,
} from 'lucide-react';

const bloodGroupOptions = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'donors' | 'requests'

  // Overview Stats
  const [stats, setStats] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Donors Management
  const [donors, setDonors] = useState([]);
  const [donorTotal, setDonorTotal] = useState(0);
  const [donorPage, setDonorPage] = useState(1);
  const [donorBloodGroup, setDonorBloodGroup] = useState('All');
  const [donorSearch, setDonorSearch] = useState('');
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Requests Management
  const [requests, setRequests] = useState([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [requestPage, setRequestPage] = useState(1);
  const [requestStatus, setRequestStatus] = useState('All');
  const [requestSearch, setRequestSearch] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Add/Edit Donor Modal
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [donorFormData, setDonorFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    phone: '',
    city: '',
    state: '',
    age: 25,
    gender: 'Prefer not to say',
    isAvailable: true,
  });
  const [isSavingDonor, setIsSavingDonor] = useState(false);

  // Edit Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [requestFormData, setRequestFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    hospitalName: '',
    city: '',
    contactPerson: '',
    contactPhone: '',
    urgency: 'Urgent',
    status: 'Open',
    medicalReason: '',
  });
  const [isSavingRequest, setIsSavingRequest] = useState(false);

  // Load Overview Data
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      error(err.message || 'Failed to load admin analytics');
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Donors
  const fetchDonors = async () => {
    setLoadingDonors(true);
    try {
      const params = new URLSearchParams();
      if (donorBloodGroup !== 'All') params.append('bloodGroup', donorBloodGroup);
      if (donorSearch.trim()) params.append('search', donorSearch.trim());
      params.append('page', donorPage.toString());
      params.append('limit', '10');

      const res = await api.get(`/admin/donors?${params.toString()}`);
      if (res.data.success) {
        setDonors(res.data.donors || []);
        setDonorTotal(res.data.total || 0);
      }
    } catch (err) {
      error(err.message || 'Failed to load donors');
    } finally {
      setLoadingDonors(false);
    }
  };

  // Load Requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const params = new URLSearchParams();
      if (requestStatus !== 'All') params.append('status', requestStatus);
      if (requestSearch.trim()) params.append('search', requestSearch.trim());
      params.append('page', requestPage.toString());
      params.append('limit', '10');

      const res = await api.get(`/admin/requests?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setRequestTotal(res.data.total || 0);
      }
    } catch (err) {
      error(err.message || 'Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'donors') {
      fetchDonors();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, donorPage, donorBloodGroup, requestPage, requestStatus]);

  // Handle Donor Actions
  const handleOpenAddDonor = () => {
    setEditingDonor(null);
    setDonorFormData({
      name: '',
      email: '',
      password: '',
      bloodGroup: 'O+',
      phone: '',
      city: '',
      state: '',
      age: 25,
      gender: 'Prefer not to say',
      isAvailable: true,
    });
    setIsDonorModalOpen(true);
  };

  const handleOpenEditDonor = (donor) => {
    setEditingDonor(donor);
    setDonorFormData({
      name: donor.name || '',
      email: donor.email || '',
      password: '',
      bloodGroup: donor.bloodGroup || 'O+',
      phone: donor.phone || '',
      city: donor.city || '',
      state: donor.state || '',
      age: donor.age || 25,
      gender: donor.gender || 'Prefer not to say',
      isAvailable: donor.isAvailable ?? true,
    });
    setIsDonorModalOpen(true);
  };

  const handleSaveDonor = async (e) => {
    e.preventDefault();
    setIsSavingDonor(true);
    try {
      if (editingDonor) {
        // Update
        const payload = { ...donorFormData };
        if (!payload.password) delete payload.password; // don't overwrite if empty
        const res = await api.put(`/admin/donors/${editingDonor._id}`, payload);
        if (res.data.success) {
          success('Donor updated successfully');
          setIsDonorModalOpen(false);
          fetchDonors();
        }
      } else {
        // Create
        const res = await api.post('/admin/donors', donorFormData);
        if (res.data.success) {
          success('Donor created successfully');
          setIsDonorModalOpen(false);
          fetchDonors();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save donor');
    } finally {
      setIsSavingDonor(false);
    }
  };

  const handleDeleteDonor = async (donorId, donorName) => {
    if (!window.confirm(`Are you sure you want to permanently delete donor ${donorName}?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/donors/${donorId}`);
      if (res.data.success) {
        success('Donor deleted successfully');
        fetchDonors();
        fetchOverview();
      }
    } catch (err) {
      error(err.message || 'Failed to delete donor');
    }
  };

  const handleToggleDonorStatus = async (donor) => {
    try {
      await api.put(`/admin/donors/${donor._id}`, { isAvailable: !donor.isAvailable });
      success(`Updated status for ${donor.name}`);
      fetchDonors();
    } catch (err) {
      error(err.message || 'Failed to update status');
    }
  };

  // Handle Request Actions
  const handleOpenEditRequest = (req) => {
    setEditingRequest(req);
    setRequestFormData({
      patientName: req.patientName || '',
      bloodGroup: req.bloodGroup || 'O+',
      unitsNeeded: req.unitsNeeded || 1,
      hospitalName: req.hospitalName || '',
      city: req.city || '',
      contactPerson: req.contactPerson || '',
      contactPhone: req.contactPhone || '',
      urgency: req.urgency || 'Urgent',
      status: req.status || 'Open',
      medicalReason: req.medicalReason || '',
    });
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    setIsSavingRequest(true);
    try {
      if (editingRequest) {
        const res = await api.put(`/admin/requests/${editingRequest._id}`, requestFormData);
        if (res.data.success) {
          success('Blood request updated successfully');
          setIsRequestModalOpen(false);
          fetchRequests();
        }
      } else {
        const res = await api.post('/requests', requestFormData);
        if (res.data.success) {
          success('Emergency request broadcasted successfully');
          setIsRequestModalOpen(false);
          fetchRequests();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save request');
    } finally {
      setIsSavingRequest(false);
    }
  };

  const handleDeleteRequest = async (requestId, patientName) => {
    if (!window.confirm(`Delete blood request for ${patientName}?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/requests/${requestId}`);
      if (res.data.success) {
        success('Blood request removed');
        fetchRequests();
        fetchOverview();
      }
    } catch (err) {
      error(err.message || 'Failed to delete request');
    }
  };

  const handleQuickStatusChange = async (requestId, newStatus) => {
    try {
      await api.put(`/admin/requests/${requestId}`, { status: newStatus });
      success(`Status set to ${newStatus}`);
      fetchRequests();
      fetchOverview();
    } catch (err) {
      error(err.message || 'Failed to change status');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Admin Header */}
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
              <ShieldAlert size={16} />
              <span>Admin Management Console</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0.25rem 0 0' }}>
              System Administration
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              fetchOverview();
              if (activeTab === 'donors') fetchDonors();
              if (activeTab === 'requests') fetchRequests();
            }}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'overview' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'overview' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Analytics & Overview
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'donors' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'donors' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Manage Donors ({stats?.totalDonors ?? donorTotal})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'requests' ? '#dc2626' : '#64748b',
              borderBottom: activeTab === 'requests' ? '3px solid #dc2626' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Manage Blood Requests ({stats?.totalRequests ?? requestTotal})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div>
            {/* Top KPI Cards */}
            <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Donors</span>
                  <Users size={20} color="#dc2626" />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0 0.2rem' }}>
                  {stats?.totalDonors || 0}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                  {stats?.availableDonors || 0} Currently Available
                </span>
              </div>

              <div className="card" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Requests</span>
                  <AlertCircle size={20} color="#ea580c" />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0 0.2rem' }}>
                  {(stats?.openRequests || 0) + (stats?.inProgressRequests || 0)}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600 }}>
                  {stats?.openRequests || 0} Open • {stats?.inProgressRequests || 0} In Progress
                </span>
              </div>

              <div className="card" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Fulfilled Requests</span>
                  <CheckCircle size={20} color="#16a34a" />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0 0.2rem' }}>
                  {stats?.fulfilledRequests || 0}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Successfully matched
                </span>
              </div>

              <div className="card" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Transfusions</span>
                  <Award size={20} color="#dc2626" />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#dc2626', margin: '0.5rem 0 0.2rem' }}>
                  {stats?.totalDonations || 0}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Certified records
                </span>
              </div>
            </div>

            {/* Blood Groups Distribution Bar */}
            <div className="card" style={{ background: '#ffffff', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Droplets size={20} color="#dc2626" />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Registered Donors Blood Group Breakdown</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.75rem' }}>
                {Object.entries(stats?.bloodGroupCounts || {}).map(([bg, count]) => (
                  <div
                    key={bg}
                    style={{
                      background: '#f8fafc',
                      padding: '1rem 0.5rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <BloodGroupBadge bloodGroup={bg} size="md" solid />
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                      {count}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                      {count === 1 ? 'Donor' : 'Donors'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation to Tabs */}
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              <div className="card" style={{ background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Donor Management</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Quickly add new verified donors, update contact details, or manage availability flags.
                </p>
                <button onClick={() => setActiveTab('donors')} className="btn btn-primary btn-sm">
                  Go to Donors Table
                </button>
              </div>

              <div className="card" style={{ background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Emergency Blood Requests</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Update live patient statuses, broadcast urgent requests, or remove closed listings.
                </p>
                <button onClick={() => setActiveTab('requests')} className="btn btn-primary btn-sm">
                  Go to Requests Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE DONORS */}
        {activeTab === 'donors' && (
          <div>
            {/* Filter & Action Controls */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <div className="grid-4" style={{ alignItems: 'flex-end', gap: '1rem' }}>
                <div>
                  <label className="form-label">Search Donors</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Name, email, phone, city..."
                      value={donorSearch}
                      onChange={(e) => setDonorSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Blood Group</label>
                  <select
                    value={donorBloodGroup}
                    onChange={(e) => {
                      setDonorBloodGroup(e.target.value);
                      setDonorPage(1);
                    }}
                    className="form-select"
                  >
                    {bloodGroupOptions.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={fetchDonors} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Filter size={16} />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setDonorBloodGroup('All');
                      setDonorSearch('');
                      setDonorPage(1);
                    }}
                    className="btn btn-ghost"
                    title="Reset"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div>
                  <button onClick={handleOpenAddDonor} className="btn btn-primary" style={{ width: '100%' }}>
                    <PlusCircle size={16} />
                    <span>Add New Donor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Donors Table */}
            <div className="table-responsive" style={{ background: '#ffffff', borderRadius: '12px' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Contact Info</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Donations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDonors ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading donor records...
                      </td>
                    </tr>
                  ) : donors.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No donors found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    donors.map((d) => (
                      <tr key={d._id}>
                        <td>
                          <strong>{d.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                            {d.email}
                          </span>
                        </td>
                        <td>
                          <BloodGroupBadge bloodGroup={d.bloodGroup} size="sm" solid />
                        </td>
                        <td>{d.phone}</td>
                        <td>{d.city} {d.state ? `, ${d.state}` : ''}</td>
                        <td>
                          <button
                            onClick={() => handleToggleDonorStatus(d)}
                            className={`badge-status ${d.isAvailable ? 'badge-available' : 'badge-busy'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Click to toggle availability"
                          >
                            {d.isAvailable ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td>{d.totalDonations || 0} times</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEditDonor(d)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Edit donor"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDonor(d._id, d.name)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Delete donor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {donorTotal > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setDonorPage((p) => Math.max(1, p - 1))}
                  disabled={donorPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                  Page {donorPage} of {Math.ceil(donorTotal / 10)}
                </span>
                <button
                  onClick={() => setDonorPage((p) => Math.min(Math.ceil(donorTotal / 10), p + 1))}
                  disabled={donorPage >= Math.ceil(donorTotal / 10)}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE BLOOD REQUESTS */}
        {activeTab === 'requests' && (
          <div>
            {/* Filter & Action Controls */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <div className="grid-4" style={{ alignItems: 'flex-end', gap: '1rem' }}>
                <div>
                  <label className="form-label">Search Requests</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Patient, hospital, city..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={requestStatus}
                    onChange={(e) => {
                      setRequestStatus(e.target.value);
                      setRequestPage(1);
                    }}
                    className="form-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={fetchRequests} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Filter size={16} />
                    <span>Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setRequestStatus('All');
                      setRequestSearch('');
                      setRequestPage(1);
                    }}
                    className="btn btn-ghost"
                    title="Reset"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setEditingRequest(null);
                      setRequestFormData({
                        patientName: '',
                        bloodGroup: 'O+',
                        unitsNeeded: 1,
                        hospitalName: '',
                        city: '',
                        contactPerson: '',
                        contactPhone: '',
                        urgency: 'Urgent',
                        status: 'Open',
                        medicalReason: '',
                      });
                      setIsRequestModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <PlusCircle size={16} />
                    <span>Broadcast Request</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="table-responsive" style={{ background: '#ffffff', borderRadius: '12px' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Group</th>
                    <th>Units</th>
                    <th>Hospital & City</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRequests ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading blood requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No blood requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <strong>{r.patientName}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                            {r.contactPerson} ({r.contactPhone})
                          </span>
                        </td>
                        <td>
                          <BloodGroupBadge bloodGroup={r.bloodGroup} size="sm" solid />
                        </td>
                        <td>{r.unitsNeeded} Unit(s)</td>
                        <td>
                          <strong>{r.hospitalName}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                            {r.city}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${
                            r.urgency === 'Urgent' ? 'badge-urgent' : r.urgency === 'Moderate' ? 'badge-moderate' : 'badge-routine'
                          }`}>
                            {r.urgency}
                          </span>
                        </td>
                        <td>
                          <select
                            value={r.status}
                            onChange={(e) => handleQuickStatusChange(r._id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEditRequest(r)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Edit request"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(r._id, r.patientName)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Delete request"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {requestTotal > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                  disabled={requestPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                  Page {requestPage} of {Math.ceil(requestTotal / 10)}
                </span>
                <button
                  onClick={() => setRequestPage((p) => Math.min(Math.ceil(requestTotal / 10), p + 1))}
                  disabled={requestPage >= Math.ceil(requestTotal / 10)}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Donor Modal */}
      <Modal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        title={editingDonor ? `Edit Donor (${editingDonor.name})` : 'Add New Donor Record'}
      >
        <form onSubmit={handleSaveDonor}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={donorFormData.name}
                onChange={(e) => setDonorFormData({ ...donorFormData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                value={donorFormData.email}
                onChange={(e) => setDonorFormData({ ...donorFormData, email: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password {editingDonor ? '(Leave blank to keep current)' : '*'}</label>
              <input
                type="password"
                required={!editingDonor}
                placeholder={editingDonor ? '••••••••' : 'Min 6 characters'}
                value={donorFormData.password}
                onChange={(e) => setDonorFormData({ ...donorFormData, password: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                value={donorFormData.bloodGroup}
                onChange={(e) => setDonorFormData({ ...donorFormData, bloodGroup: e.target.value })}
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
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                required
                value={donorFormData.phone}
                onChange={(e) => setDonorFormData({ ...donorFormData, phone: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={donorFormData.city}
                onChange={(e) => setDonorFormData({ ...donorFormData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                min="18"
                max="65"
                value={donorFormData.age}
                onChange={(e) => setDonorFormData({ ...donorFormData, age: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                value={donorFormData.isAvailable ? 'true' : 'false'}
                onChange={(e) => setDonorFormData({ ...donorFormData, isAvailable: e.target.value === 'true' })}
                className="form-select"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsDonorModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingDonor}
              className="btn btn-primary"
            >
              {isSavingDonor ? 'Saving...' : 'Save Donor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={editingRequest ? `Edit Request (${editingRequest.patientName})` : 'Broadcast Emergency Blood Request'}
      >
        <form onSubmit={handleSaveRequest}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient Name *</label>
              <input
                type="text"
                required
                value={requestFormData.patientName}
                onChange={(e) => setRequestFormData({ ...requestFormData, patientName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group Needed *</label>
              <select
                value={requestFormData.bloodGroup}
                onChange={(e) => setRequestFormData({ ...requestFormData, bloodGroup: e.target.value })}
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
              <label className="form-label">Units Needed *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={requestFormData.unitsNeeded}
                onChange={(e) => setRequestFormData({ ...requestFormData, unitsNeeded: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <select
                value={requestFormData.urgency}
                onChange={(e) => setRequestFormData({ ...requestFormData, urgency: e.target.value })}
                className="form-select"
              >
                <option value="Urgent">Urgent</option>
                <option value="Moderate">Moderate</option>
                <option value="Routine">Routine</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hospital Name *</label>
              <input
                type="text"
                required
                value={requestFormData.hospitalName}
                onChange={(e) => setRequestFormData({ ...requestFormData, hospitalName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={requestFormData.city}
                onChange={(e) => setRequestFormData({ ...requestFormData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                required
                value={requestFormData.contactPerson}
                onChange={(e) => setRequestFormData({ ...requestFormData, contactPerson: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                required
                value={requestFormData.contactPhone}
                onChange={(e) => setRequestFormData({ ...requestFormData, contactPhone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {editingRequest && (
            <div className="form-group">
              <label className="form-label">Request Status</label>
              <select
                value={requestFormData.status}
                onChange={(e) => setRequestFormData({ ...requestFormData, status: e.target.value })}
                className="form-select"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

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
              disabled={isSavingRequest}
              className="btn btn-primary"
            >
              {isSavingRequest ? 'Saving...' : 'Save Blood Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
