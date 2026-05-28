const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      unique: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Please specify unit (e.g. kg, g, pcs, liters)'],
      trim: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    costPrice: {
      type: Number,
      required: [true, 'Please specify default cost price'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
