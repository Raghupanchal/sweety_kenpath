import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { getGlucoseCategory } from '../utils/glucoseHelpers';

export default function GlucoseTrendChart({ data, title = 'Blood Glucose Trend' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-700">No chart data available</p>
        <p className="text-xs text-slate-400 mt-1">Log readings to see visual glucose curves.</p>
      </div>
    );
  }

  // Format chart data (reverse or sort chronologically)
  const chartPoints = [...data]
    .sort((a, b) => new Date(a.reading_date) - new Date(b.reading_date))
    .map((item) => ({
      date: item.reading_date ? item.reading_date.slice(5) : '', // MM-DD
      fullDate: item.reading_date,
      value: item.value,
      slot: item.slot,
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      const cat = getGlucoseCategory(p.value);
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1">
          <p className="font-bold text-slate-800">{p.fullDate}</p>
          <p className="text-slate-500">{p.slot}</p>
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="text-base font-extrabold text-slate-900">{p.value}</span>
            <span className="text-slate-400 font-medium">mg/dl</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badgeColor}`}>
              {cat.label}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Readings with clinical target range (70–140 mg/dl)</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Target</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-rose-400"></span>
            <span>Thresholds</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
            <YAxis domain={[40, 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target band reference lines */}
            <ReferenceLine y={140} stroke="#f87171" strokeDasharray="4 4" label={{ value: '140 Max Target', fill: '#f87171', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={70} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: '70 Min Target', fill: '#fbbf24', fontSize: 10, position: 'right' }} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#047857' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
