# GIT WORKFLOW — Splito
> Build order, commit discipline, and delivery checklist.
> The rule is simple: every meaningful step gets its own commit. No bulk dumps. No "final final v2" commits.

---

## 1. Commit Message Format

Every commit follows this format:

```
<type>(<scope>): <short description>

Types:
  feat     → new feature or screen
  fix      → bug fix
  chore    → setup, config, tooling, deps
  docs     → markdown files, comments
  refactor → restructuring without behaviour change
  style    → UI-only changes (no logic)
  test     → tests (if any)
  db       → schema or seed changes

Scope (optional but preferred):
  auth, groups, expenses, balances, import, settlements, ui, api, db, deploy
```

**Examples:**
```
chore: initialise repo with planning docs and CSV
chore(frontend): scaffold React Vite project with Tailwind
chore(backend): scaffold Express TypeScript project
db: add schema.sql with all 7 tables
db: add seed script for users and Flat 4B group
feat(auth): implement login page UI
feat(auth): add Supabase auth integration and JWT middleware
feat(groups): add group detail page with member list
feat(expenses): implement add expense form with all split types
feat(expenses): add split calculation logic for equal and unequal
feat(expenses): add split calculation logic for percentage and share
feat(balances): implement balance calculation service
feat(balances): add debt simplification algorithm
feat(balances): add per-person breakdown drawer
feat(import): add CSV parser and anomaly detection engine
feat(import): add import review UI with approve/reject flow
feat(import): add import finalize and report generation
feat(settlements): add settlements list and record payment modal
fix(import): handle percentage anomaly edit before approve
style(dashboard): tighten balance card spacing
docs: add README with setup instructions
docs: add SCOPE.md anomaly log and schema
docs: add DECISIONS.md
docs: add AI_USAGE.md
chore(deploy): add Vercel and Render config files
```

---

## 2. Branch Strategy

Single branch: `main`

This is a 2-day solo build. Branching adds overhead with no benefit. Every commit goes straight to main. The meaningful commit history is what evaluators look for — not branch structure.

---

## 3. Build Order + Commit Sequence

Follow this exact sequence. Do not skip ahead. Each phase should be fully working before moving to the next.

---

### PHASE 0 — Setup (Before Writing Any App Code)

```
Step 0.1 — Create local folder and git init
  mkdir splito && cd splito
  git init
  git remote add origin https://github.com/yourusername/splito.git

Step 0.2 — Add planning docs and CSV
  Add: PROJECT_BLUEPRINT.md
  Add: UI_DESIGN_PLAN.md
  Add: GIT_WORKFLOW.md
  Add: MD_FILES_GUIDE.md
  Add: Expenses_Export.csv
  Add: README.md (initial — just title and "WIP")

  git add .
  git commit -m "chore: initialise repo with planning docs and raw CSV"
  git push -u origin main
```

---

### PHASE 1 — Project Scaffolding

```
Step 1.1 — Frontend scaffold
  cd frontend
  npm create vite@latest . -- --template react-ts
  npm install
  npm install tailwindcss @tailwindcss/vite
  Configure tailwind, set up color tokens in index.css

  git add .
  git commit -m "chore(frontend): scaffold React Vite project with Tailwind"
  git push

Step 1.2 — Backend scaffold
  cd backend
  npm init -y
  npm install express cors dotenv @supabase/supabase-js
  npm install -D typescript ts-node @types/express @types/node nodemon
  Set up tsconfig.json, src/index.ts, basic health check route

  git add .
  git commit -m "chore(backend): scaffold Express TypeScript project with Supabase client"
  git push

Step 1.3 — Environment files
  Add .env.example for both frontend and backend
  Add .gitignore (node_modules, .env, dist)

  git add .
  git commit -m "chore: add env examples and gitignore"
  git push
```

---

### PHASE 2 — Database

