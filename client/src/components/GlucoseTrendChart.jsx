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
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF4] shadow-soft text-center">
        <p className="text-sm font-bold text-[#05193C]">No chart data available</p>
        <p className="text-xs text-[#05193C]/60 mt-1">Log readings to see visual glycemic curves.</p>
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
        <div className="bg-white p-3.5 rounded-2xl shadow-soft-lg border border-[#E8ECF4] text-xs space-y-1">
          <p className="font-extrabold text-[#05193C]">{p.fullDate}</p>
          <p className="text-[#05193C]/60 text-[11px] font-medium">{p.slot}</p>
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="text-base font-extrabold text-[#05193C]">{p.value}</span>
            <span className="text-[#05193C]/60 font-medium">mg/dl</span>
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
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8ECF4] shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-[#05193C]">{title}</h3>
          <p className="text-xs text-[#05193C]/60">Clinical target zone (70–140 mg/dl)</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-bold text-[#05193C]/60">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FA0C57]"></span>
            <span>Glucose Curve</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#FA0C57]/60"></span>
            <span>Thresholds</span>
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3FA" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#05193C', opacity: 0.6 }} tickLine={false} axisLine={{ stroke: '#E8ECF4' }} />
            <YAxis domain={[40, 'auto']} tick={{ fontSize: 11, fill: '#05193C', opacity: 0.6 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target band reference lines */}
            <ReferenceLine y={140} stroke="#FA0C57" strokeDasharray="4 4" label={{ value: '140 Max', fill: '#FA0C57', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={70} stroke="#FFB800" strokeDasharray="4 4" label={{ value: '70 Min', fill: '#FFB800', fontSize: 10, position: 'right' }} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#FA0C57"
              strokeWidth={3}
              dot={{ r: 4, fill: '#FA0C57', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 7, fill: '#05193C', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
