import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Users, Plus, CheckSquare, Calendar, Building, Sparkles } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { validateMinLength, validatePositiveNumber } from '../utils/validation';

const Groups = () => {
  const { groups, rooms, guests, fetchGroups, fetchRooms, fetchGuests, createGroup } = useHotelStore();
  const [showAddGroup, setShowAddGroup] = useState(false);

  // New Group Inputs
  const [groupName, setGroupName] = useState('');
  const [contactGuestId, setContactGuestId] = useState('');
  const [roomsBlocked, setRoomsBlocked] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [masterBilling, setMasterBilling] = useState(true);
  const [splitDetails, setSplitDetails] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGroups();
    fetchRooms();
    fetchGuests();
  }, [fetchGroups, fetchRooms, fetchGuests]);

  const handleRoomToggle = (roomId) => {
    if (roomsBlocked.includes(roomId)) {
      setRoomsBlocked(roomsBlocked.filter((id) => id !== roomId));
    } else {
      setRoomsBlocked([...roomsBlocked, roomId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validateMinLength(groupName, 3)) {
      newErrors.groupName = 'Group Name must be at least 3 characters';
    }

    if (!contactGuestId) {
      newErrors.contactGuestId = 'Master Contact Guest selection is required';
    }

    if (!checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    } else if (checkInDate && checkOutDate <= checkInDate) {
      newErrors.checkOutDate = 'Check-out must be after Check-in';
    }

    if (roomsBlocked.length === 0) {
      newErrors.roomsBlocked = 'Please select at least one room to block';
    }

    if (totalAmount && !validatePositiveNumber(totalAmount)) {
      newErrors.totalAmount = 'Estimated value must be a valid positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const ok = await createGroup({
      groupName,
      contactGuestId,
      roomsBlocked,
      checkInDate,
      checkOutDate,
      masterBilling,
      splitDetails,
      totalAmount: Number(totalAmount || 0),
      notes,
    });
    if (ok) {
      setGroupName('');
      setContactGuestId('');
      setRoomsBlocked([]);
      setCheckInDate('');
      setCheckOutDate('');
      setMasterBilling(true);
      setSplitDetails('');
      setTotalAmount('');
      setNotes('');
      setErrors({});
      setShowAddGroup(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Group Bookings & Blocks" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Toolbar */}
        <div className="glass-card rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-205">Active Corporate & Event Groups</h2>
          </div>
          <button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Block Group</span>
          </button>
        </div>

        {/* Groups Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Group Name</th>
                  <th className="px-6 py-4">Contact Guest</th>
                  <th className="px-6 py-4">Check-In/Out</th>
                  <th className="px-6 py-4">Rooms Blocked</th>
                  <th className="px-6 py-4">Master Billing</th>
                  <th className="px-6 py-4">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {groups.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{g.groupName}</td>
                    <td className="px-6 py-4 text-slate-400">{g.contactGuestId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(g.checkInDate).toLocaleDateString()} - {new Date(g.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {g.roomsBlocked?.map((r) => (
                          <span key={r._id} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 font-bold rounded text-[9px]">
                            R{r.roomNo}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {g.masterBilling ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">Consolidated Folio</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">Individual Folios</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-400">${g.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}

                {groups.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 font-semibold">
                      No corporate or wedding block groups active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Block Group */}
        {showAddGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateGroup} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-205">Block Event Rooms</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group / Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miller Wedding"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                  {errors.groupName && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.groupName}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Contact Guest</label>
                  <select
                    required
                    value={contactGuestId}
                    onChange={(e) => setContactGuestId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Select Contact --</option>
                    {guests.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                  {errors.contactGuestId && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.contactGuestId}</p>}
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    label="Check-In"
                    required
                    value={checkInDate}
                    onChange={(val) => setCheckInDate(val)}
                  />
                  {errors.checkInDate && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.checkInDate}</p>}
                </div>
                <div>
                  <DatePicker
                    label="Check-Out"
                    required
                    value={checkOutDate}
                    onChange={(val) => setCheckOutDate(val)}
                    minDate={checkInDate}
                  />
                  {errors.checkOutDate && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.checkOutDate}</p>}
                </div>
              </div>

              {/* Rooms Multi-Select Checklist */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Rooms to Block</label>
                <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-28 overflow-y-auto">
                  {rooms.filter(room => room.status === 'available').map((room) => {
                    const isSelected = roomsBlocked.includes(room._id);
                    return (
                      <button
                        key={room._id}
                        type="button"
                        onClick={() => handleRoomToggle(room._id)}
                        className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600/15 border-brand-500 text-brand-400 shadow-sm'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        Room {room.roomNo}
                      </button>
                    );
                  })}
                  {rooms.filter(room => room.status === 'available').length === 0 && (
                    <span className="text-[10px] text-slate-500 col-span-4 text-center">No available rooms.</span>
                  )}
                </div>
                {errors.roomsBlocked && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.roomsBlocked}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Folio Split Setting</label>
                  <select
                    value={masterBilling ? 'true' : 'false'}
                    onChange={(e) => setMasterBilling(e.target.value === 'true')}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="true">Consolidated Master Invoice</option>
                    <option value="false">Individual folio splits</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Value ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                  {errors.totalAmount && <p className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.totalAmount}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes & Event description</label>
                <textarea
                  placeholder="e.g. split details, wedding packages particulars..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-16"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGroupName('');
                    setContactGuestId('');
                    setRoomsBlocked([]);
                    setCheckInDate('');
                    setCheckOutDate('');
                    setMasterBilling(true);
                    setSplitDetails('');
                    setTotalAmount('');
                    setNotes('');
                    setErrors({});
                    setShowAddGroup(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Groups;
