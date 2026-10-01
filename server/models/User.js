const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['donor', 'admin'],
      default: 'donor',
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please specify your blood group'],
      enum: {
        values: BloodGroups,
        message: '{VALUE} is not a valid blood group (Allowed: A+, A-, B+, B-, AB+, AB-, O+, O-)',
      },
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide your city'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      min: [18, 'Donors must be at least 18 years old'],
      max: [65, 'Donors must be 65 or under'],
      default: 25,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check eligibility helper (typically 90 days / 3 months between donations)
UserSchema.methods.isEligibleToDonate = function () {
  if (!this.lastDonationDate) return true;
  const daysSinceLast = (new Date() - new Date(this.lastDonationDate)) / (1000 * 60 * 60 * 24);
  return daysSinceLast >= 90;
};

module.exports = mongoose.model('User', UserSchema);
