const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    idType: {
      type: String,
      trim: true,
      default: 'Government ID', // e.g., Aadhaar, Passport, DL
    },
    idNumber: {
      type: String,
      trim: true,
    },
    preferences: {
      type: String,
      trim: true,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
guestSchema.index({ name: 'text', phone: 'text' });
guestSchema.index({ phone: 1 });

module.exports = mongoose.model('Guest', guestSchema);
