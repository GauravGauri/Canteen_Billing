const Product = require('../models/Product');

// @desc    Get all inventory products
// @route   GET /api/products
// @access  Private (Admin)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  const { name, unit, minStockLevel, costPrice, stockQuantity } = req.body;

  try {
    if (!name || !unit) {
      return res.status(400).json({ success: false, message: 'Name and Unit are required' });
    }

    const exists = await Product.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Product with this name already exists' });
    }

    const product = await Product.create({
      name,
      unit,
      minStockLevel: minStockLevel || 5,
      costPrice: costPrice || 0,
      stockQuantity: stockQuantity || 0,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  const { name, unit, minStockLevel, costPrice, stockQuantity } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name || product.name;
    product.unit = unit || product.unit;
    product.minStockLevel = minStockLevel !== undefined ? minStockLevel : product.minStockLevel;
    product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
