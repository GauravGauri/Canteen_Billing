import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Lazy load page components for route-based code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
const QuickBill = lazy(() => import('./pages/QuickBill'));
const BillingHistory = lazy(() => import('./pages/BillingHistory'));
const Inventory = lazy(() => import('./pages/Inventory'));
const DishCreator = lazy(() => import('./pages/DishCreator'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));

// Modern, sleek loading spinner aligned with App UI theme
const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-3">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
    <p className="text-sm font-semibold tracking-wide text-slate-400">Loading page...</p>
  </div>
);

// Layout wrapper for authenticated sessions to render Sidebar
const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected MERN Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/quick-bill" element={<QuickBill />} />
                <Route path="/billing-history" element={<BillingHistory />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/dish-creator" element={<DishCreator />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
              </Route>
            </Route>

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
