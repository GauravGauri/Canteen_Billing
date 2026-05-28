const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNo: {
      type: String,
      required: [true, 'Please provide table number or name'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'billed'],
      default: 'available',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Table', tableSchema);
