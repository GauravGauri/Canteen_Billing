import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Lazy load page components for route-based code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POSBilling = lazy(() => import('./pages/POSBilling'));
const POSBillHistory = lazy(() => import('./pages/POSBillHistory'));
const PaymentReports = lazy(() => import('./pages/PaymentReports'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Guests = lazy(() => import('./pages/Guests'));
const Agents = lazy(() => import('./pages/Agents'));
const Groups = lazy(() => import('./pages/Groups'));
const Settings = lazy(() => import('./pages/Settings'));
const Inventory = lazy(() => import('./pages/Inventory'));
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

            {/* Protected MERN Resort Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos-billing" element={<POSBilling />} />
                <Route path="/pos-bill-history" element={<POSBillHistory />} />
                <Route path="/payment-reports" element={<PaymentReports />} />
                
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/groups" element={<Groups />} />
                
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                
                <Route path="/settings" element={<Settings />} />
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
