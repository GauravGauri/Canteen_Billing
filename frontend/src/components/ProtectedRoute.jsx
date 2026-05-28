import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-brand-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide">Loading canteen workspace...</p>
        </div>
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
