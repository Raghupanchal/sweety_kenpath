const { Pool, types } = require('pg');
const { newDb } = require('pg-mem');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Ensure DATE types (OID 1082) are returned as 'YYYY-MM-DD' strings, preventing timezone drift
types.setTypeParser(1082, (val) => val);

let activeMode = 'pg'; // 'pg' or 'embedded'
let memDb = null;
let memPool = null;
let pgPool = null;

const storeFilePath = path.join(__dirname, '../../data/sweety_store.json');

// Ensure data folder exists
const dataDir = path.dirname(storeFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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

/**
 * Saves current memory DB state to disk
 */
async function persistStore() {
  if (activeMode !== 'embedded' || !memPool) return;
  try {
    const usersRes = await memPool.query('SELECT * FROM users');
    const readingsRes = await memPool.query('SELECT * FROM readings');
    const store = {
      users: usersRes.rows,
      readings: readingsRes.rows,
      lastSaved: new Date().toISOString(),
    };
    fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('⚠️ Could not persist store to disk:', err.message);
  }
}

/**
 * Loads data from disk into embedded memory DB
 */
async function loadStore() {
  if (!fs.existsSync(storeFilePath)) return false;
  try {
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    const store = JSON.parse(raw);
    if (!store.users || store.users.length === 0) return false;

    console.log(`📦 Restoring ${store.users.length} users and ${store.readings.length} readings from persistent store...`);

    for (const u of store.users) {
      await memPool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, u.password_hash, u.created_at, u.updated_at]
      );
    }

    for (const r of store.readings) {
      // Format date if needed
      const rDate = typeof r.reading_date === 'string' ? r.reading_date.slice(0, 10) : r.reading_date;
      await memPool.query(
        `INSERT INTO readings (id, user_id, reading_date, slot, value, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.user_id, rDate, r.slot, r.value, r.created_at, r.updated_at]
      );
    }

    console.log('✅ Persistent store restored successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️ Could not load existing store:', err.message);
    return false;
  }
}

/**
 * Seeds demo patient data if the database is newly initialized
 */
async function seedDemoData() {
  console.log('🌱 Populating demo patient account (demo@sweety.app) with clinical readings...');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Password123!', salt);

  const userInsert = await memPool.query(
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

  // Today's readings (3 readings: fasting, breakfast, lunch - leaving 1 free for live demo)
  const todayStr = formatDate(now);
  await memPool.query(
    `INSERT INTO readings (user_id, reading_date, slot, value) VALUES
     ($1, $2, 'Morning (fasting)', 92),
     ($1, $2, 'After breakfast', 138),
     ($1, $2, 'After lunch', 145)`,
    [userId, todayStr]
  );

  // Past 60 days
  for (let i = 1; i <= 60; i++) {
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

      await memPool.query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
        [userId, pastStr, slot, val]
      );
    }
  }

  await persistStore();
  console.log('✅ Demo patient seeded successfully!');
  console.log('   Email:    demo@sweety.app');
  console.log('   Password: Password123!');
}

async function initDb() {
  // 1. Try external PostgreSQL first
  try {
    const res = await pgPool.query('SELECT NOW()');
    console.log(`✅ Connected to external PostgreSQL database at ${res.rows[0].now}`);
    activeMode = 'pg';
    return { mode: 'pg' };
  } catch (err) {
    console.log(`\nℹ️ Notice: External PostgreSQL connection was not established (${err.message}).`);
    console.log('🚀 Activating embedded PostgreSQL engine (zero-configuration, pure JS, no password required)...');

    activeMode = 'embedded';
    memDb = newDb();
    memDb.public.registerFunction({
      name: 'gen_random_uuid',
      impure: true,
      implementation: () => require('crypto').randomUUID(),
    });

    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    memDb.public.none(schemaSql);

    const adapter = memDb.adapters.createPg();
    memPool = new adapter.Pool();

    console.log('✅ Embedded PostgreSQL database initialized successfully.');

    // Restore from disk or seed
    const restored = await loadStore();
    if (!restored) {
      await seedDemoData();
    }

    return { mode: 'embedded' };
  }
}

async function query(text, params = []) {
  if (activeMode === 'embedded' && memPool) {
    const res = await memPool.query(text, params);
    
    // Auto persist mutations (INSERT, UPDATE, DELETE)
    const upper = text.trim().toUpperCase();
    if (upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
      persistStore().catch(() => {});
    }

    return res;
  }

  return pgPool.query(text, params);
}

module.exports = {
  query,
  pool: pgPool,
  initDb,
  persistStore,
};
