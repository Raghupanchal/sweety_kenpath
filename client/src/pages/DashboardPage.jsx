import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Edit2,
  Trash2,
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

  // Modal states
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-700/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateDisplay(todayStr)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
            You have logged <strong className="text-white font-bold">{todayReadings.length} of 4</strong> blood
            glucose readings today. Consistency helps maintain ideal glycemic control.
          </p>
        </div>

        <button
          onClick={() => {
            setModalInitialData(null);
            setIsModalOpen(true);
          }}
          disabled={todayReadings.length >= 4}
          className="inline-flex items-center space-x-2 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 font-bold px-5 py-3 rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>{todayReadings.length >= 4 ? 'All 4 Slots Logged' : 'Log New Reading'}</span>
        </button>
      </div>

      {/* 4 Daily Slots Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Today's Measurement Slots</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">Max 4 readings / day</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SLOTS.map((slotName) => {
            const reading = getSlotReading(slotName);
            const isRecorded = !!reading;
            const category = isRecorded ? getGlucoseCategory(reading.value) : null;

            return (
              <div
                key={slotName}
                className={`rounded-2xl p-5 border transition-all ${
                  isRecorded
                    ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'
                    : 'bg-slate-50/70 border-dashed border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 tracking-wide">{slotName}</span>
                  {isRecorded ? (
                    <span className="p-1 text-emerald-600 bg-emerald-50 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                {isRecorded ? (
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-extrabold text-slate-900">{reading.value}</span>
                      <span className="text-xs font-semibold text-slate-400">mg/dl</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${category.badgeColor}`}>
                        {category.label}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditReading(reading)}
                          title="Edit reading"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(reading)}
                          title="Delete reading"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-xs text-slate-400 mb-3">No reading recorded yet</p>
                    <button
                      onClick={() => handleOpenAddForSlot(slotName)}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Log Slot</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports Summary Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Reports Snapshot</span>
          </h2>
          <Link
            to="/reports"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Today's Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily (Today)</span>
            {reportsData?.daily?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {reportsData.daily.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">mg/dl avg</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>High: <strong>{reportsData.daily.highest}</strong></span>
                  <span>Low: <strong>{reportsData.daily.lowest}</strong></span>
                  <span>Entries: <strong>{reportsData.daily.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No entries logged today.</p>
            )}
          </div>

          {/* Month-to-date Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Month-to-Date</span>
            {reportsData?.monthToDate?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {reportsData.monthToDate.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">mg/dl avg</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>High: <strong>{reportsData.monthToDate.highest}</strong></span>
                  <span>Low: <strong>{reportsData.monthToDate.lowest}</strong></span>
                  <span>Entries: <strong>{reportsData.monthToDate.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No entries this month yet.</p>
            )}
          </div>

          {/* Previous Month Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {reportsData?.monthly?.monthLabel || 'Previous Month'}
            </span>
            {reportsData?.monthly?.count > 0 ? (
              <div className="mt-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {reportsData.monthly.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">mg/dl avg</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>High: <strong>{reportsData.monthly.highest}</strong></span>
                  <span>Low: <strong>{reportsData.monthly.lowest}</strong></span>
                  <span>Entries: <strong>{reportsData.monthly.count}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No entries in previous month.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Readings</h2>
          <Link
            to="/readings"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReadings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
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
                      <td className="py-3.5 pl-2 font-semibold text-slate-800">
                        {formatDateDisplay(r.reading_date)}
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">{r.slot}</td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {r.value} <span className="text-xs text-slate-400 font-normal">mg/dl</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.badgeColor}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right space-x-1">
                        <button
                          onClick={() => handleEditReading(r)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
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
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No readings found. Start by logging one!</p>
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
