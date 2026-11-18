import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatDateDisplay } from '../utils/glucoseHelpers';

export default function DeleteModal({ isOpen, onClose, onConfirm, reading, deleting }) {
  if (!isOpen || !reading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1940]/50 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-4xl shadow-soft-lg max-w-sm w-full p-6 border border-[#ECECFA] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-extrabold text-[#1A1940]">Delete Glucose Reading?</h3>
          <p className="text-xs text-[#8E8EA9] mt-1">
            This action cannot be undone. Are you sure you want to remove this reading?
          </p>

          <div className="my-4 p-3.5 bg-[#F8F9FE] rounded-2xl border border-[#ECECFA] text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8E8EA9] font-medium">Date:</span>
              <span className="font-bold text-[#1A1940]">{formatDateDisplay(reading.reading_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8EA9] font-medium">Slot:</span>
              <span className="font-bold text-[#1A1940]">{reading.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8EA9] font-medium">Value:</span>
              <span className="font-extrabold text-rose-600">{reading.value} mg/dl</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-1/2 py-3 px-4 border border-[#ECECFA] bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-bold text-[#646383] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="w-1/2 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-soft transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
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
