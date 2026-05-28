import React from 'react';
import { Layers } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';

const TableSelector = () => {
  const tables = usePosStore((state) => state.tables);
  const selectedTable = usePosStore((state) => state.selectedTable);
  const orderType = usePosStore((state) => state.orderType);
  const handleSelectTable = usePosStore((state) => state.handleSelectTable);
  const selectTakeaway = usePosStore((state) => state.selectTakeaway);
  const selectOnline = usePosStore((state) => state.selectOnline);
  const setIsTableModalOpen = usePosStore((state) => state.setIsTableModalOpen);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bold text-white text-base">Dining Tables</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Adjust Tables</span>
          </button>
          <button
            onClick={selectTakeaway}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              orderType === 'takeaway'
                ? 'bg-brand-600 border-brand-500 text-white shadow shadow-brand-600/10'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Takeaway Order
          </button>
          <button
            onClick={selectOnline}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              orderType === 'online'
                ? 'bg-brand-600 border-brand-500 text-white shadow shadow-brand-600/10'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Online Order
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {tables.map((table) => {
          const isSelected = selectedTable?._id === table._id;
          let statusColor = 'bg-slate-800/40 border-slate-800 text-slate-400';
          if (table.status === 'occupied') statusColor = 'bg-red-500/10 border-red-500/30 text-red-400';
          if (table.status === 'billed') statusColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
          if (isSelected) statusColor = 'bg-brand-600 border-brand-500 text-white ring-2 ring-brand-500/20';

          return (
            <button
              key={table._id}
              onClick={() => handleSelectTable(table)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${statusColor}`}
            >
              <span className="font-bold text-sm">{table.tableNo}</span>
              <span className="text-[10px] opacity-80">Cap: {table.capacity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableSelector;
