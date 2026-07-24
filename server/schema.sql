CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_calculations (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  trade_in_value  NUMERIC(10,2) NOT NULL DEFAULT 0,
  trade_in_owed   NUMERIC(10,2) NOT NULL DEFAULT 0,
  doc_fee         NUMERIC(10,2) NOT NULL DEFAULT 0,
  dmv_fees        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,4) NOT NULL,
  apr             NUMERIC(5,4) NOT NULL,
  term_months     INTEGER NOT NULL,
  down_payment    NUMERIC(10,2) NOT NULL DEFAULT 0,
  otd             NUMERIC(10,2) NOT NULL,
  monthly_payment NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_calculations_user_created
  ON saved_calculations (user_id, created_at DESC);