import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import BillingHistory from './pages/BillingHistory';
import Inventory from './pages/Inventory';
import DishCreator from './pages/DishCreator';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';

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
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected MERN Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
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
      </AuthProvider>
    </Router>
  );
};

export default App;
