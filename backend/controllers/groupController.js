const GroupBooking = require('../models/GroupBooking');
const Room = require('../models/Room');

// @desc    Get all group bookings
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    const groups = await GroupBooking.find()
      .populate('contactGuestId')
      .populate('roomsBlocked')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create group booking
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { groupName, contactGuestId, roomsBlocked, checkInDate, checkOutDate, masterBilling, splitDetails, totalAmount, notes } = req.body;

    const group = await GroupBooking.create({
      groupName,
      contactGuestId,
      roomsBlocked,
      checkInDate,
      checkOutDate,
      masterBilling: masterBilling !== undefined ? masterBilling : true,
      splitDetails,
      totalAmount: totalAmount || 0,
      notes,
    });

    // Block the rooms in parallel
    if (roomsBlocked && roomsBlocked.length > 0) {
      await Room.updateMany(
        { _id: { $in: roomsBlocked } },
        { $set: { status: 'reserved' } }
      );
    }

    const populated = await GroupBooking.findById(group._id)
      .populate('contactGuestId')
      .populate('roomsBlocked');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update group booking
// @route   PUT /api/groups/:id
// @access  Private
exports.updateGroup = async (req, res) => {
  try {
    const group = await GroupBooking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('contactGuestId').populate('roomsBlocked');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group booking not found' });
    }

    res.status(200).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete group booking
// @route   DELETE /api/groups/:id
// @access  Private
exports.deleteGroup = async (req, res) => {
  try {
    const group = await GroupBooking.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group booking not found' });
    }

    // Unblock rooms
    if (group.roomsBlocked && group.roomsBlocked.length > 0) {
      await Room.updateMany(
        { _id: { $in: group.roomsBlocked }, status: 'reserved' },
        { $set: { status: 'available' } }
      );
    }

    await group.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
