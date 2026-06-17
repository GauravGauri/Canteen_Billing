import React, { useEffect } from 'react';
import { useHotelStore } from '../store/useHotelStore';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Bed,
  CreditCard,
  Percent,
  Clock,
  AlertTriangle,
  RefreshCw,
  CalendarCheck,
  CheckCircle,
} from 'lucide-react';
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
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#6b7280'];

const Dashboard = () => {
  const { stats, loading, fetchDashboardStats } = useHotelStore();
  const { user, roleLabels } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400">Loading Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  // Fallback default stats if none returned yet
  const defaultStats = {
    todayRevenue: 0,
    totalSales: 0,
    activeTransactions: 0,
    occupancyPercentage: 0,
    roomStatuses: { available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0, out_of_service: 0 },
    dailyRevenueHistory: [],
    paymentBreakdown: { cash: 0, card: 0, upi: 0 },
    pendingDues: 0,
    recentTransactions: [],
  };

  const data = stats || defaultStats;

  // Pie chart data
  const pieData = Object.keys(data.roomStatuses).map((status) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: data.roomStatuses[status],
  })).filter(item => item.value > 0);

  // Bar chart data for payments
  const barData = Object.keys(data.paymentBreakdown).map((method) => ({
    method: method.toUpperCase(),
    amount: data.paymentBreakdown[method],
  }));

  return (
    <div className="p-6 lg:pl-72 min-h-screen bg-slate-900 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Dashboard & Analytics</h1>
          <p className="text-sm text-slate-400">
            Welcome back, <span className="font-semibold text-brand-400">{user?.username}</span> (Role: {roleLabels[user?.role]})
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Revenue */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Revenue</p>
            <h3 className="text-2xl font-extrabold text-emerald-400">${data.todayRevenue.toFixed(2)}</h3>
            <p className="text-[10px] text-slate-400">Room checkouts + POS sales</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room Occupancy</p>
            <h3 className="text-2xl font-extrabold text-blue-400">{data.occupancyPercentage}%</h3>
            <p className="text-[10px] text-slate-400">Total active occupied rooms</p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Active Transactions */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Operations</p>
            <h3 className="text-2xl font-extrabold text-brand-400">{data.activeTransactions}</h3>
            <p className="text-[10px] text-slate-400">Current guests + POS bills</p>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Folio Dues */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Dues</p>
            <h3 className="text-2xl font-extrabold text-amber-400">${data.pendingDues.toFixed(2)}</h3>
            <p className="text-[10px] text-slate-400">Dues from checked-in guests</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="glass-card p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Revenue Performance</h3>
            <p className="text-[11px] text-slate-500">Split daily revenue between room checkouts and restaurant/POS items</p>
          </div>
          <div className="h-72">
            {data.dailyRevenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyRevenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRoom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPOS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="RoomRevenue" name="Room Bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRoom)" />
                  <Area type="monotone" dataKey="POSRevenue" name="POS & Dining" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPOS)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No revenue history available. Open POS or checkout a guest to populate.
              </div>
            )}
          </div>
        </div>

        {/* Room Status Breakdown (Pie Chart) */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Room Statuses</h3>
            <p className="text-[11px] text-slate-500">Live operational status of resort rooms</p>
          </div>
          <div className="h-60 flex items-center justify-center relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No rooms loaded in system yet.</div>
            )}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-100">{stats?.roomStatuses.occupied || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Occupied</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-400 font-medium truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Payments Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Payment Breakdown</h3>
            <p className="text-[11px] text-slate-500">Sales settlement options breakdown (UPI, Cash, Card)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="method" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.method === 'UPI' ? '#10b981' : entry.method === 'CARD' ? '#3b82f6' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-card p-5 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-300">Recent Transactions</h3>
              <p className="text-[11px] text-slate-500">Latest settled guest checkouts and restaurant bills</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Module</th>
                  <th className="py-2.5">Reference</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40 text-slate-300">
                      <td className="py-2.5">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                          tx.type.includes('Checkout') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium">{tx.ref}</td>
                      <td className="py-2.5 font-bold text-slate-100">${tx.amount.toFixed(2)}</td>
                      <td className="py-2.5 font-semibold uppercase text-[10px] text-slate-400">{tx.paymentMethod}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                      No recent transactions found. Get started by booking a reservation!
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

export default Dashboard;
