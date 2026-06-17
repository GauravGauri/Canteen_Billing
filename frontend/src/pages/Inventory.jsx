import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Plus, Edit2, Trash2, Search, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { validateMinLength, validatePositiveNumber, validateNonNegativeNumber } from '../utils/validation';

const Inventory = () => {
  const { inventory, fetchInventory, createInventoryItem, updateInventoryItem, loading, message } = useHotelStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(5);
  const [costPrice, setCostPrice] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openAddModal = () => {
    setIsEditing(false);
    setProductId('');
    setName('');
    setUnit('kg');
    setStockQuantity(0);
    setMinStockLevel(5);
    setCostPrice(0);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setProductId(product._id);
    setName(product.name);
    setUnit(product.unit);
    setStockQuantity(product.stockQuantity);
    setMinStockLevel(product.minStockLevel);
    setCostPrice(product.costPrice);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {};
    if (!validateMinLength(name, 2)) {
      newErrors.name = 'Item name must be at least 2 characters.';
    }
    if (!validateMinLength(unit, 1)) {
      newErrors.unit = 'Unit of measure is required.';
    }
    if (!validatePositiveNumber(costPrice)) {
      newErrors.costPrice = 'Cost price must be a positive number.';
    }
    if (!validateNonNegativeNumber(stockQuantity)) {
      newErrors.stockQuantity = 'Stock quantity must be a non-negative number.';
    }
    if (!validateNonNegativeNumber(minStockLevel)) {
      newErrors.minStockLevel = 'Min stock alert level must be a non-negative number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload = {
      name,
      unit,
      stockQuantity: Number(stockQuantity),
      minStockLevel: Number(minStockLevel),
      costPrice: Number(costPrice),
    };

    let ok;
    if (isEditing) {
      ok = await updateInventoryItem(productId, payload);
    } else {
      ok = await createInventoryItem(payload);
    }

    if (ok) {
      setIsModalOpen(false);
      fetchInventory();
    }
  };

  // Filter products
  const filteredProducts = inventory.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count low stock
  const lowStockCount = inventory.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Resort Stock & Supplies" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-brand-500">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Supplies</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{inventory.length}</h3>
            </div>
            <div className="p-3 bg-brand-650/10 text-brand-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-red-500">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Low Stock Alert</span>
              <h3 className="text-2xl font-extrabold text-red-400 mt-1">{lowStockCount}</h3>
            </div>
            <div className="p-3 bg-red-650/10 text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-emerald-500">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Healthy Levels</span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{inventory.length - lowStockCount}</h3>
            </div>
            <div className="p-3 bg-emerald-650/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory supplies..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Unit of Measure</th>
                  <th className="px-6 py-4">Reorder Level</th>
                  <th className="px-6 py-4">Cost Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-350">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stockQuantity <= product.minStockLevel;
                  return (
                    <tr key={product._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-200">{product.name}</td>
                      <td className={`px-6 py-4 font-extrabold ${isLowStock ? 'text-red-400' : 'text-slate-200'}`}>
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 text-slate-500 uppercase font-semibold">{product.unit}</td>
                      <td className="px-6 py-4 text-slate-400">{product.minStockLevel}</td>
                      <td className="px-6 py-4 font-bold">${product.costPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-450 animate-pulse">Low Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">Healthy</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800 transition-colors inline-flex cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500 font-semibold">
                      No stock items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-850">
              <h3 className="font-bold text-slate-100 text-sm">
                {isEditing ? 'Edit Stock Details' : 'Add New Stock Product'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setErrors({}); }} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Linen Bed Sheets, Coffee Beans"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                />
                {errors.name && (
                  <div className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.name}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
                    }}
                    placeholder="e.g. units, kg, liters"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                  {errors.unit && (
                    <div className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.unit}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Unit Cost Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => {
                      setCostPrice(Math.max(0, Number(e.target.value)));
                      if (errors.costPrice) setErrors(prev => ({ ...prev, costPrice: '' }));
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                  {errors.costPrice && (
                    <div className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.costPrice}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stockQuantity}
                    onChange={(e) => {
                      setStockQuantity(Math.max(0, Number(e.target.value)));
                      if (errors.stockQuantity) setErrors(prev => ({ ...prev, stockQuantity: '' }));
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                  {errors.stockQuantity && (
                    <div className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.stockQuantity}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Min Stock Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minStockLevel}
                    onChange={(e) => {
                      setMinStockLevel(Math.max(0, Number(e.target.value)));
                      if (errors.minStockLevel) setErrors(prev => ({ ...prev, minStockLevel: '' }));
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                  {errors.minStockLevel && (
                    <div className="text-red-400 text-[10px] mt-0.5 font-bold">{errors.minStockLevel}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setErrors({}); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-350 text-xs font-semibold hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isEditing ? 'Save Details' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
