import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  History,
  Boxes,
  BookOpen,
  Users,
  ShoppingBag,
  LogOut,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const links = [
    { to: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { to: '/pos', name: 'POS Terminal', icon: Utensils },
    { to: '/quick-bill', name: 'Quick Bill', icon: Sparkles },
    { to: '/billing-history', name: 'Billing History', icon: History },
    { to: '/inventory', name: 'Inventory', icon: Boxes },
    { to: '/dish-creator', name: 'Dishes & Recipes', icon: BookOpen },
    { to: '/suppliers', name: 'Suppliers', icon: Users },
    { to: '/purchase-orders', name: 'Purchase Orders', icon: ShoppingBag },
  ];

  return (
    <aside className="no-print w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Utensils className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 leading-none">KK Food</h1>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Canteen POS</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/15'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                  <span>{link.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow animate-pulse">
            {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 truncate max-w-[130px]">{user?.username || 'Admin'}</p>
            <div className="flex items-center gap-1 text-[10px] text-brand-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Administrator</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
