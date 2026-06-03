import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Layers,
  Banknote,
  Calendar,
  Sparkles,
  Utensils,
  Package,
  ChevronDown,
} from 'lucide-react';

const COLORS = ['#5275ff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, [startDate, endDate]);

  const fetchDashboardData = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      // Fetch stats and tables in parallel
      const [statsRes, tablesRes] = await Promise.all([
        axios.get('/orders/stats', { params }),
        axios.get('/tables')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
        if (statsRes.data.data.lowStockProducts) {
          setLowStockProducts(statsRes.data.data.lowStockProducts);
        }
      }

      if (tablesRes.data.success) {
        setTables(tablesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/orders', { params });
      if (response.data.success) {
        const orders = response.data.data;
        if (orders.length === 0) {
          alert('No bill history found for the selected date range.');
          return;
        }

        // Generate CSV content
        const headers = [
          'Bill No',
          'Date',
          'Time',
          'Order Type',
          'Table No',
          'Subtotal (R)',
          'Tax (R)',
          'Discount (R)',
          'Total (R)',
          'Payment Method',
          'Status',
          'Items'
        ];

        const rows = orders.map((order) => {
          const orderDate = new Date(order.createdAt);
          const dateStr = orderDate.toLocaleDateString();
          const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const tableNo = order.tableId?.tableNo || 'N/A';
          
          const itemsStr = order.items
            .map((item) => `${item.name} (${item.quantity})`)
            .join('; ');

          return [
            order.billNo,
            dateStr,
            timeStr,
            order.type,
            tableNo,
            order.subTotal.toFixed(2),
            order.tax.toFixed(2),
            order.discount.toFixed(2),
            order.total.toFixed(2),
            order.paymentMethod,
            order.status,
            `"${itemsStr.replace(/"/g, '""')}"`
          ];
        });

        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        let fileName = 'bill_history';
        if (startDate) fileName += `_from_${startDate}`;
        if (endDate) fileName += `_to_${endDate}`;
        fileName += '.csv';

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to export data', error);
      alert('Error exporting data: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/orders', { params });
      if (response.data.success) {
        const orders = response.data.data;
        if (orders.length === 0) {
          alert('No bill history found for the selected date range.');
          return;
        }

        // Open new window for print document
        const printWindow = window.open('', '_blank');
        
        // Calculate totals
        const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
        const totalSubtotal = orders.reduce((sum, order) => sum + order.subTotal, 0);
        const totalTax = orders.reduce((sum, order) => sum + order.tax, 0);
        const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);

        const title = `Bill History Report${startDate ? ` (${startDate} to ${endDate || 'Present'})` : ''}`;

        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 40px;
                  color: #1e293b;
                  background-color: #ffffff;
                }
                .header {
                  border-bottom: 2px solid #e2e8f0;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 26px;
                  color: #0f172a;
                  font-weight: 800;
                  letter-spacing: -0.5px;
                }
                .header h2 {
                  margin: 5px 0 0;
                  font-size: 18px;
                  color: #64748b;
                  font-weight: 500;
                }
                .header .meta {
                  margin-top: 10px;
                  font-size: 12px;
                  color: #94a3b8;
                }
                .summary-cards {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 15px;
                  margin-bottom: 30px;
                }
                .card {
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 15px;
                  background-color: #f8fafc;
                }
                .card h3 {
                  margin: 0;
                  font-size: 11px;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  font-weight: 600;
                }
                .card p {
                  margin: 6px 0 0;
                  font-size: 20px;
                  font-weight: 700;
                  color: #0f172a;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                  font-size: 12px;
                }
                th, td {
                  border-bottom: 1px solid #e2e8f0;
                  padding: 10px 12px;
                  text-align: left;
                }
                th {
                  background-color: #f1f5f9;
                  font-weight: bold;
                  color: #475569;
                }
                tr:nth-child(even) {
                  background-color: #f8fafc;
                }
                .text-right {
                  text-align: right;
                }
                .bold {
                  font-weight: 700;
                }
                .badge {
                  padding: 3px 8px;
                  border-radius: 9999px;
                  font-size: 10px;
                  font-weight: 600;
                  text-transform: uppercase;
                  display: inline-block;
                }
                .badge-paid { background-color: #d1e7dd; color: #0f5132; }
                .badge-kitchen { background-color: #cff4fc; color: #087990; }
                .badge-ready { background-color: #dbf2e3; color: #198754; }
                .badge-pending { background-color: #f8d7da; color: #842029; }
                .badge-served { background-color: #fff3cd; color: #664d03; }
                .badge-cancelled { background-color: #f8d7da; color: #842029; }
                @media print {
                  body { margin: 15px; }
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>KK Food Canteen</h1>
                <h2>Bill History Report</h2>
                <div class="meta">
                  <span>Generated on: ${new Date().toLocaleString()}</span>
                  ${startDate || endDate ? ` | <span>Period: ${startDate || 'Beginning'} to ${endDate || 'Present'}</span>` : ' | <span>Period: All Time</span>'}
                </div>
              </div>

              <div class="summary-cards">
                <div class="card">
                  <h3>Total Bills</h3>
                  <p>${orders.length}</p>
                </div>
                <div class="card">
                  <h3>Subtotal</h3>
                  <p>₹${totalSubtotal.toFixed(2)}</p>
                </div>
                <div class="card">
                  <h3>Total Discount</h3>
                  <p>₹${totalDiscount.toFixed(2)}</p>
                </div>
                <div class="card">
                  <h3>Net Revenue</h3>
                  <p>₹${totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Date & Time</th>
                    <th>Order Type</th>
                    <th>Table</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders.map(order => {
                    const orderDate = new Date(order.createdAt);
                    const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const tableNo = order.tableId?.tableNo || 'N/A';
                    const badgeClass = `badge-${order.status}`;
                    return `
                      <tr>
                        <td class="bold">${order.billNo}</td>
                        <td>${formattedDate}</td>
                        <td style="text-transform: capitalize;">${order.type}</td>
                        <td>${tableNo}</td>
                        <td style="text-transform: capitalize;">${order.paymentMethod}</td>
                        <td><span class="badge ${badgeClass}">${order.status}</span></td>
                        <td class="text-right bold">₹${order.total.toFixed(2)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to export PDF data', error);
      alert('Error exporting PDF: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const activeTablesCount = tables.filter((t) => t.status !== 'available').length;

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64 pb-12">
      <Navbar title="Management Analytics Dashboard" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Date Range Selector & Export Controls */}
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-base">Filter Reports</h3>
              <p className="text-xs text-slate-500">Filter all dashboard metrics and export bill history</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto items-end">
            <div className="flex flex-col gap-1.5 flex-1 md:w-44">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1 md:w-44">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-all hover:bg-slate-950/50"
              >
                Clear
              </button>
            )}

            {/* Export Dropdown */}
            <div 
              className="relative"
              ref={dropdownRef}
            >
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={exporting}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-10 py-1.5 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      handleExportCSV();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      handleExportPDF();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Download PDF Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Hero Stat Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Revenue */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-brand-500 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {startDate || endDate ? 'Period Sales' : 'Cumulative Sales'}
              </span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">₹{stats.totalRevenue?.toFixed(2)}</h3>
              <span className="text-[10px] text-brand-400 font-medium block mt-1.5">
                {startDate || endDate ? 'For Selected Period' : 'All Settle Invoices'}
              </span>
            </div>
            <div className="p-3.5 bg-brand-500/10 text-brand-400 rounded-xl">
              <Banknote className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Revenue This Month */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-emerald-500 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">This Month Revenue</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">₹{stats.revenueThisMonth?.toFixed(2)}</h3>
              <span className="text-[10px] text-emerald-400 font-medium block mt-1.5">Current Month Period</span>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Active Orders */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-amber-500 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Orders (KOT)</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.activeOrdersCount}</h3>
              <span className="text-[10px] text-amber-400 font-medium block mt-1.5">{stats.pendingBillsCount} Unpaid Bills Running</span>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Occupied Tables */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-indigo-500 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Dining Tables Occupied</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.occupiedTablesCount} / {tables.length}</h3>
              <span className="text-[10px] text-indigo-400 font-medium block mt-1.5">{tables.length - stats.occupiedTablesCount} Available Tables</span>
            </div>
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sales Area Chart (8/12 cols) */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h4 className="font-bold text-slate-100 text-base">
                {startDate || endDate ? 'Sales Revenue Trend (₹)' : '7-Day Revenue Trend (₹)'}
              </h4>
            </div>

            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5275ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5275ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#5275ff" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dish Category Share Pie Chart (4/12 cols) */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h4 className="font-bold text-slate-100 text-base">Sales by Category</h4>
            </div>

            <div className="h-[260px] flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total sold</span>
                <span className="text-2xl font-black text-slate-100">
                  {stats.categorySales.reduce((a, b) => a + b.value, 0)}
                </span>
              </div>
            </div>

            {/* Custom Legends */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
              {stats.categorySales.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="truncate">{item.name} ({item.value})</span>
                </div>
              ))}
              {stats.categorySales.length === 0 && (
                <div className="col-span-2 text-center text-xs text-slate-500 italic">No sales recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Warning & Table Occupancy Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alert Dashboard Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <h4 className="font-bold text-slate-100 text-base">Low Stock Alerts</h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10">
                {lowStockProducts.length} Items Low
              </span>
            </div>

            <div className="overflow-y-auto max-h-[220px] divide-y divide-slate-800/50 pr-2">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <h5 className="font-semibold text-sm text-slate-100">{p.name}</h5>
                      <span className="text-[10px] text-slate-500">Min. stock limit: {p.minStockLevel} {p.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-red-400 block">{p.stockQuantity} {p.unit}</span>
                    <span className="text-[10px] text-red-400/80 font-medium">Critical Reorder</span>
                  </div>
                </div>
              ))}

              {lowStockProducts.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 italic">
                  All inventory raw material levels are healthy!
                </div>
              )}
            </div>
          </div>

          {/* Occupied dining tables layout */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-brand-400" />
                <h4 className="font-bold text-slate-100 text-base">Occupied Tables Overview</h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/10">
                {activeTablesCount} Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2">
              {tables.map((t) => {
                const isActive = t.status !== 'available';
                return (
                  <div
                    key={t._id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-red-500/5 border-red-500/25 text-red-400 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-200">{t.tableNo}</h5>
                      <span className="text-[9px] text-slate-500">Capacity: {t.capacity} guests</span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {isActive ? 'Occupied' : 'Free'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
