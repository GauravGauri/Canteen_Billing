import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus, Edit2, Trash2, Search, Users, Phone, MapPin, Mail } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/suppliers');
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showMsg('error', 'Failed to fetch suppliers list');
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
    setSupplierId('');
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setIsEditing(true);
    setSupplierId(supplier._id);
    setName(supplier.name);
    setContactPerson(supplier.contactPerson || '');
    setPhone(supplier.phone);
    setEmail(supplier.email || '');
    setAddress(supplier.address || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      showMsg('error', 'Supplier Name and Phone are required');
      return;
    }

    try {
      const payload = {
        name,
        contactPerson,
        phone,
        email,
        address,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/suppliers/${supplierId}`, payload);
      } else {
        response = await axios.post('/suppliers', payload);
      }

      if (response.data.success) {
        showMsg('success', `Supplier ${isEditing ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchSuppliers();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error saving supplier');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will not delete past purchase orders.')) {
      try {
        const response = await axios.delete(`/suppliers/${id}`);
        if (response.data.success) {
          showMsg('success', 'Supplier deleted successfully');
          fetchSuppliers();
        }
      } catch (err) {
        showMsg('error', 'Failed to delete supplier');
      }
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Supplier Registry" />

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        
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
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow shadow-brand-600/15"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        {/* Suppliers List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier._id} className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="p-3 bg-brand-600/10 text-brand-400 rounded-xl border border-brand-500/10">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base leading-none">{supplier.name}</h4>
                    {supplier.contactPerson && (
                      <span className="text-xs text-slate-400 mt-1 block">Contact: {supplier.contactPerson}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3.5">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-4 mt-5">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors inline-flex"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm">
              No suppliers found. Create a supplier to map purchase orders.
            </div>
          )}

          {loading && (
            <div className="col-span-full py-16 text-center text-brand-400 font-semibold">
              Loading supplier registry...
            </div>
          )}
        </div>

      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base">
                {isEditing ? 'Edit Supplier Registry' : 'Register New Vendor / Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Supplier / Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fresh Veggies Ltd, Meat Distributors"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Mr. John Doe"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999-99999"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@supplier.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Office/Warehouse address..."
                  rows="2"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
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
                  {isEditing ? 'Save Details' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Suppliers;
