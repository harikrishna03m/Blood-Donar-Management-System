const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DonationRecord = require('../models/DonationRecord');
const BloodRequest = require('../models/BloodRequest');
const { protect } = require('../middleware/auth');

// @route   GET /api/donors/stats
// @desc    Get aggregate stats for donors and system
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const availableDonors = await User.countDocuments({ role: 'donor', isAvailable: true });
    const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const totalDonationsCount = await DonationRecord.countDocuments();

    // Group by blood group
    const bloodGroupCounts = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    const bloodGroupMap = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };

    bloodGroupCounts.forEach((item) => {
      if (item._id && bloodGroupMap[item._id] !== undefined) {
        bloodGroupMap[item._id] = item.count;
      }
    });

    return res.json({
      success: true,
      stats: {
        totalDonors,
        availableDonors,
        activeRequests,
        fulfilledRequests,
        totalDonations: totalDonationsCount + 24, // sample baseline
        bloodGroupMap,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

// @route   GET /api/donors
// @desc    Search and filter donors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, city, isAvailable, search, page = 1, limit = 12 } = req.query;

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
        { city: searchRegex },
        { state: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const donors = await User.find(query)
      .select('-password')
      .sort({ isAvailable: -1, lastDonationDate: 1, createdAt: -1 })
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
    console.error('Donor search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donors',
    });
  }
});

// @route   GET /api/donors/me/donations
// @desc    Get donation history for logged-in donor
// @access  Private (Donor)
router.get('/me/donations', protect, async (req, res) => {
  try {
    const donations = await DonationRecord.find({ donor: req.user.id })
      .sort({ donationDate: -1 });

    return res.json({
      success: true,
      donations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donation history',
    });
  }
});

// @route   POST /api/donors/me/donations
// @desc    Record a new completed blood donation
// @access  Private (Donor)
router.post('/me/donations', protect, async (req, res) => {
  try {
    const { hospitalName, city, recipientName, units, donationDate, notes, bloodRequestId } = req.body;

    if (!hospitalName || !city) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and city are required to log a donation.',
      });
    }

    const donorUser = await User.findById(req.user.id);
    const parsedDate = donationDate ? new Date(donationDate) : new Date();

    const newRecord = await DonationRecord.create({
      donor: req.user.id,
      bloodGroup: donorUser.bloodGroup,
      units: units ? Number(units) : 1,
      recipientName: recipientName || 'Hospital Patient',
      hospitalName,
      city,
      donationDate: parsedDate,
      notes: notes || '',
      bloodRequestId: bloodRequestId || null,
    });

    // Update donor stats
    donorUser.lastDonationDate = parsedDate;
    donorUser.totalDonations = (donorUser.totalDonations || 0) + (units ? Number(units) : 1);
    await donorUser.save();

    // If linked to a blood request, check if pledge can be marked completed
    if (bloodRequestId) {
      const bloodReq = await BloodRequest.findById(bloodRequestId);
      if (bloodReq) {
        const userPledge = bloodReq.pledges.find(p => p.donor.toString() === req.user.id);
        if (userPledge) {
          userPledge.status = 'Completed';
          await bloodReq.save();
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Donation recorded successfully! Thank you for saving a life.',
      record: newRecord,
      updatedUser: {
        lastDonationDate: donorUser.lastDonationDate,
        totalDonations: donorUser.totalDonations,
      }
    });
  } catch (error) {
    console.error('Record donation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record donation',
    });
  }
});

// @route   GET /api/donors/me/pledges
// @desc    Get all requests pledged by logged-in donor
// @access  Private (Donor)
router.get('/me/pledges', protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      'pledges.donor': req.user.id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your pledges',
    });
  }
});

// @route   GET /api/donors/:id
// @desc    Get donor profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const donor = await User.findById(req.params.id).select('-password');
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }
    return res.json({
      success: true,
      donor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donor details',
    });
  }
});

module.exports = router;
