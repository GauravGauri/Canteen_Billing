import React from 'react';
import { X, Printer } from 'lucide-react';

const KotModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="no-print w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-lg text-white">Kitchen Order Ticket</h3>
            <p className="text-xs text-slate-400">Preview and print KOT slip</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Preview Area (Styled like thermal slip) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          <div className="bg-white text-black p-4 rounded-lg shadow-inner font-mono text-sm max-w-[280px] mx-auto leading-relaxed border border-slate-300">
            <div className="text-center border-b border-dashed border-black pb-2 mb-3">
              <h4 className="font-bold text-base uppercase">KITCHEN SLIP</h4>
              <p className="text-xs">BiteFlow Canteen</p>
            </div>

            <div className="space-y-1 text-xs mb-3">
              <p><span className="font-bold">Bill No:</span> {order.billNo}</p>
              <p><span className="font-bold">Date:</span> {new Date(order.createdAt || Date.now()).toLocaleTimeString()}</p>
              <p><span className="font-bold">Table:</span> {order.tableId?.tableNo || 'Takeaway'}</p>
              <p><span className="font-bold">Type:</span> {order.type?.toUpperCase()}</p>
            </div>

            <table className="w-full text-xs text-left mb-3">
              <thead>
                <tr className="border-b border-dashed border-black font-bold">
                  <th className="pb-1">Item Description</th>
                  <th className="pb-1 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-1 font-bold">{item.name}</td>
                    <td className="py-1 text-right font-bold">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-center text-[10px] border-t border-dashed border-black pt-2 mt-2">
              <p>*** SEND TO KITCHEN ***</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-850 font-medium text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-colors shadow-lg shadow-brand-600/10"
          >
            <Printer className="w-4 h-4" />
            <span>Print KOT Slip</span>
          </button>
        </div>
      </div>

      {/* CSS Print-only rendering structure */}
      <div className="print-area font-mono text-black bg-white">
        <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '5px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>KITCHEN SLIP</h3>
          <p style={{ margin: 0, fontSize: '12px' }}>BiteFlow Canteen</p>
        </div>
        <div style={{ fontSize: '11px', marginBottom: '10px', lineHeight: '1.4' }}>
          <div><strong>Bill No:</strong> {order?.billNo}</div>
          <div><strong>Date:</strong> {new Date(order?.createdAt || Date.now()).toLocaleString()}</div>
          <div><strong>Table:</strong> {order?.tableId?.tableNo || 'Takeaway'}</div>
          <div><strong>Type:</strong> {order?.type?.toUpperCase()}</div>
        </div>
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed black', fontWeight: 'bold' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item Name</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {order?.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingTop: '4px', paddingBottom: '4px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px', fontWeight: 'bold' }}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', fontSize: '10px', borderTop: '1px dashed black', paddingTop: '8px', marginTop: '10px' }}>
          <p style={{ margin: 0 }}>*** SEND TO KITCHEN ***</p>
        </div>
      </div>
    </div>
  );
};

export default KotModal;
