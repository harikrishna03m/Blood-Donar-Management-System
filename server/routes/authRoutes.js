const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'blood_donor_secret_key_2026_super_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register a donor
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bloodGroup,
      phone,
      city,
      state,
      age,
      gender,
      lastDonationDate,
      emergencyContact,
      bio,
    } = req.body;

    // Validation
    if (!name || !email || !password || !bloodGroup || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Email, Password, Blood Group, Phone, and City.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Create user (donors can only self-register as donor role)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      bloodGroup,
      phone,
      city,
      state: state || '',
      age: age ? Number(age) : 25,
      gender: gender || 'Prefer not to say',
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      emergencyContact: emergencyContact || '',
      bio: bio || '',
      role: 'donor',
      isAvailable: true,
      isVerified: true,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Blood Donor Community.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        city: user.city,
        state: user.state,
        age: user.age,
        gender: user.gender,
        isAvailable: user.isAvailable,
        lastDonationDate: user.lastDonationDate,
        totalDonations: user.totalDonations,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user (Donor & Admin) and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        city: user.city,
        state: user.state,
        age: user.age,
        gender: user.gender,
        isAvailable: user.isAvailable,
        lastDonationDate: user.lastDonationDate,
        totalDonations: user.totalDonations,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      state,
      age,
      gender,
      bloodGroup,
      isAvailable,
      lastDonationDate,
      emergencyContact,
      bio,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (state !== undefined) user.state = state;
    if (age) user.age = Number(age);
    if (gender) user.gender = gender;
    if (bloodGroup && req.user.role === 'admin') user.bloodGroup = bloodGroup;
    if (isAvailable !== undefined) user.isAvailable = isAvailable;
    if (lastDonationDate !== undefined) {
      user.lastDonationDate = lastDonationDate ? new Date(lastDonationDate) : null;
    }
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
});

module.exports = router;
