import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Droplets, AlertCircle } from 'lucide-react';
import { SLOTS, getTodayString, getGlucoseCategory } from '../utils/glucoseHelpers';
import api from '../services/api';

export default function ReadingModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const isEditing = Boolean(initialData && initialData.id);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05193C]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-4xl shadow-soft-lg max-w-md w-full p-6 sm:p-7 border border-[#E8ECF4] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF4]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] text-[#FA0C57] flex items-center justify-center border border-[#FFE0EB]">
              <Droplets className="w-5 h-5 fill-[#FA0C57]/20" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#05193C]">
                {isEditing ? 'Edit Glucose Reading' : 'Log Blood Glucose'}
              </h3>
              <p className="text-xs text-[#05193C]/60 font-medium">Record accurate capillary measurement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start space-x-2.5 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Date Field */}
          <div>
            <label htmlFor="reading-date-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FA0C57]" />
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
              className={`w-full px-4 py-3 bg-[#F8F9FC] border rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 transition-all ${
                fieldErrors.date ? 'border-rose-400 bg-rose-50/40' : 'border-[#E8ECF4] focus:border-[#FA0C57]'
              }`}
            />
            {fieldErrors.date && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.date}</span>
              </p>
            )}
          </div>

          {/* Time Slot Field */}
          <div>
            <label htmlFor="reading-slot-select" className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Measurement Slot</span>
              </span>
              <span className="text-[10px] text-[#05193C]/50 font-medium">4 daily slots</span>
            </label>

            {/* Select dropdown for accessibility & RTL test compatibility */}
            <select
              id="reading-slot-select"
              value={slot}
              name="slot"
              onChange={(e) => {
                setSlot(e.target.value);
                setFieldErrors((prev) => ({ ...prev, slot: null }));
              }}
              className={`w-full px-4 py-3 bg-[#F8F9FC] border rounded-2xl text-sm font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 transition-all ${
                fieldErrors.slot ? 'border-rose-400 bg-rose-50/40' : 'border-[#E8ECF4] focus:border-[#FA0C57]'
              }`}
            >
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Visual Chip selector using Light Button / Primary Button theme */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SLOTS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSlot(s);
                    setFieldErrors((prev) => ({ ...prev, slot: null }));
                  }}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold text-center border transition-all truncate ${
                    slot === s
                      ? 'bg-[#FA0C57] text-white border-[#FA0C57] shadow-sm'
                      : 'bg-[#FFF0F5] text-[#FA0C57] border-[#FFE0EB] hover:bg-[#FFE2EC]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {fieldErrors.slot && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.slot}</span>
              </p>
            )}
          </div>

          {/* Value Field */}
          <div>
            <label htmlFor="reading-value-input" className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#FA0C57]" />
                <span>Glucose Value (mg/dl)</span>
              </span>
              <span className="text-[10px] text-[#05193C]/50 font-normal">Range: 40 – 600</span>
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
                className={`w-full px-4 py-3 bg-[#F8F9FC] border rounded-2xl text-lg font-extrabold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#FA0C57]/20 transition-all pr-16 ${
                  fieldErrors.value ? 'border-rose-400 bg-rose-50/40' : 'border-[#E8ECF4] focus:border-[#FA0C57]'
                }`}
              />
              <span className="absolute right-4 top-3.5 text-xs font-extrabold text-[#05193C]/40">
                mg/dl
              </span>
            </div>
            {fieldErrors.value && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fieldErrors.value}</span>
              </p>
            )}

            {/* Live Clinical Tag Preview */}
            {previewCategory && (
              <div className="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FC] border border-[#E8ECF4] flex items-center justify-between text-xs">
                <span className="text-[#05193C]/60 font-medium">Status Assessment:</span>
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-bold ${previewCategory.badgeColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${previewCategory.dotColor}`}></span>
                  <span>{previewCategory.label}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Primary (#FA0C57) and Light Button (#FFF0F5 / #FA0C57) */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-1/2 py-3 px-4 border border-[#FFE0EB] bg-[#FFF0F5] hover:bg-[#FFE2EC] rounded-2xl text-xs font-extrabold text-[#FA0C57] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-3 px-4 bg-[#FA0C57] hover:bg-[#E00A4D] active:scale-95 text-white rounded-2xl text-xs font-extrabold shadow-primary-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Reading' : 'Save Glucose Reading'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
