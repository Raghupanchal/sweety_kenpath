# Sweety – Blood Glucose Tracker

A web application built with Node.js, Express, PostgreSQL, and React where a diabetes patient records up to 4 blood glucose readings a day and views daily, month-to-date, and previous month reports.

---

## Features

### 1. User Authentication & Isolation
- User registration and login with name, email, and password.
- Passwords hashed with `bcrypt` (10 rounds); never stored in plain text.
- Tenant data isolation: users can only view, edit, and delete their own readings (enforced via JWT and parameterized SQL queries with `WHERE user_id = $1`).

### 2. Blood Glucose Readings Management
- 4 physiological daily slots:
  1. `Morning (fasting)`
  2. `After breakfast`
  3. `After lunch`
  4. `After dinner`
- Capillary blood glucose measured in `mg/dl`.

#### Validation Rules & Error Messages
| Rule | Condition | Error Message |
|---|---|---|
| **Value is required** | Empty or missing input | `"Please enter a glucose value."` |
| **Value range** | Whole number between 40 and 600 | `"Value must be between 40 and 600 mg/dl."` |
| **Single slot per day** | Duplicate slot on same date | `"You already have an [Slot] reading for this date."` |
| **Daily quota** | Exceeding 4 readings per day | `"You can add only 4 readings per day."` |
| **No future dates** | Selected date is in the future | `"Date cannot be in the future."` |

### 3. Reports Engine
For any selected date (defaults to today), three analytical scopes are calculated:
- **Daily**: Selected date stats (Highest, Lowest, Average rounded to 1 decimal, Count) plus a breakdown of each reading with its slot.
- **Month-to-Date**: From the 1st of the month to the selected date.
- **Monthly (Previous Month)**: The entire previous calendar month (e.g., 1 Sep – 30 Sep for 15 Oct; handles year rollover for January).
- **Empty States**: Clear and friendly empty state message when no readings exist.

### 4. Additional Implemented Tasks
- **Pagination**: `GET /api/readings?page=1&limit=20` with page controls.
- **Trend Chart**: Interactive Recharts line chart displaying glucose curves alongside standard target lines (70 mg/dl and 140 mg/dl).
- **Docker Compose**: Containerized setup (`docker-compose.yml`) running PostgreSQL, Express API, and React frontend.
- **Automated Tests**:
  - 22 backend integration tests (Jest + Supertest) covering auth, CRUD, validation rules, isolation, and reports.
  - 5 frontend unit tests (Vitest + React Testing Library) testing form validations and submission.
- **Database Fallback**: Automatically connects to local PostgreSQL if available, or falls back to an embedded in-memory database with persistent JSON storage if PostgreSQL is not installed locally.

---

## Project Structure

```
├── client/                     # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, ReadingModal, DeleteModal, ReportCard, TrendChart, LiveRoundClock
│   │   ├── context/            # AuthContext (JWT management & session sync)
│   │   ├── pages/              # DashboardPage, ReadingsPage, ReportsPage, LoginPage, RegisterPage
│   │   ├── services/           # Axios client with bearer token interceptors
│   │   ├── utils/              # Glucose categorizations & date formatters
│   │   └── test/               # React Testing Library form validation tests
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/             # PostgreSQL connection pool with Date parser & fallback engine
│   │   ├── controllers/        # Auth, Readings CRUD, Reports calculations
│   │   ├── db/                 # SQL schema, migration runner, seed script
│   │   ├── middleware/         # JWT auth, validation engine, error handler
│   │   └── routes/             # Express routes
│   ├── tests/                  # Supertest + Jest integration tests
│   └── Dockerfile
│
├── docker-compose.yml          # Container configuration
├── .env.example                # Example environment variables
└── README.md
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) or Docker *(Optional: an embedded fallback database is included)*

---

### Option A: Running with Docker

```bash
# 1. Start all services (PostgreSQL, Backend API, React Frontend)
docker compose up --build

# 2. In a separate terminal, seed demo data:
npm run seed
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

