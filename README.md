# Splito

Splito is a full-stack shared-expenses app for messy, real-world group finances. It imports a raw CSV export, detects anomalies, lets an admin review and resolve them, and then surfaces balances and suggested settlements for each member.

## Production Deployment

- Live app: `http://139.59.42.119`
- Hosting: DigitalOcean droplet with Nginx reverse proxy and a Node/Express backend
- Production frontend API base path: `/api`

## Features

- Login with Supabase Auth
- Group and member management with `joined_at` / `left_at` timelines
- Expense creation and balance views
- CSV import review flow with anomaly detection and approvals
- Pairwise balance computation and suggested settlements
- Integer-based currency math in paise to avoid floating-point drift

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- A Supabase project
- Two `.env` files: one in `backend/` and one in `frontend/`

### Backend

```bash
cd backend
npm install
```

Create `backend/.env` with at least:

```env
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-role-key
```

Run the API:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` with:

```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:3001
```

Run the app:

```bash
npm start
```

For production, set `REACT_APP_API_URL=/api` so the frontend uses the reverse proxy.

## Demo Accounts

- Admin password: `Admin@123`
- Member password: `Flat@123`

Accounts used in the assignment dataset:

| Role / Name | Email | Notes |
| --- | --- | --- |
| System Admin | `admin@splito.com` | Admin dashboard and import flow |
| Aisha | `aisha@example.com` | Primary payer |
| Priya | `priya@example.com` | Active member |
| Rohan | `rohan@example.com` | Active member |
| Dev | `dev@example.com` | Left early |
| Meera | `meera@example.com` | Left on `2026-03-31` |
| Sam | `sam@example.com` | Joined on `2026-04-08` |

## Documentation

- `SCOPE.md` - assignment scope, anomaly log, and database schema
- `DECISIONS.md` - significant decisions, options considered, and rationale
- `IMPORT_REPORT.md` - import report for the provided CSV
- `AI_USAGE.md` - AI tools used, prompts, mistakes, and corrections

## AI Assistance

AI was used as a development collaborator for parser design, split math, UI scaffolding, and documentation drafting. The full breakdown, including mistakes that were caught and corrected, is in `AI_USAGE.md`.

## Final Import Result

The finalized import report for the provided CSV currently records:

- 42 total rows processed
- 26 clean rows imported
- 17 anomalies detected
- 5 rows rejected

The resolved rows in the finalized report are:

- Row 5: accepted
- Row 6: rejected
- Row 7: auto-fixed
- Row 9: auto-fixed
- Row 11: rejected
- Row 13: rejected
- Row 15: rejected
- Rows 20, 21, 23, 26, 27, 28, 31, 42: auto-fixed
- Row 32: rejected

## Tech Stack

- Frontend: React, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: Supabase Postgres
- Auth: Supabase Auth
- Import pipeline: CSV parsing plus custom split and anomaly handling
