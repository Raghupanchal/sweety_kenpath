const { query } = require('../config/db');
const { getTodayDateString } = require('../middleware/validateReading');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculates start and end dates for Daily, Month-to-date, and Previous Month
 */
function calculateReportDateRanges(dateStr) {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  const day = parseInt(dayStr, 10);

  // Daily
  const dailyDate = dateStr;

  // Month-to-date (1st of selected month to selected date)
  const mtdStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const mtdEndDate = dateStr;

  // Monthly: Whole previous calendar month
  let prevMonthYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevMonthYear = year - 1;
  }
  const prevMonthDays = new Date(prevMonthYear, prevMonth, 0).getDate();
  const prevMonthStart = `${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevMonthEnd = `${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-${String(prevMonthDays).padStart(2, '0')}`;
  const prevMonthLabel = `${MONTH_NAMES[prevMonth - 1]} ${prevMonthYear}`;

  return {
    dailyDate,
    mtd: {
      startDate: mtdStartDate,
      endDate: mtdEndDate,
      label: `1 ${MONTH_NAMES[month - 1].slice(0, 3)} – ${day} ${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`,
    },
    previousMonth: {
      startDate: prevMonthStart,
      endDate: prevMonthEnd,
      label: prevMonthLabel,
      rangeLabel: `1 ${MONTH_NAMES[prevMonth - 1].slice(0, 3)} – ${prevMonthDays} ${MONTH_NAMES[prevMonth - 1].slice(0, 3)} ${prevMonthYear}`,
    },
  };
}

/**
 * Helper to aggregate stats for a date range
 */
async function getAggregateStats(userId, startDate, endDate) {
  const result = await query(
    `SELECT 
       COUNT(*)::int AS count,
       MAX(value) AS highest,
       MIN(value) AS lowest,
       ROUND(AVG(value)::numeric, 1) AS average
     FROM readings
     WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3`,
    [userId, startDate, endDate]
  );

  const row = result.rows[0];
  const count = parseInt(row.count, 10) || 0;

  if (count === 0) {
    return {
      count: 0,
      highest: null,
      lowest: null,
      average: null,
      hasReadings: false,
    };
  }

  return {
    count,
    highest: parseInt(row.highest, 10),
    lowest: parseInt(row.lowest, 10),
    average: parseFloat(row.average),
    hasReadings: true,
  };
}

/**
 * GET /api/reports?date=YYYY-MM-DD
 */
async function getReports(req, res, next) {
  try {
    const userId = req.user.id;
    let selectedDate = req.query.date || getTodayDateString();

    // Validate format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selectedDate) || isNaN(Date.parse(selectedDate))) {
      selectedDate = getTodayDateString();
    }

    const ranges = calculateReportDateRanges(selectedDate);

    // 1. Daily Report & readings
    const [dailyStats, dailyReadingsResult, mtdStats, prevMonthStats] = await Promise.all([
      getAggregateStats(userId, ranges.dailyDate, ranges.dailyDate),
      query(
        `SELECT id, reading_date, slot, value, created_at, updated_at
         FROM readings
         WHERE user_id = $1 AND reading_date = $2
         ORDER BY 
           CASE slot
             WHEN 'Morning (fasting)' THEN 1
             WHEN 'After breakfast' THEN 2
             WHEN 'After lunch' THEN 3
             WHEN 'After dinner' THEN 4
             ELSE 5
           END ASC`,
        [userId, ranges.dailyDate]
      ),
      getAggregateStats(userId, ranges.mtd.startDate, ranges.mtd.endDate),
      getAggregateStats(userId, ranges.previousMonth.startDate, ranges.previousMonth.endDate),
    ]);

    return res.status(200).json({
      selectedDate,
      daily: {
        date: ranges.dailyDate,
        ...dailyStats,
        readings: dailyReadingsResult.rows,
      },
      monthToDate: {
        startDate: ranges.mtd.startDate,
        endDate: ranges.mtd.endDate,
        label: ranges.mtd.label,
        ...mtdStats,
      },
      monthly: {
        startDate: ranges.previousMonth.startDate,
        endDate: ranges.previousMonth.endDate,
        monthLabel: ranges.previousMonth.label,
        rangeLabel: ranges.previousMonth.rangeLabel,
        ...prevMonthStats,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
  calculateReportDateRanges,
  getAggregateStats,
};
