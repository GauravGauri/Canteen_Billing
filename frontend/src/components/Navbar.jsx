import React, { useState, useEffect } from 'react';
import { Calendar, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('canteen_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('canteen_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="no-print h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Welcome back to the terminal.</p>
      </div>

      <div className="flex items-center gap-6 text-sm text-slate-300">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-800/40 text-brand-400 hover:bg-slate-850 hover:text-brand-300 transition-all flex items-center justify-center cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-medium text-slate-300">{today}</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <span className="font-semibold text-slate-200">{user?.username}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