```
Step 2.1 — Schema
  Create backend/src/db/schema.sql
  Contains all 7 tables: users, groups, group_members,
  expenses, expense_splits, settlements,
  import_batches, import_anomalies
  Run in Supabase SQL editor

  git add .
  git commit -m "db: add complete schema with all 7 tables"
  git push

Step 2.2 — Seed script
  Create backend/src/db/seed.ts
  Seeds: 7 users in Supabase Auth + users table
  Seeds: Flat 4B group + group_members with dates

  git add .
  git commit -m "db: add seed script for users, group, and memberships"
  git push
```

---

### PHASE 3 — Auth

```
Step 3.1 — Backend auth middleware
  Create backend/src/middleware/auth.ts
  Validates Supabase JWT on every protected route
  Attaches user to req.user

  git add .
  git commit -m "feat(auth): add JWT validation middleware"
  git push

Step 3.2 — Login page UI
  Create frontend/src/pages/Login.tsx
  Email + password form, styled per UI_DESIGN_PLAN
  No signup, no social auth

  git add .
  git commit -m "feat(auth): implement login page UI"
  git push

Step 3.3 — Auth integration
  Connect login form to Supabase Auth
  Store JWT in localStorage
  Redirect to /dashboard on success
  Add ProtectedRoute wrapper component

  git add .
  git commit -m "feat(auth): integrate Supabase auth, add protected route wrapper"
  git push
```

---

### PHASE 4 — Groups

```
Step 4.1 — Groups API
  Create backend/src/routes/groups.ts
  GET /api/groups
  GET /api/groups/:id
  POST /api/groups
  POST /api/groups/:id/members
  PUT /api/groups/:id/members/:uid

  git add .
  git commit -m "feat(groups): add groups and members API routes"
  git push

Step 4.2 — Group detail page
  Create frontend/src/pages/GroupDetail.tsx
  Show group name, member list with joined/left dates
  Active/inactive member display

  git add .
  git commit -m "feat(groups): add group detail page with membership history"
  git push
```

---

### PHASE 5 — Expenses

```
Step 5.1 — Split calculation service
  Create backend/src/services/splitService.ts
  Functions: calculateEqualSplit, calculateUnequalSplit,
             calculatePercentageSplit, calculateShareSplit
  All return array of { userId, amountPaise }
  Handles rounding (remainder to payer)

  git add .
  git commit -m "feat(expenses): add split calculation service for all 4 split types"
  git push

Step 5.2 — Expenses API
  Create backend/src/routes/expenses.ts
  GET /api/groups/:id/expenses
  POST /api/groups/:id/expenses
  GET /api/expenses/:id
  PUT /api/expenses/:id
  DELETE /api/expenses/:id (soft delete)

  git add .
  git commit -m "feat(expenses): add expenses CRUD API with split persistence"
  git push

Step 5.3 — Expenses list page
  Create frontend/src/pages/Expenses.tsx
  Table of expenses with filters
  Your share column

  git add .
  git commit -m "feat(expenses): add expenses list page with filters"
  git push

Step 5.4 — Add expense form
  Create frontend/src/components/SplitForm.tsx
  Conditional split detail UI based on split type
  Live validation (percentages sum, unequal sum)
  Currency selector with INR equivalent preview

  git add .
  git commit -m "feat(expenses): add expense form with dynamic split type UI"
  git push
```

---

### PHASE 6 — Balances

