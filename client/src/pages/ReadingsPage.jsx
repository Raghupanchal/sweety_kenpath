import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Glucose Readings</h1>
          <p className="text-xs text-slate-500 mt-1">Complete patient log with 4 slots per day validation</p>
        </div>

        <button
          onClick={() => {
            setModalInitialData(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Reading</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Date Picker Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Slot Filter */}
          <div className="relative">
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <button
          onClick={() => fetchReadings(pagination.page)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl self-end md:self-auto transition-colors"
          title="Refresh table"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Readings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Loading readings...</p>
          </div>
        ) : readings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr className="text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3.5 pl-6">Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Glucose Level</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.map((r) => {
                  const cat = getGlucoseCategory(r.value);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-6 font-semibold text-slate-800">
                        {formatDateDisplay(r.reading_date)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{r.slot}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <span className="text-base">{r.value}</span>{' '}
                        <span className="text-xs font-normal text-slate-400">mg/dl</span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.badgeColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`}></span>
                          <span>{cat.label}</span>
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(r)}
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
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No readings found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {dateFilter || slotFilter
                ? 'No glucose readings match the active filter criteria.'
                : 'You have not logged any readings yet.'}
            </p>
            {(dateFilter || slotFilter) && (
              <button
                onClick={handleClearFilters}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{startRecord}</strong> to{' '}
              <strong className="text-slate-800">{endRecord}</strong> of{' '}
              <strong className="text-slate-800">{pagination.total}</strong> readings
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchReadings(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => fetchReadings(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
