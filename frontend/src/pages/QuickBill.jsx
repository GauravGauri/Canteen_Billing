import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import InvoiceModal from '../components/InvoiceModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Zap,
  ShoppingBag,
  Sparkles,
  Utensils,
  Percent,
} from 'lucide-react';

const QuickBill = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickOnly, setQuickOnly] = useState(true); // Default to filtering small/quick items
  
  // Local Cart State to prevent overwriting main POS draft orders
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(5); // 5% GST
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Invoice state
  const [printedOrder, setPrintedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get('/dishes');
      if (response.data.success) {
        const activeDishes = response.data.data.filter((d) => d.isAvailable);
        setDishes(activeDishes);
        
        const uniqueCats = ['All', ...new Set(activeDishes.map((d) => d.category))];
        setCategories(uniqueCats);
        
        // Dynamically focus on drinks/snacks category if it exists
        const quickCat = uniqueCats.find(c => 
          ['Drinks', 'Beverages', 'Snacks', 'Packaged', 'Fast Food'].includes(c)
        );
        if (quickCat) {
          setSelectedCategory(quickCat);
        }
      }
    } catch (err) {
      showMsg('error', 'Failed to fetch dishes for quick bill');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Helper to identify small/packaged/quick products
  const isQuickProduct = (dish) => {
    const name = dish.name.toLowerCase();
    const cat = dish.category.toLowerCase();
    
    // Check common packaged categories
    if (['drinks', 'beverages', 'snacks', 'packaged', 'desserts', 'chocolates', 'bottles'].includes(cat)) {
      return true;
    }
    
    // Check common keywords
    const quickKeywords = [
      'chips', 'lays', 'kurkure', 'pepsi', 'coke', 'cola', 'drink', 'water', 'juice', 
      'biscuit', 'maggi', 'tea', 'coffee', 'soda', 'limca', 'sprite', 'fanta', 'milk', 
      'chocolate', 'packet', 'chips', 'cookie', 'patties', 'puff', 'samosa'
    ];
    return quickKeywords.some((kw) => name.includes(kw));
  };

  // Filter and prioritize dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuick = !quickOnly || isQuickProduct(dish);
    return matchesCategory && matchesSearch && matchesQuick;
  });

  // Cart operations
  const addToCart = (dish) => {
    const existingIndex = cart.findIndex((item) => item.dishId === dish._id);
    const newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        category: dish.category,
        quantity: 1,
      });
    }
    setCart(newCart);
  };

  const adjustQty = (dishId, action) => {
    const existingIndex = cart.findIndex((item) => item.dishId === dishId);
    if (existingIndex === -1) return;

    const newCart = [...cart];
    if (action === 'increase') {
      newCart[existingIndex].quantity += 1;
    } else if (action === 'decrease') {
      newCart[existingIndex].quantity -= 1;
      if (newCart[existingIndex].quantity <= 0) {
        newCart.splice(existingIndex, 1);
      }
    }
    setCart(newCart);
  };

  const removeFromCart = (dishId) => {
    setCart(cart.filter((item) => item.dishId !== dishId));
  };

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const netTotal = Math.max(0, subtotal + tax - discount);

  // Settle transaction instantly
  const handleQuickCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const orderPayload = {
        type: 'takeaway',
        items: cart,
        subTotal: subtotal,
        tax,
        discount,
        total: netTotal,
        status: 'paid', // Instantly settled
        paymentMethod,
        paymentDetails: 'Quick Bill Counter',
      };

      const response = await axios.post('/orders', orderPayload);
      if (response.data.success) {
        setPrintedOrder(response.data.data);
        setShowInvoiceModal(true);
        setCart([]);
        setDiscount(0);
        showMsg('success', `Quick bill settled successfully via ${paymentMethod.toUpperCase()}`);
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Quick checkout failed. Check inventory levels.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-64 pb-12">
      <Navbar title="Quick Bill Counter" />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        
        {/* Left Side: Fast Product Browser (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Toast Message Banner */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center justify-between border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
          )}

          {/* Controls row */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quick products..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
                />
              </div>

              {/* Quick Products Filter Toggle */}
              <button
                type="button"
                onClick={() => setQuickOnly(!quickOnly)}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  quickOnly 
                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-400 font-extrabold shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Packaged Items</span>
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dish Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish._id}
                onClick={() => addToCart(dish)}
                className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-brand-500/40 hover:scale-[1.01] transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-sm"
              >
                <div>
                  <span className="text-[9px] font-black text-brand-400 bg-brand-500/5 border border-brand-500/10 px-2 py-0.5 rounded-full uppercase">
                    {dish.category}
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-3.5 group-hover:text-brand-400 transition-colors">
                    {dish.name}
                  </h4>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-base text-slate-100">₹{dish.price}</span>
                  <div className="p-1.5 rounded-lg bg-slate-800 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}

            {filteredDishes.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                <Utensils className="w-8 h-8 opacity-25" />
                <span>No items found matching the selected filters.</span>
                {quickOnly && (
                  <button 
                    onClick={() => setQuickOnly(false)} 
                    className="text-xs text-brand-400 hover:underline mt-1 font-semibold"
                  >
                    Show all menu items instead
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Fast Checkout Column (4/12 cols) */}
        <div className="lg:col-span-4">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 sticky top-28 flex flex-col max-h-[82vh] justify-between shadow-2xl">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-855 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-brand-400" />
                  <h3 className="font-bold text-slate-100 text-base">Quick Cart</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 uppercase tracking-wider">
                  Instant Checkout
                </span>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto max-h-[35vh] pr-1 space-y-3 mb-4 scrollbar-thin">
                {cart.map((item) => (
                  <div key={item.dishId} className="flex items-center justify-between bg-slate-955 p-3 rounded-xl border border-slate-855">
                    <div className="max-w-[55%]">
                      <h5 className="font-semibold text-xs text-slate-200 truncate">{item.name}</h5>
                      <span className="text-[10px] text-slate-500">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => adjustQty(item.dishId, 'decrease')}
                          className="p-1 rounded text-slate-400 hover:text-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-2 text-slate-200">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => adjustQty(item.dishId, 'increase')}
                          className="p-1 rounded text-slate-400 hover:text-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.dishId)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                    <ShoppingBag className="w-8 h-8 opacity-25" />
                    <span>Cart is empty. Tap products to add.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations & Checkout Trigger */}
            <div className="border-t border-slate-855 pt-4 space-y-4">
              <div className="space-y-2 text-xs">
                {/* Discount */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-slate-500" />
                    <span>Apply Discount (₹)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={discount === 0 ? '' : discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-20 px-2 py-1 bg-slate-955 border border-slate-800 rounded text-right text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none text-slate-200"
                  />
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-100 font-bold text-sm border-t border-slate-855 pt-3">
                  <span>Total Due</span>
                  <span className="text-brand-400 text-base">₹{netTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Action Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0 || loading}
                  className="py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/5 font-semibold text-xs transition-all disabled:opacity-40"
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCheckout('cash')}
                  disabled={cart.length === 0 || loading}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/20 disabled:text-emerald-500/50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-emerald-950/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>⚡ Cash Settle</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCheckout('upi')}
                  disabled={cart.length === 0 || loading}
                  className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/20 disabled:text-blue-500/50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-blue-950/20"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ UPI Instant Settle</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Invoice receipt modal on successful bill */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={printedOrder}
      />
    </div>
  );
};

export default QuickBill;
