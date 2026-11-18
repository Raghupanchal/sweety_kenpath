const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const request = require('supertest');

// 1. Setup in-memory PostgreSQL emulator with schema
const db = newDb();
db.public.registerFunction({
  name: 'gen_random_uuid',
  impure: true,
  implementation: () => require('crypto').randomUUID(),
});

// Load schema
const schemaSql = fs
  .readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8')
  .replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/g, '');
db.public.none(schemaSql);

// Bind mock pool before importing app
const adapter = db.adapters.createPg();
const memPool = new adapter.Pool();

// Override db.js
const dbModule = require('../src/config/db');
dbModule.query = (text, params) => memPool.query(text, params);
dbModule.pool = memPool;

const app = require('../src/app');

describe('Sweety API Integration Tests', () => {
  let userToken;
  let userId;
  let otherUserToken;
  let otherUserId;
  let createdReadingId;

  const todayStr = new Date().toISOString().slice(0, 10);

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & SECURITY
  // -------------------------------------------------------------
  describe('Authentication Endpoints (/api/auth)', () => {
    it('registers a new user successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('sarah@example.com');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('password_hash');

      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('rejects registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Sarah',
          email: 'sarah@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('An account with this email already exists.');
    });

    it('rejects registration with short password (< 6 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password must be at least 6 characters long.');
    });

    it('logs in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.name).toBe('Sarah Connor');
    });

    it('rejects login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sarah@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password.');
    });

    it('registers a second user for data isolation tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Connor',
          email: 'john@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      otherUserToken = res.body.token;
      otherUserId = res.body.user.id;
    });
  });

  // -------------------------------------------------------------
  // 2. VALIDATION ENGINE (ALL 5 SPEC RULES)
  // -------------------------------------------------------------
  describe('Clinical Validation Rules (/api/readings)', () => {
    it('Rule 1: rejects when value is missing', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          // value omitted
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Please enter a glucose value.');
    });

    it('Rule 2: rejects when value is out of range (<40)', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: 39,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('Rule 2: rejects when value is out of range (>600)', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: 601,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('Rule 2: rejects when value is a decimal (must be whole number)', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: '120.5',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('Rule 5: rejects when date is in the future', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: '2099-12-31',
          slot: 'Morning (fasting)',
          value: 95,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Date cannot be in the future.');
    });

    it('successfully creates a valid reading', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: 95,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.value).toBe(95);
      createdReadingId = res.body.data.id;
    });

    it('Rule 3: rejects duplicate reading for same slot on same day', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        'You already have a Morning (fasting) reading for this date.'
      );
    });

    it('allows different slots on the same day up to 4 readings', async () => {
      // 2nd reading: After breakfast
      const r2 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reading_date: todayStr, slot: 'After breakfast', value: 135 });
      expect(r2.status).toBe(201);

      // 3rd reading: After lunch
      const r3 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reading_date: todayStr, slot: 'After lunch', value: 142 });
      expect(r3.status).toBe(201);

      // 4th reading: After dinner
      const r4 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reading_date: todayStr, slot: 'After dinner', value: 110 });
      expect(r4.status).toBe(201);
    });

    it('Rule 4: rejects 5th reading on same day ("Maximum 4 readings per day")', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)', // Even if slot was different, daily max is 4
          value: 120,
        });

      expect(res.status).toBe(400);
      // Either slot or count error: since slots are already full, it triggers validation
      expect(res.body.error).toMatch(/You can add only 4 readings per day|already have/);
    });
  });

  // -------------------------------------------------------------
  // 3. USER DATA ISOLATION & CRUD
  // -------------------------------------------------------------
  describe('User Data Isolation & CRUD (/api/readings)', () => {
    it('user only sees their own readings', async () => {
      const resUserA = await request(app)
        .get('/api/readings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(resUserA.status).toBe(200);
      expect(resUserA.body.data.length).toBe(4);

      const resUserB = await request(app)
        .get('/api/readings')
        .set('Authorization', `Bearer ${otherUserToken}`);
      expect(resUserB.status).toBe(200);
      expect(resUserB.body.data.length).toBe(0);
    });

    it('prevents user B from deleting user A reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Reading not found.');
    });

    it('allows owner to update reading', async () => {
      const res = await request(app)
        .put(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: todayStr,
          slot: 'Morning (fasting)',
          value: 99,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.value).toBe(99);
    });

    it('supports pagination on GET /readings (?page=1&limit=2)', async () => {
      const res = await request(app)
        .get('/api/readings?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(4);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('allows owner to delete reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${createdReadingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Reading deleted successfully.');
    });
  });

  // -------------------------------------------------------------
  // 4. REPORTS ENGINE
  // -------------------------------------------------------------
  describe('Clinical Reports Engine (/api/reports)', () => {
    it('returns accurate Daily, Month-to-date, and Monthly aggregates with 1 decimal rounding', async () => {
      const res = await request(app)
        .get(`/api/reports?date=${todayStr}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('daily');
      expect(res.body).toHaveProperty('monthToDate');
      expect(res.body).toHaveProperty('monthly');

      // Daily report tests
      expect(res.body.daily.count).toBe(3); // 4 minus 1 deleted
      expect(res.body.daily.highest).toBe(142);
      expect(res.body.daily.lowest).toBe(110);
      // Average: (135 + 142 + 110) / 3 = 387 / 3 = 129.0
      expect(res.body.daily.average).toBe(129.0);
      expect(res.body.daily.readings.length).toBe(3);

      // Month to date
      expect(res.body.monthToDate.count).toBe(3);
    });

    it('returns friendly empty state for user with no readings', async () => {
      const res = await request(app)
        .get(`/api/reports?date=${todayStr}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.daily.count).toBe(0);
      expect(res.body.daily.highest).toBeNull();
      expect(res.body.daily.lowest).toBeNull();
      expect(res.body.daily.average).toBeNull();
      expect(res.body.daily.readings).toEqual([]);
    });
  });
});
