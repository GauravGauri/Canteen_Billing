const Dish = require('../models/Dish');

// @desc    Get all dishes
// @route   GET /api/dishes
// @access  Private (Admin)
const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({})
      .populate('recipe.productId', 'name unit stockQuantity minStockLevel costPrice')
      .sort({ name: 1 });
    res.json({ success: true, data: dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a dish with recipe
// @route   POST /api/dishes
// @access  Private (Admin)
const createDish = async (req, res) => {
  const { name, price, category, description, recipe } = req.body;

  try {
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, Price and Category are required' });
    }

    const exists = await Dish.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Dish with this name already exists' });
    }

    const dish = await Dish.create({
      name,
      price,
      category,
      description,
      recipe: recipe || [],
    });

    const populatedDish = await Dish.findById(dish._id).populate('recipe.productId', 'name unit');

    res.status(201).json({ success: true, data: populatedDish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a dish
// @route   PUT /api/dishes/:id
// @access  Private (Admin)
const updateDish = async (req, res) => {
  const { name, price, category, description, recipe, isAvailable } = req.body;

  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    dish.name = name || dish.name;
    dish.price = price !== undefined ? price : dish.price;
    dish.category = category || dish.category;
    dish.description = description !== undefined ? description : dish.description;
    dish.recipe = recipe || dish.recipe;
    dish.isAvailable = isAvailable !== undefined ? isAvailable : dish.isAvailable;

    const updatedDish = await dish.save();
    const populatedDish = await Dish.findById(updatedDish._id).populate('recipe.productId', 'name unit');

    res.json({ success: true, data: populatedDish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private (Admin)
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    await dish.deleteOne();
    res.json({ success: true, message: 'Dish removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDishes,
  createDish,
  updateDish,
  deleteDish,
};
