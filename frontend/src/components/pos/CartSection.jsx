import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Printer, Receipt } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';

const CartSection = () => {
  const cart = usePosStore((state) => state.cart);
  const discount = usePosStore((state) => state.discount);
  const taxRate = usePosStore((state) => state.taxRate);
  const orderType = usePosStore((state) => state.orderType);
  const selectedTable = usePosStore((state) => state.selectedTable);
  const onlinePlatform = usePosStore((state) => state.onlinePlatform);
  const tableActiveOrders = usePosStore((state) => state.tableActiveOrders);
  const currentOrder = usePosStore((state) => state.currentOrder);
  const loading = usePosStore((state) => state.loading);

  const setDiscount = usePosStore((state) => state.setDiscount);
  const setOnlinePlatform = usePosStore((state) => state.setOnlinePlatform);
  const startNewSharedOrder = usePosStore((state) => state.startNewSharedOrder);
  const loadOrderIntoCart = usePosStore((state) => state.loadOrderIntoCart);
  const adjustQty = usePosStore((state) => state.adjustQty);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  const cancelOrder = usePosStore((state) => state.cancelOrder);
  const sendToKitchen = usePosStore((state) => state.sendToKitchen);
  const setIsSettleModalOpen = usePosStore((state) => state.setIsSettleModalOpen);
  const quickBill = usePosStore((state) => state.quickBill);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const netTotal = Math.max(0, subtotal + tax - discount);

  return (
    <div className="glass rounded-3xl p-6 border border-slate-800 sticky top-28 flex flex-col max-h-[82vh] justify-between shadow-2xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-slate-100 text-base">Current Cart</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
            {orderType === 'dine-in' ? `${selectedTable?.tableNo || 'Table'}` : orderType}
          </span>
        </div>

        {/* Online Platform Selector */}
        {orderType === 'online' && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl mb-4 space-y-1.5 shadow-inner">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Online Platform</label>
            <select
              value={onlinePlatform}
              onChange={(e) => setOnlinePlatform(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Zomato">Zomato</option>
              <option value="Swiggy">Swiggy</option>
              <option value="Canteen Website">Canteen Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}

        {/* Table Sharing Active Orders Selection */}
        {orderType === 'dine-in' && selectedTable && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl mb-4 space-y-2 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Customers</span>
              <button
                type="button"
                onClick={startNewSharedOrder}
                className="text-[10px] font-bold text-brand-400 hover:text-brand-350 flex items-center gap-0.5 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New Customer</span>
              </button>
            </div>
            
            {tableActiveOrders.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tableActiveOrders.map((ord, idx) => {
                  const isSelected = currentOrder?._id === ord._id;
                  return (
                    <button
                      key={ord._id}
                      type="button"
                      onClick={() => loadOrderIntoCart(ord)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-brand-600/10 border-brand-500 text-brand-400 shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Cust {idx + 1} ({ord.billNo.slice(-4)})
                    </button>
                  );
                })}
                {!currentOrder && cart.length > 0 && (
                  <span className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-emerald-500 bg-emerald-500/5 text-emerald-400 animate-pulse">
                    New Draft *
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">No active orders. Send KOT to start.</div>
            )}
          </div>
        )}

        {/* Cart Items list */}
        <div className="overflow-y-auto max-h-[30vh] pr-1 space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.dishId} className="flex items-center justify-between bg-slate-900/50 border border-slate-800/60 p-3 rounded-xl">
              <div className="max-w-[55%]">
                <h5 className="font-semibold text-xs text-slate-100 truncate">{item.name}</h5>
                <span className="text-[10px] text-slate-500">₹{item.price} each</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                  <button
                    onClick={() => adjustQty(item.dishId, 'decrease')}
                    className="p-1 rounded text-slate-400 hover:text-slate-200"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold px-2 text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => adjustQty(item.dishId, 'increase')}
                    className="p-1 rounded text-slate-400 hover:text-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.dishId)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <ShoppingCart className="w-8 h-8 opacity-25" />
              <span>Cart is empty. Add dishes to start billing.</span>
            </div>
          )}
        </div>
      </div>

      {/* Calculations & Checkout */}
      <div className="border-t border-slate-850 pt-4 space-y-4">
        <div className="space-y-2 text-xs">
          {/* Discount input */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Discount (₹)</span>
            <input
              type="number"
              min="0"
              value={discount === 0 ? '' : discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-right text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none text-slate-200"
            />
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tax (GST 5%)</span>
            <span>₹{tax}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-100 font-bold text-sm border-t border-slate-800 pt-2.5">
            <span>Total Amount</span>
            <span className="text-brand-400 text-base">₹{netTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={cancelOrder}
            disabled={cart.length === 0 || loading}
            className="py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/5 font-medium text-xs transition-all disabled:opacity-40"
          >
            {currentOrder ? 'Cancel Order' : 'Clear Cart'}
          </button>

          <button
            onClick={sendToKitchen}
            disabled={cart.length === 0 || loading}
            className="py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-brand-400 hover:text-brand-350 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Send KOT</span>
          </button>

          <button
            onClick={() => setIsSettleModalOpen(true)}
            disabled={cart.length === 0 || loading}
            className="col-span-2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-600/15 transition-all disabled:opacity-40"
          >
            <Receipt className="w-4 h-4" />
            <span>Settle & Print Bill</span>
          </button>

          <div className="col-span-2 border-t border-slate-800/80 pt-3 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">Quick Bill (Instant Settle)</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickBill('cash')}
                disabled={cart.length === 0 || loading}
                className="py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/20 disabled:text-emerald-500/50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-emerald-950/20"
              >
                <span>⚡ Cash</span>
              </button>
              <button
                type="button"
                onClick={() => quickBill('upi')}
                disabled={cart.length === 0 || loading}
                className="py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/20 disabled:text-blue-500/50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-blue-950/20"
              >
                <span>⚡ UPI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSection;
