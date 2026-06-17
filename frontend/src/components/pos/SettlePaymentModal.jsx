import React, { useEffect } from 'react';
import { X, Banknote, Smartphone, CreditCard, Bed } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';
import { useHotelStore } from '../../store/useHotelStore';

const SettlePaymentModal = () => {
  const isSettleModalOpen = usePosStore((state) => state.isSettleModalOpen);
  const loading = usePosStore((state) => state.loading);
  const cart = usePosStore((state) => state.cart);
  const discount = usePosStore((state) => state.discount);
  const taxRate = usePosStore((state) => state.taxRate);

  const paymentMethod = usePosStore((state) => state.paymentMethod);
  const paymentDetails = usePosStore((state) => state.paymentDetails);
  const selectedRoomId = usePosStore((state) => state.roomId);

  const setPaymentMethod = usePosStore((state) => state.setPaymentMethod);
  const setPaymentDetails = usePosStore((state) => state.setPaymentDetails);
  const setRoomId = usePosStore((state) => state.setRoomId);
  const setReservationId = usePosStore((state) => state.setReservationId);
  const setIsSettleModalOpen = usePosStore((state) => state.setIsSettleModalOpen);
  const settleOrder = usePosStore((state) => state.settleOrder);

  // Fetch reservations from hotel store
  const { reservations, fetchReservations } = useHotelStore();

  useEffect(() => {
    if (isSettleModalOpen) {
      fetchReservations();
    }
  }, [isSettleModalOpen, fetchReservations]);

  if (!isSettleModalOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const netTotal = Math.max(0, subtotal + tax - discount);

  // Filter for checked_in guests only
  const activeBookings = reservations.filter((r) => r.status === 'checked_in');

  const handleSelectBooking = (e) => {
    const bookingId = e.target.value;
    if (!bookingId) {
      setRoomId(null);
      setReservationId(null);
      return;
    }
    const booking = activeBookings.find((r) => r._id === bookingId);
    if (booking) {
      setRoomId(booking.roomId?._id || null);
      setReservationId(booking._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 text-base">Settle POS Payment</h3>
          <button onClick={() => setIsSettleModalOpen(false)} className="text-slate-400 hover:text-slate-205 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={settleOrder} className="space-y-6 pt-4">
          <div className="text-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold tracking-wide">Total Payable Amount</span>
            <h4 className="text-3xl font-extrabold text-brand-400 mt-1">${netTotal.toFixed(2)}</h4>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Receiving Method</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'room', label: 'Room Folio', icon: Bed },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                      if (method.id !== 'room') {
                        setRoomId(null);
                        setReservationId(null);
                      }
                    }}
                    className={`py-3 px-1 border rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-600/10 border-brand-500 text-brand-400 shadow-md shadow-brand-500/5'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post to Room Details */}
          {paymentMethod === 'room' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Checked-in Guest Room</label>
              <select
                onChange={handleSelectBooking}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
              >
                <option value="">-- Choose Occupied Room --</option>
                {activeBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    Room {booking.roomId?.roomNo || 'N/A'} - {booking.guestId?.name}
                  </option>
                ))}
              </select>
              {activeBookings.length === 0 && (
                <p className="text-[10px] text-amber-400 mt-1">No guests are currently checked in to the resort.</p>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Transaction Notes (Optional)</label>
            <input
              type="text"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder={paymentMethod === 'room' ? 'e.g. Room service delivery notes' : 'e.g. UPI Ref Number, card slip digits'}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsSettleModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || (paymentMethod === 'room' && !selectedRoomId)}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-brand-600/10"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlePaymentModal;