```
Step 6.1 — Balance calculation service
  Create backend/src/services/balanceService.ts
  Membership-aware filtering (joined_at / left_at)
  Computes pairwise balances
  Returns per-person net balance

  git add .
  git commit -m "feat(balances): add membership-aware balance calculation service"
  git push

Step 6.2 — Debt simplification
  Create backend/src/services/debtSimplifier.ts
  Greedy algorithm: min transactions to settle group
  Input: array of { userId, netBalance }
  Output: array of { from, to, amount }

  git add .
  git commit -m "feat(balances): add greedy debt simplification algorithm"
  git push

Step 6.3 — Balances API
  Create backend/src/routes/balances.ts
  GET /api/groups/:id/balances
  GET /api/groups/:id/balances/:uid
  GET /api/groups/:id/simplified

  git add .
  git commit -m "feat(balances): add balance and debt simplification API routes"
  git push

Step 6.4 — Dashboard page
  Create frontend/src/pages/Dashboard.tsx
  Balance hero card (net balance in one number)
  Per-person breakdown list
  Recent expenses section
  Admin panel section (conditional)

  git add .
  git commit -m "feat(balances): add dashboard with balance summary and per-person breakdown"
  git push

Step 6.5 — Expense breakdown drawer
  Create frontend/src/components/ExpenseBreakdownDrawer.tsx
  Slides in on breakdown row click
  Lists all expenses between two people
  Shows date, description, total, share

  git add .
  git commit -m "feat(balances): add expense breakdown drawer component"
  git push
```

---

### PHASE 7 — Settlements

```
Step 7.1 — Settlements API
  Create backend/src/routes/settlements.ts
  GET /api/groups/:id/settlements
  POST /api/groups/:id/settlements

  git add .
  git commit -m "feat(settlements): add settlements API"
  git push

Step 7.2 — Settlements page + modal
  Create frontend/src/pages/Settlements.tsx
  List of settlements
  Record payment modal

  git add .
  git commit -m "feat(settlements): add settlements page and record payment modal"
  git push
```

---

### PHASE 8 — CSV Import (Biggest Phase)

```
Step 8.1 — CSV parser
  Create backend/src/services/importService.ts
  Parse raw CSV text → array of row objects
  Normalize: trim whitespace, lowercase names, strip commas from amounts
  Date parsing: handle all formats (DD-MM-YYYY, Mar-14, etc.)

  git add .
  git commit -m "feat(import): add CSV parser with normalization and date handling"
  git push

Step 8.2 — Anomaly detection engine
  Add detectAnomalies() to importService.ts
  Detects all 18 anomaly types
  Returns: { cleanRows[], anomalies[] }
  Each anomaly has: rowNumber, type, detail, suggestedAction, severity

  git add .
  git commit -m "feat(import): add anomaly detection engine covering all 18 anomaly types"
  git push

Step 8.3 — Import API
  Create backend/src/routes/import.ts
  POST /api/import (upload + parse + detect)
  GET /api/import/:batch_id
  PUT /api/import/:batch_id/anomalies/:id (approve/reject)
  POST /api/import/:batch_id/finalize
  GET /api/import/:batch_id/report

  git add .
  git commit -m "feat(import): add import API routes with batch management"
  git push

Step 8.4 — Import upload page
  Create frontend/src/pages/Import.tsx
  File drop zone
  Analyze button → calls POST /api/import
  Shows summary: X rows, Y anomalies

  git add .
  git commit -m "feat(import): add CSV upload page with analysis summary"
  git push

Step 8.5 — Import review page
  Create frontend/src/pages/ImportReview.tsx
  Blocking anomaly cards with approve/reject buttons
  Info anomalies table (auto-approved)
  Finalize Import button (disabled until all blocking resolved)

  git add .
  git commit -m "feat(import): add import review page with anomaly approval flow"
  git push

Step 8.6 — Import report page
  Create frontend/src/pages/ImportReport.tsx
  Summary stat cards
  Full anomaly log table
  Download report button

  git add .
  git commit -m "feat(import): add import report page with full anomaly log"
  git push
```

---

### PHASE 9 — Polish and Fixes

```
Step 9.1 — Navbar and routing
  Create frontend/src/components/Navbar.tsx
  Set up React Router with all routes
  Protected routes, admin-only routes

  git add .
  git commit -m "feat(ui): add navbar and complete client-side routing"
  git push

Step 9.2 — Error and empty states
  Add error boundaries
  Empty state components
  Toast notifications

  git add .
  git commit -m "style(ui): add error states, empty states, and toast notifications"
  git push

Step 9.3 — Bug fixes (ongoing)
  As you find issues during testing, fix and commit immediately
  git commit -m "fix(balances): correct rounding in percentage split"
  git commit -m "fix(import): handle empty split_details for equal type"
```

