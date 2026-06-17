import React, { useEffect, useState } from 'react';
import { usePosStore } from '../store/usePosStore';
import Navbar from '../components/Navbar';
import KotModal from '../components/KotModal';
import InvoiceModal from '../components/InvoiceModal';
import TableManagementModal from '../components/TableManagementModal';
import { ShoppingCart, X } from 'lucide-react';

// POS sub-components
import TableSelector from '../components/pos/TableSelector';
import MenuSection from '../components/pos/MenuSection';
import CartSection from '../components/pos/CartSection';
import SettlePaymentModal from '../components/pos/SettlePaymentModal';

const POSBilling = () => {
  const fetchTables = usePosStore((state) => state.fetchTables);
  const fetchDishes = usePosStore((state) => state.fetchDishes);
  const message = usePosStore((state) => state.message);

  // Modals & UI States from store
  const isTableModalOpen = usePosStore((state) => state.isTableModalOpen);
  const showKotModal = usePosStore((state) => state.showKotModal);
  const showInvoiceModal = usePosStore((state) => state.showInvoiceModal);
  const printedOrder = usePosStore((state) => state.printedOrder);
  
  const setIsTableModalOpen = usePosStore((state) => state.setIsTableModalOpen);
  const setShowKotModal = usePosStore((state) => state.setShowKotModal);
  const setShowInvoiceModal = usePosStore((state) => state.setShowInvoiceModal);

  // Local mobile cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart calculations for floating button
  const cart = usePosStore((state) => state.cart);
  const discount = usePosStore((state) => state.discount);
  const taxRate = usePosStore((state) => state.taxRate);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const netTotal = Math.max(0, subtotal + tax - discount);

  useEffect(() => {
    fetchTables();
    fetchDishes();
  }, [fetchTables, fetchDishes]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Point of Sale (POS) Billing" />

      {/* Main Container */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Side: Tables & Menu Grid (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Banner Alert */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center justify-between border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              <span>{message.text}</span>
            </div>
          )}

          {/* Table Selector Grid */}
          <TableSelector />

          {/* Menu Search & Category Filters */}
          <MenuSection />
        </div>

        {/* Right Side: Order Cart Panel (4/12 cols) */}
        <div className="hidden lg:block lg:col-span-4">
          <CartSection />
        </div>

      </div>

      {/* Settle Bill Modal */}
      <SettlePaymentModal />

      {/* KOT Receipt Modal */}
      <KotModal
        isOpen={showKotModal}
        onClose={() => setShowKotModal(false)}
        order={printedOrder}
      />

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={printedOrder}
      />

      {/* Table Management Modal */}
      <TableManagementModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onRefresh={fetchTables}
      />

      {/* Mobile Floating Cart Trigger Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-500 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all animate-bounce cursor-pointer"
          title="Open Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs">({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
          <span className="bg-brand-700 px-2 py-0.5 rounded-lg text-[10px]">${netTotal.toFixed(0)}</span>
        </button>
      )}

      {/* Mobile Cart Drawer Backdrop */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        />
      )}

      {/* Mobile Cart Drawer Panel */}
      <div className={`lg:hidden fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      } p-4 flex flex-col`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">Your Order Cart</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <CartSection isDrawer={true} onClose={() => setIsCartOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default POSBilling;
