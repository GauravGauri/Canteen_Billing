const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
    },
    baseRate: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRoomCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    extraCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'unpaid'],
      default: 'unpaid',
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    groupBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupBooking',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    additionalGuests: [
      {
        name: {
          type: String,
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
        idType: {
          type: String,
          trim: true,
          default: 'Government ID',
        },
        idNumber: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
reservationSchema.index({ status: 1 });
reservationSchema.index({ guestId: 1 });
reservationSchema.index({ roomId: 1 });
reservationSchema.index({ checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
