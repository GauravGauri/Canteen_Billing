const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');

// @desc    Get all guests (with optional text search)
// @route   GET /api/guests
// @access  Private
exports.getGuests = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    
    const guests = await Guest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: guests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get guest by ID with visit/reservation history
// @route   GET /api/guests/:id
// @access  Private
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    
    // Find reservations for this guest
    const reservations = await Reservation.find({ guestId: guest._id })
      .populate('roomId')
      .sort({ checkInDate: -1 });

    res.status(200).json({ success: true, data: { guest, history: reservations } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new guest
// @route   POST /api/guests
// @access  Private
exports.createGuest = async (req, res) => {
  try {
    const { name, email, phone, idType, idNumber, preferences, specialRequests, notes } = req.body;
    
    // Create new guest record
    const guest = await Guest.create({
      name,
      email,
      phone,
      idType,
      idNumber,
      preferences,
      specialRequests,
      notes,
    });
    
    res.status(201).json({ success: true, data: guest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Private
exports.updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    
    res.status(200).json({ success: true, data: guest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Private
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
