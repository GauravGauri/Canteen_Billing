import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { DollarSign, Calendar, RefreshCw, CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-react';

const PaymentReports = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Report statistics
  const [stats, setStats] = useState({
    cashSum: 0,
    cardSum: 0,
    upiSum: 0,
    totalSum: 0,
    posCount: 0,
    roomsCount: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Get POS Orders
      const orderRes = await axios.get('/orders', {
        params: {
          status: 'paid',
          startDate,
          endDate,
        },
      });

      // Get Checkouts
      const resRes = await axios.get('/reservations');

      let ordersData = [];
      if (orderRes.data.success) {
        ordersData = orderRes.data.data.filter(o => o.paymentMethod !== 'room'); // exclude room postings as they are settled at checkout
      }

      let checkoutsData = [];
      if (resRes.data.success) {
        // filter checked_out reservations settled within range
        checkoutsData = resRes.data.data.filter((r) => {
          if (r.status !== 'checked_out') return false;
          const checkoutDate = new Date(r.updatedAt).toISOString().slice(0, 10);
          return checkoutDate >= startDate && checkoutDate <= endDate;
        });
      }

      // Merge into unified transaction logs
      const combined = [
        ...ordersData.map((o) => ({
          id: o._id,
          date: o.updatedAt,
          type: 'Restaurant POS',
          ref: o.billNo,
          amount: o.total,
          method: o.paymentMethod,
        })),
        ...checkoutsData.map((r) => ({
          id: r._id,
          date: r.updatedAt,
          type: `Room Checkout (${r.roomId?.roomNo || 'N/A'})`,
          ref: r.guestId?.name || 'Guest',
          amount: r.paidAmount,
          method: r.paymentMethod,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate summaries
      let cash = 0, card = 0, upi = 0;
      combined.forEach((tx) => {
        if (tx.method === 'cash') cash += tx.amount;
        else if (tx.method === 'card') card += tx.amount;
        else if (tx.method === 'upi') upi += tx.amount;
      });

      setTransactions(combined);
      setStats({
        cashSum: cash,
        cardSum: card,
        upiSum: upi,
        totalSum: cash + card + upi,
        posCount: ordersData.length,
        roomsCount: checkoutsData.length,
      });
    } catch (err) {
      console.error('Failed to load reports data', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate simple CSV download
    const headers = 'Date,Type,Reference,Amount,Method\n';
    const rows = transactions.map((t) => 
      `"${new Date(t.date).toLocaleDateString()}","${t.type}","${t.ref}",${t.amount},"${t.method.toUpperCase()}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reconciliation_Report_${startDate}_to_${endDate}.csv`);
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Payment Reconciliation & Reports" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Filter Toolbar */}
        <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-slate-100">Select Date Range</h2>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-slate-500 text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Summaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Total Collections */}
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Collection</span>
              <h3 className="text-2xl font-extrabold text-brand-400">${stats.totalSum.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">{stats.posCount} POS | {stats.roomsCount} Rooms</p>
            </div>
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Cash Sum */}
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Cash Collection</span>
              <h3 className="text-2xl font-extrabold text-emerald-400">${stats.cashSum.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-500">Handled in drawer</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Banknote className="w-6 h-6" />
            </div>
          </div>

          {/* Card Sum */}
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Card Collection</span>
              <h3 className="text-2xl font-extrabold text-blue-400">${stats.cardSum.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-500">Terminal card settlements</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* UPI Sum */}
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">UPI / QR Collections</span>
              <h3 className="text-2xl font-extrabold text-purple-400">${stats.upiSum.toFixed(2)}</h3>
              <p className="text-[10px] text-slate-500">Instant digital transfers</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Audit Trail List */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-350 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Financial Audit Ledger</span>
              </h3>
              <p className="text-[10px] text-slate-500">List of transactions processed in selected range</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Reference Name</th>
                  <th className="py-3 px-4">Settled Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-4 text-slate-450">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        tx.type.includes('Checkout') ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{tx.ref}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] uppercase font-bold text-slate-400">
                        {tx.method}
                      </span>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                      No payments processed in this range.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-brand-400 font-semibold">
                      Compiling report data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentReports;
