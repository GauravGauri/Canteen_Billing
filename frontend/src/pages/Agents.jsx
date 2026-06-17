import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Building, Plus, Percent, RefreshCw } from 'lucide-react';

const Agents = () => {
  const { agents, fetchAgents, createAgent } = useHotelStore();
  const [showAddAgent, setShowAddAgent] = useState(false);

  // New Agent Inputs
  const [agentName, setAgentName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [corporateRateDetails, setCorporateRateDetails] = useState('');

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!agentName || !code) return;
    const ok = await createAgent({
      agentName,
      code,
      email,
      phone,
      commissionRate: Number(commissionRate || 0),
      corporateRateDetails,
    });
    if (ok) {
      setAgentName('');
      setCode('');
      setEmail('');
      setPhone('');
      setCommissionRate('');
      setCorporateRateDetails('');
      setShowAddAgent(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Travel Agents & Corporate Contracts" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Toolbar */}
        <div className="glass-card rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-205">Registered Agents & Partners</h2>
          </div>
          <button
            onClick={() => setShowAddAgent(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Agent</span>
          </button>
        </div>

        {/* Agents Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Partner Code</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Commission Margin</th>
                  <th className="px-6 py-4">Corporate Contract Terms</th>
                  <th className="px-6 py-4">Total Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {agents.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{a.agentName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-brand-450 uppercase">
                        {a.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{a.phone || 'N/A'} | {a.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-emerald-450 font-bold">
                        <Percent className="w-3.5 h-3.5" />
                        <span>{a.commissionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{a.corporateRateDetails || 'None'}</td>
                    <td className="px-6 py-4 font-bold text-slate-205">{a.totalBookings || 0} reservation slots</td>
                  </tr>
                ))}

                {agents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 font-semibold">
                      No travel agents or corporate partners registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Agent */}
        {showAddAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateAgent} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-200">Register Partner Agent</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Booking.com"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partner Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOOKING10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. agent@partner.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 555-0988"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commission Margin (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 15 for 15%"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corporate Rates/Contract terms</label>
                <textarea
                  placeholder="Special discounted tariffs or credit limits..."
                  value={corporateRateDetails}
                  onChange={(e) => setCorporateRateDetails(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAgent(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-355 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Agents;
