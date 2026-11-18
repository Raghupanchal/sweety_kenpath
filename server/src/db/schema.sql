-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Readings Table
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Whole number between 40 and 600 mg/dl
    CONSTRAINT chk_glucose_value CHECK (value >= 40 AND value <= 600),

    -- Constraint: Valid predefined slots
    CONSTRAINT chk_slot_name CHECK (
        slot IN ('Morning (fasting)', 'After breakfast', 'After lunch', 'After dinner')
    ),

    -- Constraint: Only one reading per slot per day for a user
    CONSTRAINT uq_user_date_slot UNIQUE (user_id, reading_date, slot)
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings (user_id, reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_readings_user_date_slot ON readings (user_id, reading_date, slot);
