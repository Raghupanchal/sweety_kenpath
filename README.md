# Sweety – Blood Glucose Tracker 🩸

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Vitest%20(27%20passing)-success?style=flat-square)](#-running-tests)

A modern, responsive, and clinically accurate blood glucose tracking application built for diabetes patients. Patients record up to 4 readings per day across designated physiological slots, set customizable real-time alerts with browser notifications, and view instant analytical reports (Daily, Month-to-Date, and Previous Month) alongside interactive trend charts.

---

## 📋 Features

### 1. Secure Authentication & User Isolation
- **Sign up and Log in**: Register with name, email, and password.
- **Bcrypt Password Hashing**: Passwords salted and hashed with 10 rounds; plaintext passwords never persist.
- **Tenant Data Isolation**: Users can **only view, edit, or delete their own readings** (enforced in both JWT middleware and SQL `WHERE user_id = $1` queries).

### 2. Blood Glucose Readings CRUD & Validation
Patients record readings across 4 predefined physiological time slots:
1. `Morning (fasting)`
2. `After breakfast`
3. `After lunch`
4. `After dinner`

#### Strict Validation Rules Enforced (Client, Server & Database):
| Rule | Condition | Required Error Message |
|---|---|---|
| **Value is required** | Empty / missing value | `"Please enter a glucose value."` |
| **Value range** | Whole number between 40 and 600 | `"Value must be between 40 and 600 mg/dl."` |
| **Single slot per day** | Duplicate slot for user on selected date | `"You already have an [Slot] reading for this date."` |
| **Daily quota** | Maximum 4 readings per calendar day | `"You can add only 4 readings per day."` |
| **No future dates** | Selected date > today | `"Date cannot be in the future."` |

### 3. Clinical Reports Engine
For any chosen date (defaults to today), three analytical scopes are computed:
- **Daily**: Selected date stats (Highest, Lowest, Average rounded to 1 decimal, Count) + full chronological breakdown of each reading with its slot and clinical classification.
- **Month-to-Date**: 1st of the calendar month to the selected date.
- **Monthly (Previous Month)**: Complete previous calendar month (e.g., 1 Sep – 30 Sep for 15 Oct; handles year rollovers correctly).
- **Friendly Empty States**: Graceful UI when no readings exist for any timeframe.

### 4. Completed Bonus Features 🌟
- **Pagination**: `GET /api/readings?page=1&limit=20` with total count, total pages, and navigation controls.
- **Interactive Visual Charts**: Recharts line chart illustrating glucose curves with clinical reference thresholds (70 mg/dl hypo line, 140 mg/dl post-meal upper limit).
- **Docker Compose**: Containerized multi-service setup (`docker-compose.yml`) running PostgreSQL, Express API, and React frontend.
- **Frontend & Backend Automated Test Suites**:
  - **Backend**: 22 Jest + Supertest integration tests covering auth, CRUD, all 5 validation rules, DB constraints, and report calculations.
  - **Frontend**: 5 Vitest + React Testing Library unit tests verifying form validation and submission behavior.
- **Realistic Demo Seed Script**: Pre-populates 60 days of clinical readings + 3 readings for today (leaving 1 open slot for testing).
- **Live Round Health Clock**: Real-time analog clock widget with custom reminder setup (`+15m`, `+30m`, `+1h`, `+2h`, or custom time) and Web Notifications API support.
- **Dual-Mode Database Architecture**: Seamlessly connects to real PostgreSQL if running, or auto-falls back to an embedded in-memory database with persistent disk sync so reviewers can test without any DB configuration hassle!

---

## 🏗️ Architecture & Project Structure

```
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, ReadingModal, DeleteModal, ReportCard, TrendChart, LiveRoundClock
│   │   ├── context/            # AuthContext (JWT management & session sync)
│   │   ├── pages/              # DashboardPage, ReadingsPage, ReportsPage, LoginPage, RegisterPage
│   │   ├── services/           # Axios client with bearer token interceptors
│   │   ├── utils/              # Clinical classification (<70, 70-140, 141-180, >180)
│   │   └── test/               # React Testing Library form validation tests
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                     # Node.js + Express.js REST API
│   ├── src/
│   │   ├── config/             # PostgreSQL connection pool with Date parser & fallback engine
│   │   ├── controllers/        # Auth, Readings CRUD, Reports calculations
│   │   ├── db/                 # SQL schema, migration runner, seed script
│   │   ├── middleware/         # JWT auth, validation engine, error handler
│   │   └── routes/             # Express route definitions
│   ├── tests/                  # Supertest + Jest integration tests
│   └── Dockerfile
│
├── docker-compose.yml          # Docker composition for PostgreSQL, API, and Web
├── .env.example                # Example environment variables
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher) or [Docker](https://www.docker.com/) *(Optional: app has zero-config embedded DB fallback)*

---

### Option A: Running with Docker (One-Command Setup)

If you have Docker installed:
```bash
# 1. Start all services (PostgreSQL, Backend API, React Frontend)
docker compose up --build

# 2. In a separate terminal, seed demo data:
npm run seed
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

### Option B: Local Development Setup

#### 1. Clone & Install Dependencies
```bash
git clone <your-repo-link>
cd "Sweety – Blood Glucose Tracker"

# Install all root, server, and client dependencies
npm run install:all
```

#### 2. Configure Environment Variables
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
> **Note:** If you do not have local PostgreSQL running, Sweety will automatically detect this and switch to the embedded dual-mode database engine with JSON disk persistence.

#### 3. Database Migration & Demo Seed
Run the migration script to create tables, constraints, and indexes:
```bash
# Creates database and tables
npm run migrate

# Populates realistic demo user and 60 days of clinical readings
npm run seed
```

#### 4. Run Server and Client
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npm run server
# API runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Web app runs on http://localhost:5173
```

---

## 🔑 Demo Account Credentials

A pre-populated account is available after running `npm run seed`:

- **Email**: `demo@sweety.app`
- **Password**: `Password123!`
- *(Or click the **"Use Demo Account"** button on the Login page for 1-click login)*

The demo account includes:
- **3 readings for today** (fasting, after breakfast, after lunch) allowing you to immediately test adding the 4th reading (`After dinner`).
- **Over 150 historical readings** spanning the current month and the previous month for rich visual charts and reports.

---

## 🧪 Running Tests

Both backend and frontend test suites are automated and require no external services:

```bash
# Run both server and client tests
npm test

# Or run separately:
npm run test:server   # Runs 22 Jest + Supertest integration tests
npm run test:client   # Runs 5 React Testing Library form validation tests
```

### Test Coverage Highlights:
- **Backend (22 Passing Tests)**:
  - Registration with duplicate email rejection & bcrypt verification.
  - Login authentication & 401 unauthorized token verification.
  - Rule 1: Missing glucose value rejection.
  - Rule 2: Out-of-range (<40, >600) and decimal value rejection.
  - Rule 3: Duplicate slot on the same day rejection.
  - Rule 4: Exceeding 4 readings per day rejection.
  - Rule 5: Future date rejection.
  - User-specific data isolation (User B cannot view or delete User A's readings).
  - Accurate Daily, Month-to-Date, and Monthly report aggregations with exact 1-decimal rounding.
- **Frontend (5 Passing Tests)**:
  - Immediate form validation errors rendering exact specification strings.
  - Out-of-bounds boundary tests (30 and 650 mg/dl).
  - Future date rejection.
  - Form submission calling API and triggering onSuccess callback.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new patient account | No |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/api/readings` | List readings with `page`, `limit`, `date`, `slot` filters | Yes |
| `POST` | `/api/readings` | Create new reading (validates all 5 rules) | Yes |
| `GET` | `/api/readings/:id` | Fetch single reading (user-isolated) | Yes |
| `PUT` | `/api/readings/:id` | Update reading (revalidates constraints) | Yes |
| `DELETE` | `/api/readings/:id` | Delete reading (user-isolated) | Yes |
| `GET` | `/api/reports?date=YYYY-MM-DD` | Daily, Month-to-date & Previous Month reports | Yes |

---

## 📝 Notes & Engineering Decisions

### Assumptions Made
1. **Clinical Target Standards**:
   - Blood glucose values are categorized into 4 clinical tiers:
     - **Hypoglycemia**: `< 70 mg/dl` (Amber badge)
     - **Normal Target**: `70 – 140 mg/dl` (Green badge)
     - **Elevated**: `141 – 180 mg/dl` (Orange badge)
     - **Hyperglycemia**: `> 180 mg/dl` (Red badge)
2. **Date Timezone Preservation**:
   - PostgreSQL returns `DATE` types as UTC midnight timestamps by default in `node-pg`, which can cause a 1-day drift depending on the client timezone. We registered an explicit type parser (OID 1082) in `server/src/config/db.js` so date strings (`YYYY-MM-DD`) are preserved strictly without timezone shift.
3. **Previous Month Boundary**:
   - For any given selected date, the "Monthly" report strictly computes the **entire previous calendar month** (e.g. if the user selects `15 Oct 2026`, the report covers `1 Sep 2026 – 30 Sep 2026`; if `10 Jan 2026`, it covers `1 Dec 2025 – 31 Dec 2025`).

### What I'd Improve with More Time
1. **Doctor / Clinician Portal**: Implement role-based access control (RBAC) where doctors can be invited to view read-only dashboards and export PDF summaries of patient glycemic logs.
2. **Redis Caching**: Add Redis caching for the analytical reports endpoint (`/api/reports`), automatically invalidated on reading mutations (`POST`, `PUT`, `DELETE`).
3. **Automated Reminders**: Use BullMQ and Redis to run a nightly cron job dispatching reminders to patients with fewer than 4 readings logged for the day.
4. **CSV / PDF Export**: Enable patients to download a certified clinical report for their endocrinologist consultation.
