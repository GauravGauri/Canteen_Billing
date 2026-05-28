import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import InvoiceModal from '../components/InvoiceModal';
import KotModal from '../components/KotModal';
import { Eye, Printer, Filter, Calendar, CreditCard, ChevronDown } from 'lucide-react';

const BillingHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printedOrder, setPrintedOrder] = useState(null);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showKotModal, setShowKotModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/orders', {
        params: {
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        },
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = (order) => {
    setPrintedOrder(order);
    setShowInvoiceModal(true);
  };

  const handleOpenKOT = (order) => {
    setPrintedOrder(order);
    setShowKotModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Paid</span>;
      case 'kitchen':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">In Kitchen</span>;
      case 'served':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Served</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-64">
      <Navbar title="Billing History" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Filters Header */}
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">Filter Bills</h3>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Status Filter */}
            <div className="relative flex-1 md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="kitchen">In Kitchen</option>
                <option value="served">Served</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative flex-1 md:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none text-slate-300"
              >
                <option value="">All Types</option>
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Bill No</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Table</th>
                  <th className="px-6 py-4">Order Type</th>
                  <th className="px-6 py-4">Bill Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{order.billNo}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {order.tableId?.tableNo || 'Takeaway'}
                    </td>
                    <td className="px-6 py-4 capitalize">{order.type}</td>
                    <td className="px-6 py-4 font-bold text-brand-400">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 capitalize text-xs">
                      {order.paymentMethod === 'unpaid' ? (
                        <span className="text-red-400 font-semibold">Unpaid</span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{order.paymentMethod}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenKOT(order)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold transition-all inline-flex items-center gap-1 text-slate-300 hover:bg-slate-800"
                        title="Print Kitchen Ticket"
                      >
                        <Printer className="w-3 h-3" />
                        <span>KOT</span>
                      </button>
                      <button
                        onClick={() => handleOpenInvoice(order)}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-all inline-flex items-center gap-1 shadow-sm"
                        title="View & Print Bill Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                      No billing records match the filters.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-brand-400 font-semibold">
                      Fetching history records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={printedOrder}
      />

      {/* KOT Modal */}
      <KotModal
        isOpen={showKotModal}
        onClose={() => setShowKotModal(false)}
        order={printedOrder}
      />
    </div>
  );
};

export default BillingHistory;
