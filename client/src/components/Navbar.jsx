import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  LayoutGrid,
  CalendarDays,
  BarChart2,
  LogOut,
  Plus,
  Bell,
  ChevronRight,
  User,
} from 'lucide-react';
import { getTodayString, formatDateDisplay } from '../utils/glucoseHelpers';

export default function Navbar({ onOpenNewReading }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const todayStr = getTodayString();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Readings', path: '/readings', icon: CalendarDays },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* ================= DESKTOP HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#ECECFA] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-all">
                <Droplets className="w-6 h-6 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#1A1940]">
                  Sweety<span className="text-brand-500">.</span>
                </span>
                <span className="text-[10px] font-bold text-[#8E8EA9] tracking-wider uppercase -mt-0.5">
                  Glucose Tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center space-x-2 bg-[#F5F5FE] p-1.5 rounded-2xl border border-[#ECECFA]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-[#646383] hover:text-[#1A1940] hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-[#8E8EA9]'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {onOpenNewReading && (
                <button
                  onClick={onOpenNewReading}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-soft transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Log Reading</span>
                </button>
              )}

              {/* User Profile Capsule */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3 pl-3 pr-2 py-1.5 rounded-2xl bg-white border border-[#ECECFA] hover:border-brand-200 transition-all text-left shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center border border-brand-200">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-xs font-bold text-[#1A1940] max-w-[110px] truncate leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-medium text-[#8E8EA9] leading-tight">
                      Patient
                    </span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-[#ECECFA] p-2 py-2.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#ECECFA] px-4 py-3.5 md:hidden">
        <div className="flex items-center justify-between">
          {/* Patient Avatar & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-sm flex items-center justify-center shadow-soft">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1A1940] leading-tight">
                {user?.name || 'Patient'}
              </span>
              <span className="text-[11px] font-semibold text-brand-600 leading-tight">
                Type 2 Care
              </span>
            </div>
          </div>

          {/* Date & Logout button */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F5F5FE] rounded-xl border border-[#ECECFA] text-xs font-bold text-[#646383]">
              <span>{formatDateDisplay(todayStr).split(',')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION DOCK ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-[#ECECFA] px-6 py-2 pb-safe shadow-[0_-8px_20px_rgba(108,93,211,0.06)]">
        <div className="flex items-center justify-around relative max-w-sm mx-auto">
          {/* Dashboard Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/' ? 'text-brand-600' : 'text-[#8E8EA9] hover:text-[#1A1940]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/' ? 'bg-brand-50' : ''}`}>
              <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Home</span>
          </Link>

          {/* Prominent Center Floating Plus Button */}
          {onOpenNewReading && (
            <button
              onClick={onOpenNewReading}
              className="-mt-6 w-13 h-13 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-glow active:scale-95 transition-transform border-4 border-white"
              title="Log Blood Glucose"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Readings Tab */}
          <Link
            to="/readings"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/readings' ? 'text-brand-600' : 'text-[#8E8EA9] hover:text-[#1A1940]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/readings' ? 'bg-brand-50' : ''}`}>
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Readings</span>
          </Link>

          {/* Reports Tab */}
          <Link
            to="/reports"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/reports' ? 'text-brand-600' : 'text-[#8E8EA9] hover:text-[#1A1940]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/reports' ? 'bg-brand-50' : ''}`}>
              <BarChart2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Reports</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
