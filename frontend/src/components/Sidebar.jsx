import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosStore } from '../store/usePosStore';
import {
  LayoutDashboard,
  Utensils,
  History,
  Boxes,
  Users,
  ShoppingBag,
  LogOut,
  Sparkles,
  Settings,
  Bed,
  Calendar,
  Contact,
  CreditCard,
  Building,
  ShieldAlert,
  ChefHat,
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user, hasRole, roleLabels } = useAuth();
  const isSidebarOpen = usePosStore((state) => state.isSidebarOpen);
  const setSidebarOpen = usePosStore((state) => state.setSidebarOpen);

  // Grouped navigation structure with roles checking
  const navigationGroups = [
    {
      title: 'POS & Billing',
      roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk', 'restaurant_staff', 'accountant'],
      links: [
        { to: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'hotel_manager', 'accountant'] },
        { to: '/pos-billing', name: 'POS Billing', icon: Utensils, roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk', 'restaurant_staff'] },
        { to: '/dish-creator', name: 'Dish Creator', icon: ChefHat, roles: ['super_admin', 'admin', 'hotel_manager', 'restaurant_staff'] },
        { to: '/pos-bill-history', name: 'Bill History', icon: History, roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk', 'restaurant_staff', 'accountant'] },
        { to: '/payment-reports', name: 'Payment Reports', icon: CreditCard, roles: ['super_admin', 'admin', 'accountant'] },
      ],
    },
    {
      title: 'Hotel Operations',
      roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk'],
      links: [
        { to: '/rooms', name: 'Rooms', icon: Bed, roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk'] },
        { to: '/reservations', name: 'Reservations', icon: Calendar, roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk'] },
        { to: '/guests', name: 'Guests', icon: Contact, roles: ['super_admin', 'admin', 'hotel_manager', 'front_desk'] },
        { to: '/agents', name: 'Agents', icon: Building, roles: ['super_admin', 'admin', 'hotel_manager'] },
        { to: '/groups', name: 'Groups', icon: Users, roles: ['super_admin', 'admin', 'hotel_manager'] },
      ],
    },
    {
      title: 'Inventory',
      roles: ['super_admin', 'admin', 'hotel_manager', 'inventory_manager'],
      links: [
        { to: '/inventory', name: 'Stock Inventory', icon: Boxes, roles: ['super_admin', 'admin', 'hotel_manager', 'inventory_manager'] },
        { to: '/suppliers', name: 'Suppliers', icon: Users, roles: ['super_admin', 'admin', 'hotel_manager', 'inventory_manager'] },
        { to: '/purchase-orders', name: 'Purchase Orders', icon: ShoppingBag, roles: ['super_admin', 'admin', 'hotel_manager', 'inventory_manager'] },
      ],
    },
    {
      title: 'System',
      roles: ['super_admin', 'admin', 'hotel_manager'],
      links: [
        { to: '/settings', name: 'Settings', icon: Settings, roles: ['super_admin', 'admin', 'hotel_manager'] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`no-print w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Brand Header */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Building className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-100 leading-none tracking-wide">GRAND RESORT</h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Hotel ERP v2.0</span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="p-4 space-y-6">
            {navigationGroups.map((group) => {
              // Check if user has role for the overall group
              if (!hasRole(group.roles)) return null;

              // Filter links that this user is allowed to see
              const allowedLinks = group.links.filter((link) => hasRole(link.roles));
              if (allowedLinks.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1.5">
                  <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {group.title}
                  </h3>
                  <div className="space-y-0.5">
                    {allowedLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-xs font-medium ${
                              isActive
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                            }`
                          }
                        >
                          <Icon className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />
                          <span>{link.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Profile Info & Logout */}
        <div className="p-4 border-t border-slate-800/60 space-y-3 bg-slate-950">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.username || 'Guest'}</p>
              <div className="flex items-center gap-1 text-[9px] text-brand-400 font-semibold tracking-wider uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                <span className="truncate">{roleLabels[user?.role] || 'User'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
