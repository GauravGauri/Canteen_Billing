import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus, Edit2, Trash2, Search, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showMsg('error', 'Failed to fetch inventory products');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setProductId('');
    setName('');
    setUnit('kg');
    setStockQuantity(0);
    setMinStockLevel(5);
    setCostPrice(0);
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !unit) {
      showMsg('error', 'Name and Unit are required');
      return;
    }

    try {
      const payload = {
        name,
        unit,
        stockQuantity: Number(stockQuantity),
        minStockLevel: Number(minStockLevel),
        costPrice: Number(costPrice),
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/products/${productId}`, payload);
      } else {
        response = await axios.post('/products', payload);
      }

      if (response.data.success) {
        showMsg('success', `Product ${isEditing ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this product from inventory? This will impact dishes associated with it.')) {
      try {
        const response = await axios.delete(`/products/${id}`);
        if (response.data.success) {
          showMsg('success', 'Product removed successfully');
          fetchProducts();
        }
      } catch (err) {
        showMsg('error', 'Failed to delete product. Ensure it is not locked by recipes.');
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count low stock
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Inventory Management" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between border-l-4 border-brand-500">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Raw Items</span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1.5">{products.length}</h3>
            </div>
            <div className="p-3 bg-brand-600/10 text-brand-400 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center justify-between border-l-4 border-red-500">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
              <h3 className="text-3xl font-extrabold text-red-400 mt-1.5">{lowStockCount}</h3>
            </div>
            <div className="p-3 bg-red-650/10 text-red-400 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center justify-between border-l-4 border-emerald-500">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Healthy Stock Items</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">{products.length - lowStockCount}</h3>
            </div>
            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {message.text && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filter & Action Header */}
        <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory items..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Add Action */}
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow shadow-brand-600/15"
          >
            <Plus className="w-4 h-4" />
            <span>Add Raw Product</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Stock Unit</th>
                  <th className="px-6 py-4">Min stock level</th>
                  <th className="px-6 py-4">Cost Price</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stockQuantity <= product.minStockLevel;
                  return (
                    <tr key={product._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{product.name}</td>
                      <td className={`px-6 py-4 font-extrabold ${isLowStock ? 'text-red-400' : 'text-slate-200'}`}>
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 text-slate-400 uppercase text-xs">{product.unit}</td>
                      <td className="px-6 py-4 text-slate-400">{product.minStockLevel}</td>
                      <td className="px-6 py-4">₹{product.costPrice}</td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">Low Stock</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">In Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800 transition-colors inline-flex"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors inline-flex"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                      No products found. Add products to populate inventory.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-brand-400 font-semibold">
                      Loading inventory products...
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">
                {isEditing ? 'Edit Product Details' : 'Add New Raw Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken, Onion, Tomato"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Unit & Cost Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg, g, pcs, liters"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Default Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Min Stock Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl"
                >
                  {isEditing ? 'Save Changes' : 'Create Product'}
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
