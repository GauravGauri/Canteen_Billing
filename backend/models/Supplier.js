const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide supplier name'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
