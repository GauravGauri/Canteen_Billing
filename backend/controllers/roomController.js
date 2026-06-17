const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('categoryId').sort({ roomNo: 1 });
    res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('categoryId');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { roomNo, categoryId, status, cleaningStatus, notes } = req.body;
    
    // Check if room exists
    const roomExists = await Room.findOne({ roomNo });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNo,
      categoryId,
      status: status || 'available',
      cleaningStatus: cleaningStatus || 'clean',
      notes,
    });

    const populatedRoom = await Room.findById(room._id).populate('categoryId');
    res.status(201).json({ success: true, data: populatedRoom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categoryId');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get room categories
// @route   GET /api/rooms/categories
// @access  Private
exports.getRoomCategories = async (req, res) => {
  try {
    const categories = await RoomCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create room category
// @route   POST /api/rooms/categories
// @access  Private
exports.createRoomCategory = async (req, res) => {
  try {
    const { name, description, basePrice, maxOccupancy, amenities } = req.body;
    
    const catExists = await RoomCategory.findOne({ name });
    if (catExists) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }

    const category = await RoomCategory.create({
      name,
      description,
      basePrice,
      maxOccupancy,
      amenities,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
