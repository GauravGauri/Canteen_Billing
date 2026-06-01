import React from 'react';
import { Search, Plus } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';

const MenuSection = () => {
  const dishes = usePosStore((state) => state.dishes);
  const categories = usePosStore((state) => state.categories);
  const selectedCategory = usePosStore((state) => state.selectedCategory);
  const searchQuery = usePosStore((state) => state.searchQuery);
  const setSelectedCategory = usePosStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePosStore((state) => state.setSearchQuery);
  const addToCart = usePosStore((state) => state.addToCart);

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-200"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => (
          <div
            key={dish._id}
            onClick={() => addToCart(dish)}
            className={`glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-brand-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
              !dish.isAvailable ? 'opacity-50' : ''
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-brand-400 bg-brand-500/5 border border-brand-500/10 px-2 py-0.5 rounded-full uppercase">
                {dish.category}
              </span>
              <h4 className="font-bold text-slate-100 text-sm mt-2.5 group-hover:text-brand-400 transition-colors">
                {dish.name}
              </h4>
              {dish.description && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-base text-slate-100">₹{dish.price}</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-brand-400 hover:bg-brand-600 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {!dish.isAvailable && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex items-center justify-center font-bold text-red-400 text-xs tracking-wider uppercase">
                Unavailable
              </div>
            )}
          </div>
        ))}

        {filteredDishes.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No dishes found in category "{selectedCategory}"
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuSection;
