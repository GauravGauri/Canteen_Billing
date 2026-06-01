import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus, Check, Eye, X, Truck, Calendar, ShoppingBag, PlusCircle, Trash2 } from 'lucide-react';

const PurchaseOrders = () => {
  const [pos, setPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Form states (Create PO)
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQty, setOrderQty] = useState(0);
  const [orderPrice, setOrderPrice] = useState(0);

  // Form states (Receive PO Items)
  const [receiveQtys, setReceiveQtys] = useState({}); // { [productId]: quantity }

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPOs();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/purchase-orders');
      if (response.data.success) {
        setPOs(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showMsg('error', 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/suppliers');
      if (response.data.success) {
        setSuppliers(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedSupplierId(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProductId(response.data.data[0]._id);
          setOrderPrice(response.data.data[0].costPrice);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update cost price automatically when selected product changes in dropdown
  const handleProductDropdownChange = (productId) => {
    setSelectedProductId(productId);
    const prod = products.find(p => p._id === productId);
    if (prod) {
      setOrderPrice(prod.costPrice);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Open Create PO modal
  const openCreateModal = () => {
    setOrderItems([]);
    setOrderQty(0);
    if (suppliers.length > 0) setSelectedSupplierId(suppliers[0]._id);
    if (products.length > 0) {
      setSelectedProductId(products[0]._id);
      setOrderPrice(products[0].costPrice);
    }
    setIsCreateOpen(true);
  };

  // Add Item to active PO list
  const handleAddItemToOrder = () => {
    if (orderQty <= 0 || orderPrice <= 0) {
      showMsg('error', 'Please fill valid quantity and purchase price');
      return;
    }

    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    // Check duplicate
    const exists = orderItems.find(item => item.productId === selectedProductId);
    if (exists) {
      showMsg('error', 'Product already added to this purchase order');
      return;
    }

    setOrderItems([
      ...orderItems,
      {
        productId: selectedProductId,
        name: prod.name,
        unit: prod.unit,
        quantityOrdered: Number(orderQty),
        costPrice: Number(orderPrice),
      },
    ]);
    setOrderQty(0);
  };

  const handleRemoveItemFromOrder = (prodId) => {
    setOrderItems(orderItems.filter(item => item.productId !== prodId));
  };

  const handleCreatePOSubmit = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      showMsg('error', 'Add at least one product to create a purchase order');
      return;
    }

    try {
      const response = await axios.post('/purchase-orders', {
        supplierId: selectedSupplierId,
        items: orderItems,
      });

      if (response.data.success) {
        showMsg('success', 'Purchase order created successfully');
        setIsCreateOpen(false);
        fetchPOs();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error creating PO');
    }
  };

  // Open Receive PO modal
  const openReceiveModal = (po) => {
    setSelectedPO(po);
    // Initialize receive amounts with remaining amounts
    const initialRecs = {};
    po.items.forEach((item) => {
      const remaining = item.quantityOrdered - item.quantityReceived;
      initialRecs[item.productId._id] = remaining > 0 ? remaining : 0;
    });
    setReceiveQtys(initialRecs);
    setIsReceiveOpen(true);
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsPayload = Object.keys(receiveQtys).map((prodId) => ({
        productId: prodId,
        quantityReceived: Number(receiveQtys[prodId]) || 0,
      }));

      const response = await axios.post(`/purchase-orders/${selectedPO._id}/receive`, {
        itemsReceived: itemsPayload,
      });

      if (response.data.success) {
        showMsg('success', 'Goods successfully received and credited to product stock!');
        setIsReceiveOpen(false);
        fetchPOs();
        fetchProducts(); // refresh products stock
      }
    } catch (err) {
      showMsg('error', 'Error recording stock receipt');
    }
  };

  const handleCancelPO = async (poId) => {
    if (window.confirm('Are you sure you want to cancel this purchase order?')) {
      try {
        const response = await axios.post(`/purchase-orders/${poId}/cancel`);
        if (response.data.success) {
          showMsg('success', 'Purchase Order Cancelled');
          fetchPOs();
        }
      } catch (err) {
        showMsg('error', 'Failed to cancel PO');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Received</span>;
      case 'partially_received':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Partial</span>;
      case 'ordered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">Ordered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-805 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-64">
      <Navbar title="Purchase Orders" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Alerts */}
        {message.text && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Create PO Trigger */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Purchase Management</h3>
            <p className="text-xs text-slate-400 mt-1">Reorder raw materials and track supplier deliveries.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow shadow-brand-600/15"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>

        {/* PO List Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Received Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {pos.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100">{po.poNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{po.supplierId?.name || 'Deleted Supplier'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-brand-400">₹{po.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Receive items button triggers only for active ordered or partially_received POs */}
                      {(po.status === 'ordered' || po.status === 'partially_received') && (
                        <>
                          <button
                            onClick={() => openReceiveModal(po)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Receive Goods</span>
                          </button>
                          <button
                            onClick={() => handleCancelPO(po._id)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all inline-flex items-center"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {pos.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-brand-400 font-semibold">
                      Loading purchase history...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create PO Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base">New Purchase Order</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-6">
              {/* Supplier Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
                >
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Reorder Tool */}
              <div className="border-t border-slate-800/80 pt-4 space-y-4">
                <h4 className="font-bold text-slate-100 text-sm">Add Items to Order</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Select Product */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Select Raw Item</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductDropdownChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Ordered */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Qty ({products.find(p => p._id === selectedProductId)?.unit || 'unit'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={orderQty === 0 ? '' : orderQty}
                      onChange={(e) => setOrderQty(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Purchase Unit Cost */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Cost (₹)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="sm:col-span-2 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-brand-400 font-semibold text-sm rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {/* Items preview list */}
                <div className="bg-slate-950/60 rounded-xl border border-slate-850 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                        <th className="px-4 py-2.5">Item Name</th>
                        <th className="px-4 py-2.5 text-center">Ordered Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Total Cost</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {orderItems.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-4 py-2.5 font-semibold text-slate-100">{item.name}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-slate-200">
                            {item.quantityOrdered} <span className="text-[10px] text-slate-500 uppercase">{item.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-400">₹{item.costPrice}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-brand-400">
                            ₹{(item.costPrice * item.quantityOrdered).toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromOrder(item.productId)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {orderItems.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-slate-500 italic">
                            No products added to this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {orderItems.length > 0 && (
                  <div className="flex justify-end text-sm font-bold text-slate-100 border-t border-slate-800 pt-3">
                    <span>Est. PO Total: <span className="text-brand-400 font-extrabold text-base ml-1">
                      ₹{orderItems.reduce((s, i) => s + i.costPrice * i.quantityOrdered, 0).toFixed(2)}
                    </span></span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/10"
                >
                  Place Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Goods Modal */}
      {isReceiveOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-100 text-base">Receive Products</h3>
                <p className="text-xs text-slate-400 mt-0.5">PO: {selectedPO.poNumber} | Supplier: {selectedPO.supplierId?.name}</p>
              </div>
              <button onClick={() => setIsReceiveOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-4">
              <div className="bg-slate-950/40 rounded-xl border border-slate-850 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-center">Ordered</th>
                      <th className="px-4 py-3 text-center">Received</th>
                      <th className="px-4 py-3 text-right">Qty to Receive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {selectedPO.items.map((item) => {
                      const remaining = item.quantityOrdered - item.quantityReceived;
                      return (
                        <tr key={item.productId._id}>
                          <td className="px-4 py-3 font-semibold text-slate-100">{item.productId.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-200">
                            {item.quantityOrdered} <span className="text-[10px] text-slate-500 uppercase">{item.productId.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-emerald-400 font-bold">
                            {item.quantityReceived}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {remaining > 0 ? (
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                step="0.01"
                                value={receiveQtys[item.productId._id] ?? ''}
                                onChange={(e) =>
                                  setReceiveQtys({
                                    ...receiveQtys,
                                    [item.productId._id]: Math.min(remaining, Math.max(0, Number(e.target.value))),
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-right text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none text-slate-100 font-bold"
                              />
                            ) : (
                              <span className="text-xs text-emerald-500 font-semibold uppercase mr-2">Fully Received</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsReceiveOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/10"
                >
                  Record Goods Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseOrders;
