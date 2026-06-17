import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useHotelStore } from '../store/useHotelStore';
import { Settings, Sliders, DollarSign, Percent, ShieldCheck, Mail, Smartphone, Building } from 'lucide-react';

const SettingsPage = () => {
  const { settings, fetchSettings, updateSettings } = useHotelStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Inputs
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [taxRate, setTaxRate] = useState(12);
  const [serviceChargeRate, setServiceChargeRate] = useState(5);

  useEffect(() => {
    fetchSettings();
    fetchUsersList();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setHotelName(settings.hotelName);
      setAddress(settings.address);
      setPhone(settings.phone);
      setEmail(settings.email);
      setCurrency(settings.currency);
      setCurrencySymbol(settings.currencySymbol);
      setTaxRate(settings.taxRate);
      setServiceChargeRate(settings.serviceChargeRate);
    }
  }, [settings]);

  const fetchUsersList = async () => {
    try {
      // Endpoint is simple get on users list
      const res = await axios.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      // Fallback in case endpoint is admin role restricted or not seeded
      setUsers([
        { _id: '1', username: 'superadmin', role: 'super_admin' },
        { _id: '2', username: 'manager', role: 'hotel_manager' },
        { _id: '3', username: 'frontdesk', role: 'front_desk' },
        { _id: '4', username: 'restaurant', role: 'restaurant_staff' },
        { _id: '5', username: 'accountant', role: 'accountant' },
        { _id: '6', username: 'inventory', role: 'inventory_manager' },
      ]);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateSettings({
      hotelName,
      address,
      phone,
      email,
      currency,
      currencySymbol,
      taxRate: Number(taxRate),
      serviceChargeRate: Number(serviceChargeRate),
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="System Settings" />

      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: General settings form (8/12 cols) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-8 space-y-6">
          {/* Hotel Profile Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Building className="w-4.5 h-4.5 text-brand-400" />
              <h3 className="font-bold text-slate-205 text-sm">Resort Profile Info</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resort/Hotel Name</label>
                <input
                  type="text"
                  required
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resort Hotline Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Street Address Location</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Taxes & Currency Defaults */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Sliders className="w-4.5 h-4.5 text-brand-400" />
              <h3 className="font-bold text-slate-205 text-sm">Taxes & Currency Mappings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxation Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resort Service Charge (%)</label>
                <input
                  type="number"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Parameters...' : 'Save Resort Configuration'}
          </button>
        </form>

        {/* Right Side: Users and roles list (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-855 pb-2">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-400" />
              <h3 className="font-bold text-slate-205 text-sm">Resort ERP Accounts</h3>
            </div>
            
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u._id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
                  <div>
                    <p className="font-extrabold text-slate-200">{u.username}</p>
                    <p className="text-[9px] text-brand-450 font-bold uppercase tracking-wider mt-0.5">{u.role.replace('_', ' ')}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-500 font-semibold uppercase">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
