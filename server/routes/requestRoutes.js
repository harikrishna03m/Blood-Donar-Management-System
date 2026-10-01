const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// @route   GET /api/requests/urgent
// @desc    Get top urgent active blood requests
// @access  Public
router.get('/urgent', async (req, res) => {
  try {
    const urgentRequests = await BloodRequest.find({
      status: { $in: ['Open', 'In Progress'] },
      urgency: 'Urgent',
    })
      .sort({ createdAt: -1 })
      .limit(6);

    return res.json({
      success: true,
      requests: urgentRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve urgent requests',
    });
  }
});

// @route   GET /api/requests
// @desc    Get blood requests with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, city, urgency, status, search, page = 1, limit = 12 } = req.query;

    const query = {};

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (urgency && urgency !== 'All') {
      query.urgency = urgency;
    }

    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      // Default to non-cancelled
      query.status = { $in: ['Open', 'In Progress', 'Fulfilled'] };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { patientName: searchRegex },
        { hospitalName: searchRegex },
        { city: searchRegex },
        { contactPerson: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .sort({
        // Priority to urgent open requests
        urgency: -1,
        createdAt: -1,
      })
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
    console.error('Request fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood requests',
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single blood request details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('requestedBy', 'name email phone');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood request details',
    });
  }
});

// @route   POST /api/requests
// @desc    Create a new blood request (Public or Logged in)
// @access  Public / Optional Auth
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      city,
      contactPerson,
      contactPhone,
      urgency,
      neededByDate,
      medicalReason,
      additionalNotes,
    } = req.body;

    if (!patientName || !bloodGroup || !unitsNeeded || !hospitalName || !city || !contactPerson || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields: Patient Name, Blood Group, Units Needed, Hospital, City, Contact Person, and Contact Phone.',
      });
    }

    const bloodRequest = await BloodRequest.create({
      patientName,
      bloodGroup,
      unitsNeeded: Number(unitsNeeded) || 1,
      hospitalName,
      hospitalAddress: hospitalAddress || '',
      city,
      contactPerson,
      contactPhone,
      urgency: urgency || 'Urgent',
      status: 'Open',
      neededByDate: neededByDate ? new Date(neededByDate) : new Date(Date.now() + 48 * 60 * 60 * 1000),
      medicalReason: medicalReason || 'Urgent Medical Requirement',
      additionalNotes: additionalNotes || '',
      requestedBy: req.user ? req.user._id : null,
      pledges: [],
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request created successfully and broadcast to matching donors!',
      request: bloodRequest,
    });
  } catch (error) {
    console.error('Blood request creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blood request',
    });
  }
});

// @route   POST /api/requests/:id/pledge
// @desc    Pledge to donate for a blood request
// @access  Private (Donor)
router.post('/:id/pledge', protect, async (req, res) => {
  try {
    const { unitsPledged, note } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (request.status === 'Fulfilled' || request.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${request.status}.`,
      });
    }

    // Check if user already pledged
    const existingPledge = request.pledges.find(
      (p) => p.donor.toString() === req.user.id && p.status === 'Pledged'
    );

    if (existingPledge) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active pledge for this request. Thank you!',
      });
    }

    const newPledge = {
      donor: req.user._id,
      donorName: req.user.name,
      donorPhone: req.user.phone,
      donorEmail: req.user.email,
      unitsPledged: unitsPledged ? Number(unitsPledged) : 1,
      status: 'Pledged',
      pledgedAt: new Date(),
      note: note || '',
    };

    request.pledges.push(newPledge);

    // Update status to 'In Progress' if still 'Open'
    if (request.status === 'Open') {
      request.status = 'In Progress';
    }

    await request.save();

    return res.json({
      success: true,
      message: 'Thank you for your generous pledge! The patient/hospital has been notified.',
      request,
    });
  } catch (error) {
    console.error('Pledge error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit pledge',
    });
  }
});

// @route   PUT /api/requests/:id/status
// @desc    Update blood request status
// @access  Private (Creator or Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Must be admin or request creator
    const isCreator = request.requestedBy && request.requestedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this blood request.',
      });
    }

    if (!['Open', 'In Progress', 'Fulfilled', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    request.status = status;
    await request.save();

    return res.json({
      success: true,
      message: `Request status updated to ${status}`,
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update request status',
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete blood request
// @access  Private (Creator or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    const isCreator = request.requestedBy && request.requestedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blood request',
      });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Blood request removed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blood request',
    });
  }
});

module.exports = router;
