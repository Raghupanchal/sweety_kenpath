import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  Clock,
} from 'lucide-react';
import { SLOTS, formatDateDisplay, getGlucoseCategory } from '../utils/glucoseHelpers';
import api from '../services/api';
import ReadingModal from '../components/ReadingModal';
import DeleteModal from '../components/DeleteModal';

export default function ReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReadings = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (dateFilter) params.append('date', dateFilter);
      if (slotFilter) params.append('slot', slotFilter);

      const res = await api.get(`/readings?${params.toString()}`);
      setReadings(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings(1);
  }, [dateFilter, slotFilter]);

  const handleClearFilters = () => {
    setDateFilter('');
    setSlotFilter('');
  };

  const handleEdit = (reading) => {
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
      await fetchReadings(pagination.page);
    } catch (err) {
      console.error('Failed to delete reading:', err);
    } finally {
      setDeleting(false);
    }
  };

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-5 md:space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1940] tracking-tight">Glucose Readings Log</h1>
          <p className="text-xs text-[#8E8EA9]">Complete history with 4-slot daily quota records</p>
        </div>

        <button
          onClick={() => {
            setModalInitialData(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Reading</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECECFA] shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#8E8EA9] uppercase tracking-wider pr-1">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span>Filter:</span>
          </div>

          {/* Date Picker Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-[#F8F9FE] border border-[#ECECFA] rounded-xl text-xs font-bold text-[#1A1940] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Slot Filter */}
          <div className="relative">
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="px-3 py-2 bg-[#F8F9FE] border border-[#ECECFA] rounded-xl text-xs font-bold text-[#1A1940] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Slots</option>
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(dateFilter || slotFilter) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <button
          onClick={() => fetchReadings(pagination.page)}
          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl self-end md:self-auto transition-colors"
          title="Refresh table"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Readings Table Card */}
      <div className="bg-white rounded-3xl border border-[#ECECFA] shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#8E8EA9]">Loading readings log...</p>
          </div>
        ) : readings.length > 0 ? (
          <div>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FE] border-b border-[#ECECFA]">
                  <tr className="text-[11px] font-bold uppercase text-[#8E8EA9]">
                    <th className="py-3.5 pl-6">Date</th>
                    <th className="py-3.5 px-4">Time Slot</th>
                    <th className="py-3.5 px-4">Glucose Level</th>
                    <th className="py-3.5 px-4">Classification</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3FA]">
                  {readings.map((r) => {
                    const cat = getGlucoseCategory(r.value);
                    return (
                      <tr key={r.id} className="hover:bg-[#F8F9FE]/80 transition-colors">
                        <td className="py-4 pl-6 font-bold text-[#1A1940]">
                          {formatDateDisplay(r.reading_date)}
                        </td>
                        <td className="py-4 px-4 text-[#646383] font-medium">{r.slot}</td>
                        <td className="py-4 px-4 font-extrabold text-[#1A1940]">
                          <span className="text-base">{r.value}</span>{' '}
                          <span className="text-xs font-normal text-[#8E8EA9]">mg/dl</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${cat.badgeColor}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`}></span>
                            <span>{cat.label}</span>
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right space-x-1">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
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

            {/* Mobile Card List */}
            <div className="sm:hidden p-4 space-y-3">
              {readings.map((r) => {
                const cat = getGlucoseCategory(r.value);
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#ECECFA] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-[#1A1940]">{r.slot}</span>
                      <p className="text-[11px] text-[#8E8EA9] mt-0.5">{formatDateDisplay(r.reading_date)}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#1A1940]">{r.value}</span>
                        <span className="text-[10px] text-[#8E8EA9] ml-1">mg/dl</span>
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badgeColor}`}>
                            {cat.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-brand-600"
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
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#1A1940]">No readings found</p>
            <p className="text-xs text-[#8E8EA9] mt-1 max-w-xs mx-auto">
              {dateFilter || slotFilter
                ? 'No glucose readings match the active filter criteria.'
                : 'You have not logged any readings yet.'}
            </p>
            {(dateFilter || slotFilter) && (
              <button
                onClick={handleClearFilters}
                className="mt-3 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="p-4 bg-[#F8F9FE] border-t border-[#ECECFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E8EA9]">
            <div>
              Showing <strong className="text-[#1A1940]">{startRecord}</strong> to{' '}
              <strong className="text-[#1A1940]">{endRecord}</strong> of{' '}
              <strong className="text-[#1A1940]">{pagination.total}</strong> readings
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchReadings(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="p-2 rounded-xl border border-[#ECECFA] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-extrabold text-[#1A1940] px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => fetchReadings(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="p-2 rounded-xl border border-[#ECECFA] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchReadings(pagination.page)}
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
