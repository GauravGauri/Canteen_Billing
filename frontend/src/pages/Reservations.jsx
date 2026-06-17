import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useHotelStore } from '../store/useHotelStore';
import { Calendar, UserPlus, Filter, Plus, CalendarDays, RefreshCw, DollarSign, Users, Trash2, Edit } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { validatePositiveNumber, validateNonNegativeNumber, validateMinLength, validatePhone, validateEmail } from '../utils/validation';

const Reservations = () => {
  const {
    reservations,
    rooms,
    guests,
    fetchReservations,
    fetchRooms,
    fetchGuests,
    createReservation,
    updateReservation,
    deleteReservation,
  } = useHotelStore();

  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showEditGuestsModal, setShowEditGuestsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [folioData, setFolioData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Booking Inputs
  const [guestId, setGuestId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [advanceDeposit, setAdvanceDeposit] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [additionalGuests, setAdditionalGuests] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    fetchGuests();
  }, [fetchReservations, fetchRooms, fetchGuests]);

  const handleAddAdditionalGuestField = () => {
    // Check occupancy limit
    let maxOccupancy = 2;
    if (selectedBooking) {
      const roomDoc = rooms.find(r => r._id === (selectedBooking.roomId?._id || selectedBooking.roomId));
      maxOccupancy = roomDoc?.categoryId?.maxOccupancy || 2;
    } else if (roomId) {
      const selectedRoom = rooms.find(r => r._id === roomId);
      maxOccupancy = selectedRoom?.categoryId?.maxOccupancy || 2;
    }

    if (1 + additionalGuests.length >= maxOccupancy) {
      setErrors((prev) => ({
        ...prev,
        additionalGuests: `Stayer limit reached. This room category only allows a maximum of ${maxOccupancy} occupant(s) total.`
      }));
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.additionalGuests;
      return copy;
    });

    setAdditionalGuests([
      ...additionalGuests,
      { name: '', phone: '', email: '', idType: 'Government ID', idNumber: '' }
    ]);
  };

  const handleUpdateAdditionalGuestField = (index, field, value) => {
    const updated = [...additionalGuests];
    updated[index][field] = value;
    setAdditionalGuests(updated);
  };

  const handleRemoveAdditionalGuestField = (index) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.additionalGuests;
      return copy;
    });
  };

  const openEditGuestsFlow = (booking) => {
    setSelectedBooking(booking);
    setAdditionalGuests(booking.additionalGuests || []);
    setErrors({});
    setShowEditGuestsModal(true);
  };

  const handleSaveGuests = async () => {
    if (!selectedBooking) return;
    const newErrors = {};

    const roomDoc = rooms.find(r => r._id === (selectedBooking.roomId?._id || selectedBooking.roomId));
    const maxOccupancy = roomDoc?.categoryId?.maxOccupancy || 2;

    if (1 + additionalGuests.length > maxOccupancy) {
      newErrors.additionalGuests = `Stayer limit exceeded. This room only allows max ${maxOccupancy} occupant(s).`;
    }

    // Validate stayers
    additionalGuests.forEach((g, idx) => {
      if (!validateMinLength(g.name, 2)) {
        newErrors[`stayer_${idx}_name`] = 'Full Name must be at least 2 characters';
      }
      if (g.phone && !validatePhone(g.phone)) {
        newErrors[`stayer_${idx}_phone`] = 'Enter valid phone number (7-15 digits)';
      }
      if (g.email && !validateEmail(g.email)) {
        newErrors[`stayer_${idx}_email`] = 'Enter valid email address';
      }
      if (g.idNumber && !validateMinLength(g.idNumber, 3)) {
        newErrors[`stayer_${idx}_idNumber`] = 'ID Number must be at least 3 characters';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const ok = await updateReservation(selectedBooking._id, {
      additionalGuests,
    });
    if (ok) {
      setShowEditGuestsModal(false);
      setSelectedBooking(null);
      setAdditionalGuests([]);
      fetchReservations();
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!guestId) {
      newErrors.guestId = 'Guest selection is required';
    }

    if (!roomId) {
      newErrors.roomId = 'Room selection is required';
    }

    if (!checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    } else if (checkInDate && checkOutDate <= checkInDate) {
      newErrors.checkOutDate = 'Check-out must be after Check-in';
    }

    if (!validatePositiveNumber(baseRate)) {
      newErrors.baseRate = 'Base Rate must be a valid positive number';
    }

    if (advanceDeposit && !validateNonNegativeNumber(advanceDeposit)) {
      newErrors.advanceDeposit = 'Advance Deposit must be a valid non-negative number';
    }

    // Capacity check
    if (roomId) {
      const selectedRoom = rooms.find(r => r._id === roomId);
      const maxOccupancy = selectedRoom?.categoryId?.maxOccupancy || 2;
      if (1 + additionalGuests.length > maxOccupancy) {
        newErrors.additionalGuests = `Stayer limit exceeded. This room category only allows max ${maxOccupancy} occupant(s).`;
      }
    }

    // Validate stayers
    additionalGuests.forEach((g, idx) => {
      if (!validateMinLength(g.name, 2)) {
        newErrors[`stayer_${idx}_name`] = 'Full Name must be at least 2 characters';
      }
      if (g.phone && !validatePhone(g.phone)) {
        newErrors[`stayer_${idx}_phone`] = 'Enter valid phone number (7-15 digits)';
      }
      if (g.email && !validateEmail(g.email)) {
        newErrors[`stayer_${idx}_email`] = 'Enter valid email address';
      }
      if (g.idNumber && !validateMinLength(g.idNumber, 3)) {
        newErrors[`stayer_${idx}_idNumber`] = 'ID Number must be at least 3 characters';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const ok = await createReservation({
      guestId,
      roomId,
      checkInDate,
      checkOutDate,
      baseRate: Number(baseRate),
      advanceDeposit: Number(advanceDeposit || 0),
      notes: bookingNotes,
      additionalGuests,
    });
    if (ok) {
      setGuestId('');
      setRoomId('');
      setCheckInDate('');
      setCheckOutDate('');
      setBaseRate('');
      setAdvanceDeposit('');
      setBookingNotes('');
      setAdditionalGuests([]);
      setErrors({});
      setShowAddBooking(false);
    }
  };

  const handleCheckIn = async (booking) => {
    await updateReservation(booking._id, { status: 'checked_in' });
  };

  const openCheckoutFlow = async (booking) => {
    setSelectedBooking(booking);
    try {
      const res = await axios.get(`/reservations/${booking._id}`);
      if (res.data.success) {
        setFolioData(res.data.data);
        setShowCheckoutModal(true);
      }
    } catch (err) {
      console.error('Failed to load reservation folio details', err);
    }
  };

  const handleCheckoutSettle = async () => {
    if (!selectedBooking) return;
    const ok = await updateReservation(selectedBooking._id, {
      status: 'checked_out',
      paymentMethod,
    });
    if (ok) {
      setShowCheckoutModal(false);
      setSelectedBooking(null);
      setFolioData(null);
      fetchReservations();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Reserved</span>;
      case 'checked_in':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">In House</span>;
      case 'checked_out':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">Checked Out</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Reservations & Front Desk" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Toolbar */}
        <div className="glass-card rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-205">Booking Records</h2>
          </div>
          <button
            onClick={() => setShowAddBooking(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-brand-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>

        {/* Bookings Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Room No</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Charges</th>
                  <th className="px-6 py-4">Advance Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-350">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{res.guestId?.name}</div>
                      {res.groupBookingId?.groupName && (
                        <div className="text-[9px] text-brand-400 font-bold mt-0.5 uppercase tracking-wider">
                          Group: {res.groupBookingId.groupName}
                        </div>
                      )}
                      {res.additionalGuests && res.additionalGuests.length > 0 && (
                        <div className="text-[9px] text-slate-400 mt-1 font-medium italic">
                          + {res.additionalGuests.length} stayer(s): {res.additionalGuests.map(g => g.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-400">
                      Room {res.roomId?.roomNo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(res.checkInDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(res.checkOutDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-205">${res.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-450">${res.advanceDeposit.toFixed(2)}</td>
                    <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(res.status === 'pending' || res.status === 'checked_in') && (
                        <button
                          onClick={() => openEditGuestsFlow(res)}
                          className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Edit Stayers ({res.additionalGuests?.length || 0})
                        </button>
                      )}
                      {res.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCheckIn(res)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow-sm transition-all"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => deleteReservation(res._id)}
                            className="px-2.5 py-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg text-[10px] cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {res.status === 'checked_in' && (
                        <button
                          onClick={() => openCheckoutFlow(res)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow-sm transition-all"
                        >
                          Checkout Folio
                        </button>
                      )}
                      {res.status === 'checked_out' && (
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}

                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-500 font-semibold">
                      No reservation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Booking */}
        {showAddBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateBooking} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-200">Book Reservation</h3>
              <div className="space-y-3">
                
                {/* Guest Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Guest</label>
                  <select
                    required
                    value={guestId}
                    onChange={(e) => setGuestId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Choose Registered Guest --</option>
                    {guests.map((g) => (
                      <option key={g._id} value={g._id}>{g.name} ({g.phone})</option>
                    ))}
                  </select>
                  {errors.guestId && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.guestId}</p>}
                </div>

                {/* Room Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Available Room</label>
                  <select
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Choose Available Room --</option>
                    {rooms.filter(room => room.status === 'available').map((r) => (
                      <option key={r._id} value={r._id}>Room {r.roomNo} - {r.categoryId?.name} (${r.categoryId?.basePrice}/night)</option>
                    ))}
                  </select>
                  {errors.roomId && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.roomId}</p>}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <DatePicker
                      label="Check-In"
                      required
                      value={checkInDate}
                      onChange={(val) => setCheckInDate(val)}
                    />
                    {errors.checkInDate && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.checkInDate}</p>}
                  </div>
                  <div>
                    <DatePicker
                      label="Check-Out"
                      required
                      value={checkOutDate}
                      onChange={(val) => setCheckOutDate(val)}
                      minDate={checkInDate}
                    />
                    {errors.checkOutDate && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.checkOutDate}</p>}
                  </div>
                </div>

                {/* Rates & Deposits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate ($ per night)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                    />
                    {errors.baseRate && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.baseRate}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advance Deposit ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={advanceDeposit}
                      onChange={(e) => setAdvanceDeposit(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                    />
                    {errors.advanceDeposit && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.advanceDeposit}</p>}
                  </div>
                </div>

                {/* Additional Guests (Optional Stayers) */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Stayers (Optional)</label>
                    <button
                      type="button"
                      onClick={handleAddAdditionalGuestField}
                      className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-350 font-bold uppercase cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stayer
                    </button>
                  </div>
                  {errors.additionalGuests && <p className="text-amber-400 text-[10px] font-semibold">{errors.additionalGuests}</p>}
                  {additionalGuests.length > 0 && (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {additionalGuests.map((g, index) => (
                        <div key={index} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalGuestField(index)}
                            className="absolute top-2 right-2 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="text"
                                required
                                placeholder="Full Name"
                                value={g.name}
                                onChange={(e) => handleUpdateAdditionalGuestField(index, 'name', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                              />
                              {errors[`stayer_${index}_name`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_name`]}</p>}
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Phone"
                                value={g.phone}
                                onChange={(e) => handleUpdateAdditionalGuestField(index, 'phone', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                              />
                              {errors[`stayer_${index}_phone`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_phone`]}</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={g.idType}
                              onChange={(e) => handleUpdateAdditionalGuestField(index, 'idType', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="Government ID">Gov ID</option>
                              <option value="Passport">Passport</option>
                              <option value="Aadhaar">Aadhaar</option>
                              <option value="Driving License">Driving License</option>
                            </select>
                            <div>
                              <input
                                type="text"
                                placeholder="ID Number"
                                value={g.idNumber}
                                onChange={(e) => handleUpdateAdditionalGuestField(index, 'idNumber', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                              />
                              {errors[`stayer_${index}_idNumber`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_idNumber`]}</p>}
                            </div>
                          </div>
                          <div>
                            <input
                              type="email"
                              placeholder="Email Address"
                              value={g.email}
                              onChange={(e) => handleUpdateAdditionalGuestField(index, 'email', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                            />
                            {errors[`stayer_${index}_email`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_email`]}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</label>
                  <textarea
                    placeholder="Booking notes / requests..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-16"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGuestId('');
                    setRoomId('');
                    setCheckInDate('');
                    setCheckOutDate('');
                    setBaseRate('');
                    setAdvanceDeposit('');
                    setBookingNotes('');
                    setAdditionalGuests([]);
                    setErrors({});
                    setShowAddBooking(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Folio Check-out Settle */}
        {showCheckoutModal && folioData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-sm font-bold text-slate-200">Consolidated Room Folio & Checkout</h3>
                <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold">
                  Room {folioData.reservation.roomId?.roomNo}
                </span>
              </div>

              {/* Folio Ledger details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-medium text-slate-400">
                  <span>Guest Profile:</span>
                  <span className="text-slate-200">{folioData.reservation.guestId?.name}</span>
                </div>
                
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="flex justify-between text-slate-400">
                    <span>Room Charges ({Math.ceil(Math.abs(new Date(folioData.reservation.checkOutDate) - new Date(folioData.reservation.checkInDate)) / (1000 * 3600 * 24))} nights):</span>
                    <span className="text-slate-100 font-semibold">${folioData.reservation.totalRoomCharges.toFixed(2)}</span>
                  </div>
                  
                  {/* Extra charges / POS orders */}
                  <div className="border-t border-slate-800/60 pt-1.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Posted Restaurant/POS Charges</span>
                    {folioData.postedOrders.length > 0 ? (
                      folioData.postedOrders.map((o) => (
                        <div key={o._id} className="flex justify-between text-slate-450 pl-2">
                          <span>• POS {o.billNo}:</span>
                          <span>${o.total.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 pl-2 italic">No restaurant charges posted.</span>
                    )}
                  </div>
                </div>

                {/* Summaries */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>${(folioData.reservation.totalRoomCharges + folioData.postedOrders.reduce((s,o)=>s+o.total,0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-450">
                    <span>Advance Deposit Credit:</span>
                    <span className="text-emerald-400 font-semibold">-${folioData.reservation.advanceDeposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold text-slate-100 text-sm">
                    <span>Net Balance Due:</span>
                    <span className="text-brand-400 text-base">${Math.max(0, (folioData.reservation.totalRoomCharges + folioData.postedOrders.reduce((s,o)=>s+o.total,0) - folioData.reservation.advanceDeposit)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Settle Balance via</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'card', 'upi'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-1 text-xs font-bold border rounded-xl cursor-pointer ${
                          paymentMethod === m
                            ? 'bg-brand-600/10 border-brand-500 text-brand-400 shadow-md shadow-brand-500/5'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCheckoutSettle}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-brand-600/10"
                >
                  Settle & Checkout
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal: Edit Stayers */}
        {showEditGuestsModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-sm font-bold text-slate-200">Manage Additional Stayers</h3>
                <span className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold">
                  Room {selectedBooking.roomId?.roomNo || 'N/A'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">
                    Main Guest: <strong className="text-slate-200">{selectedBooking.guestId?.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAdditionalGuestField}
                    className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-350 font-bold uppercase cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Stayer
                  </button>
                </div>
                {errors.additionalGuests && <p className="text-amber-400 text-xs font-semibold">{errors.additionalGuests}</p>}

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {additionalGuests.map((g, index) => (
                    <div key={index} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalGuestField(index)}
                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={g.name}
                            onChange={(e) => handleUpdateAdditionalGuestField(index, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
                          {errors[`stayer_${index}_name`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_name`]}</p>}
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Phone</label>
                          <input
                            type="text"
                            placeholder="Phone"
                            value={g.phone}
                            onChange={(e) => handleUpdateAdditionalGuestField(index, 'phone', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
                          {errors[`stayer_${index}_phone`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_phone`]}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">ID Type</label>
                          <select
                            value={g.idType}
                            onChange={(e) => handleUpdateAdditionalGuestField(index, 'idType', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="Government ID">Gov ID</option>
                            <option value="Passport">Passport</option>
                            <option value="Aadhaar">Aadhaar</option>
                            <option value="Driving License">Driving License</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">ID Number</label>
                          <input
                            type="text"
                            placeholder="ID Number"
                            value={g.idNumber}
                            onChange={(e) => handleUpdateAdditionalGuestField(index, 'idNumber', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
                          {errors[`stayer_${index}_idNumber`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_idNumber`]}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Email</label>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={g.email}
                          onChange={(e) => handleUpdateAdditionalGuestField(index, 'email', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
                        />
                        {errors[`stayer_${index}_email`] && <p className="text-red-400 text-[9px] mt-0.5 font-bold">{errors[`stayer_${index}_email`]}</p>}
                      </div>
                    </div>
                  ))}
                  {additionalGuests.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-6 italic">
                      No additional stayers registered. Click "Add Stayer" to add.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditGuestsModal(false);
                    setSelectedBooking(null);
                    setAdditionalGuests([]);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGuests}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-brand-600/10"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reservations;
