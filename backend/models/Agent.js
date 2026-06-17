const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    commissionRate: {
      type: Number,
      default: 0, // In percentage, e.g., 10 for 10%
      min: 0,
      max: 100,
    },
    corporateRateDetails: {
      type: String,
      trim: true,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Agent', agentSchema);
