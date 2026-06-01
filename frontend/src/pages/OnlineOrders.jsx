import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import KotModal from '../components/KotModal';
import InvoiceModal from '../components/InvoiceModal';
import { 
  Globe, 
  Play, 
  Check, 
  X, 
  Clock, 
  User, 
  MapPin, 
  Utensils, 
  AlertTriangle, 
  ChevronRight, 
  Bell, 
  CheckCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const OnlineOrders = () => {
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printedOrder, setPrintedOrder] = useState(null);
  const [showKotModal, setShowKotModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('all');

  // Load orders & dishes
  useEffect(() => {
    fetchOrders();
    fetchDishes();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders', { params: { type: 'online' } });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load online orders', error);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get('/dishes');
      if (response.data.success) {
        setDishes(response.data.data.filter(d => d.isAvailable));
      }
    } catch (error) {
      console.error('Failed to load menu dishes', error);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Synthesize standard Web Audio chime on new incoming order
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
      
      setTimeout(() => {
        const audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
        const osc2 = audioCtx2.createOscillator();
        const gain2 = audioCtx2.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx2.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, audioCtx2.currentTime); // G5
        gain2.gain.setValueAtTime(0.08, audioCtx2.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx2.currentTime + 0.35);
        osc2.start();
        osc2.stop(audioCtx2.currentTime + 0.35);
      }, 150);
    } catch (e) {
      console.warn("Chime muted or context block", e);
    }
  };

  // Simulate incoming order
  const handleSimulateOrder = async (platform) => {
    if (dishes.length === 0) {
      showMsg('error', 'Cannot simulate order: No available dishes in menu');
      return;
    }

    setLoading(true);
    try {
      // Pick 1-3 random dishes
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let subTotal = 0;

      for (let i = 0; i < itemCount; i++) {
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const exists = orderItems.find(item => item.dishId === dish._id);
        
        if (!exists) {
          orderItems.push({
            dishId: dish._id,
            name: dish.name,
            price: dish.price,
            quantity: qty
          });
          subTotal += dish.price * qty;
        }
      }

      const tax = Number((subTotal * 0.05).toFixed(2));
      const total = subTotal + tax;
      
      const customNames = ['Gaurav Sharma', 'Aarti Patel', 'Vikram Rathore', 'Pooja Verma', 'Karan Johar', 'Sneha Kapoor', 'Rahul Verma'];
      const customAddresses = ['Boys Hostel A, Room 102', 'Girls Hostel B, Room 304', 'Staff Quarter C-4', 'Academic Block Main Lobby', 'Canteen Plaza Lawn Seat #4', 'IT Center Ground Floor'];
      const valets = ['Ramesh (Zomato Valet)', 'Suresh (Swiggy Captain)', 'Raj (Canteen Runner)', 'Aman (Valet)'];

      const randomName = customNames[Math.floor(Math.random() * customNames.length)];
      const randomAddress = customAddresses[Math.floor(Math.random() * customAddresses.length)];
      const randomValet = valets[Math.floor(Math.random() * valets.length)];
      const deliveryInstructions = Math.random() > 0.5 ? 'Leave at front door' : 'Call on arrival';

      const payload = {
        type: 'online',
        items: orderItems,
        subTotal,
        tax,
        discount: 0,
        total,
        status: 'pending', // Starts in pending acceptance state
        paymentMethod: 'upi', // Pre-paid online
        paymentDetails: `Platform: ${platform} | Address: ${randomAddress} | Customer: ${randomName} | Valet: ${randomValet} | Notes: ${deliveryInstructions}`
      };

      const response = await axios.post('/orders', payload);
      if (response.data.success) {
        showMsg('success', `Incoming ${platform} Order simulated successfully!`);
        fetchOrders();
        playChime();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to simulate incoming order.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, nextStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(`/orders/${orderId}`, { status: nextStatus });
      if (response.data.success) {
        const updatedOrder = response.data.data;
        showMsg('success', `Order status updated to "${nextStatus}"`);
        
        // Show KOT Modal automatically when accepted to Kitchen
        if (nextStatus === 'kitchen') {
          setPrintedOrder(updatedOrder);
          setShowKotModal(true);
        }
        // Show Invoice Modal automatically when completed/paid
        if (nextStatus === 'paid') {
          setPrintedOrder(updatedOrder);
          setShowInvoiceModal(true);
        }

        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColors = (platformInfo) => {
    const info = String(platformInfo).toLowerCase();
    if (info.includes('zomato')) {
      return {
        bg: 'bg-red-500/10 border-red-500/30 hover:border-red-500/50',
        badge: 'bg-red-500 text-white',
        text: 'text-red-400',
        glow: 'shadow-red-500/10',
        name: 'Zomato'
      };
    }
    if (info.includes('swiggy')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-500',
        glow: 'shadow-amber-500/10',
        name: 'Swiggy'
      };
    }
    return {
      bg: 'bg-brand-500/10 border-brand-500/30 hover:border-brand-500/50',
      badge: 'bg-brand-600 text-white',
      text: 'text-brand-400',
      glow: 'shadow-brand-500/10',
      name: 'Canteen Web'
    };
  };

  const parsePaymentDetails = (detailsStr) => {
    const details = {
      platform: 'Online',
      customer: 'Guest Client',
      address: 'Canteen Pickup',
      valet: 'Self Collection',
      notes: ''
    };
    if (!detailsStr) return details;
    const parts = detailsStr.split(' | ');
    parts.forEach(part => {
      if (part.startsWith('Platform:')) details.platform = part.replace('Platform:', '').trim();
      if (part.startsWith('Customer:')) details.customer = part.replace('Customer:', '').trim();
      if (part.startsWith('Address:')) details.address = part.replace('Address:', '').trim();
      if (part.startsWith('Valet:')) details.valet = part.replace('Valet:', '').trim();
      if (part.startsWith('Notes:')) details.notes = part.replace('Notes:', '').trim();
    });
    return details;
  };

  // Group orders by current active columns
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'kitchen');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const outOrders = orders.filter(o => o.status === 'served');
  const deliveredOrders = orders.filter(o => o.status === 'paid').slice(0, 10); // show last 10 completed

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-64 pb-12">
      <Navbar title="Digital Channels Order Hub" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Simulator controls and statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Channel Stats */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border-l-4 border-red-500">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Zomato Orders</span>
              <h3 className="text-xl font-black text-slate-100 mt-1">
                {orders.filter(o => String(o.paymentDetails).includes('Zomato')).length} Active
              </h3>
            </div>
            <div className="glass-card p-5 rounded-2xl border-l-4 border-amber-500">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Swiggy Orders</span>
              <h3 className="text-xl font-black text-slate-100 mt-1">
                {orders.filter(o => String(o.paymentDetails).includes('Swiggy')).length} Active
              </h3>
            </div>
            <div className="glass-card p-5 rounded-2xl border-l-4 border-brand-500">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pending Review</span>
              <h3 className="text-xl font-black text-red-400 mt-1 animate-pulse">
                {pendingOrders.length} New Requests
              </h3>
            </div>
          </div>

          {/* Simulate Order Trigger panel */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-400" />
                <span>Channel Simulator</span>
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Push simulated integration orders to MongoDB</p>
            </div>
            <div className="flex gap-2.5 w-full md:w-auto">
              <button
                onClick={() => handleSimulateOrder('Zomato')}
                disabled={loading}
                className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/10 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>+ Zomato</span>
              </button>
              <button
                onClick={() => handleSimulateOrder('Swiggy')}
                disabled={loading}
                className="flex-1 md:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>+ Swiggy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Toast Alert */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center justify-between border max-w-xl mx-auto shadow-lg animate-bounce ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            <span className="text-sm font-semibold">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="p-0.5 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Kanban Board Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          
          {/* Column 1: Pending Acceptance */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-extrabold text-xs text-slate-100 tracking-wide uppercase">New / Pending</span>
              </div>
              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              {pendingOrders.map(order => {
                const details = parsePaymentDetails(order.paymentDetails);
                const colColors = getPlatformColors(details.platform);
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`glass-card p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden group shadow-md hover:shadow-lg ${colColors.bg} ${colColors.glow}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colColors.badge}`}>
                        {colColors.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{order.billNo.slice(-4)}</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{details.customer}</h5>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[150px]">{details.address}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                      <span className="font-bold text-xs text-slate-100">₹{order.total.toFixed(2)}</span>
                    </div>

                    {/* Action buttons inside pending card */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Reject this online order?')) {
                            handleUpdateStatus(order._id, 'cancelled');
                          }
                        }}
                        className="py-1.5 border border-red-500/30 hover:border-red-500/80 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, 'kitchen');
                        }}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm shadow-emerald-600/10"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {pendingOrders.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-850 rounded-xl">
                  No new online orders.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                <span className="font-extrabold text-xs text-slate-100 tracking-wide uppercase">Preparing</span>
              </div>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              {preparingOrders.map(order => {
                const details = parsePaymentDetails(order.paymentDetails);
                const colColors = getPlatformColors(details.platform);
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${colColors.badge}`}>
                        {colColors.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{order.billNo.slice(-4)}</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{details.customer}</h5>
                      <div className="mt-1 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-[10px] text-slate-400 flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 flex justify-between items-center mt-1">
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Est: 15-20 min</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, 'ready');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                      >
                        Ready
                      </button>
                    </div>
                  </div>
                );
              })}
              {preparingOrders.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-850 rounded-xl">
                  Kitchen is currently idle.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Ready for Pickup */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <span className="font-extrabold text-xs text-slate-100 tracking-wide uppercase">Ready for Pickup</span>
              </div>
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              {readyOrders.map(order => {
                const details = parsePaymentDetails(order.paymentDetails);
                const colColors = getPlatformColors(details.platform);
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${colColors.badge}`}>
                        {colColors.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{order.billNo.slice(-4)}</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{details.customer}</h5>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1 bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                        <User className="w-3.5 h-3.5 text-brand-400" />
                        <span>Rider: {details.valet}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 flex justify-between items-center mt-1">
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Prepared</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, 'served');
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                      >
                        <span>Dispatch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {readyOrders.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-850 rounded-xl">
                  No orders waiting.
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Out for Delivery */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-extrabold text-xs text-slate-100 tracking-wide uppercase">Out for Delivery</span>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {outOrders.length}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              {outOrders.map(order => {
                const details = parsePaymentDetails(order.paymentDetails);
                const colColors = getPlatformColors(details.platform);
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${colColors.badge}`}>
                        {colColors.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{order.billNo.slice(-4)}</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{details.customer}</h5>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Transit with {details.valet.split(' ')[0]}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 flex justify-between items-center mt-1">
                      <span className="text-[9px] text-slate-500">In Transit...</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order._id, 'paid');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                      >
                        Settle/Paid
                      </button>
                    </div>
                  </div>
                );
              })}
              {outOrders.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-850 rounded-xl">
                  No orders in transit.
                </div>
              )}
            </div>
          </div>

          {/* Column 5: Delivered History */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                <span className="font-extrabold text-xs text-slate-100 tracking-wide uppercase">Delivered</span>
              </div>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                {deliveredOrders.length}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              {deliveredOrders.map(order => {
                const details = parsePaymentDetails(order.paymentDetails);
                const colColors = getPlatformColors(details.platform);
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="glass-card p-4 rounded-xl border border-slate-800/60 hover:border-slate-800 opacity-70 hover:opacity-100 transition-all cursor-pointer flex flex-col gap-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400`}>
                        {colColors.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{order.billNo.slice(-4)}</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-slate-300">{details.customer}</h5>
                      <span className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Delivered & Settled</span>
                      </span>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
                      <span>Total: ₹{order.total.toFixed(2)}</span>
                      <span className="font-mono">{new Date(order.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                );
              })}
              {deliveredOrders.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-500 italic bg-slate-900/20 border border-dashed border-slate-850 rounded-xl">
                  No recently completed orders.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Order Details Drawer / Modal */}
        {selectedOrder && (() => {
          const details = parsePaymentDetails(selectedOrder.paymentDetails);
          const colColors = getPlatformColors(details.platform);
          return (
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">
              {/* Drawer Container */}
              <div className="w-full max-w-lg bg-slate-950 border-l border-slate-800 h-full p-8 flex flex-col justify-between shadow-2xl relative animate-slide-in">
                
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colColors.badge}`}>
                        {colColors.name} Channel
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-100 mt-2">{selectedOrder.billNo}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Received on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer and Logistics */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl mb-6">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Customer Details</span>
                      <span className="font-bold text-xs text-slate-200 block mt-1">{details.customer}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{details.address}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Delivery Agent</span>
                      <span className="font-bold text-xs text-slate-200 block mt-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-brand-400" />
                        <span>{details.valet}</span>
                      </span>
                      {details.notes && (
                        <span className="text-[9px] italic text-slate-500 block mt-1">Notes: "{details.notes}"</span>
                      )}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ordered Items</span>
                    <div className="divide-y divide-slate-850 max-h-[30vh] overflow-y-auto pr-1">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">₹{item.price} each</span>
                          </div>
                          <div className="flex gap-8">
                            <span className="text-slate-400">Qty: {item.quantity}</span>
                            <span className="font-bold text-slate-200">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer and Settle Controls */}
                <div className="border-t border-slate-850 pt-6 space-y-5 mt-6">
                  {/* Totals Summary */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax (GST 5%)</span>
                      <span>₹{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-slate-800 pt-3 text-slate-100">
                      <span>Total Amount</span>
                      <span className="text-brand-400 text-base">₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Context Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'paid' && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this online order?")) {
                            handleUpdateStatus(selectedOrder._id, 'cancelled');
                            setSelectedOrder(null);
                          }
                        }}
                        className="py-3 border border-red-500/30 hover:border-red-500/70 bg-red-500/5 text-red-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cancel / Reject Order
                      </button>
                    )}

                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'kitchen');
                          setSelectedOrder(null);
                        }}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
                      >
                        Accept Online Order
                      </button>
                    )}

                    {selectedOrder.status === 'kitchen' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'ready');
                          setSelectedOrder(null);
                        }}
                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
                      >
                        Mark Ready for Rider
                      </button>
                    )}

                    {selectedOrder.status === 'ready' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'served');
                          setSelectedOrder(null);
                        }}
                        className="py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                      >
                        Dispatch (Rider Collected)
                      </button>
                    )}

                    {selectedOrder.status === 'served' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder._id, 'paid');
                          setSelectedOrder(null);
                        }}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
                      >
                        Confirm Settle / Paid
                      </button>
                    )}

                    {/* Print buttons */}
                    {selectedOrder.status !== 'pending' && selectedOrder.status !== 'cancelled' && (
                      <div className="col-span-2 grid grid-cols-2 gap-3 mt-1">
                        <button
                          onClick={() => {
                            setPrintedOrder(selectedOrder);
                            setShowKotModal(true);
                          }}
                          className="py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          Print KOT slip
                        </button>
                        <button
                          onClick={() => {
                            setPrintedOrder(selectedOrder);
                            setShowInvoiceModal(true);
                          }}
                          className="py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          Print Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </div>

      {/* Printable KOT Modal */}
      <KotModal
        isOpen={showKotModal}
        onClose={() => setShowKotModal(false)}
        order={printedOrder}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={printedOrder}
      />
    </div>
  );
};

export default OnlineOrders;
