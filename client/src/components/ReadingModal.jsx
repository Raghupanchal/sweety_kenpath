import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Activity, AlertCircle } from 'lucide-react';
import { SLOTS, getTodayString, getGlucoseCategory } from '../utils/glucoseHelpers';
import api from '../services/api';

export default function ReadingModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const isEditing = !!initialData;
  const todayStr = getTodayString();

  const [date, setDate] = useState(todayStr);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.reading_date || initialData.date);
      setSlot(initialData.slot || SLOTS[0]);
      setValue(initialData.value !== undefined ? String(initialData.value) : '');
    } else {
      setDate(todayStr);
      setSlot(SLOTS[0]);
      setValue('');
    }
    setError(null);
    setFieldErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Immediate Client-Side Validation following the exact specification rules
  const validateForm = () => {
    const errors = {};

    // 1. Date cannot be in the future
    if (!date) {
      errors.date = 'Please select a date.';
    } else if (date > todayStr) {
      errors.date = 'Date cannot be in the future.';
    }

    // 2. Slot selection
    if (!slot) {
      errors.slot = 'Please select a time slot.';
    }

    // 3. Glucose value rules
    if (value === '' || value === null || value === undefined) {
      errors.value = 'Please enter a glucose value.';
    } else {
      const num = Number(value);
      const isInteger = Number.isInteger(num) && String(value).trim() === String(num);

      if (!isInteger || num < 40 || num > 600) {
        errors.value = 'Value must be between 40 and 600 mg/dl.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reading_date: date,
        slot,
        value: parseInt(value, 10),
      };

      if (isEditing) {
        await api.put(`/readings/${initialData.id}`, payload);
      } else {
        await api.post('/readings', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting reading:', err);
      const serverMsg = err.response?.data?.error || 'Failed to save glucose reading. Please try again.';
      setError(serverMsg);

      // If server returned a slot/count error, highlight the respective fields
      if (serverMsg.includes('slot reading for this date')) {
        setFieldErrors((prev) => ({ ...prev, slot: serverMsg }));
      } else if (serverMsg.includes('only 4 readings per day')) {
        setFieldErrors((prev) => ({ ...prev, date: serverMsg }));
      } else if (serverMsg.includes('between 40 and 600')) {
        setFieldErrors((prev) => ({ ...prev, value: serverMsg }));
      } else if (serverMsg.includes('in the future')) {
        setFieldErrors((prev) => ({ ...prev, date: serverMsg }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const previewCategory = value && !isNaN(Number(value)) && Number(value) >= 40 && Number(value) <= 600
    ? getGlucoseCategory(value)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Glucose Reading' : 'Log Blood Glucose'}
              </h3>
              <p className="text-xs text-slate-500">Record accurate capillary reading</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Date Field */}
          <div>
            <label htmlFor="reading-date-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date</span>
            </label>
            <input
              id="reading-date-input"
              type="date"
              name="date"
              max={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setFieldErrors((prev) => ({ ...prev, date: null }));
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                fieldErrors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
              }`}
            />
            {fieldErrors.date && (
              <p className="mt-1 text-xs font-medium text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.date}</span>
              </p>
            )}
          </div>

          {/* Time Slot Field */}
          <div>
            <label htmlFor="reading-slot-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Measurement Slot</span>
            </label>
            <select
              id="reading-slot-select"
              value={slot}
              name="slot"
              onChange={(e) => {
                setSlot(e.target.value);
                setFieldErrors((prev) => ({ ...prev, slot: null }));
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                fieldErrors.slot ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
              }`}
            >
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {fieldErrors.slot && (
              <p className="mt-1 text-xs font-medium text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.slot}</span>
              </p>
            )}
          </div>

          {/* Value Field */}
          <div>
            <label htmlFor="reading-value-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>Glucose Value (mg/dl)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Range: 40 – 600</span>
            </label>
            <div className="relative">
              <input
                id="reading-value-input"
                type="number"
                name="value"
                step="1"
                min="40"
                max="600"
                placeholder="e.g. 110"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, value: null }));
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all pr-16 ${
                  fieldErrors.value ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">
                mg/dl
              </span>
            </div>
            {fieldErrors.value && (
              <p className="mt-1 text-xs font-medium text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.value}</span>
              </p>
            )}

            {/* Live Clinical Tag Preview */}
            {previewCategory && (
              <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Classification:</span>
                <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full font-semibold ${previewCategory.badgeColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${previewCategory.dotColor}`}></span>
                  <span>{previewCategory.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-1/2 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Reading' : 'Save Reading'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
