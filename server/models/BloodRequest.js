const mongoose = require('mongoose');

const BloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PledgeSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    donorPhone: {
      type: String,
      required: true,
    },
    donorEmail: {
      type: String,
    },
    unitsPledged: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Pledged', 'Completed', 'Cancelled'],
      default: 'Pledged',
    },
    pledgedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const BloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Please provide the patient name'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please specify the needed blood group'],
      enum: BloodGroups,
    },
    unitsNeeded: {
      type: Number,
      required: [true, 'Please specify units of blood needed'],
      min: [1, 'Must request at least 1 unit'],
      max: [20, 'Cannot request more than 20 units at once'],
      default: 1,
    },
    hospitalName: {
      type: String,
      required: [true, 'Please specify hospital or clinic name'],
      trim: true,
    },
    hospitalAddress: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide contact person name'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['Urgent', 'Moderate', 'Routine'],
      default: 'Urgent',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Fulfilled', 'Cancelled'],
      default: 'Open',
    },
    neededByDate: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // Default 48 hours
    },
    medicalReason: {
      type: String,
      default: 'Emergency / Surgical requirement',
    },
    additionalNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Can be requested by guests/family
    },
    pledges: [PledgeSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
