-- Splito Database Schema
-- All 7 tables for the shared expenses app
-- Run this in Supabase SQL Editor

-- 1. Users table (mirrors Supabase Auth)
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Groups table
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- 3. Group Members table (time-bound membership)
CREATE TABLE group_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID REFERENCES groups(id) NOT NULL,
  user_id     UUID REFERENCES users(id) NOT NULL,
  joined_at   DATE NOT NULL,
  left_at     DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. Expenses table
CREATE TABLE expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID REFERENCES groups(id) NOT NULL,
  description       TEXT NOT NULL,
  amount_paise      BIGINT NOT NULL,
  original_amount   NUMERIC(12,4),
  original_currency TEXT DEFAULT 'INR',
  exchange_rate     NUMERIC(10,4),
  paid_by           UUID REFERENCES users(id) NOT NULL,
  expense_date      DATE NOT NULL,
  split_type        TEXT NOT NULL CHECK (split_type IN ('equal', 'unequal', 'percentage', 'share')),
  notes             TEXT,
  is_settlement     BOOLEAN DEFAULT FALSE,
  import_row_number INT,
  import_batch_id   UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- 5. Expense Splits table
CREATE TABLE expense_splits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id    UUID REFERENCES expenses(id) NOT NULL,
  user_id       UUID REFERENCES users(id) NOT NULL,
  amount_paise  BIGINT NOT NULL,
  share_units   NUMERIC(8,2),
  percentage    NUMERIC(5,2),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Settlements table
CREATE TABLE settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID REFERENCES groups(id) NOT NULL,
  paid_by         UUID REFERENCES users(id) NOT NULL,
  paid_to         UUID REFERENCES users(id) NOT NULL,
  amount_paise    BIGINT NOT NULL,
  settlement_date DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- 7. Import Batches table
CREATE TABLE import_batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by   UUID REFERENCES users(id) NOT NULL,
  filename      TEXT NOT NULL,
  total_rows    INT NOT NULL,
  clean_rows    INT NOT NULL,
  anomaly_rows  INT NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'finalized')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  finalized_at  TIMESTAMPTZ
);

-- 8. Import Anomalies table
CREATE TABLE import_anomalies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        UUID REFERENCES import_batches(id) NOT NULL,
  row_number      INT NOT NULL,
  raw_row         JSONB NOT NULL,
  anomaly_type    TEXT NOT NULL,
  anomaly_detail  TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  resolution      TEXT CHECK (resolution IN ('approved', 'rejected', 'pending')) DEFAULT 'pending',
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for import_batch_id on expenses (after import_batches exists)
ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_import_batch
  FOREIGN KEY (import_batch_id) REFERENCES import_batches(id);
