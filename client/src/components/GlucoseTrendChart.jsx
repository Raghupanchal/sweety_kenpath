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
      <div className="bg-white rounded-3xl p-6 border border-[#ECECFA] shadow-soft text-center">
        <p className="text-sm font-bold text-[#1A1940]">No chart data available</p>
        <p className="text-xs text-[#8E8EA9] mt-1">Log readings to see visual glycemic curves.</p>
      </div>
    );
  }

  // Format chart data chronologically
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
        <div className="bg-white p-3.5 rounded-2xl shadow-soft-lg border border-[#ECECFA] text-xs space-y-1">
          <p className="font-extrabold text-[#1A1940]">{p.fullDate}</p>
          <p className="text-[#8E8EA9] text-[11px] font-medium">{p.slot}</p>
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="text-base font-extrabold text-[#1A1940]">{p.value}</span>
            <span className="text-[#8E8EA9] font-medium">mg/dl</span>
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
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#ECECFA] shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-[#1A1940]">{title}</h3>
          <p className="text-xs text-[#8E8EA9]">Clinical target zone (70–140 mg/dl)</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-bold text-[#8E8EA9]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
            <span>Glucose Curve</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-400"></span>
            <span>Thresholds</span>
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3FA" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8E8EA9' }} tickLine={false} axisLine={{ stroke: '#ECECFA' }} />
            <YAxis domain={[40, 'auto']} tick={{ fontSize: 11, fill: '#8E8EA9' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target band reference lines */}
            <ReferenceLine y={140} stroke="#F87171" strokeDasharray="4 4" label={{ value: '140 Max', fill: '#F87171', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={70} stroke="#FBBF24" strokeDasharray="4 4" label={{ value: '70 Min', fill: '#FBBF24', fontSize: 10, position: 'right' }} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#6C5DD3"
              strokeWidth={3}
              dot={{ r: 4, fill: '#6C5DD3', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 7, fill: '#5849BD', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
