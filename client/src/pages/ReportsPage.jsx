import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  CalendarDays,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { getTodayString, formatDateDisplay, getGlucoseCategory } from '../utils/glucoseHelpers';
import api from '../services/api';
import ReportCard from '../components/ReportCard';
import GlucoseTrendChart from '../components/GlucoseTrendChart';

export default function ReportsPage() {
  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (date) => {
    try {
      setLoading(true);
      const [reportsRes, chartRes] = await Promise.all([
        api.get(`/reports?date=${date}`),
        api.get(`/readings?limit=100&startDate=${date.slice(0, 7)}-01&endDate=${date}`),
      ]);

      setReportData(reportsRes.data);
      setChartData(chartRes.data.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  const handleResetToToday = () => {
    setSelectedDate(todayStr);
  };

  const dailyReadings = reportData?.daily?.readings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard glycemic analytics: Daily, Month-to-date, and Previous full month
          </p>
        </div>

        {/* Date Selector Control */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
          <div className="flex items-center space-x-2 px-2 text-xs font-semibold text-slate-500">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Report Date:</span>
          </div>
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {selectedDate !== todayStr && (
            <button
              onClick={handleResetToToday}
              className="p-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Reset to today"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Calculating clinical metrics...</p>
        </div>
      ) : (
        <>
          {/* 3 Core Analytical Report Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Daily Report */}
            <ReportCard
              title="Daily Report"
              subtitle="Measurements on selected date"
              dateRange={formatDateDisplay(reportData?.daily?.date)}
              stats={reportData?.daily}
              icon={Clock}
              extraContent={
                dailyReadings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Slots Breakdown
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {dailyReadings.map((r) => {
                        const cat = getGlucoseCategory(r.value);
                        return (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-700">{r.slot}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{r.value} mg/dl</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badgeColor}`}
                              >
                                {cat.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              }
            />

            {/* 2. Month-to-date Report */}
            <ReportCard
              title="Month-to-Date"
              subtitle="1st of the month to selected date"
              dateRange={reportData?.monthToDate?.label}
              stats={reportData?.monthToDate}
              icon={CalendarDays}
            />

            {/* 3. Monthly (Previous Month) Report */}
            <ReportCard
              title="Monthly (Previous Month)"
              subtitle={reportData?.monthly?.monthLabel}
              dateRange={reportData?.monthly?.rangeLabel}
              stats={reportData?.monthly}
              icon={BarChart3}
            />
          </div>

          {/* Visual Trend Chart */}
          <div className="mt-8">
            <GlucoseTrendChart
              data={chartData}
              title={`Month-to-Date Trend (${reportData?.monthToDate?.label})`}
            />
          </div>
        </>
      )}
    </div>
  );
}
