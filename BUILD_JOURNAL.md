# Car Loan Calculator — Build Journal

A running log of decisions, scope, and progress for this project. Keep this file in the repo root and update it as each phase is completed.

**Stack:** React + TypeScript (frontend), Node/Express + SQL (backend)
**Goal:** A backend-heavy CRUD + auth project — full stack actually gets learned end to end.

---

## Build Plan (7 phases)

1. ~~Nail down the feature scope~~ ✅
2. ~~Scaffold the frontend with loose TypeScript~~ ✅
3. ~~Build the UI against fake local data~~ ✅
4. ~~Stand up Express + the SQL database~~ ✅
5. ~~Add auth~~ ✅
6. ~~Wire frontend to backend~~ ✅
7. ~~Tighten TypeScript once it's all working~~ ✅ — **project complete**

---

## Decisions Log

### Session 1 — 2026-07-20
- **Project chosen:** Car payment/lease calculator with amortization schedule
- **Backend:** Node/Express + SQL (chosen over Supabase/Next.js API routes as the most transferable stack for junior roles)
- **TypeScript approach:** Ease in gradually — no strict mode yet. Start with plain functions, add types to signatures once logic works, tighten later (phase 7)
- **v1 scope:** Loan calculations only. Lease mode deferred as a stretch goal — keeps phase 1 (and the DB schema) simpler out of the gate
- **Added input:** Additional Fees (covers DOC fee & DMV fees) — rolled into the financed amount alongside price, down payment, and trade-in
- **Added input:** Trade-in Amount Owed — conditional field, only relevant when a trade-in value is entered; nets against trade-in value (negative equity increases amount financed, positive equity reduces it)
- **Added intermediate step:** Out-the-Door (OTD) amount is calculated and shown *before* the payment calculator runs, then feeds into amount financed
- **Sales tax basis:** Calculated on price minus trade-in value (trade-in tax credit), not full price
- **Split Additional Fees:** separated into DOC fee (taxable) and DMV fees (not taxable) as two distinct inputs, since they're treated differently in the tax calculation
- **OTD formula confirmed:** taxable amount = price − trade + doc; sales tax = taxable × rate; equity = trade value − amount owed; OTD = price + tax + doc + dmv, adjusted by equity (+/−)

---

## Feature Scope (v1 — Loan Calculator)

### Inputs
- Vehicle price
- Down payment
- Trade-in value (optional)
- Trade-in amount owed (optional, only shown/used when a trade-in value is entered — nets against trade-in value to produce positive or negative equity)
- Sales tax rate (%)
- APR (annual interest rate, %)
- Loan term (months)
- Additional fees:
  - DOC fee (dealer documentation fee — typically taxable)
  - DMV fees (title/registration — typically not taxable)

### Intermediate Calculation — Out-the-Door (OTD) Amount
Calculated *before* the payment/amortization math runs, using the inputs above:

1. **Taxable amount** = Price − Trade-in value + DOC fee
2. **Sales tax** = Taxable amount × Sales tax rate
3. **Trade-in equity** = Trade-in value − Trade-in amount owed
4. **OTD amount** = Price + Sales tax + DOC fee + DMV fees, then adjusted by trade-in equity (added if negative equity/still owed, subtracted if positive equity)
5. **Amount financed** = OTD amount − Down payment ← *this feeds the amortization schedule*

### Outputs
- **OTD (out-the-door) amount** — shown to the user before the payment calculation runs
- Monthly payment
- Total amount financed
- Total interest paid over the life of the loan
- Total cost (principal + interest)
- Full amortization schedule: month #, payment, principal portion, interest portion, remaining balance

### Saved Calculations (CRUD — this is what justifies the backend)
- Label/name for the calculation
- Created date
- All input values
- Computed summary (monthly payment, total interest, total cost)
- Actions: create, list all, view one (with full amortization schedule), delete

---

## Backlog / Open Questions
- [ ] Lease mode (stretch goal, post-v1)
- [x] DB choice: Postgres vs. SQLite — decided (phase 4): Postgres, installed directly on Windows
- [x] Auth approach: JWT vs. session-based — decided (phase 5): JWT, self-implemented, stored in an HTTP-only cookie

