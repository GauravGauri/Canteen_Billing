const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      default: 'The Grand Resort & Spa',
    },
    address: {
      type: String,
      default: '101 Resort Boulevard, Beachside',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    email: {
      type: String,
      default: 'contact@grandresort.com',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    currencySymbol: {
      type: String,
      default: '$',
    },
    taxRate: {
      type: Number,
      default: 12, // 12% standard hotel GST/tax
    },
    serviceChargeRate: {
      type: Number,
      default: 5, // 5% service charge
    },
    invoiceTemplate: {
      type: String,
      default: 'classic',
    },
    emailConfigured: {
      type: Boolean,
      default: false,
    },
    smsConfigured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
