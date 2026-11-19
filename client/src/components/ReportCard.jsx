import React from 'react';
import { ArrowUpRight, ArrowDownRight, Hash, Droplets } from 'lucide-react';
import { getGlucoseCategory } from '../utils/glucoseHelpers';

export default function ReportCard({ title, subtitle, dateRange, stats, icon: Icon, extraContent = null }) {
  const hasData = stats && stats.count > 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EDE9FE] shadow-soft flex flex-col justify-between transition-all hover:border-[#6C5DD3]/40">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-11 h-11 rounded-2xl bg-[#F0EEFD] text-[#6C5DD3] flex items-center justify-center border border-[#DDD8FB]">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold text-[#05193C]">{title}</h3>
              {subtitle && <p className="text-xs text-[#05193C]/60 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {dateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#F0EEFD] text-[#6C5DD3] border border-[#DDD8FB]">
              {dateRange}
            </span>
          )}
        </div>

        {/* Content State */}
        {hasData ? (
          <div className="mt-6 space-y-4">
            {/* Average Main Metric */}
            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-[#EDE9FE] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">
                  Average Glucose
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#05193C] tracking-tight">
                    {stats.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-[#05193C]/50">mg/dl</span>
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
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#05193C]">
                  {stats.highest} <span className="text-[10px] font-normal text-[#05193C]/50">mg/dl</span>
                </p>
              </div>

              {/* Lowest */}
              <div className="p-3 rounded-2xl bg-[#EDFCF2] border border-[#A7F3D0]/50">
                <div className="flex items-center space-x-1 text-[#059669] text-[11px] font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Lowest</span>
                </div>
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#05193C]">
                  {stats.lowest} <span className="text-[10px] font-normal text-[#05193C]/50">mg/dl</span>
                </p>
              </div>

              {/* Count */}
              <div className="p-3 rounded-2xl bg-[#F0EEFD] border border-[#DDD8FB]">
                <div className="flex items-center space-x-1 text-[#6C5DD3] text-[11px] font-bold">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Readings</span>
                </div>
                <p className="mt-1 text-base sm:text-lg font-extrabold text-[#05193C]">
                  {stats.count}
                </p>
              </div>
            </div>

            {extraContent && <div className="mt-4 pt-3 border-t border-[#EDE9FE]">{extraContent}</div>}
          </div>
        ) : (
          <div className="my-8 py-7 px-4 bg-[#F8F7FF] rounded-2xl border border-dashed border-[#DDD8FB] text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#F0EEFD] text-[#6C5DD3] flex items-center justify-center mx-auto mb-2.5 shadow-sm border border-[#DDD8FB]">
              <Droplets className="w-5 h-5 fill-[#6C5DD3]/20" />
            </div>
            <p className="text-xs font-bold text-[#05193C]">No readings recorded</p>
            <p className="text-[11px] text-[#05193C]/50 mt-1 max-w-[210px] mx-auto">
              There are no blood glucose entries logged for this period yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
