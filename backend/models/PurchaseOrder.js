const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantityOrdered: {
          type: Number,
          required: true,
        },
        quantityReceived: {
          type: Number,
          default: 0,
        },
        costPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['ordered', 'partially_received', 'received', 'cancelled'],
      default: 'ordered',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    receivedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
