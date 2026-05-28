const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide dish name'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify selling price'],
    },
    category: {
      type: String,
      required: [true, 'Please specify category (e.g. Starters, Mains, Desserts, Drinks)'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    recipe: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true, // Quantity of raw material used for 1 serving
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dish', dishSchema);
