import React from 'react';
import { X, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';

const SettlePaymentModal = () => {
  const isSettleModalOpen = usePosStore((state) => state.isSettleModalOpen);
  const loading = usePosStore((state) => state.loading);
  const cart = usePosStore((state) => state.cart);
  const discount = usePosStore((state) => state.discount);
  const taxRate = usePosStore((state) => state.taxRate);

  const paymentMethod = usePosStore((state) => state.paymentMethod);
  const paymentDetails = usePosStore((state) => state.paymentDetails);

  const setPaymentMethod = usePosStore((state) => state.setPaymentMethod);
  const setPaymentDetails = usePosStore((state) => state.setPaymentDetails);
  const setIsSettleModalOpen = usePosStore((state) => state.setIsSettleModalOpen);
  const settleOrder = usePosStore((state) => state.settleOrder);

  if (!isSettleModalOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const netTotal = Math.max(0, subtotal + tax - discount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 text-base">Settle POS Payment</h3>
          <button onClick={() => setIsSettleModalOpen(false)} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={settleOrder} className="space-y-6 pt-4">
          <div className="text-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Payable Amount</span>
            <h4 className="text-3xl font-extrabold text-brand-400 mt-1">₹{netTotal.toFixed(2)}</h4>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Receiving Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                { id: 'card', label: 'Card', icon: CreditCard },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-600/10 border-brand-500 text-brand-400'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Transaction Notes (Optional)</label>
            <input
              type="text"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="e.g. UPI Ref Number, card slip digits"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsSettleModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-850"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl"
            >
              Settle Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlePaymentModal;
