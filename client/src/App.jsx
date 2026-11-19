import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReadingsPage from './pages/ReadingsPage';
import ReportsPage from './pages/ReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ReadingModal from './components/ReadingModal';

function AppLayout() {
  const [globalModalOpen, setGlobalModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar onOpenNewReading={() => setGlobalModalOpen(true)} />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#EDE9FE] bg-white/70 backdrop-blur-md py-5 text-center text-xs text-[#05193C]/60 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-[#05193C]">Sweety – Blood Glucose Tracker</span>
          <span className="text-[11px] font-medium text-[#05193C]/50">Smart, simplified daily blood glucose monitoring</span>
        </div>
      </footer>

      <ReadingModal
        isOpen={globalModalOpen}
        onClose={() => setGlobalModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh for active view
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/readings" element={<ReadingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
