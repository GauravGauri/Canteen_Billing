import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
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
            <h3 className="font-bold text-lg text-white">Bill Invoice</h3>
            <p className="text-xs text-slate-400">Preview and print transaction invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          <div className="bg-white text-black p-5 rounded-lg shadow-inner font-mono text-xs max-w-[290px] mx-auto leading-relaxed border border-slate-300">
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h4 className="font-bold text-base uppercase tracking-wider">BITEFLOW CANTEEN</h4>
              <p className="text-[10px]">123 Campus Plaza, Sector 4</p>
              <p className="text-[10px]">Phone: +91 98765 43210</p>
            </div>

            <div className="space-y-1 mb-3 border-b border-slate-100 pb-2">
              <p><span className="font-bold">INVOICE:</span> {order.billNo}</p>
              <p><span className="font-bold">DATE:</span> {new Date(order.createdAt || Date.now()).toLocaleString()}</p>
              <p><span className="font-bold">TABLE:</span> {order.tableId?.tableNo || 'Takeaway'}</p>
              <p><span className="font-bold">TYPE:</span> {order.type?.toUpperCase()}</p>
            </div>

            <table className="w-full text-left mb-3">
              <thead>
                <tr className="border-b border-dashed border-black font-bold">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-55">
                    <td className="py-1 max-w-[110px] truncate">{item.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">₹{item.price}</td>
                    <td className="py-1 text-right font-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1.5 border-t border-dashed border-black pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST/SGST (5%):</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-1.5">
                <span>NET TOTAL:</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 mt-3 space-y-1 text-[10px]">
              <p><span className="font-bold">Status:</span> {order.status?.toUpperCase()}</p>
              {order.status === 'paid' && (
                <>
                  <p><span className="font-bold">Payment Method:</span> {order.paymentMethod?.toUpperCase()}</p>
                  {order.paymentDetails && <p><span className="font-bold">Txn Ref:</span> {order.paymentDetails}</p>}
                </>
              )}
            </div>

            <div className="text-center text-[10px] border-t border-dashed border-black pt-3 mt-3">
              <p>Thank you for dining with us!</p>
              <p>Have a great day!</p>
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
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* CSS Print-only rendering structure */}
      <div className="print-area font-mono text-black bg-white">
        <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '8px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>BITEFLOW CANTEEN</h3>
          <p style={{ margin: 0, fontSize: '10px' }}>123 Campus Plaza, Sector 4</p>
          <p style={{ margin: 0, fontSize: '10px' }}>Phone: +91 98765 43210</p>
        </div>
        <div style={{ fontSize: '11px', marginBottom: '10px', lineHeight: '1.4' }}>
          <div><strong>INVOICE:</strong> {order?.billNo}</div>
          <div><strong>DATE:</strong> {new Date(order?.createdAt || Date.now()).toLocaleString()}</div>
          <div><strong>TABLE:</strong> {order?.tableId?.tableNo || 'Takeaway'}</div>
          <div><strong>TYPE:</strong> {order?.type?.toUpperCase()}</div>
        </div>
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed black', fontWeight: 'bold' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
              <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order?.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingTop: '4px', paddingBottom: '4px' }}>{item.name}</td>
                <td style={{ textAlign: 'center', paddingTop: '4px', paddingBottom: '4px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px' }}>₹{item.price}</td>
                <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px', fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: '11px', borderTop: '1px dashed black', paddingTop: '8px', marginTop: '10px', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{order?.subTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST (5%):</span>
            <span>₹{order?.tax?.toFixed(2)}</span>
          </div>
          {order?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-₹{order?.discount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
            <span>NET TOTAL:</span>
            <span>₹{order?.total?.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ fontSize: '10px', borderTop: '1px solid #ddd', paddingTop: '6px', marginTop: '6px' }}>
          <div><strong>Status:</strong> {order?.status?.toUpperCase()}</div>
          {order?.status === 'paid' && (
            <>
              <div><strong>Payment:</strong> {order?.paymentMethod?.toUpperCase()}</div>
              {order?.paymentDetails && <div><strong>Txn Ref:</strong> {order?.paymentDetails}</div>}
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px', borderTop: '1px dashed black', paddingTop: '8px', marginTop: '10px' }}>
          <p style={{ margin: 0 }}>Thank you for dining with us!</p>
          <p style={{ margin: 0 }}>Have a great day!</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
