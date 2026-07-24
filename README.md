# Car Loan Calculator

A full-stack car loan calculator with amortization schedules and user accounts — built to learn a complete React + Node/Express + PostgreSQL stack, including hand-rolled JWT authentication, end to end.

## Overview

Enter a vehicle's price, trade-in details, fees, APR, and loan term to get an instant out-the-door total, monthly payment, and full month-by-month amortization schedule. Create an account to save calculations and come back to them later — every saved calculation is private to the account that created it.

## Features

- **Loan calculator** — computes out-the-door total (price, sales tax, trade-in equity, fees), monthly payment, and a full amortization schedule (principal/interest/balance per month)
- **User accounts** — register and log in with hashed passwords (bcrypt) and JWT-based sessions stored in an HTTP-only cookie
- **Saved calculations** — every calculation is saved automatically on calculate, scoped per-user; view, and delete saved calculations from a dedicated page
- **Protected routes** — the calculator and saved-calculations pages require login; the frontend verifies session state against the backend on every load rather than trusting client-side state alone

## Tech Stack

**Frontend:** React, TypeScript (strict mode), Vite, Tailwind CSS v4, React Router
**Backend:** Node.js, Express, TypeScript (strict mode), PostgreSQL (`pg`)
**Auth:** JWT (`jsonwebtoken`), `bcrypt` for password hashing, `cookie-parser`, HTTP-only cookies
**Other:** `cors` for cross-origin requests between the Vite dev server and the API

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL

### Database setup
Create a database and the two required tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE saved_calculations (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  trade_in_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  trade_in_owed NUMERIC(10,2) NOT NULL DEFAULT 0,
  doc_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  dmv_fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) NOT NULL,
  apr NUMERIC(5,4) NOT NULL,
  term_months INTEGER NOT NULL,
  down_payment NUMERIC(10,2) NOT NULL DEFAULT 0,
  otd NUMERIC(10,2) NOT NULL,
  monthly_payment NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id)
);
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```
DATABASE_URL=postgres://<user>:<password>@localhost:5432/<database>
JWT_SECRET=<a long, random string>
```

Run the server:

```bash
npx tsx server.ts
```

The API runs on `http://localhost:3001`.

### Frontend

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Project Structure

```
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # CalculateForm, Header, ProtectedRoute, Layout
│   ├── context/               # AuthContext (shared login state)
│   ├── pages/                 # LoginPage, RegisterPage, CalculatePage, SavedCalculationsPage, NotFoundPage
│   └── lib/                   # calc.ts — pure loan math (OTD, monthly payment, amortization)
│
├── server/                   # Backend (Express + TypeScript)
│   ├── routes/                # auth.ts (register/login/logout/me), calculations.ts (CRUD)
│   ├── middleware/            # auth.ts — requireAuth JWT verification
│   ├── types/                  # express.d.ts — extends Request with req.user
│   └── db.ts                   # PostgreSQL connection pool
│
└── BUILD_JOURNAL.md          # Full build log: decisions, debugging lessons, phase-by-phase notes
```

## API Endpoints

| Method | Endpoint                     | Description                               | Auth required |
|--------|------------------------------|-------------------------------------------|:---:|
| POST   | `/api/auth/register`           | Create an account (auto-logs in on success)  | ✅ |
| POST   | `/api/auth/login`              | Log in, issues a JWT cookie                  | ✅ |
| POST   | `/api/auth/logout`             | Clears the session cookie                    | ✅ |
| GET    | `/api/auth/me`                 | Returns the current logged-in user           | ✅ |
| GET    | `/api/calculations`            | List the logged-in user's saved calculations | ✅ |
| GET    | `/api/calculations/:id`        | Get one saved calculation                    | ✅ |
| POST   | `/api/calculations`            | Save a new calculation                       | ✅ |
| PUT    | `/api/calculations/:id`        | Update a saved calculation                   | ✅ |
| DELETE | `/api/calculations/:id`        | Delete a saved calculation                   | ✅ |

All calculation routes are scoped to the authenticated user — a valid session can never view, edit, or delete another user's data.

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored or logged in plaintext
- Sessions use JWTs stored in HTTP-only cookies (not `localStorage`), preventing client-side JS from reading the token
- Login and registration return the same generic "invalid credentials" message regardless of whether the email or password was wrong, to avoid leaking which emails are registered
- `secure: true` on the session cookie is deferred until deployment (`localhost` in development isn't HTTPS) — see the `TODO` comment in `routes/auth.ts`

## Build Notes

This project was built in seven deliberate phases — scope, frontend UI, backend + database, auth, full-stack wiring, then a final pass turning on strict TypeScript. See [`BUILD_JOURNAL.md`](./BUILD_JOURNAL.md) for the full decision log and every debugging lesson hit along the way.
