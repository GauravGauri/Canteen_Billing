import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useHotelStore } from '../store/useHotelStore';
import { Users, Plus, Edit2, Phone, Mail, Star, DollarSign } from 'lucide-react';

const Suppliers = () => {
  const { suppliers, fetchSuppliers, createSupplier, updateSupplier, loading } = useHotelStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [supplierId, setSupplierId] = useState('');

  // Inputs
  const [supplierName, setSupplierName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [vendorRating, setVendorRating] = useState(5);
  const [paymentDueAmount, setPaymentDueAmount] = useState(0);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openAddModal = () => {
    setIsEditing(false);
    setSupplierId('');
    setSupplierName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setVendorRating(5);
    setPaymentDueAmount(0);
    setShowAddModal(true);
  };

  const openEditModal = (sup) => {
    setIsEditing(true);
    setSupplierId(sup._id);
    setSupplierName(sup.supplierName);
    setContactName(sup.contactName);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setVendorRating(sup.vendorRating || 5);
    setPaymentDueAmount(sup.paymentDueAmount || 0);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierName) return;

    const payload = {
      supplierName,
      contactName,
      phone,
      email,
      address,
      vendorRating: Number(vendorRating),
      paymentDueAmount: Number(paymentDueAmount),
    };

    let ok;
    if (isEditing) {
      ok = await updateSupplier(supplierId, payload);
    } else {
      ok = await createSupplier(payload);
    }

    if (ok) {
      setShowAddModal(false);
      fetchSuppliers();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Supplier Directory" />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Actions Header */}
        <div className="glass-card rounded-2xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-205">Registered Supplies Vendors</h2>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-600/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-750 transition-all hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-200 text-sm">{sup.supplierName}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">POC: {sup.contactName || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-450 font-bold text-xs bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                    <Star className="w-3 h-3 fill-amber-400/20" />
                    <span>{sup.vendorRating || 5}</span>
                  </div>
                </div>

                {/* Contact items */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-850">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sup.phone || 'No Phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{sup.email || 'No Email'}</span>
                  </div>
                </div>

                {/* Account Dues */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Pending Dues Balance:</span>
                  <span className={`font-bold ${sup.paymentDueAmount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    ${(sup.paymentDueAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-850">
                <button
                  onClick={() => openEditModal(sup)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit details</span>
                </button>
              </div>
            </div>
          ))}

          {suppliers.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-semibold">
              No vendors registered.
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">
              {isEditing ? 'Modify Supplier Profile' : 'Register New Vendor'}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Vendor Business Name"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
              />
              <input
                type="text"
                placeholder="Contact Person Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                />
              </div>
              <input
                type="text"
                placeholder="Vendor Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Rating (1 to 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={vendorRating}
                    onChange={(e) => setVendorRating(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Dues Outstanding ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={paymentDueAmount}
                    onChange={(e) => setPaymentDueAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-slate-200"
                  />
                </div>
              </div>
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
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
