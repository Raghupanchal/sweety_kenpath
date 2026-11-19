import React from 'react';
import { X, User, HeartPulse, Stethoscope, Phone, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PatientProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const patientName = user?.name || 'Alex Johnson';
  const patientEmail = user?.email || 'patient@sweety.app';

  return (
    <div className="fixed inset-0 z-50 bg-[#05193C]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-7 max-w-md w-full border border-[#EDE9FE] shadow-soft-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9FE]">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F0EEFD] text-[#6C5DD3] flex items-center justify-center border border-[#DDD8FB] font-extrabold text-base">
              {patientName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[#05193C]">{patientName}</h3>
                <span className="text-[10px] font-bold bg-[#F0EEFD] text-[#6C5DD3] px-2 py-0.5 rounded-full border border-[#DDD8FB]">
                  29 y/o
                </span>
              </div>
              <p className="text-xs text-[#05193C]/50 font-medium">MRN: #SW-94821 • Type 1 Diabetes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#05193C] hover:bg-[#F0EEFD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Profile Details */}
        <div className="py-4 space-y-3.5 text-xs">
          {/* Diagnosis & Glycemic Targets */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7FF] border border-[#EDE9FE] space-y-2">
            <div className="flex items-center space-x-2 text-[#6C5DD3] font-bold text-[11px] uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" />
              <span>Clinical Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[#05193C]/50 font-medium block">Condition:</span>
                <span className="font-bold text-[#05193C]">Type 1 Diabetes (Insulin)</span>
              </div>
              <div>
                <span className="text-[#05193C]/50 font-medium block">Target Range:</span>
                <span className="font-bold text-emerald-600">70 – 140 mg/dl</span>
              </div>
              <div>
                <span className="text-[#05193C]/50 font-medium block">Daily Slot Protocol:</span>
                <span className="font-bold text-[#05193C]">4 Checks / Day</span>
              </div>
              <div>
                <span className="text-[#05193C]/50 font-medium block">Last HbA1c:</span>
                <span className="font-bold text-[#05193C]">6.4% (In Control)</span>
              </div>
            </div>
          </div>

          {/* Care Team & Contacts */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7FF] border border-[#EDE9FE] space-y-2">
            <div className="flex items-center space-x-2 text-[#6C5DD3] font-bold text-[11px] uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" />
              <span>Attending Care Team</span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#05193C]/50 font-medium">Physician:</span>
                <span className="font-bold text-[#05193C]">Dr. Sarah Mitchell, MD (Endocrinology)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#05193C]/50 font-medium">Hospital / Clinic:</span>
                <span className="font-bold text-[#05193C]">Metropolitan Diabetes Institute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#05193C]/50 font-medium">Emergency Line:</span>
                <span className="font-bold text-[#6C5DD3]">+1 (555) 019-2834</span>
              </div>
            </div>
          </div>

          {/* Patient Contact Info */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7FF] border border-[#EDE9FE] space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#05193C]/50 font-medium">Account Email:</span>
              <span className="font-bold text-[#05193C]">{patientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#05193C]/50 font-medium">Next Clinical Review:</span>
              <span className="font-bold text-[#05193C]">Dec 15, 2026</span>
            </div>
          </div>
        </div>

        {/* Modal Action */}
        <div className="pt-2 border-t border-[#EDE9FE] flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[10px] font-semibold text-[#05193C]/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Patient Medical Record</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#F0EEFD] hover:bg-[#E4E0FD] border border-[#DDD8FB] text-[#6C5DD3] rounded-2xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