---

## Phase 2 Notes — Calculation Layer
- Core functions built in `src/lib/calc.ts`: `calcOtd`, `calcMonthlyPayment`, `calcAmortizationSchedule` — all verified working via manual `console.log` checks
- Zero-APR edge case handled in `calcMonthlyPayment` (straight division, no formula needed when there's no interest)
- `calcMonthlyPayment` rounds its return value with `toFixed(2)` wrapped in `Number()` — decided to round at this layer rather than only at display time
- Debugging lessons hit along the way: Vite module scope doesn't leak into the browser console (values/functions defined in a file aren't globally accessible — test by calling functions from within the file itself); a missing `export` keyword produces a "does not provide an export" error that looks like a syntax error at the import site; calling `someFunction.length` reads its parameter count, not its return value — need `someFunction()` to actually invoke it
- Last-payment rounding fix implemented: on the final month, `principal` is set to whatever `balance` remains (not the formula-derived value), and `payment` is recalculated as `principal + interest` — this makes the schedule's final balance land exactly at `0` instead of drifting a few cents. Verified with a test checking both `balance === 0` and `payment ≈ principal + interest` on the last row
- Project initialized with git and pushed to a new GitHub repo

## Phase 3 Notes — Form & Results UI
- `CalculatorForm.tsx` built with 9 controlled inputs (price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment) and a submit handler calling `calcOtd` → `calcMonthlyPayment` → `calcAmortizationSchedule` in sequence
- Verified working end to end in the browser with real numbers
- Debugging lessons: `useState<Number>` (capital) vs `useState<number>` (lowercase) — capital is the boxed wrapper type, not what you want; a form's default submit behavior reloads the page unless `e.preventDefault()` is called; local variables computed inside an event handler vanish once the handler returns — only `useState` bridges a computed value into what the component renders; naming a local variable the same as an outer state variable silently shadows it rather than erroring
- React.FormEvent was deprecated as of React 19.2.10 in favor of React.SubmitEvent — form handler now typed as `React.SubmitEvent<HTMLFormElement>`
- UX fix: `apr` and `taxRate` inputs now accept whole percentages (e.g. `6` for 6%) rather than raw decimals (`0.06`) — conversion (`/ 100`) happens where the values are passed into the calc functions, matching how real loan calculator UIs behave
- Known follow-up: `schedule` (the full amortization table) is computed and stored in state but not yet rendered anywhere — only OTD and monthly payment currently display

## Phase 3 Notes — Styling (Tailwind v4)
- Design direction: dealership buyer's order / itemized invoice aesthetic — paper background, slab-serif labels, monospace tabular numbers for all dollar figures, hairline dividers between line items, bold amber total rule for the OTD figure
- Tokens defined via Tailwind v4's CSS-first `@theme` block (no `tailwind.config.js`): `--color-paper`, `--color-ink`, `--color-line`, `--color-accent`, `--color-muted`, plus `--font-display` (Roboto Slab), `--font-body` (Inter), `--font-mono` (IBM Plex Mono)
- Confirmed Tailwind v4 setup: `@tailwindcss/vite` plugin in `vite.config.ts`, `@import "tailwindcss";` + `@theme {}` in the main CSS file — replaces the old `tailwind.config.js` + `@tailwind base/components/utilities` v3 approach
- Form fields arranged in a 2-column grid to keep the form above the fold; results section conditionally rendered via a `showResults` boolean state, only appearing after Calculate is pressed
- Whole page centered (both axes) using an outer `flex min-h-screen items-center justify-center` wrapper around an inner `max-w-2xl` column holding the form + results together

