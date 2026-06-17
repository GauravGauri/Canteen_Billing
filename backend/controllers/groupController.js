const GroupBooking = require('../models/GroupBooking');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

// Helper to synchronize room reservations for a group booking
const syncGroupReservations = async (group) => {
  const existingReservations = await Reservation.find({ groupBookingId: group._id });
  const existingRoomIds = existingReservations.map(r => r.roomId.toString());

  const checkInDate = group.checkInDate;
  const checkOutDate = group.checkOutDate;

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const timeDiff = Math.abs(end.getTime() - start.getTime());
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;

  // Rooms currently blocked in the group schema
  const blockedRoomIds = group.roomsBlocked.map(r => (r._id || r).toString());

  // 1. Remove reservations for rooms that are no longer blocked
  const toRemove = existingReservations.filter(r => !blockedRoomIds.includes(r.roomId.toString()));
  for (const res of toRemove) {
    await Room.updateOne(
      { _id: res.roomId, currentReservationId: res._id },
      { $set: { status: 'available', currentReservationId: null } }
    );
    await res.deleteOne();
  }

  // 2. Add reservations for new rooms
  const toAddIds = blockedRoomIds.filter(id => !existingRoomIds.includes(id));
  for (const roomId of toAddIds) {
    const room = await Room.findById(roomId).populate('categoryId');
    if (room) {
      const baseRate = room.categoryId?.basePrice || 0;
      const totalRoomCharges = baseRate * nights;

      const newRes = await Reservation.create({
        guestId: group.contactGuestId,
        roomId: room._id,
        checkInDate,
        checkOutDate,
        baseRate,
        totalRoomCharges,
        totalAmount: totalRoomCharges,
        groupBookingId: group._id,
        status: 'pending',
      });

      room.status = 'reserved';
      room.currentReservationId = newRes._id;
      await room.save();
    }
  }

  // 3. Update existing reservations if dates or contact guest changed
  const toUpdate = existingReservations.filter(r => blockedRoomIds.includes(r.roomId.toString()));
  for (const res of toUpdate) {
    res.checkInDate = checkInDate;
    res.checkOutDate = checkOutDate;
    res.guestId = group.contactGuestId;

    const totalRoomCharges = res.baseRate * nights;
    res.totalRoomCharges = totalRoomCharges;
    res.totalAmount = totalRoomCharges;
    await res.save();
  }
};

// @desc    Get all group bookings
// @route   GET /api/groups
// @access  Private
// exports.getGroups = async (req, res) => {
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

    const populated = await GroupBooking.findById(group._id)
      .populate('contactGuestId')
      .populate('roomsBlocked');

    // Sync room reservations
    await syncGroupReservations(populated);

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

    // Sync room reservations
    await syncGroupReservations(group);

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

    // Find and delete reservations associated with group, and set room status back to available
    const reservations = await Reservation.find({ groupBookingId: group._id });
    const reservationIds = reservations.map(r => r._id);
    const roomIds = reservations.map(r => r.roomId);

    await Room.updateMany(
      { _id: { $in: roomIds }, currentReservationId: { $in: reservationIds } },
      { $set: { status: 'available', currentReservationId: null } }
    );
    await Reservation.deleteMany({ groupBookingId: group._id });

    await group.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
