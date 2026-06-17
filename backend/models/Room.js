const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'out_of_service'],
      default: 'available',
    },
    cleaningStatus: {
      type: String,
      enum: ['clean', 'dirty'],
      default: 'clean',
    },
    currentReservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
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

// Indexes for faster lookups on category and status
roomSchema.index({ status: 1 });
roomSchema.index({ categoryId: 1 });

module.exports = mongoose.model('Room', roomSchema);
