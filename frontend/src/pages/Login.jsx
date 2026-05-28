import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to POS
  if (token) {
    return <Navigate to="/pos" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate('/pos');
      } else {
        setError(res.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection failure, check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Background blobs for depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-brand-600/10 text-brand-400 border border-brand-500/20 mb-3 shadow-lg shadow-brand-500/5">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">BiteFlow Terminal</h2>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to manage billing & inventory</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Seed hint */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
            <p>Default credentials: <span className="text-brand-400 font-semibold">admin</span> / <span className="text-brand-400 font-semibold">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
