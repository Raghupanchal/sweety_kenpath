const { query } = require('../config/db');

/**
 * GET /api/readings
 * Supports pagination, date filtering, and user isolation
 */
async function getReadings(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const { date, startDate, endDate, slot } = req.query;

    const conditions = ['user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (date) {
      conditions.push(`reading_date = $${paramIndex}`);
      values.push(date);
      paramIndex++;
    } else {
      if (startDate) {
        conditions.push(`reading_date >= $${paramIndex}`);
        values.push(startDate);
        paramIndex++;
      }
      if (endDate) {
        conditions.push(`reading_date <= $${paramIndex}`);
        values.push(endDate);
        paramIndex++;
      }
    }

    if (slot) {
      conditions.push(`slot = $${paramIndex}`);
      values.push(slot);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Total count query
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM readings WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Data fetch query with slot sort ordering
    const dataValues = [...values, limit, offset];
    const dataResult = await query(
      `SELECT id, user_id, reading_date, slot, value, created_at, updated_at
       FROM readings
       WHERE ${whereClause}
       ORDER BY reading_date DESC,
         CASE slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
           ELSE 5
         END ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataValues
    );

    return res.status(200).json({
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/readings/:id
 */
async function getReadingById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT id, user_id, reading_date, slot, value, created_at, updated_at
       FROM readings
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/readings
 */
async function createReading(req, res, next) {
  try {
    const userId = req.user.id;
    const { reading_date, slot, value } = req.normalizedReading;

    const result = await query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, reading_date, slot, value, created_at, updated_at`,
      [userId, reading_date, slot, value]
    );

    return res.status(201).json({
      message: 'Reading added successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    // If DB check constraint caught anything
    if (err.code === '23505') {
      const article = /^[aeiou]/i.test(req.body.slot) ? 'an' : 'a';
      return res.status(400).json({
        error: `You already have ${article} ${req.body.slot} reading for this date.`,
      });
    }
    if (err.code === '23514') {
      return res.status(400).json({
        error: 'Value must be between 40 and 600 mg/dl.',
      });
    }
    next(err);
  }
}

/**
 * PUT /api/readings/:id
 */
async function updateReading(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reading_date, slot, value } = req.normalizedReading;

    // Check ownership first
    const checkOwner = await query(
      'SELECT id FROM readings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkOwner.rowCount === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    const result = await query(
      `UPDATE readings
       SET reading_date = $1, slot = $2, value = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, reading_date, slot, value, created_at, updated_at`,
      [reading_date, slot, value, id, userId]
    );

    return res.status(200).json({
      message: 'Reading updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      const article = /^[aeiou]/i.test(req.body.slot) ? 'an' : 'a';
      return res.status(400).json({
        error: `You already have ${article} ${req.body.slot} reading for this date.`,
      });
    }
    if (err.code === '23514') {
      return res.status(400).json({
        error: 'Value must be between 40 and 600 mg/dl.',
      });
    }
    next(err);
  }
}

/**
 * DELETE /api/readings/:id
 */
async function deleteReading(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    return res.status(200).json({
      message: 'Reading deleted successfully.',
      id: result.rows[0].id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReadings,
  getReadingById,
  createReading,
  updateReading,
  deleteReading,
};
