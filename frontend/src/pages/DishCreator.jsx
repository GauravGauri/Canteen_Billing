import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus, Edit2, Trash2, Search, BookOpen, Layers, X, PlusCircle, MinusCircle } from 'lucide-react';

const DishCreator = () => {
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dishId, setDishId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Mains');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Recipe Builder states (individual ingredients added to active recipe)
  const [recipeItems, setRecipeItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [ingredientQty, setIngredientQty] = useState(0);

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDishes();
    fetchProducts();
  }, []);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/dishes');
      if (response.data.success) {
        setDishes(response.data.data);
      }
    } catch (err) {
      console.error(err);
      showMsg('error', 'Failed to fetch dishes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedProductId(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setDishId('');
    setName('');
    setPrice(0);
    setCategory('Mains');
    setDescription('');
    setRecipeItems([]);
    setIsAvailable(true);
    if (products.length > 0) {
      setSelectedProductId(products[0]._id);
    }
    setIngredientQty(0);
    setIsModalOpen(true);
  };

  const openEditModal = (dish) => {
    setIsEditing(true);
    setDishId(dish._id);
    setName(dish.name);
    setPrice(dish.price);
    setCategory(dish.category);
    setDescription(dish.description || '');
    setIsAvailable(dish.isAvailable);

    // Map recipes from backend structure
    const mappedRecipe = dish.recipe.map((r) => ({
      productId: r.productId?._id || r.productId,
      name: r.productId?.name || 'Unknown Product',
      unit: r.productId?.unit || '',
      quantity: r.quantity,
    }));

    setRecipeItems(mappedRecipe);
    setIsModalOpen(true);
  };

  // Add ingredient item to recipe builders
  const handleAddIngredient = () => {
    if (ingredientQty <= 0) {
      showMsg('error', 'Please enter a valid ingredient quantity');
      return;
    }

    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    // Check if product is already in recipe
    const exists = recipeItems.find((item) => item.productId === selectedProductId);
    if (exists) {
      showMsg('error', 'This ingredient is already in the recipe');
      return;
    }

    setRecipeItems([
      ...recipeItems,
      {
        productId: selectedProductId,
        name: product.name,
        unit: product.unit,
        quantity: Number(ingredientQty),
      },
    ]);
    setIngredientQty(0);
  };

  const handleRemoveIngredient = (prodId) => {
    setRecipeItems(recipeItems.filter((item) => item.productId !== prodId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price <= 0 || !category) {
      showMsg('error', 'Name, Price and Category are required');
      return;
    }

    try {
      // Map recipeItems back to schemas format
      const recipePayload = recipeItems.map((r) => ({
        productId: r.productId,
        quantity: r.quantity,
      }));

      const payload = {
        name,
        price: Number(price),
        category,
        description,
        isAvailable,
        recipe: recipePayload,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/dishes/${dishId}`, payload);
      } else {
        response = await axios.post('/dishes', payload);
      }

      if (response.data.success) {
        showMsg('success', `Dish ${isEditing ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchDishes();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Error saving dish');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this dish? It will be removed from the POS menu.')) {
      try {
        const response = await axios.delete(`/dishes/${id}`);
        if (response.data.success) {
          showMsg('success', 'Dish removed successfully');
          fetchDishes();
        }
      } catch (err) {
        showMsg('error', 'Failed to delete dish');
      }
    }
  };

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pl-0 lg:pl-64">
      <Navbar title="Dishes & Recipe Creator" />

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
              placeholder="Search dishes..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow shadow-brand-600/15"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dish & Recipe</span>
          </button>
        </div>

        {/* Dishes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish._id} className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-bold text-brand-400 bg-brand-500/5 border border-brand-500/10 px-2.5 py-0.5 rounded-full uppercase">
                    {dish.category}
                  </span>
                  {dish.isAvailable ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Available</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Unavailable</span>
                  )}
                </div>

                <h4 className="font-bold text-slate-100 text-base leading-tight mb-1">{dish.name}</h4>
                <h5 className="font-bold text-brand-400 text-base mb-3">₹{dish.price}</h5>
                
                {dish.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{dish.description}</p>
                )}

                {/* Recipe Ingredients Preview */}
                <div className="border-t border-slate-800/80 pt-3 mt-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Recipe Ingredients</span>
                  {dish.recipe && dish.recipe.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto">
                      {dish.recipe.map((r, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg">
                          {r.productId?.name || 'Unknown'}: {r.quantity} {r.productId?.unit || ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-500 italic block">No recipe items bound (Direct preparation)</span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-4 mt-4">
                <button
                  onClick={() => openEditModal(dish)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Recipe</span>
                </button>
                <button
                  onClick={() => handleDelete(dish._id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors inline-flex"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredDishes.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm">
              No dishes created. Add dishes to setup the menu.
            </div>
          )}

          {loading && (
            <div className="col-span-full py-16 text-center text-brand-400 font-semibold">
              Loading menu dishes...
            </div>
          )}
        </div>

      </div>

      {/* Dish Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base">
                {isEditing ? 'Edit Dish & Recipe Details' : 'Create Dish & Link Recipe'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dish Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Butter Chicken, Mango Shake"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Selling Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Mains">Mains</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dish flavors or specs..."
                  rows="2"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              {/* Status toggler */}
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="availability"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-800 rounded bg-slate-900"
                />
                <label htmlFor="availability" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Item is active and available to order in POS terminal
                </label>
              </div>

              {/* Recipe Builder Component */}
              <div className="border-t border-slate-800/80 pt-4 space-y-4">
                <h4 className="font-bold text-slate-100 text-sm">Recipe Ingredients Editor</h4>
                
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  {/* Select Product */}
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Raw Ingredient</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-300"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Required */}
                  <div className="w-full sm:w-40 space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Quantity Needed ({products.find(p => p._id === selectedProductId)?.unit || 'unit'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={ingredientQty === 0 ? '' : ingredientQty}
                      onChange={(e) => setIngredientQty(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-brand-400 font-semibold text-sm rounded-xl"
                  >
                    Add Ingredient
                  </button>
                </div>

                {/* Recipe List Table */}
                <div className="bg-slate-950/60 rounded-xl border border-slate-850 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                        <th className="px-4 py-2.5">Ingredient</th>
                        <th className="px-4 py-2.5 text-center">Required Quantity</th>
                        <th className="px-4 py-2.5 text-center">Unit</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {recipeItems.map((item, index) => (
                        <tr key={item.productId || index}>
                          <td className="px-4 py-2.5 font-semibold text-slate-100">{item.name}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-brand-400">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-center text-slate-400 uppercase">{item.unit}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(item.productId)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {recipeItems.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-slate-500 italic">
                            No recipe ingredients mapped. (Ideal for direct items like bottled sodas, etc.)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80">
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
                  {isEditing ? 'Save Recipe Changes' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DishCreator;
