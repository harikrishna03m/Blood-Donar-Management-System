const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonationRecord = require('../models/DonationRecord');
const { protect, authorize } = require('../middleware/auth');

// Apply admin protection to all admin routes
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/overview
// @desc    Get comprehensive admin dashboard analytics
// @access  Private (Admin)
router.get('/overview', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const availableDonors = await User.countDocuments({ role: 'donor', isAvailable: true });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const openRequests = await BloodRequest.countDocuments({ status: 'Open' });
    const inProgressRequests = await BloodRequest.countDocuments({ status: 'In Progress' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const totalRequests = await BloodRequest.countDocuments();

    const totalDonations = await DonationRecord.countDocuments();

    // Blood group distributions
    const bloodGroupAggregation = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    const bloodGroupCounts = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
    bloodGroupAggregation.forEach((g) => {
      if (g._id) bloodGroupCounts[g._id] = g.count;
    });

    // Recent 5 donors & recent 5 requests
    const recentDonors = await User.find({ role: 'donor' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRequests = await BloodRequest.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      stats: {
        totalDonors,
        availableDonors,
        totalAdmins,
        openRequests,
        inProgressRequests,
        fulfilledRequests,
        totalRequests,
        totalDonations,
        bloodGroupCounts,
      },
      recentDonors,
      recentRequests,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard analytics',
    });
  }
});

// @route   GET /api/admin/donors
// @desc    Get all donors with admin search/filters
// @access  Private (Admin)
router.get('/donors', async (req, res) => {
  try {
    const { bloodGroup, city, isAvailable, search, page = 1, limit = 15 } = req.query;

    const query = { role: 'donor' };

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (isAvailable !== undefined && isAvailable !== 'All') {
      query.isAvailable = isAvailable === 'true';
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const donors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      count: donors.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      donors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donors for admin',
    });
  }
});

// @route   POST /api/admin/donors
// @desc    Create a donor account via Admin console
// @access  Private (Admin)
router.post('/donors', async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone, city, state, age, gender, isAvailable } = req.body;

    if (!name || !email || !password || !bloodGroup || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, bloodGroup, phone, and city are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const donor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      bloodGroup,
      phone,
      city,
      state: state || '',
      age: age ? Number(age) : 25,
      gender: gender || 'Prefer not to say',
      role: 'donor',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVerified: true,
    });

    const donorResponse = donor.toObject();
    delete donorResponse.password;

    return res.status(201).json({
      success: true,
      message: 'Donor created successfully by Admin',
      donor: donorResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create donor',
    });
  }
});

// @route   PUT /api/admin/donors/:id
// @desc    Update any donor info via Admin
// @access  Private (Admin)
router.put('/donors/:id', async (req, res) => {
  try {
    const donor = await User.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    const allowedFields = [
      'name', 'email', 'bloodGroup', 'phone', 'city', 'state',
      'age', 'gender', 'isAvailable', 'isVerified', 'lastDonationDate', 'totalDonations', 'bio'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        donor[field] = req.body[field];
      }
    });

    if (req.body.password && req.body.password.trim().length >= 6) {
      donor.password = req.body.password;
    }

    await donor.save();

    const updated = await User.findById(donor._id).select('-password');

    return res.json({
      success: true,
      message: 'Donor details updated successfully',
      donor: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update donor',
    });
  }
});

// @route   DELETE /api/admin/donors/:id
// @desc    Delete a donor account
// @access  Private (Admin)
router.delete('/donors/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    if (user.role === 'admin' && user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own active account',
      });
    }

    await User.findByIdAndDelete(req.params.id);
    await DonationRecord.deleteMany({ donor: req.params.id });

    return res.json({
      success: true,
      message: 'Donor and associated records deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete donor',
    });
  }
});

// @route   GET /api/admin/requests
// @desc    Get all blood requests for admin oversight
// @access  Private (Admin)
router.get('/requests', async (req, res) => {
  try {
    const { bloodGroup, status, urgency, city, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;
    if (city && city.trim() !== '') query.city = { $regex: new RegExp(city.trim(), 'i') };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ patientName: regex }, { hospitalName: regex }, { city: regex }, { contactPerson: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood requests for admin',
    });
  }
});

// @route   PUT /api/admin/requests/:id
// @desc    Update any blood request by Admin
// @access  Private (Admin)
router.put('/requests/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    return res.json({
      success: true,
      message: 'Blood request updated successfully by Admin',
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update request',
    });
  }
});

// @route   DELETE /api/admin/requests/:id
// @desc    Delete any blood request by Admin
// @access  Private (Admin)
router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    return res.json({
      success: true,
      message: 'Blood request deleted successfully by Admin',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blood request',
    });
  }
});

module.exports = router;