### Option B: Local Setup

#### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

#### 2. Environment Variables
Copy the example files:
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

Default credentials in `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=super_secret_jwt_key
CLIENT_ORIGIN=http://localhost:5173
```
*(If PostgreSQL is not running locally, the server automatically switches to the embedded database engine).*

#### 3. Database Migration & Seed
```bash
# Run migrations (create tables, constraints, indexes)
npm run migrate

# Seed demo user and historical readings
npm run seed
```

#### 4. Start Server & Client
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npm run server
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Running on http://localhost:5173
```

---

## Demo Account

A pre-populated account is ready to use after running `npm run seed`:

- **Email**: `demo@sweety.app`
- **Password**: `Password123!`

Demo data includes:
- 3 readings for today (`Morning (fasting)`, `After breakfast`, `After lunch`), leaving `After dinner` open to test adding the 4th reading.
- 60 days of historical readings across the current and previous months for testing reports and charts.

---

## Running Tests

All 27 automated tests can be run without external database dependencies:

```bash
# Run both server and client test suites
npm test

# Or run separately:
npm run test:server   # 22 Jest + Supertest integration tests
npm run test:client   # 5 React Testing Library form validation tests
```

### Test Coverage Summary:
- **Backend (22 tests)**:
  - Registration with duplicate email rejection & bcrypt verification.
  - Login authentication & unauthorized token checks.
  - Rule 1: Missing glucose value rejection.
  - Rule 2: Out-of-range (<40, >600) and decimal value rejection.
  - Rule 3: Duplicate slot rejection on the same day.
  - Rule 4: Exceeding 4 readings per day rejection.
  - Rule 5: Future date rejection.
  - User data isolation (User B cannot view or delete User A's data).
  - Daily, Month-to-Date, and Monthly report aggregations with 1-decimal rounding.
- **Frontend (5 tests)**:
  - Form field rendering and immediate validation messages.
  - Boundary value tests (30 and 650 mg/dl).
  - Future date rejection.
  - Successful form submission callback.

---

## REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/api/readings` | List readings with `page`, `limit`, `date`, `slot` | Yes |
| `POST` | `/api/readings` | Create reading (enforces all 5 rules) | Yes |
| `GET` | `/api/readings/:id` | Fetch single reading (user-isolated) | Yes |
| `PUT` | `/api/readings/:id` | Update reading (re-validates constraints) | Yes |
| `DELETE` | `/api/readings/:id` | Delete reading (user-isolated) | Yes |
| `GET` | `/api/reports?date=YYYY-MM-DD` | Daily, Month-to-date & Previous Month reports | Yes |

---

## Notes & Assumptions

### Assumptions Made
1. **Clinical Target Range**:
   - In Target: `70 – 140 mg/dl`
   - Low (Hypoglycemia): `< 70 mg/dl`
   - Elevated: `141 – 180 mg/dl`
   - High (Hyperglycemia): `> 180 mg/dl`
2. **Date Timezone Handling**:
   - PostgreSQL returns `DATE` types as UTC midnight timestamps by default in `node-pg`, which can shift by a day depending on the client timezone. We registered an explicit type parser (OID 1082) in `server/src/config/db.js` so date strings (`YYYY-MM-DD`) are preserved without timezone drift.
3. **Previous Month Scope**:
   - The "Monthly" report strictly computes the entire previous calendar month relative to the selected date (e.g. 1 Sep – 30 Sep for 15 Oct; handles December rollover for January dates).

### What I'd Improve with More Time
1. **Doctor / Clinician Role**: Role-based access control where clinicians can view read-only dashboards and export summaries of assigned patients.
2. **Redis Caching**: Cache `/api/reports` results and invalidate on reading mutations (`POST`, `PUT`, `DELETE`).
3. **Background Reminders**: A scheduled BullMQ job sending daily check reminders to users with fewer than 4 readings logged.
4. **PDF / CSV Export**: Option for patients to download a formatted report for their doctor appointments.
