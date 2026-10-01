const mongoose = require('mongoose');

const DonationRecordSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    units: {
      type: Number,
      default: 1,
    },
    recipientName: {
      type: String,
      default: 'Anonymous Recipient',
    },
    hospitalName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    certificateNumber: {
      type: String,
      unique: true,
      default: () => 'CERT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DonationRecord', DonationRecordSchema);
