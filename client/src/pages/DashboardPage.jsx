import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { SLOTS, getTodayString, formatDateDisplay, getGlucoseCategory } from '../utils/glucoseHelpers';
import api from '../services/api';
import ReadingModal from '../components/ReadingModal';
import DeleteModal from '../components/DeleteModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const todayStr = getTodayString();

  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [todayReadings, setTodayReadings] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsRes, readingsRes] = await Promise.all([
        api.get(`/reports?date=${todayStr}`),
        api.get('/readings?limit=5'),
      ]);

      setReportsData(reportsRes.data);
      setTodayReadings(reportsRes.data.daily.readings || []);
      setRecentReadings(readingsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenAddForSlot = (slotName) => {
    setModalInitialData({
      reading_date: todayStr,
      slot: slotName,
      value: '',
    });
    setIsModalOpen(true);
  };

  const handleEditReading = (reading) => {
    setModalInitialData(reading);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (reading) => {
    setReadingToDelete(reading);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!readingToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/readings/${readingToDelete.id}`);
      setIsDeleteOpen(false);
      setReadingToDelete(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getSlotReading = (slotName) => {
    return todayReadings.find((r) => r.slot === slotName);
  };

  const latestReading = todayReadings.length > 0
    ? todayReadings[todayReadings.length - 1]
    : (recentReadings.length > 0 ? recentReadings[0] : null);

  const latestCat = latestReading ? getGlucoseCategory(latestReading.value) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6 md:space-y-8 pb-24 md:pb-12">
      {/* ================= HERO GLUCOSE MONITORING CARD ================= */}
      <div className="relative overflow-hidden bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-9 border border-[#E8ECF4] shadow-soft">
        {/* Ambient brand glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FFF0F5] via-[#FFE2EC]/30 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Central Droplet & Status Graphic */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-7 text-center sm:text-left">
            {/* Concentric Circle Droplet Motif */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFC5D9] animate-[spin_40s_linear_infinite]"></div>
              <div className="absolute inset-2.5 rounded-full bg-[#FFF0F5] border border-[#FFE0EB]"></div>
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#FA0C57] text-white flex items-center justify-center shadow-primary-glow transform hover:scale-105 transition-transform">
                <Droplets className="w-9 h-9 sm:w-10 sm:h-10 fill-white/20" />
              </div>
            </div>

            {/* Glucose Level & Status */}
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">
                <Clock className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>{latestReading ? `Latest: ${latestReading.slot}` : "Today's Status"}</span>
              </div>

              <div className="mt-1 flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#05193C] tracking-tight">
                  {latestReading ? latestReading.value : '--'}
                </span>
                <span className="text-sm font-bold text-[#05193C]/50">mg/dl</span>
              </div>

              {latestCat ? (
                <div className="mt-2.5 flex items-center justify-center sm:justify-start">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${latestCat.badgeColor}`}>
                    <span className={`w-2 h-2 rounded-full ${latestCat.dotColor}`}></span>
                    <span>{latestCat.label}</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs font-medium text-[#05193C]/50 mt-1">No readings logged yet today</p>
              )}
            </div>
          </div>

          {/* Right Action Button & Progress */}
          <div className="w-full sm:w-auto flex flex-col items-center sm:items-end space-y-3.5">
            <div className="text-center sm:text-right">
              <span className="text-xs font-semibold text-[#05193C]/60">Daily Target Progress</span>
              <p className="text-sm font-extrabold text-[#05193C]">
                {todayReadings.length} of 4 Slots Logged
              </p>
              {/* Progress bar */}
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 mx-auto sm:ml-auto">
                <div
                  className="h-full bg-gradient-to-r from-[#05193C] to-[#FA0C57] rounded-full transition-all duration-500"
                  style={{ width: `${(todayReadings.length / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Primary Button: #FA0C57 with White Text */}
            <button
              onClick={() => {
                setModalInitialData(null);
                setIsModalOpen(true);
              }}
              disabled={todayReadings.length >= 4}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#FA0C57] hover:bg-[#E00A4D] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{todayReadings.length >= 4 ? 'All 4 Slots Complete' : 'Save Glucose Reading'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4 MEASUREMENT SLOTS CARDS ================= */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#05193C]">Today's Readings</h2>
            <p className="text-xs text-[#05193C]/60 font-medium">4 clinical slots: fasting & post-meal</p>
          </div>
          <span className="text-[11px] font-extrabold text-[#FA0C57] bg-[#FFF0F5] px-3 py-1 rounded-full border border-[#FFE0EB]">
            {todayReadings.length}/4 Done
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {SLOTS.map((slotName) => {
            const reading = getSlotReading(slotName);
            const isRecorded = !!reading;
            const category = isRecorded ? getGlucoseCategory(reading.value) : null;

            return (
              <div
                key={slotName}
                className={`rounded-3xl p-5 border transition-all ${
                  isRecorded
                    ? 'bg-white border-[#E8ECF4] shadow-soft hover:border-[#FA0C57]/40'
                    : 'bg-white/70 border-dashed border-[#FFC5D9] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#05193C]/80 truncate">{slotName}</span>
                  {isRecorded ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#05193C]/50 bg-slate-100 px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  )}
                </div>

                {isRecorded ? (
                  <div>
                    <div className="flex items-baseline space-x-1.5 my-1">
                      <span className="text-3xl font-extrabold text-[#05193C] tracking-tight">{reading.value}</span>
                      <span className="text-xs font-semibold text-[#05193C]/50">mg/dl</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${category.badgeColor}`}>
                        {category.label}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditReading(reading)}
                          title="Edit reading"
                          className="p-1.5 text-slate-400 hover:text-[#FA0C57] hover:bg-[#FFF0F5] rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(reading)}
                          title="Delete reading"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <p className="text-[11px] text-[#05193C]/50 mb-3">No entry recorded yet</p>
                    {/* Light Button: Background #FFF0F5, Text #FA0C57 */}
                    <button
                      onClick={() => handleOpenAddForSlot(slotName)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#FFF0F5] hover:bg-[#FFE2EC] border border-[#FFE0EB] text-[#FA0C57] text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Log Slot</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= ANALYTICS SNAPSHOT TILES ================= */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#05193C]">Analytics Summary</h2>
            <p className="text-xs text-[#05193C]/60 font-medium">Quick glimpse of glycemic averages</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-extrabold text-[#FA0C57] hover:text-[#E00A4D] flex items-center space-x-1 group"
          >
            <span>Full Reports</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Daily */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8ECF4] shadow-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">Daily Average (Today)</span>
            {reportsData?.daily?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#05193C]">{reportsData.daily.average?.toFixed(1)}</span>
                  <span className="text-xs font-semibold text-[#05193C]/50">mg/dl</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#05193C]/70 pt-2.5 border-t border-slate-100">
                  <span>High: <strong>{reportsData.daily.highest}</strong></span>
                  <span>Low: <strong>{reportsData.daily.lowest}</strong></span>
                  <span>Readings: <strong>{reportsData.daily.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#05193C]/50 mt-2">No entries logged today.</p>
            )}
          </div>

          {/* Month to Date */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8ECF4] shadow-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">Month-to-Date Avg</span>
            {reportsData?.monthToDate?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#05193C]">{reportsData.monthToDate.average?.toFixed(1)}</span>
                  <span className="text-xs font-semibold text-[#05193C]/50">mg/dl</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#05193C]/70 pt-2.5 border-t border-slate-100">
                  <span>High: <strong>{reportsData.monthToDate.highest}</strong></span>
                  <span>Low: <strong>{reportsData.monthToDate.lowest}</strong></span>
                  <span>Readings: <strong>{reportsData.monthToDate.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#05193C]/50 mt-2">No entries this month yet.</p>
            )}
          </div>

          {/* Previous Month */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8ECF4] shadow-soft">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">
              {reportsData?.monthly?.monthLabel || 'Previous Month'}
            </span>
            {reportsData?.monthly?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold text-[#05193C]">{reportsData.monthly.average?.toFixed(1)}</span>
                  <span className="text-xs font-semibold text-[#05193C]/50">mg/dl</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#05193C]/70 pt-2.5 border-t border-slate-100">
                  <span>High: <strong>{reportsData.monthly.highest}</strong></span>
                  <span>Low: <strong>{reportsData.monthly.lowest}</strong></span>
                  <span>Readings: <strong>{reportsData.monthly.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#05193C]/50 mt-2">No entries in previous month.</p>
            )}
          </div>
        </div>
      </div>

      {/* ================= RECENT READINGS LIST (RESPONSIVE TABLE + MOBILE CARDS) ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8ECF4] shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#05193C]">Recent Entries</h2>
          <Link
            to="/readings"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-[#FFF0F5] hover:bg-[#FFE2EC] border border-[#FFE0EB] text-[#FA0C57] text-xs font-extrabold transition-all active:scale-95 shadow-sm"
          >
            <span>View History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReadings.length > 0 ? (
          <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8ECF4] text-[11px] font-bold uppercase text-[#05193C]/60">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Slot</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">Classification</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReadings.map((r) => {
                    const cat = getGlucoseCategory(r.value);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2 font-bold text-[#05193C]">
                          {formatDateDisplay(r.reading_date)}
                        </td>
                        <td className="py-3.5 text-[#05193C]/80 font-medium">{r.slot}</td>
                        <td className="py-3.5 font-extrabold text-[#05193C]">
                          {r.value} <span className="text-xs text-[#05193C]/50 font-normal">mg/dl</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.badgeColor}`}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-right space-x-1">
                          <button
                            onClick={() => handleEditReading(r)}
                            className="p-1.5 text-slate-400 hover:text-[#FA0C57] hover:bg-[#FFF0F5] rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2.5">
              {recentReadings.map((r) => {
                const cat = getGlucoseCategory(r.value);
                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E8ECF4] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#05193C]">{r.slot}</p>
                      <p className="text-[11px] text-[#05193C]/50 font-medium">{formatDateDisplay(r.reading_date)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-[#05193C]">{r.value}</span>
                        <span className="text-[10px] text-[#05193C]/50 ml-1">mg/dl</span>
                        <div>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${cat.badgeColor}`}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleEditReading(r)}
                          className="p-1.5 text-slate-400 hover:text-[#FA0C57]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#05193C]/50 py-6 text-center">No readings found. Start by logging one!</p>
        )}
      </div>

      {/* Modals */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
        initialData={modalInitialData}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        reading={readingToDelete}
        deleting={deleting}
      />
    </div>
  );
}
