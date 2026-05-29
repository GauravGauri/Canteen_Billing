const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: false,
    },
    type: {
      type: String,
      enum: ['dine-in', 'takeaway', 'online'],
      default: 'dine-in',
    },
    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Dish',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0, // In currency units, e.g. 5% GST
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['kitchen', 'served', 'paid', 'cancelled'],
      default: 'kitchen',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'unpaid'],
      default: 'unpaid',
    },
    paymentDetails: {
      type: String,
      trim: true,
    },
    kotPrinted: {
      type: Boolean,
      default: false,
    },
    billPrinted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize queries sorting or filtering by status and/or creation date
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
