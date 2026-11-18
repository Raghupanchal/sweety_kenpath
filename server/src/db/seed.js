const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');
const { runMigrations } = require('./migrate');

const DEMO_USER = {
  name: 'Alex Johnson (Demo Patient)',
  email: 'demo@sweety.app',
  password: 'Password123!',
};

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function seed() {
  console.log('🌱 Starting Sweety database seed process...');

  try {
    // 1. Ensure migrations have run
    const schemaSql = require('fs').readFileSync(require('path').join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log(' Verified database schema.');

    // 2. Upsert demo user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_USER.password, salt);

    let userResult = await query('SELECT id FROM users WHERE email = $1', [DEMO_USER.email]);
    let userId;

    if (userResult.rowCount > 0) {
      userId = userResult.rows[0].id;
      // Update password hash to ensure it matches
      await query(
        'UPDATE users SET password_hash = $1, name = $2 WHERE id = $3',
        [passwordHash, DEMO_USER.name, userId]
      );
      console.log(` Found existing demo user (ID: ${userId}). Clearing old readings for clean seed...`);
      await query('DELETE FROM readings WHERE user_id = $1', [userId]);
    } else {
      userResult = await query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [DEMO_USER.name, DEMO_USER.email, passwordHash]
      );
      userId = userResult.rows[0].id;
      console.log(` Created new demo user (ID: ${userId}).`);
    }

    // 3. Generate sample readings for:
    //    - Today (3 readings: fasting, breakfast, lunch - leaving 1 slot free for live demo)
    //    - Past 45 days (covering current month-to-date and whole previous month)
    const slots = [
      'Morning (fasting)',
      'After breakfast',
      'After lunch',
      'After dinner',
    ];

    const today = new Date();
    const readingsToInsert = [];

    // Today's readings
    const todayStr = formatDate(today);
    readingsToInsert.push(
      { date: todayStr, slot: 'Morning (fasting)', value: 92 },
      { date: todayStr, slot: 'After breakfast', value: 138 },
      { date: todayStr, slot: 'After lunch', value: 145 }
      // 'After dinner' left empty so the user/reviewer can add a reading immediately
    );

    // Days going back 60 days
    for (let i = 1; i <= 60; i++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      const pastDateStr = formatDate(pastDate);

      // Add 2 to 4 readings per day
      const dailyCount = (i % 3 === 0) ? 2 : (i % 2 === 0 ? 3 : 4);

      for (let s = 0; s < dailyCount; s++) {
        const slot = slots[s];
        let val;

        // Realistic clinical physiological variations
        if (slot === 'Morning (fasting)') {
          // Fasting usually 75 - 115
          val = 80 + ((i * 7 + s * 13) % 36);
        } else if (slot === 'After breakfast') {
          // Post-breakfast 110 - 155
          val = 115 + ((i * 11 + s * 17) % 45);
        } else if (slot === 'After lunch') {
          // Post-lunch 120 - 165
          val = 120 + ((i * 13 + s * 19) % 46);
        } else {
          // Post-dinner 110 - 150
          val = 110 + ((i * 9 + s * 23) % 42);
        }

        readingsToInsert.push({ date: pastDateStr, slot, value: val });
      }
    }

    console.log(` Inserting ${readingsToInsert.length} clinical readings for demo user...`);

    for (const r of readingsToInsert) {
      await query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
        [userId, r.date, r.slot, r.value]
      );
    }

    console.log(' Database seed completed successfully!');
    console.log('───────────────────────────────────────────────────────');
    console.log(' DEMO USER CREDENTIALS:');
    console.log(`   Email:    ${DEMO_USER.email}`);
    console.log(`   Password: ${DEMO_USER.password}`);
    console.log(`   Readings: ${readingsToInsert.length} entries populated`);
    console.log('───────────────────────────────────────────────────────');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, DEMO_USER };
