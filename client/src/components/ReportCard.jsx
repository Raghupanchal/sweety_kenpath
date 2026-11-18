import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Hash, AlertCircle } from 'lucide-react';
import { getGlucoseCategory } from '../utils/glucoseHelpers';

export default function ReportCard({ title, subtitle, dateRange, stats, icon: Icon, extraContent = null }) {
  const hasData = stats && stats.count > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {dateRange && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {dateRange}
            </span>
          )}
        </div>

        {/* Content State */}
        {hasData ? (
          <div className="mt-6 space-y-4">
            {/* Average Main Metric */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Average Glucose
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stats.average?.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">mg/dl</span>
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
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/70">
                <div className="flex items-center space-x-1 text-rose-600 text-xs font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Highest</span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-slate-900">
                  {stats.highest} <span className="text-[10px] font-normal text-slate-500">mg/dl</span>
                </p>
              </div>

              {/* Lowest */}
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100/70">
                <div className="flex items-center space-x-1 text-teal-600 text-xs font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Lowest</span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-slate-900">
                  {stats.lowest} <span className="text-[10px] font-normal text-slate-500">mg/dl</span>
                </p>
              </div>

              {/* Count */}
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70">
                <div className="flex items-center space-x-1 text-indigo-600 text-xs font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Readings</span>
                </div>
                <p className="mt-1.5 text-lg font-bold text-slate-900">
                  {stats.count}
                </p>
              </div>
            </div>

            {extraContent && <div className="mt-4 pt-3 border-t border-slate-100">{extraContent}</div>}
          </div>
        ) : (
          <div className="my-8 py-6 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No readings recorded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
              There are no blood glucose entries logged for this period yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