## Phase 3 Notes — Amortization Table
- Full 60-row amortization schedule now rendered as a scrollable table (`max-h-96 overflow-y-auto`), styled to match the invoice theme, with a sticky header row
- New patterns covered: `key` prop required when using `.map()` to render a list in React (used `row.month` since it's already unique); `sticky top-0` to keep table headers visible while scrolling
- Phase 3 complete: form, calculation wiring, styling, and the amortization table are all built and verified working end to end

## Phase 4 Notes — Backend Setup
- Postgres installed directly on Windows (Docker was attempted first but blocked by a virtualization-support error, so switched to a direct install)
- `car_calc` database created and confirmed via `psql`
- `server/` folder initialized separately from the frontend: Express, `pg`, `dotenv`, `cors` (runtime) + TypeScript, `tsx`, and type packages (dev)
- `/api/health` route built and verified — confirms Express is running AND the `pg` pool can successfully query Postgres (`SELECT NOW()` returns a live timestamp)
- Debugging lesson: `tsx server.ts` doesn't hot-reload on save the way Vite does — the process must be manually stopped and restarted to pick up code changes, which caused a confusing stale-error moment (fix looked right in the file but the old process was still running)
- `saved_calculations` table created — stores inputs, computed OTD/monthly payment, label, and timestamp. Dollar amounts and rates use `NUMERIC` (not `FLOAT`) to avoid floating-point rounding issues in stored money values
- Schedule storage approach: regenerating the full amortization schedule on demand from stored inputs (via `calcAmortizationSchedule`) rather than persisting all 60 rows per saved calculation — simpler, and the schedule is cheap to recompute
- `POST /api/calculations` (Create) built and verified via Thunder Client — inserts a row and returns it with `RETURNING *`
- Debugging lessons: SQL placeholders (`$1, $2...`) are filled positionally from a separate values array, not by matching variable names — the array order must exactly match the placeholder order; a request without the `Content-Type: application/json` header causes `express.json()` to silently skip parsing, leaving `req.body` fully `undefined` (not just missing fields); the `pg` driver returns Postgres `NUMERIC` columns as strings, not JS numbers (to avoid precision loss), so values like `otd` and `monthly_payment` need `Number(...)` before doing math with them on the frontend

### Full CRUD completed — 2026-07-21
All five REST endpoints for `saved_calculations` built, debugged, and tested:
- `GET /api/calculations` (list all) — includes `ORDER BY created_at DESC`
- `GET /api/calculations/:id` (view one) — 404 when the id doesn't exist, otherwise returns the single row object (not an array)
- `POST /api/calculations` (create) — already built in the prior session
- `PUT /api/calculations/:id` (update) — full-replace update (client sends all fields every time); 404 on missing id, otherwise returns the updated row
- `DELETE /api/calculations/:id` (delete) — 204 with no body on success, 404 if the id doesn't exist

**Debugging lessons from this phase:**
- `express.json()` middleware has to be added per-route, not assumed global — PUT initially threw `Cannot destructure property 'label' of 'req.body' as it is undefined` because the middleware was missing on that route while POST had it
- SQL placeholders (`$1`, `$2`...) are plain Postgres placeholders, not JS template-literal interpolation (`${}`) — mixing the two (`$object.id`) produces invalid SQL
- The position of a value in the array passed to `pool.query()` must match its placeholder's position in the SQL string itself, not any "logical" ordering — in the `UPDATE` query, `id` is used in `WHERE` (the last clause), so it had to go **last** in the array, matching `$13`, even though it's conceptually "the reference to the object"
- `req.params` is an object (`{ id: '3' }`), not the id value directly — needs destructuring (`const { id } = req.params`) before use
- `res.json(...)` and similar response methods are actions (send now), not values to test in an `if` condition — calling them inside a condition sends a response as a side effect and can trigger `ERR_HTTP_HEADERS_SENT` if a second response call follows
- A 204 response should have no body at all (`res.status(204).send()`) — pairing 204 with a JSON body is inconsistent with what the status code means
- On Windows, PowerShell aliases `curl` to `Invoke-WebRequest`, which doesn't accept curl's `-X`/`-H`/`-d` flags — use `curl.exe` explicitly for real curl syntax, or PowerShell's native `Invoke-RestMethod -Method PUT -ContentType "application/json" -Body '...'` instead

Next: Phase 5 — auth (JWT vs. session-based still to be decided)

## Phase 5 Notes — Auth
- Decision: JWT (self-implemented, no third-party provider like Auth0), stored client-side in an HTTP-only cookie rather than `localStorage` — HTTP-only cookies can't be read by JS on the page, closing the XSS token-theft risk that `localStorage` has
- Backend restructured before adding auth code: split the single `server.ts` file into `server/db.ts` (pool setup), `server/routes/calculations.ts` (existing CRUD, mounted via `app.use('/api/calculations', calculationsRouter)`), and later `server/routes/auth.ts` + `server/middleware/auth.ts` — done specifically to keep the growing route count organized, matching how real codebases separate concerns
- `users` table created: `id`, `username` (UNIQUE), `email` (UNIQUE), `password_hash`, `created_at` — passwords are hashed with `bcrypt` (10 salt rounds) and never stored or logged in plaintext
- `saved_calculations` gained a `user_id INTEGER REFERENCES users(id)` column (added via `ALTER TABLE`, nullable so existing test rows didn't break) — this is what ties saved calculations to a specific user
- `POST /api/auth/register` — checks for an existing email first (app-level check backed by the DB's own `UNIQUE` constraint as the real guarantee), hashes the password, inserts the user, returns only `{ id, username, email }` (never `password_hash`) with a `201`; duplicate email returns `409` with a distinct message from the generic 500 error
- `POST /api/auth/login` — looks up the user by email, uses `bcrypt.compare()` against the stored hash (never reverses or re-hashes to compare), and returns the *same generic* `401 Invalid credentials` whether the email doesn't exist or the password is wrong — deliberately not revealing which one failed, so an attacker can't use the error to discover which emails are registered
- On successful login, a JWT (`{ id, username }` payload, signed with a secret from `.env`, 1 hour expiry) is issued via `res.cookie('token', ..., { httpOnly: true, sameSite: 'strict', maxAge: 3600000 })` — `secure: true` deliberately deferred until deployment (localhost dev isn't HTTPS), left as a TODO comment in the code
- `cookie-parser` installed and wired into `server.ts` (`app.use(cookieParser())`) so `req.cookies` exists at all
- `middleware/auth.ts` — a `requireAuth` function that reads `req.cookies.token`, verifies it with `jwt.verify()`, attaches the decoded payload to `req.user`, and calls `next()` on success; returns `401` (without calling `next()`) if the cookie is missing or the token is invalid/expired
- Extended Express's `Request` type via `server/types/express.d.ts` (`declare global { namespace Express { interface Request { user?: ... } } }`) so TypeScript recognizes `req.user` project-wide
- All five CRUD routes on `saved_calculations` now require `requireAuth` and scope their queries by `user_id` (`WHERE id = $1 AND user_id = $2` for GET one/PUT/DELETE, `WHERE user_id = $1` for GET all, inserted as a value on POST) — verified a user cannot view, update, or delete another user's row even when given a valid, existing id
- Tested end to end: register, login (cookie confirmed via PowerShell's `-SessionVariable`), unauthenticated requests correctly rejected with 401, and cross-user access correctly rejected with 404 rather than succeeding

**Debugging lessons from this phase:**
- Hashing is not encryption — hashing is one-way and can never be reversed; login works by hashing the *login attempt* and comparing hashes, never by "decrypting" anything
- A newly created table/column can silently not exist from the app's point of view if it was created while connected to the wrong Postgres database in `psql` (`\c car_calc` matters) — hit this twice, once for the `users` table itself and once for the `user_id` column
- `psql` won't run a statement until it sees a semicolon — a stray unclosed parenthesis leaves the prompt showing `(#` and silently waiting for more input, which looks like nothing happened
- `jwt.verify()` throws (doesn't return false) on an invalid/expired token — needs a `try/catch`, same as DB queries
- Forgetting `return` after sending an error response inside an `if` block lets execution fall through to the rest of the function, which can trigger a second response (`ERR_HTTP_HEADERS_SENT`) further down
- Middleware order matters: `requireAuth` must run *before* the route handler in the argument list so `req.user` exists by the time the handler runs
- `req.user` is typed as `string | JwtPayload` after extending Express's types, so accessing `.id` needs a cast (`(req.user as JwtPayload).id`) rather than direct access
- A value logged correctly right before a query ran didn't rule out an earlier stale test result — a stale server process (not restarted after an edit) was the likely cause of one confusing "wrong data saved" moment, similar to the `tsx` hot-reload gotcha from phase 4

Next: Phase 6 — wire the frontend to the now-authenticated backend

## Phase 6 Notes — Frontend Wired to Backend
- Installed `react-router-dom`; app wrapped in `<BrowserRouter>` (in `main.tsx`) inside `<AuthProvider>` (Context needs to sit above anything calling `useAuth()`, but ordering relative to `BrowserRouter` doesn't otherwise matter)
- New `AuthContext` (`src/context/AuthContext.tsx`) — `createContext` + `AuthProvider` + a `useAuth()` hook holding `{ user, setUser }`, shared across the whole app so login state survives route changes
- New pages: `LoginPage`, `RegisterPage`, `SavedCalculationsPage`, `NotFoundPage` (all under `src/pages/`), plus `Header` and `ProtectedRoute` (under `src/components/`); existing calculator UI moved into `CalculatePage` wrapping the untouched `CalculateForm`
- `GET /api/auth/me` route added on the backend — protected by `requireAuth`, just echoes back `req.user`'s `{ id, username }` — this is how the frontend checks "is anyone logged in" without ever being able to read the `httpOnly` cookie directly
- `ProtectedRoute` guards `/` and `/saved`: on mount it calls `/api/auth/me` (not just checking local Context state, since that resets on every page refresh) and only renders the nested route (`<Outlet />`) or redirects to `/login` once that check resolves — a `loading` state prevents a premature redirect before the check finishes
- `cors` wired into `server.ts` (`app.use(cors({ origin: 'http://localhost:5173', credentials: true }))`) — required the moment the browser (not PowerShell) made cross-origin requests; `credentials: true` here plus `credentials: 'include'` on every frontend `fetch()` call is what actually lets the `httpOnly` JWT cookie ride along
- Register decided to auto-log-in on success (matching how most real apps behave, rather than forcing a second manual login) — required adding the same `jwt.sign()` + `res.cookie()` block from `login` into the end of the `register` route
- `POST /api/auth/logout` added — deliberately **not** behind `requireAuth` (logout should succeed even if already logged out; it's idempotent) and needs no request body — just `res.clearCookie('token', { ...same options used to set it })`
- `CalculateForm`'s Calculate button now also saves: on submit it computes locally (unchanged) *and* `fetch`es `POST /api/calculations` with the same inputs plus a new required `label` field; results still display even if the save silently fails, with a separate save-error message shown
- Numeric form inputs converted from `useState<number>(0)` to `useState<string>('')` so fields render blank instead of prefilled with an unremovable `0` — conversion to `Number(...)` now happens only at the point of calculation/save, not on every keystroke
- `SavedCalculationsPage` — fetches `GET /api/calculations` on mount, lists each with delete buttons; delete calls `DELETE /api/calculations/:id` then removes the item from local state via `.filter()` rather than re-fetching the whole list
- Styling pass: `LoginPage`, `RegisterPage`, `Header`, and `SavedCalculationsPage` all brought in line with the existing invoice theme (`bg-paper`, `text-ink`, `border-line`, `text-accent`, `text-muted`, `font-display`/`font-body`/`font-mono`)
- `Header` (nav + logout) ended up rendered once inside `ProtectedRoute` (via a React Fragment wrapping `<Header />` and `<Outlet />`) rather than duplicated per-page, so it appears consistently on every protected route

**Debugging lessons from this phase:**
- A component can't `return` JSX from inside a plain event-handler function (`handleLogin`, `handleCalculate`, etc.) to "show an error" — JSX only renders from what the component itself returns; error messages need their own state variable that the component's real `return` reads and conditionally displays
- State setters (`setUser`, `setPrice`, etc.) return `undefined` and can't be chained (`setUser(x).navigate(y)` fails) — they're side-effecting calls, not fluent-interface methods; two independent actions are just two separate statements
- `fetch()` does not send cookies cross-origin by default — needs `credentials: 'include'` on the frontend *and* `cors({ credentials: true, origin: <exact frontend URL> })` on the backend; missing either one means the `httpOnly` JWT cookie silently never arrives, even though the request itself "succeeds"
- A `401` response is still a "successful" fetch as far as `fetch()` itself is concerned (no network error thrown) — always check `response.ok` explicitly rather than assuming a resolved promise means success
- Calling `response.json()` on a `204 No Content` response throws (`Unexpected end of JSON input`) since there's no body to parse — caused a false "delete failed" error even though the backend deletion had already succeeded; the fix is to just not parse a body on 204 responses at all
- `useEffect` is for syncing on mount/dependency-change, not for wrapping logic inside an event handler that already has its own trigger (e.g. a form's `onSubmit`) — Hooks can't be called conditionally or nested inside other functions
- Windows filesystem case-insensitivity vs. TypeScript's case-sensitive module resolution caused a "differs only in casing" build error from two near-identically-named files (`LoginPage.tsx` vs `Loginpage.tsx`) — fixed by deleting the stray file and restarting the IDE to clear its cache
- The `pg` driver's NUMERIC-as-string behavior (documented back in Phase 4) resurfaced on the frontend too — `calc.monthly_payment.toFixed(2)` crashed because the value from the API is a string, not a number; needs `Number(calc.monthly_payment).toFixed(2)`
- `useState<number>(0)` renders as a literal, un-clearable `0` in a number input since `0` is a real value, not an empty placeholder — solved here by storing form inputs as strings and converting to numbers only at the point of use

Next: Phase 7 — tighten TypeScript now that the full stack works end to end

## Phase 7 Notes — Strict TypeScript
- Discovered the backend (`server/`) had never had its own `tsconfig.json` at all — `tsx` was running it with implicit defaults, meaning there had been no deliberate type-checking configuration on the backend the whole project
- Created `server/tsconfig.json` explicitly: `target: ES2022`, `module: commonjs`, `strict: true`, `esModuleInterop: true`, `skipLibCheck: true`, `resolveJsonModule: true` — first real, intentional compiler config for the backend
- Installed `@types/cors` (same missing-third-party-types situation as `bcrypt` back in Phase 5) to resolve an implicit-`any` warning on the `cors` import
- Hit a removed-option error on `"moduleResolution": "node"` — newer TypeScript versions dropped `node`/`node10` as valid values entirely; fixed by removing the line and letting TypeScript infer the resolution strategy from `module: commonjs`
- On the frontend, discovered the root `tsconfig.json`'s `"strict": true` didn't actually apply to the app code — that file is a "solution" config with `"files": []` that just references `tsconfig.app.json` and `tsconfig.node.json`; the real app-code config (`tsconfig.app.json`) had never set `strict` itself and was running loose despite what the root file implied
- Added `"strict": true` to `tsconfig.app.json` directly
- Verified both configs with `npx tsc --noEmit -p tsconfig.app.json` (frontend) and the backend's own compile — both came back completely clean, no errors, confirming the codebase's existing discipline (explicit `useState` types, typed function signatures in `lib/calc.ts`, deliberate `as JwtPayload` casts rather than scattered `any`) held up under real strict-mode scrutiny

**Debugging lessons from this phase:**
- A `tsconfig.json` with `"strict": true` at a project's root doesn't guarantee it applies everywhere — solution-style root configs (`"files": []` + `references`) can point to sub-configs that never actually inherit or restate that setting; the sub-config that lists `include: ["src"]` (or similar) is the one that actually governs type-checking for real files
- Editor "no red squiggles" isn't fully conclusive on its own — squiggles only appear for files currently open, and a language server can lag behind a fresh config change; running `tsc --noEmit` directly is the authoritative, whole-project check
- TypeScript occasionally removes compiler options entirely between versions (not just deprecates them) — `moduleResolution: "node"` / `"node10"` is one such case; the fix is usually to delete the option and let inference take over based on `module`, rather than hunting for a replacement value

**Project status: all 7 planned phases complete.** Car Loan Calculator is a working full-stack app — React + TypeScript frontend (strict mode), Node/Express + PostgreSQL backend (strict mode), JWT auth with hashed passwords and per-user data scoping, and a full CRUD loop from form to database and back, styled end to end in a consistent invoice theme.