---

### PHASE 10 — Documentation and Deploy

```
Step 10.1 — Complete README.md
  Setup instructions, env vars, seed steps, deploy URLs, credentials table

  git add .
  git commit -m "docs: complete README with setup, deployment, and credentials"
  git push

Step 10.2 — SCOPE.md
  Anomaly log (all 18 with detection + policy)
  Full DB schema

  git add .
  git commit -m "docs: add SCOPE.md with anomaly log and database schema"
  git push

Step 10.3 — DECISIONS.md
  Every significant engineering/product decision with reasoning

  git add .
  git commit -m "docs: add DECISIONS.md with full decision log"
  git push

Step 10.4 — AI_USAGE.md
  Tools used, key prompts, 3+ cases where AI was wrong

  git add .
  git commit -m "docs: add AI_USAGE.md"
  git push

Step 10.5 — Deploy
  Deploy backend to Render
  Deploy frontend to Vercel
  Run seed script on production Supabase
  Import CSV as admin on production
  Approve all anomalies, finalize import
  Verify all user logins work

  git add .
  git commit -m "chore(deploy): add Vercel and Render config, update env examples"
  git push

Step 10.6 — Final verification commit
  Update README with live URLs

  git add .
  git commit -m "chore: add production URLs to README"
  git push
```

---

## 4. The Golden Rules

1. **Never commit broken code to main.** If something is half-done, stash it. Only commit when the step works.

2. **One thing per commit.** Don't mix "add login page" with "fix balance bug" in one commit.

3. **Push after every commit.** Don't let local get ahead of remote. If your machine dies, you lose nothing.

4. **Commit messages are for the evaluator.** They will read your git log. Write messages a stranger can understand.

5. **Don't squash or rebase.** The messy, real history of 30+ commits is the proof you built this yourself.

---

## 5. What the Git Log Should Look Like (Final)

```
chore: add production URLs to README
chore(deploy): add Vercel and Render config
docs: add AI_USAGE.md
docs: add DECISIONS.md
docs: add SCOPE.md with anomaly log and schema
docs: complete README with setup and credentials
fix(import): handle empty notes field in anomaly detection
fix(balances): correct remainder allocation in share split
style(ui): add error states, empty states, toast notifications
feat(ui): add navbar and complete client-side routing
feat(import): add import report page with full anomaly log
feat(import): add import review page with anomaly approval flow
feat(import): add CSV upload page with analysis summary
feat(import): add import API routes with batch management
feat(import): add anomaly detection engine covering all 18 anomaly types
feat(import): add CSV parser with normalization and date handling
feat(settlements): add settlements page and record payment modal
feat(settlements): add settlements API
feat(balances): add expense breakdown drawer component
feat(balances): add dashboard with balance summary
feat(balances): add balance and debt simplification API routes
feat(balances): add greedy debt simplification algorithm
feat(balances): add membership-aware balance calculation service
feat(expenses): add expense form with dynamic split type UI
feat(expenses): add expenses list page with filters
feat(expenses): add expenses CRUD API with split persistence
feat(expenses): add split calculation service for all 4 split types
feat(groups): add group detail page with membership history
feat(groups): add groups and members API routes
feat(auth): integrate Supabase auth, add protected route wrapper
feat(auth): implement login page UI
feat(auth): add JWT validation middleware
db: add seed script for users, group, and memberships
db: add complete schema with all 7 tables
chore: add env examples and gitignore
chore(backend): scaffold Express TypeScript project
chore(frontend): scaffold React Vite project with Tailwind
chore: initialise repo with planning docs and raw CSV    ← FIRST COMMIT
```

This is a story. A reader can understand what was built and in what order. That is the goal.

---

*End of GIT_WORKFLOW.md*
*Next: MD_FILES_GUIDE.md*
