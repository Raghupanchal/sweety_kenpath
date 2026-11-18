const { query } = require('../config/db');

const ALLOWED_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

/**
 * Helper to get today's date in YYYY-MM-DD format based on local/client or system time.
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Middleware to validate reading input for CREATE and UPDATE operations.
 */
async function validateReading(req, res, next) {
  try {
    const { date, reading_date, slot, value } = req.body;
    const targetDate = reading_date || date;
    const rawId = req.params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (rawId && !uuidRegex.test(rawId)) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    const readingId = rawId || null;
    const userId = req.user.id;

    // 1. Date presence and future check
    if (!targetDate) {
      return res.status(400).json({ error: 'Please select a date.' });
    }

    // Format regex check: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate) || isNaN(Date.parse(targetDate))) {
      return res.status(400).json({ error: 'Please provide a valid date in YYYY-MM-DD format.' });
    }

    const todayStr = getTodayDateString();
    if (targetDate > todayStr) {
      return res.status(400).json({ error: 'Date cannot be in the future.' });
    }

    // 2. Slot validation
    if (!slot) {
      return res.status(400).json({ error: 'Please select a time slot.' });
    }
    if (!ALLOWED_SLOTS.includes(slot)) {
      return res.status(400).json({
        error: `Invalid time slot. Must be one of: ${ALLOWED_SLOTS.join(', ')}.`,
      });
    }

    // 3. Glucose Value validation
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ error: 'Please enter a glucose value.' });
    }

    // Value must be a whole number between 40 and 600
    const numValue = Number(value);
    const isWholeNumber =
      !isNaN(numValue) &&
      Number.isInteger(numValue) &&
      String(value).trim() === String(numValue);

    if (!isWholeNumber || numValue < 40 || numValue > 600) {
      return res.status(400).json({
        error: 'Value must be between 40 and 600 mg/dl.',
      });
    }

    // Attach normalized values to req for controller use
    req.normalizedReading = {
      reading_date: targetDate,
      slot: slot.trim(),
      value: numValue,
    };

    // 4. Database checks: duplicate slot on the same day for this user
    let duplicateQuery = `
      SELECT id FROM readings 
      WHERE user_id = $1 AND reading_date = $2 AND slot = $3
    `;
    const duplicateParams = [userId, targetDate, slot.trim()];

    if (readingId) {
      duplicateQuery += ` AND id != $4`;
      duplicateParams.push(readingId);
    }

    const duplicateCheck = await query(duplicateQuery, duplicateParams);
    if (duplicateCheck.rowCount > 0) {
      const article = /^[aeiou]/i.test(slot.trim()) ? 'an' : 'a';
      return res.status(400).json({
        error: `You already have ${article} ${slot.trim()} reading for this date.`,
      });
    }

    // 5. Database check: Maximum 4 readings per day (for new readings or if changing date)
    let countQuery = `
      SELECT COUNT(*) AS total FROM readings 
      WHERE user_id = $1 AND reading_date = $2
    `;
    const countParams = [userId, targetDate];

    if (readingId) {
      countQuery += ` AND id != $3`;
      countParams.push(readingId);
    }

    const countCheck = await query(countQuery, countParams);
    const currentCount = parseInt(countCheck.rows[0].total, 10);

    if (currentCount >= 4) {
      return res.status(400).json({
        error: 'You can add only 4 readings per day.',
      });
    }

    next();
  } catch (err) {
    console.error('Validation middleware error:', err);
    return res.status(500).json({ error: 'Server error validating reading data.' });
  }
}

module.exports = {
  validateReading,
  ALLOWED_SLOTS,
  getTodayDateString,
};
