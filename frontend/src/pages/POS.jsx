import React, { useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';
import Navbar from '../components/Navbar';
import KotModal from '../components/KotModal';
import InvoiceModal from '../components/InvoiceModal';
import TableManagementModal from '../components/TableManagementModal';

// POS sub-components
import TableSelector from '../components/pos/TableSelector';
import MenuSection from '../components/pos/MenuSection';
import CartSection from '../components/pos/CartSection';
import SettlePaymentModal from '../components/pos/SettlePaymentModal';

const POS = () => {
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

  useEffect(() => {
    fetchTables();
    fetchDishes();
  }, [fetchTables, fetchDishes]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Point of Sale (POS)" />

      {/* Main Container */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        
        {/* Left Side: Tables & Menu Grid (8/12 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
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
        <div className="lg:col-span-4">
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
    </div>
  );
};

export default POS;
