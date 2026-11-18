import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  CalendarDays,
  BarChart2,
  LogOut,
  Plus,
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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E8ECF4] hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo matching user image */}
            <Link to="/" className="flex flex-col items-start group py-1">
              <img
                src="/sweety-logo.png"
                alt="Sweety"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="text-[9px] font-extrabold text-[#05193C]/60 tracking-widest uppercase pl-1 -mt-1">
                Glucose Tracker
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center space-x-1.5 bg-[#F8F9FC] p-1.5 rounded-2xl border border-[#E8ECF4]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-white text-[#FA0C57] shadow-sm border border-[#FFE0EB]'
                        : 'text-[#05193C]/70 hover:text-[#05193C] hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FA0C57]' : 'text-[#05193C]/50'}`} />
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
                  className="inline-flex items-center space-x-2 bg-[#FA0C57] hover:bg-[#E00A4D] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-primary-glow transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Log Reading</span>
                </button>
              )}

              {/* User Profile Capsule */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3 pl-3 pr-2.5 py-1.5 rounded-2xl bg-white border border-[#E8ECF4] hover:border-[#FA0C57]/40 transition-all text-left shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FA0C57] font-extrabold text-xs flex items-center justify-center border border-[#FFE0EB]">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-xs font-bold text-[#05193C] max-w-[110px] truncate leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#05193C]/50 leading-tight">
                      Patient
                    </span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-[#E8ECF4] p-2 py-2.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-[#05193C] truncate">{user?.name}</p>
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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E8ECF4] px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          {/* Logo with Glucose Tracker Subtitle */}
          <Link to="/" className="flex flex-col items-start">
            <img
              src="/sweety-logo.png"
              alt="Sweety"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[8px] font-extrabold text-[#05193C]/60 tracking-widest uppercase pl-0.5 -mt-0.5">
              Glucose Tracker
            </span>
          </Link>

          {/* Right Side: Patient Avatar & Logout */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FA0C57] font-extrabold text-xs flex items-center justify-center border border-[#FFE0EB]">
              {getInitials(user?.name)}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION DOCK ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-[#E8ECF4] px-6 py-2 pb-safe shadow-[0_-8px_20px_rgba(5,25,60,0.06)]">
        <div className="flex items-center justify-around relative max-w-sm mx-auto">
          {/* Dashboard Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/' ? 'text-[#FA0C57]' : 'text-[#05193C]/50 hover:text-[#05193C]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/' ? 'bg-[#FFF0F5]' : ''}`}>
              <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">Home</span>
          </Link>

          {/* Prominent Center Floating Plus Button matching #FA0C57 */}
          {onOpenNewReading && (
            <button
              onClick={onOpenNewReading}
              className="-mt-6 w-13 h-13 rounded-full bg-[#FA0C57] text-white flex items-center justify-center shadow-primary-glow active:scale-95 transition-transform border-4 border-white"
              title="Log Blood Glucose"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Readings Tab */}
          <Link
            to="/readings"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/readings' ? 'text-[#FA0C57]' : 'text-[#05193C]/50 hover:text-[#05193C]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/readings' ? 'bg-[#FFF0F5]' : ''}`}>
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">Readings</span>
          </Link>

          {/* Reports Tab */}
          <Link
            to="/reports"
            className={`flex flex-col items-center py-1 transition-all ${
              location.pathname === '/reports' ? 'text-[#FA0C57]' : 'text-[#05193C]/50 hover:text-[#05193C]'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${location.pathname === '/reports' ? 'bg-[#FFF0F5]' : ''}`}>
              <BarChart2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">Reports</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
