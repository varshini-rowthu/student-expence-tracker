import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import TransactionModal from './components/TransactionModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

// App Layout Shell
const AppLayout = ({ children, onOpenAddModal }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100">
      <Navbar onOpenTransactionModal={onOpenAddModal} />
      <div className="flex-1 flex pb-16 md:pb-0">
        {user && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
      <Toast />
    </div>
  );
};

const MainRoutes = () => {
  const { user } = useAuth();
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTxnAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppLayout onOpenAddModal={() => setIsGlobalAddOpen(true)}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Protected Feature Routes (SRS FR1 - FR7) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage key={refreshKey} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage key={refreshKey} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <BudgetsPage key={refreshKey} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage key={refreshKey} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Quick-Add Modal */}
      <TransactionModal
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        onSuccess={handleTxnAdded}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainRoutes />
      </Router>
    </AuthProvider>
  );
}
