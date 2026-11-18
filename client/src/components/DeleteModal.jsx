import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatDateDisplay } from '../utils/glucoseHelpers';

export default function DeleteModal({ isOpen, onClose, onConfirm, reading, deleting }) {
  if (!isOpen || !reading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">Delete Glucose Reading?</h3>
          <p className="text-xs text-slate-500 mt-1">
            This action cannot be undone. Are you sure you want to remove this reading?
          </p>

          <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-800">{formatDateDisplay(reading.reading_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slot:</span>
              <span className="font-semibold text-slate-800">{reading.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Value:</span>
              <span className="font-bold text-rose-600">{reading.value} mg/dl</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-1/2 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-sm font-semibold shadow-sm shadow-rose-200 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
