import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Bed, Filter, RefreshCw, Plus, ShieldAlert, Sparkles, AlertCircle, Wrench, RefreshCw as CleanIcon } from 'lucide-react';

const STATUS_CONFIGS = {
  available: { label: 'Available', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  reserved: { label: 'Reserved', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  occupied: { label: 'Occupied', bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  cleaning: { label: 'Cleaning', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' },
  maintenance: { label: 'Maintenance', bg: 'bg-red-500/10 border-red-500/20 text-red-400' },
  out_of_service: { label: 'Out of Service', bg: 'bg-slate-700/15 border-slate-700/30 text-slate-400' },
};

const Rooms = () => {
  const { rooms, categories, fetchRooms, fetchRoomCategories, createRoom, updateRoom, createRoomCategory } = useHotelStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // New room inputs
  const [roomNo, setRoomNo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [roomNotes, setRoomNotes] = useState('');

  // New category inputs
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catOccupancy, setCatOccupancy] = useState(2);
  const [catAmenities, setCatAmenities] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchRoomCategories();
  }, [fetchRooms, fetchRoomCategories]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomNo || !categoryId) return;
    const ok = await createRoom({
      roomNo,
      categoryId,
      notes: roomNotes,
    });
    if (ok) {
      setRoomNo('');
      setCategoryId('');
      setRoomNotes('');
      setShowAddRoom(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName || !catPrice) return;
    const ok = await createRoomCategory({
      name: catName,
      basePrice: Number(catPrice),
      maxOccupancy: Number(catOccupancy),
      amenities: catAmenities.split(',').map(a => a.trim()).filter(Boolean),
      description: catDesc,
    });
    if (ok) {
      setCatName('');
      setCatPrice('');
      setCatOccupancy(2);
      setCatAmenities('');
      setCatDesc('');
      setShowAddCategory(false);
    }
  };

  const toggleRoomStatus = async (room, nextStatus) => {
    await updateRoom(room._id, { status: nextStatus });
  };

  const toggleCleaningStatus = async (room) => {
    const nextClean = room.cleaningStatus === 'clean' ? 'dirty' : 'clean';
    await updateRoom(room._id, { cleaningStatus: nextClean });
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const statusMatch = !statusFilter || room.status === statusFilter;
    const catMatch = !catFilter || room.categoryId?._id === catFilter;
    return statusMatch && catMatch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Hotel Rooms & Categories" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Actions & Filters */}
        <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
              <Filter className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold text-slate-350">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIGS).map((key) => (
                <option key={key} value={key}>{STATUS_CONFIGS[key].label}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
            <button
              onClick={() => setShowAddRoom(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredRooms.map((room) => {
            const config = STATUS_CONFIGS[room.status] || STATUS_CONFIGS.out_of_service;
            return (
              <div
                key={room._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Bed className="w-4.5 h-4.5 text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-100 text-sm">Room {room.roomNo}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{room.categoryId?.name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${config.bg}`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border-t border-b border-slate-800/60 py-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-brand-400">${room.categoryId?.basePrice || 0}/night</span>
                    <span className="text-slate-600">•</span>
                    <span>Max {room.categoryId?.maxOccupancy || 2} Pax</span>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => toggleCleaningStatus(room)}
                      className={`font-semibold cursor-pointer ${
                        room.cleaningStatus === 'clean' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {room.cleaningStatus.toUpperCase()}
                    </button>
                  </div>

                  {room.notes && (
                    <p className="text-[10px] text-slate-500 italic truncate">{room.notes}</p>
                  )}
                </div>

                {/* Status Switcher Controls */}
                <div className="flex gap-1.5 pt-4 border-t border-slate-850 mt-4">
                  {room.status === 'available' && (
                    <>
                      <button
                        onClick={() => toggleRoomStatus(room, 'maintenance')}
                        className="flex-1 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Block
                      </button>
                      <button
                        onClick={() => toggleRoomStatus(room, 'cleaning')}
                        className="flex-1 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Clean
                      </button>
                    </>
                  )}
                  {room.status === 'cleaning' && (
                    <button
                      onClick={() => toggleRoomStatus(room, 'available')}
                      className="w-full py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Mark Available
                    </button>
                  )}
                  {room.status === 'maintenance' && (
                    <button
                      onClick={() => toggleRoomStatus(room, 'available')}
                      className="w-full py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Release Room
                    </button>
                  )}
                  {room.status === 'occupied' && (
                    <div className="w-full text-center text-[10px] text-purple-400 font-bold bg-purple-500/5 py-1 rounded-lg border border-purple-500/10">
                      Currently Occupied
                    </div>
                  )}
                  {room.status === 'reserved' && (
                    <div className="w-full text-center text-[10px] text-blue-400 font-bold bg-blue-500/5 py-1 rounded-lg border border-blue-500/10">
                      Reserved Booking
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Room */}
        {showAddRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateRoom} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Register New Room</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Room Number (e.g. 101)"
                  required
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name} (${c.basePrice}/night)</option>
                  ))}
                </select>
                <textarea
                  placeholder="Room notes/features..."
                  value={roomNotes}
                  onChange={(e) => setRoomNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-20"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Category */}
        {showAddCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateCategory} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">New Room Category</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Deluxe Suite)"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Base Price ($ per night)"
                  required
                  value={catPrice}
                  onChange={(e) => setCatPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Occupants"
                  required
                  value={catOccupancy}
                  onChange={(e) => setCatOccupancy(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Amenities (comma-separated, e.g. WiFi, Pool)"
                  value={catAmenities}
                  onChange={(e) => setCatAmenities(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
                <textarea
                  placeholder="Category description..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none h-16"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rooms;
