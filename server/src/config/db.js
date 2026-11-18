const { Pool, types } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Ensure DATE types (OID 1082) are returned as 'YYYY-MM-DD' strings, preventing timezone drift
types.setTypeParser(1082, (val) => val);

let activeMode = 'pg'; // 'pg' or 'pglite'
let pgliteDb = null;
let pgPool = null;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'sweety_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

pgPool = new Pool(poolConfig);

// Helper to auto-seed demo data if empty
async function autoSeedIfEmpty(dbQuery) {
  try {
    const userRes = await dbQuery('SELECT COUNT(*) AS total FROM users');
    const userCount = parseInt(userRes.rows[0].total, 10);

    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding demo patient account (demo@sweety.app)...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Password123!', salt);

      const userInsert = await dbQuery(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Alex Johnson (Demo Patient)', 'demo@sweety.app', hash]
      );
      const userId = userInsert.rows[0].id;

      const slots = [
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner',
      ];

      const now = new Date();
      const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      // Today's readings (3 readings, leaving 1 slot for live demo)
      const todayStr = formatDate(now);
      await dbQuery(
        `INSERT INTO readings (user_id, reading_date, slot, value) VALUES
         ($1, $2, 'Morning (fasting)', 92),
         ($1, $2, 'After breakfast', 138),
         ($1, $2, 'After lunch', 145)`,
        [userId, todayStr]
      );

      // Past 45 days
      for (let i = 1; i <= 45; i++) {
        const past = new Date();
        past.setDate(now.getDate() - i);
        const pastStr = formatDate(past);
        const dailyCount = i % 3 === 0 ? 2 : (i % 2 === 0 ? 3 : 4);

        for (let s = 0; s < dailyCount; s++) {
          const slot = slots[s];
          let val = 85 + ((i * 7 + s * 13) % 45);
          if (slot.includes('breakfast')) val = 120 + ((i * 11) % 40);
          if (slot.includes('lunch')) val = 130 + ((i * 9) % 35);
          if (slot.includes('dinner')) val = 115 + ((i * 13) % 35);

          await dbQuery(
            `INSERT INTO readings (user_id, reading_date, slot, value)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
            [userId, pastStr, slot, val]
          );
        }
      }
      console.log('✅ Auto-seed complete! Demo user is ready: demo@sweety.app / Password123!');
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed note:', err.message);
  }
}

async function initDb() {
  // Test external PostgreSQL connection first
  try {
    const res = await pgPool.query('SELECT NOW()');
    console.log(`✅ Connected to external PostgreSQL database at ${res.rows[0].now}`);
    activeMode = 'pg';
    return { mode: 'pg' };
  } catch (err) {
    console.log(`\nℹ️ Notice: External PostgreSQL connection was not established (${err.message}).`);
    console.log('🚀 Activating embedded PostgreSQL engine (zero configuration, no password needed)...');

    activeMode = 'pglite';
    const dataDir = path.join(__dirname, '../../.pgdata_embedded');
    pgliteDb = new PGlite(dataDir);

    // Apply schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pgliteDb.exec(schemaSql);
    console.log('✅ Embedded PostgreSQL database initialized successfully.');

    // Auto seed demo user & readings so it works out of the box!
    await autoSeedIfEmpty(async (text, params) => {
      const res = await pgliteDb.query(text, params || []);
      return {
        rows: res.rows,
        rowCount: res.rowCount !== undefined ? res.rowCount : res.rows.length,
      };
    });

    return { mode: 'pglite' };
  }
}

async function query(text, params = []) {
  if (activeMode === 'pglite' && pgliteDb) {
    const res = await pgliteDb.query(text, params);
    // Normalize format
    const rowCount = res.rowCount !== undefined ? res.rowCount : (res.rows ? res.rows.length : 0);
    return {
      rows: res.rows || [],
      rowCount,
    };
  }

  // Otherwise standard pgPool
  const res = await pgPool.query(text, params);
  return res;
}

module.exports = {
  query,
  pool: pgPool,
  initDb,
};
