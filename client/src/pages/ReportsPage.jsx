import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  BarChart2,
  Clock,
  CalendarDays,
  RotateCcw,
  LayoutGrid,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6 md:space-y-8 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#05193C] tracking-tight">Clinical Reports</h1>
          <p className="text-xs text-[#05193C]/60 mt-0.5">
            Standard glycemic analytics: Daily, Month-to-date, and Previous full month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Secondary Button: View Dashboard (#05193C text #FFFFFF) */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-[#05193C] hover:bg-[#0A2656] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-soft transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>View Dashboard</span>
          </Link>

          {/* Date Selector Control */}
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-[#EDE9FE] shadow-soft">
            <div className="flex items-center space-x-1.5 px-2 text-xs font-bold text-[#05193C]/60">
              <Calendar className="w-4 h-4 text-[#6C5DD3]" />
              <span>Date:</span>
            </div>
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#F8F7FF] border border-[#EDE9FE] rounded-xl text-xs font-bold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={handleResetToToday}
                className="px-2.5 py-1 text-xs text-[#6C5DD3] bg-[#F0EEFD] hover:bg-[#E4E0FD] border border-[#DDD8FB] font-bold flex items-center space-x-1 rounded-xl transition-all"
                title="Reset to today"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#6C5DD3] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#05193C]/60 font-bold">Calculating clinical metrics...</p>
        </div>
      ) : (
        <>
          {/* 3 Core Analytical Report Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#05193C]/60">
                      Slots Breakdown
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {dailyReadings.map((r) => {
                        const cat = getGlucoseCategory(r.value);
                        return (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-2xl bg-[#F8F7FF] border border-[#EDE9FE] flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-[#05193C]">{r.slot}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-[#05193C]">{r.value} mg/dl</span>
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
              icon={BarChart2}
            />
          </div>

          {/* Visual Trend Chart */}
          <div className="mt-6">
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
