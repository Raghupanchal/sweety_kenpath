const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME || 'sweety_db';
  let clientConfig;

  if (process.env.DATABASE_URL) {
    try {
      const parsedUrl = new URL(process.env.DATABASE_URL);
      parsedUrl.pathname = '/postgres'; // Connect to default administrative database
      clientConfig = { connectionString: parsedUrl.toString() };
    } catch {
      clientConfig = { connectionString: process.env.DATABASE_URL };
    }
  } else {
    clientConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: 'postgres', // Connect to default postgres DB to create target database
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };
  }

  const client = new Client(clientConfig);

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`⏳ Database "${dbName}" does not exist. Creating now...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`⚠️ Warning: Could not automatically create "${dbName}" via default admin connection:`);
    console.warn(`   Reason: ${err.message}`);
    console.warn(`\n👉 If password authentication failed, please update DB_PASSWORD in server/.env with your local PostgreSQL password.`);
    console.warn(`👉 Or create the database manually using: psql -U postgres -c "CREATE DATABASE ${dbName};"\n`);
  } finally {
    await client.end().catch(() => {});
  }
}

async function runMigrations() {
  await createDatabaseIfNotExists();

  const { pool } = require('../config/db');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('🔄 Running database schema migrations...');
    await pool.query(schemaSql);
    console.log('✅ Schema migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.message.includes(`database "${process.env.DB_NAME || 'sweety_db'}" does not exist`)) {
      console.error(`\nPlease create the database first by running:`);
      console.error(`  psql -U postgres -c "CREATE DATABASE sweety_db;"`);
      console.error(`Or create it in pgAdmin named "sweety_db", then re-run: npm run migrate`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
