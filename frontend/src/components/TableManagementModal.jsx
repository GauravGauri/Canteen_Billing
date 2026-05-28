import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Minus, Trash2, Check, AlertCircle, Layers } from 'lucide-react';

const TableManagementModal = ({ isOpen, onClose, onRefresh }) => {
  const [tables, setTables] = useState([]);
  const [newTableNo, setNewTableNo] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchTablesList();
    }
  }, [isOpen]);

  const fetchTablesList = async () => {
    try {
      const response = await axios.get('/tables');
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (err) {
      showMsg('error', 'Failed to fetch tables list');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNo.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/tables', {
        tableNo: newTableNo.trim(),
        capacity: newCapacity,
      });

      if (response.data.success) {
        showMsg('success', `Successfully created ${newTableNo}`);
        setNewTableNo('');
        setNewCapacity(4);
        fetchTablesList();
        if (onRefresh) onRefresh(); // Refresh parent POS tables list
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCapacity = async (table, action) => {
    let currentCapacity = table.capacity;
    let updatedCapacity = currentCapacity;

    if (action === 'increase') {
      updatedCapacity += 1;
    } else if (action === 'decrease') {
      updatedCapacity = Math.max(1, updatedCapacity - 1);
    }

    if (updatedCapacity === currentCapacity) return;

    try {
      const response = await axios.put(`/tables/${table._id}`, {
        capacity: updatedCapacity,
      });

      if (response.data.success) {
        setTables(tables.map(t => t._id === table._id ? { ...t, capacity: updatedCapacity } : t));
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showMsg('error', 'Failed to adjust table capacity');
    }
  };

  const handleDeleteTable = async (tableId, tableNo) => {
    if (!window.confirm(`Are you sure you want to delete ${tableNo}?`)) return;

    try {
      const response = await axios.delete(`/tables/${tableId}`);
      if (response.data.success) {
        showMsg('success', `${tableNo} removed successfully`);
        fetchTablesList();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to delete table');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Adjust Dining Tables</h3>
              <p className="text-xs text-slate-400">Add, delete, or adjust capacity of tables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 mx-5 mt-4 rounded-xl flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-xs font-semibold">{message.text}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Add Table Form */}
          <form onSubmit={handleAddTable} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Create New Table</h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Table Number / Name</label>
                <input
                  type="text"
                  required
                  value={newTableNo}
                  onChange={(e) => setNewTableNo(e.target.value)}
                  placeholder="e.g. Table 7"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Default Capacity</label>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setNewCapacity(Math.max(1, newCapacity - 1))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-xs font-bold text-white">{newCapacity}</span>
                  <button
                    type="button"
                    onClick={() => setNewCapacity(newCapacity + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-brand-600/10 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Table</span>
                </button>
              </div>
            </div>
          </form>

          {/* Tables List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Layout & Capacities</h4>
            
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20">
              {tables.map((table) => {
                const isOccupied = table.status !== 'available';
                return (
                  <div key={table._id} className="flex items-center justify-between p-4 hover:bg-slate-900/30 transition-colors">
                    <div>
                      <h5 className="font-bold text-sm text-white">{table.tableNo}</h5>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isOccupied ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {table.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Capacity Adjuster */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Capacity:</span>
                        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                          <button
                            onClick={() => handleAdjustCapacity(table, 'decrease')}
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold px-2.5 text-white w-6 text-center">{table.capacity}</span>
                          <button
                            onClick={() => handleAdjustCapacity(table, 'increase')}
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteTable(table._id, table.tableNo)}
                        disabled={isOccupied}
                        className={`p-2 rounded-xl border transition-all ${
                          isOccupied
                            ? 'border-slate-850 bg-slate-900/10 text-slate-600 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-900/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
                        }`}
                        title={isOccupied ? "Cannot delete occupied/billed table" : "Delete Table"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {tables.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No tables configured. Create one above!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableManagementModal;
