import React from 'react';
import { ArrowUpRight, ArrowDownRight, Hash, Droplets } from 'lucide-react';
import { getGlucoseCategory } from '../utils/glucoseHelpers';

export default function ReportCard({ title, subtitle, dateRange, stats, icon: Icon, extraContent = null }) {
  const hasData = stats && stats.count > 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#ECECFA] shadow-soft flex flex-col justify-between transition-all hover:border-brand-200">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-[#1A1940]">{title}</h3>
              {subtitle && <p className="text-xs text-[#8E8EA9] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {dateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#F5F5FE] text-brand-700 border border-brand-100">
              {dateRange}
            </span>
          )}
        </div>

        {/* Content State */}
        {hasData ? (
          <div className="mt-6 space-y-4">
            {/* Average Main Metric */}
            <div className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#ECECFA] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8EA9]">
                  Average Glucose
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1940] tracking-tight">
                    {stats.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-[#8E8EA9]">mg/dl</span>
                </div>
              </div>

              {stats.average && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    getGlucoseCategory(stats.average).badgeColor
                  }`}
                >
                  {getGlucoseCategory(stats.average).label}
                </span>
              )}
            </div>

            {/* Sub-metrics: Highest, Lowest, Count */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* Highest */}
              <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3]/50">
                <div className="flex items-center space-x-1 text-[#E11D48] text-[11px] font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Highest</span>
                </div>
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#1A1940]">
                  {stats.highest} <span className="text-[10px] font-normal text-[#8E8EA9]">mg/dl</span>
                </p>
              </div>

              {/* Lowest */}
              <div className="p-3 rounded-2xl bg-[#EDFCF2] border border-[#A7F3D0]/50">
                <div className="flex items-center space-x-1 text-[#059669] text-[11px] font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Lowest</span>
                </div>
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#1A1940]">
                  {stats.lowest} <span className="text-[10px] font-normal text-[#8E8EA9]">mg/dl</span>
                </p>
              </div>

              {/* Count */}
              <div className="p-3 rounded-2xl bg-[#F5F5FE] border border-brand-100">
                <div className="flex items-center space-x-1 text-brand-600 text-[11px] font-bold">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Readings</span>
                </div>
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#1A1940]">
                  {stats.count}
                </p>
              </div>
            </div>

            {extraContent && <div className="mt-4 pt-3 border-t border-slate-100">{extraContent}</div>}
          </div>
        ) : (
          <div className="my-8 py-7 px-4 bg-[#F8F9FE] rounded-2xl border border-dashed border-[#D7D6FD] text-center">
            <div className="w-10 h-10 rounded-2xl bg-white text-brand-400 flex items-center justify-center mx-auto mb-2.5 shadow-sm border border-[#ECECFA]">
              <Droplets className="w-5 h-5 fill-brand-200" />
            </div>
            <p className="text-xs font-bold text-[#1A1940]">No readings recorded</p>
            <p className="text-[11px] text-[#8E8EA9] mt-1 max-w-[210px] mx-auto">
              There are no blood glucose entries logged for this period yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
