import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Users, Search, Plus, Sparkles, UserCheck, Star } from 'lucide-react';

const Guests = () => {
  const { guests, fetchGuests, createGuest } = useHotelStore();
  const [search, setSearch] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);

  // New guest state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');
  const [preferences, setPreferences] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGuests(search);
  }, [search, fetchGuests]);

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    const ok = await createGuest({
      name,
      email,
      phone,
      idType,
      idNumber,
      preferences,
      specialRequests,
      notes,
    });
    if (ok) {
      setName('');
      setEmail('');
      setPhone('');
      setIdNumber('');
      setPreferences('');
      setSpecialRequests('');
      setNotes('');
      setShowAddGuest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Guest & Customer Directory" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Toolbar */}
        <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search guests by name/phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>

          <button
            onClick={() => setShowAddGuest(true)}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Guest</span>
          </button>
        </div>

        {/* Guests Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Guest Details</th>
                  <th className="px-6 py-4">ID Verification</th>
                  <th className="px-6 py-4">Visits</th>
                  <th className="px-6 py-4">Preferences</th>
                  <th className="px-6 py-4">Loyalty Points</th>
                  <th className="px-6 py-4">Special Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {guests.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-600/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold">
                          {g.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{g.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{g.phone} | {g.email || 'No Email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-350">{g.idType || 'N/A'}:</span>{' '}
                      <span className="text-slate-400">{g.idNumber || 'Not verified'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-205">{g.visitCount || 0} visits</td>
                    <td className="px-6 py-4 truncate max-w-xs text-slate-400">{g.preferences || 'None'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-amber-450 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                        <span>{g.loyaltyPoints || 0} pts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 italic truncate max-w-xs">{g.specialRequests || 'None'}</td>
                  </tr>
                ))}

                {guests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 font-semibold">
                      No guests registered. Register a guest to book reservations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Register Guest */}
        {showAddGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateGuest} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-200">Register Guest Profile</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="National ID">National ID</option>
                    <option value="Drivers License">Driver's License</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AB123456"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Ocean view, decaf tea"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Special Requests & Notes</label>
                <textarea
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-16"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuest(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Register Guest
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Guests;
