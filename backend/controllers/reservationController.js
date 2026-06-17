const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Order = require('../models/Order');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('guestId')
      .populate('roomId')
      .populate('agentId')
      .populate('groupBookingId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reservation by ID (along with room folio/POS charges)
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guestId')
      .populate('roomId')
      .populate('agentId')
      .populate('groupBookingId');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Retrieve all POS/restaurant bills charged to this room during this reservation
    const postedOrders = await Order.find({
      reservationId: reservation._id,
      paymentMethod: 'room',
    });

    res.status(200).json({
      success: true,
      data: {
        reservation,
        postedOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const {
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      baseRate,
      advanceDeposit,
      agentId,
      groupBookingId,
      notes,
      additionalGuests,
    } = req.body;

    // 1. Verify Room availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status !== 'available' && room.status !== 'cleaning') {
      return res.status(400).json({ success: false, message: `Room is not available (Status: ${room.status})` });
    }

    // Calculate nights
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
    const totalRoomCharges = baseRate * nights;
    const totalAmount = totalRoomCharges - (req.body.discount || 0);

    // 2. Create reservation
    const reservation = await Reservation.create({
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      baseRate,
      advanceDeposit: advanceDeposit || 0,
      totalRoomCharges,
      discount: req.body.discount || 0,
      totalAmount,
      paidAmount: advanceDeposit || 0,
      paymentStatus: (advanceDeposit >= totalAmount) ? 'paid' : (advanceDeposit > 0 ? 'partial' : 'pending'),
      agentId: agentId || null,
      groupBookingId: groupBookingId || null,
      notes,
      additionalGuests: additionalGuests || [],
      status: 'pending',
    });

    // 3. Mark room as reserved
    room.status = 'reserved';
    room.currentReservationId = reservation._id;
    await room.save();

    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update/Check-in/Check-out/Cancel Reservation
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    const { status, paidAmount, paymentMethod, discount, baseRate, checkInDate, checkOutDate } = req.body;
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const room = await Room.findById(reservation.roomId);

    // Handle Check-in flow
    if (status === 'checked_in' && reservation.status !== 'checked_in') {
      reservation.status = 'checked_in';
      if (room) {
        room.status = 'occupied';
        room.currentReservationId = reservation._id;
        await room.save();
      }
      // Increment Guest visit counts
      await Guest.findByIdAndUpdate(reservation.guestId, { $inc: { visitCount: 1 } });
    }

    // Handle Check-out flow
    if (status === 'checked_out' && reservation.status !== 'checked_out') {
      reservation.status = 'checked_out';
      if (room) {
        room.status = 'cleaning'; // Goes to cleaning after checkout
        room.currentReservationId = null;
        await room.save();
      }
      
      // Calculate final charges, including any POS extraCharges posted to the room
      const postedOrders = await Order.find({
        reservationId: reservation._id,
        paymentMethod: 'room',
      });
      const posSum = postedOrders.reduce((sum, order) => sum + order.total, 0);
      
      reservation.extraCharges = posSum;
      reservation.totalAmount = reservation.totalRoomCharges + posSum - (discount || reservation.discount);
      reservation.paymentStatus = 'paid'; // Checking out usually settles full payment
      reservation.paidAmount = reservation.totalAmount;
      reservation.paymentMethod = paymentMethod || 'cash';
    }

    // Handle Cancellation
    if (status === 'cancelled' && reservation.status !== 'cancelled') {
      reservation.status = 'cancelled';
      if (room) {
        room.status = 'available';
        room.currentReservationId = null;
        await room.save();
      }
    }

    // Standard field updates
    if (baseRate !== undefined || checkInDate !== undefined || checkOutDate !== undefined) {
      if (baseRate) reservation.baseRate = baseRate;
      if (checkInDate) reservation.checkInDate = checkInDate;
      if (checkOutDate) reservation.checkOutDate = checkOutDate;

      // Recalculate nights and charges
      const start = new Date(reservation.checkInDate);
      const end = new Date(reservation.checkOutDate);
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
      
      reservation.totalRoomCharges = reservation.baseRate * nights;
      reservation.totalAmount = reservation.totalRoomCharges + reservation.extraCharges - (discount !== undefined ? discount : reservation.discount);
    }

    if (paidAmount !== undefined) {
      reservation.paidAmount = paidAmount;
      if (reservation.paidAmount >= reservation.totalAmount) {
        reservation.paymentStatus = 'paid';
      } else if (reservation.paidAmount > 0) {
        reservation.paymentStatus = 'partial';
      } else {
        reservation.paymentStatus = 'pending';
      }
    }

    if (discount !== undefined) {
      reservation.discount = discount;
      reservation.totalAmount = reservation.totalRoomCharges + reservation.extraCharges - discount;
    }

    if (req.body.notes !== undefined) reservation.notes = req.body.notes;
    if (req.body.additionalGuests !== undefined) reservation.additionalGuests = req.body.additionalGuests;

    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate('guestId')
      .populate('roomId');

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete/Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Revert room status
    const room = await Room.findById(reservation.roomId);
    if (room && String(room.currentReservationId) === String(reservation._id)) {
      room.status = 'available';
      room.currentReservationId = null;
      await room.save();
    }

    await reservation.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get dashboard metrics & charts
// @route   GET /api/reservations/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Occupancy Percentage
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Active rooms status breakdown
    const roomStatuses = await Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusMap = { available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0, out_of_service: 0 };
    roomStatuses.forEach(stat => {
      statusMap[stat._id] = stat.count;
    });

    // 3. Today's Revenue (Rooms Checkouts + POS settled)
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sum of checked_out reservations paid today
    const roomRevenuePaidToday = await Reservation.aggregate([
      {
        $match: {
          status: 'checked_out',
          updatedAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    const roomRev = roomRevenuePaidToday.length > 0 ? roomRevenuePaidToday[0].total : 0;

    // Sum of POS orders paid today (dine-in, takeaway, online but NOT room posting - since room posting is collected at checkout)
    const posRevenuePaidToday = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          paymentMethod: { $ne: 'room' },
          updatedAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const posRev = posRevenuePaidToday.length > 0 ? posRevenuePaidToday[0].total : 0;

    const todayRevenue = roomRev + posRev;

    // 4. Monthly/Daily Revenue Graph Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    const dailyRevenueHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      // Room payments
      const roomRes = await Reservation.aggregate([
        {
          $match: {
            status: 'checked_out',
            updatedAt: { $gte: d, $lt: nextD }
          }
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]);
      const rVal = roomRes.length > 0 ? roomRes[0].total : 0;

      // POS payments
      const posRes = await Order.aggregate([
        {
          $match: {
            status: 'paid',
            paymentMethod: { $ne: 'room' },
            updatedAt: { $gte: d, $lt: nextD }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      const pVal = posRes.length > 0 ? posRes[0].total : 0;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyRevenueHistory.push({
        date: dayName,
        RoomRevenue: rVal,
        POSRevenue: pVal,
        TotalRevenue: rVal + pVal,
      });
    }

    // 5. Total Sales, Active Transactions, Pending Dues
    const totalSales = await Reservation.countDocuments({ status: 'checked_out' }) + await Order.countDocuments({ status: 'paid' });
    const activeTransactions = await Reservation.countDocuments({ status: 'checked_in' }) + await Order.countDocuments({ status: 'kitchen' });
    
    // Sum of unpaid reservation dues
    const pendingReservationDues = await Reservation.aggregate([
      {
        $match: { status: 'checked_in' }
      },
      {
        $project: {
          dues: { $subtract: ['$totalAmount', '$paidAmount'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$dues' } } }
    ]);
    const pendingDues = pendingReservationDues.length > 0 ? Math.max(0, pendingReservationDues[0].total) : 0;

    // 6. Payment method breakdown (UPI, Cash, Card)
    const posPayBreakdown = await Order.aggregate([
      { $match: { status: 'paid', paymentMethod: { $in: ['cash', 'card', 'upi'] } } },
      { $group: { _id: '$paymentMethod', amount: { $sum: '$total' } } }
    ]);
    const roomPayBreakdown = await Reservation.aggregate([
      { $match: { status: 'checked_out', paymentMethod: { $in: ['cash', 'card', 'upi'] } } },
      { $group: { _id: '$paymentMethod', amount: { $sum: '$paidAmount' } } }
    ]);

    const paymentBreakdown = { cash: 0, card: 0, upi: 0 };
    posPayBreakdown.forEach(p => { paymentBreakdown[p._id] += p.amount; });
    roomPayBreakdown.forEach(r => { paymentBreakdown[r._id] += r.amount; });

    // 7. Recent Transactions
    const recentPOS = await Order.find({ status: 'paid' }).sort({ updatedAt: -1 }).limit(5).lean();
    const recentCheckouts = await Reservation.find({ status: 'checked_out' }).populate('guestId').sort({ updatedAt: -1 }).limit(5).lean();
    
    const recentTransactions = [
      ...recentPOS.map(o => ({
        id: o._id,
        type: 'POS Restaurant',
        ref: o.billNo,
        amount: o.total,
        paymentMethod: o.paymentMethod,
        date: o.updatedAt,
      })),
      ...recentCheckouts.map(r => ({
        id: r._id,
        type: `Checkout Room ${r.roomId ? r.roomId.roomNo : 'N/A'}`,
        ref: r.guestId ? r.guestId.name : 'Guest',
        amount: r.paidAmount,
        paymentMethod: r.paymentMethod,
        date: r.updatedAt,
      }))
    ].sort((a,b) => b.date - a.date).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        totalSales,
        activeTransactions,
        occupancyPercentage,
        roomStatuses: statusMap,
        dailyRevenueHistory,
        paymentBreakdown,
        pendingDues,
        recentTransactions,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
