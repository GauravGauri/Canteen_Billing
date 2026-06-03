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
            <h3 className="font-bold text-lg text-slate-100">Bill Invoice</h3>
            <p className="text-xs text-slate-400">Preview and print transaction invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Preview (Styled like 58mm thermal slip) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40 flex justify-center">
          <div className="bg-white text-black p-3.5 rounded-lg shadow-inner font-mono text-[10px] w-[58mm] max-w-[220px] leading-tight border border-slate-300">
            <div className="text-center border-b border-dashed border-black pb-2 mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider">KK Food CANTEEN</h4>
              <p className="text-[9px]">123 Campus Plaza, Sector 4</p>
              <p className="text-[9px]">Phone: +91 98765 43210</p>
            </div>

            <div className="space-y-0.5 mb-2 border-b border-slate-100 pb-1.5 text-[9px]">
              <p><span className="font-bold">INVOICE:</span> {order.billNo}</p>
              <p><span className="font-bold">DATE:</span> {new Date(order.createdAt || Date.now()).toLocaleString()}</p>
              <p><span className="font-bold">TABLE:</span> {order.tableId?.tableNo || 'Takeaway'}</p>
              <p><span className="font-bold">TYPE:</span> {order.type?.toUpperCase()}</p>
            </div>

            {/* Items List - Two line layout to prevent 58mm overflow */}
            <div className="border-b border-dashed border-black pb-1.5 mb-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold text-[10px] break-words">{item.name}</div>
                  <div className="flex justify-between pl-2 text-[9px] text-slate-700">
                    <span>{item.quantity} x ₹{item.price.toFixed(2)}</span>
                    <span className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-b border-dashed border-black pb-2 text-[9px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Discount:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs border-t border-slate-200 pt-1">
                <span>NET TOTAL:</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-1.5 mb-2 space-y-0.5 text-[8px] text-slate-700">
              <p><span className="font-bold">Status:</span> {order.status?.toUpperCase()}</p>
              {order.status === 'paid' && (
                <>
                  <p><span className="font-bold">Payment Method:</span> {order.paymentMethod?.toUpperCase()}</p>
                  {order.paymentDetails && <p><span className="font-bold">Txn Ref:</span> {order.paymentDetails}</p>}
                </>
              )}
            </div>

            <div className="text-center text-[9px] border-t border-dashed border-black pt-2 mt-2">
              <p className="font-bold">Thank you for dining with us!</p>
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
        <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '6px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>KK Food CANTEEN</h3>
          <p style={{ margin: 0, fontSize: '9px' }}>123 Campus Plaza, Sector 4</p>
          <p style={{ margin: 0, fontSize: '9px' }}>Phone: +91 98765 43210</p>
        </div>
        <div style={{ fontSize: '9px', marginBottom: '8px', lineHeight: '1.3' }}>
          <div><strong>INVOICE:</strong> {order?.billNo}</div>
          <div><strong>DATE:</strong> {new Date(order?.createdAt || Date.now()).toLocaleString()}</div>
          <div><strong>TABLE:</strong> {order?.tableId?.tableNo || 'Takeaway'}</div>
          <div><strong>TYPE:</strong> {order?.type?.toUpperCase()}</div>
        </div>
        
        {/* Items List - Two line layout for print to prevent 58mm overflow */}
        <div style={{ borderBottom: '1px dashed black', paddingBottom: '5px', marginBottom: '8px' }}>
          {order?.items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px', wordBreak: 'break-word' }}>{item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', fontSize: '9px' }}>
                <span>{item.quantity} x ₹{item.price.toFixed(2)}</span>
                <span style={{ fontWeight: 'bold' }}>₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{order?.subTotal?.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST (5%):</span>
            <span>₹{order?.tax?.toFixed(2)}</span>
          </div>
          {order?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Discount:</span>
              <span>-₹{order?.discount?.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed black', paddingTop: '4px', marginTop: '4px', fontSize: '11px' }}>
            <span>NET TOTAL:</span>
            <span>₹{order?.total?.toFixed(2)}</span>
          </div>
        </div>
        
        <div style={{ fontSize: '8px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '6px', lineHeight: '1.3' }}>
          <div><strong>Status:</strong> {order?.status?.toUpperCase()}</div>
          {order?.status === 'paid' && (
            <>
              <div><strong>Payment:</strong> {order?.paymentMethod?.toUpperCase()}</div>
              {order?.paymentDetails && <div><strong>Txn Ref:</strong> {order?.paymentDetails}</div>}
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: '9px', borderTop: '1px dashed black', paddingTop: '6px', marginTop: '8px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Thank you for dining with us!</p>
          <p style={{ margin: 0 }}>Have a great day!</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
