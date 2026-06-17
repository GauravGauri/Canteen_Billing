import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { ShoppingBag, Plus, Calendar, FileText, ChevronDown, CheckCircle } from 'lucide-react';

const PurchaseOrders = () => {
  const { purchaseOrders, suppliers, inventory, fetchPurchaseOrders, fetchSuppliers, fetchInventory, createPurchaseOrder, updatePurchaseOrder } = useHotelStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [supplierId, setSupplierId] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ productId: '', quantity: 1, purchasePrice: 0 }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchInventory();
  }, [fetchPurchaseOrders, fetchSuppliers, fetchInventory]);

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1, purchasePrice: 0 }]);
  };

  const handleItemRowChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    
    // Auto-fill price if productId changes
    if (field === 'productId') {
      const match = inventory.find(i => i._id === value);
      if (match) {
        updated[index].purchasePrice = match.costPrice || 0;
      }
    }
    
    setSelectedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || selectedItems.length === 0) return;

    // Calculate total amount
    const items = selectedItems.map(i => ({
      productId: i.productId,
      quantity: Number(i.quantity),
      purchasePrice: Number(i.purchasePrice),
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.purchasePrice, 0);

    const ok = await createPurchaseOrder({
      supplierId,
      items,
      totalAmount,
      notes,
    });

    if (ok) {
      setSupplierId('');
      setSelectedItems([{ productId: '', quantity: 1, purchasePrice: 0 }]);
      setNotes('');
      setShowAddModal(false);
      fetchPurchaseOrders();
      fetchInventory(); // stock increments on PO delivery
    }
  };

  const handleDeliver = async (poId) => {
    const ok = await updatePurchaseOrder(poId, { status: 'received' });
    if (ok) {
      fetchPurchaseOrders();
      fetchInventory();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 uppercase">Received</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-450 uppercase animate-pulse">Ordered</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 uppercase">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Purchase Orders" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Header */}
        <div className="glass-card rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-205">Procurement Purchase Orders</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create PO</span>
          </button>
        </div>

        {/* PO List */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Supplier Partner</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-350">
                {purchaseOrders.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{po.poNo}</td>
                    <td className="px-6 py-4 text-slate-450">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{po.supplierId?.supplierName || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">{po.items?.length || 0} product lines</td>
                    <td className="px-6 py-4 font-bold text-brand-400">${po.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {po.status === 'pending' && (
                        <button
                          onClick={() => handleDeliver(po._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Receive Delivery</span>
                        </button>
                      )}
                      {po.status === 'received' && (
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Fulfilled</span>
                      )}
                    </td>
                  </tr>
                ))}

                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500 font-semibold">
                      No purchase orders recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create PO Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-sm font-bold text-slate-205">Draft Purchase Order</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose Supplier Partner</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.supplierName}</option>
                ))}
              </select>
            </div>

            {/* Selected items grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PO Items List</label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-[10px] font-bold text-brand-400 hover:text-brand-350 cursor-pointer"
                >
                  + Add Row
                </button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleItemRowChange(idx, 'productId', e.target.value)}
                      className="col-span-6 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-200 focus:outline-none"
                    >
                      <option value="">-- Choose Item --</option>
                      {inventory.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemRowChange(idx, 'quantity', e.target.value)}
                      className="col-span-3 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-200 focus:outline-none"
                    />

                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.purchasePrice}
                      onChange={(e) => handleItemRowChange(idx, 'purchasePrice', e.target.value)}
                      className="col-span-3 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-200 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Purchasing Notes</label>
              <textarea
                placeholder="Details of delivery instructions or partial receipts terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200 h-16"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Submit PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
