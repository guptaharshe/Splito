# MD FILES GUIDE — Splito
> What to write in each required deliverable document, how detailed each needs to be, and draft structure for each.
> These files are what the evaluator reads BEFORE opening your code. First impressions live here.

---

## Overview

The assignment requires 4 markdown files as deliverables:

| File | Purpose | Audience | Written When |
|------|---------|----------|-------------|
| `README.md` | Setup + run instructions | Evaluator trying to run the app | Last (after deploy) |
| `SCOPE.md` | Anomaly log + DB schema | Evaluator checking your data decisions | After import is built |
| `DECISIONS.md` | Engineering decision log | Evaluator in live session | Throughout build |
| `AI_USAGE.md` | How you used AI, where it failed | Evaluator assessing your judgment | Last |

---

## File 1 — README.md

### Purpose
The evaluator will clone your repo and try to run it. README is the instruction manual. It must also serve as a quick reference during the 45-minute live session.

### How Detailed
Very detailed on setup. Concise everywhere else. No fluff.

### Structure

```markdown
# Splito — Shared Expenses App

> Shared expenses, settled fairly.
> Built for Spreetail SDE Intern Assignment.

## Live App
- Frontend: https://splito.vercel.app
- Backend API: https://splito-api.onrender.com

## Credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@splito.com   | Admin@123  |
| Aisha | aisha@splito.com   | Flat@123   |
| Rohan | rohan@splito.com   | Flat@123   |
| Priya | priya@splito.com   | Flat@123   |
| Meera | meera@splito.com   | Flat@123   |
| Sam   | sam@splito.com     | Flat@123   |
| Dev   | dev@splito.com     | Flat@123   |

> The CSV has already been imported and all anomalies reviewed.
> Log in as Admin to view the import report.
> Log in as any member to see their personal balance.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth (email + password)
- Deployed: Vercel (frontend) + Render (backend)

## AI Tools Used
Claude (claude.ai) — primary development collaborator.
Full usage log in AI_USAGE.md.

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A Supabase project (free tier works)

### 1. Clone the repo
git clone https://github.com/yourusername/splito.git
cd splito

### 2. Set up Supabase
- Create a project at supabase.com
- Go to SQL Editor → run backend/src/db/schema.sql
- Copy your project URL and anon key

### 3. Backend setup
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run seed      # creates all users and seeds the group
npm run dev       # starts on port 3000

### 4. Frontend setup
cd frontend
cp .env.example .env
# Fill in VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev       # starts on port 5173

### 5. Import the CSV
- Log in as admin@splito.com / Admin@123
- Go to Import
- Upload Expenses_Export.csv
- Review and resolve anomalies
- Click Finalize Import

## Project Structure
splito/
├── frontend/          # React Vite app
├── backend/           # Express API
├── Expenses_Export.csv
├── README.md
├── SCOPE.md
├── DECISIONS.md
└── AI_USAGE.md
```

---

## File 2 — SCOPE.md

### Purpose
Proves you found and handled every data problem in the CSV deliberately. This is what the evaluator uses during the live session to ask "walk me through what happened to Row 23."

### How Detailed
Exhaustive on anomalies. Every one of the 18 must be listed. DB schema can be a summary (full schema is in schema.sql).

### Structure

```markdown
# SCOPE.md — Splito

## Part 1: Anomaly Log

The CSV (Expenses_Export.csv) contains 18 deliberate data problems.
Every anomaly is listed below with: how it was detected, our policy, and what the importer does.

### Anomaly Severity Levels
- BLOCKING: row cannot be imported without admin decision
- INFO: auto-handled, logged for transparency

---

### A1 — Exact Duplicate (Rows 5 & 6)
**Type:** BLOCKING
**Detection:** Normalize description (lowercase, trim) + match date + paid_by + amount + split_with
**Problem:** "Dinner at Marina Bites" and "dinner - marina bites" are identical
**Policy:** Flag both. Keep first occurrence (Row 5). Admin must approve.
**Action:** Row 6 marked REJECTED_DUPLICATE

---

### A2 — Comma-Formatted Amount (Row 7)
**Type:** INFO
**Detection:** amount.includes(',') after CSV parse
**Problem:** amount = "1,200" — not a valid number
**Policy:** Strip commas, parse as 1200. Auto-handled.
**Action:** Imported as ₹1,200

... (repeat for all 18 anomalies)

---

## Part 2: Database Schema

### Tables
1. users — mirrors Supabase Auth, adds name + role
2. groups — expense sharing groups
3. group_members — time-bound membership (joined_at, left_at)
4. expenses — one row per expense, amount in paise
5. expense_splits — one row per person per expense
6. settlements — direct payments between members
7. import_batches — tracks each CSV import run
8. import_anomalies — one row per detected anomaly

### Key Design Decisions
- All amounts stored in integer paise (×100) — no floating point money
- Soft deletes via deleted_at — nothing hard deleted
- Membership is time-bound — enables Sam/Meera exclusions
- USD stored with original_amount + exchange_rate columns for full traceability

Full schema: backend/src/db/schema.sql
```

---

## File 3 — DECISIONS.md

### Purpose
This is what the evaluator will quote during the live session — "your DECISIONS.md says you chose X, why not Y?" You must be able to defend every entry here. It shows engineering maturity.

### How Detailed
Each decision needs: the question, options considered, what you chose, and why. No fluff. Be direct.

### Structure

```markdown
# DECISIONS.md — Splito

Engineering and product decisions made during the build.
Format: Decision → Options Considered → Choice → Reason

---

## D1 — Money Storage Format

**Question:** How to store currency amounts in the database?

**Options:**
1. NUMERIC(10,2) — store as rupees with decimals
2. FLOAT — simple but imprecise
3. BIGINT as paise — store ₹1 as 100, ₹1.50 as 150

**Choice:** BIGINT as paise (option 3)

**Reason:** Floating point arithmetic is unreliable for money.
0.1 + 0.2 ≠ 0.3 in IEEE 754. With integer paise, all arithmetic
is exact. Rounding only happens once at display time.
Industry standard (Stripe, RazorPay all store in smallest currency unit).

---

## D2 — USD Exchange Rate

**Question:** Live rate or fixed rate for USD→INR conversion?

**Options:**
1. Fetch live rate from an FX API at import time
2. Use a fixed hardcoded rate, documented

**Choice:** Fixed rate — ₹84.00 per USD

**Reason:** A live rate makes balances non-reproducible.
If the evaluator runs the import tomorrow at a different rate,
balances would differ from what we show. A fixed, documented rate
is auditable and explainable. The rate ₹84 was the approximate
market rate in March 2026 (when the Goa trip occurred).

---

## D3 — Negative Amounts (Refunds)

**Question:** Is a negative amount an error or a valid refund?

**Options:**
1. Treat as error — reject during import
2. Treat as refund — import as negative expense

**Choice:** Treat as refund (option 2)

**Reason:** The CSV context is clear — Row 26 is a parasailing
refund ("one slot got cancelled"). Negative expenses are a
real financial concept. Treating it as an error would lose
real financial data. Each person's split becomes negative
(a credit). This is semantically correct.

---

## D4 — Settlement Row Handling

**Question:** Row 14 "Rohan paid Aisha back" — expense or settlement?

**Options:**
1. Import as a regular expense (wrong semantically)
2. Reject and skip
3. Import into the settlements table instead

**Choice:** Import into settlements table (option 3)

**Reason:** This is clearly a settlement — money changing hands
to reduce a debt, not a shared expense. Importing it as an expense
would double-count it (it would affect balances AND appear in
expense lists). The note even asks "is this a settlement?"
Moving it to settlements is semantically correct and directly
addresses Meera's requirement to approve such changes.

---

## D5 — Missing Payer

**Question:** Row 13 has no paid_by. What do we do?

**Options:**
1. Auto-assign to the most frequent payer
2. Reject the row
3. Flag as BLOCKING anomaly, let admin decide

**Choice:** Flag as BLOCKING, let admin decide (option 3)

**Reason:** Auto-assigning would be a silent guess that changes
real financial balances. The payer determines who is owed money.
Getting it wrong silently is worse than skipping the row.
Admin (who knows the group) should decide or skip.

---

## D6 — Conflicting Duplicate (Thalassa)

**Question:** Two people logged the same dinner with different amounts.
Which one wins?

**Options:**
1. Keep the higher amount (more conservative)
2. Keep the lower amount
3. Keep the one with the note hint, flag for admin confirmation
4. Average the two amounts

**Choice:** Option 3 — surface both to admin with suggestion

**Reason:** Row 25's note says "Aisha also logged this I think
hers is wrong" — this is a direct hint. We suggest keeping Row 25
(₹2,450, Rohan's entry) but the admin must confirm. Averaging
would produce a number neither person logged, which is harder to
trace. The evaluator specifically will ask about this row.

---

## D7 — Percentage Anomaly (Pizza Friday)

**Question:** Percentages sum to 110%. What do we do?

**Options:**
1. Normalize to 100% automatically (divide each by 1.1)
2. Reject the row
3. Flag as BLOCKING, require admin to correct percentages

**Choice:** Flag as BLOCKING, require admin correction (option 3)

**Reason:** We don't know which percentage is wrong. Was Meera
supposed to be 10% not 20%? Was Aisha 25% not 30%? Auto-normalizing
makes a silent assumption. The admin who knows the group can correct
the actual intended split.

---

## D8 — Membership-Aware Splits

**Question:** Sam joined April 15. Should he owe for April 10 expenses?

**Options:**
1. Include Sam in all April expenses regardless of join date
2. Only include Sam in expenses after his join date

**Choice:** Option 2 — strict join date filtering

**Reason:** Sam explicitly said "I moved in mid-April. Why would
March electricity affect my balance?" The group_members table stores
joined_at and left_at. The balance calculation filters expense_splits
to only include rows where expense_date >= user.joined_at.
This is the correct, fair approach.

Note: April 10 "Housewarming drinks" includes Sam in split_with.
Since Sam is in the split_with list but expense_date < joined_at,
we flag this as an anomaly and suggest removing Sam from that split.

---

## D9 — Inactive Member in Split (Meera in April)

**Question:** April 2nd groceries includes Meera who left March 31.

**Options:**
1. Include Meera anyway (she's in the CSV)
2. Remove her and redistribute among active members
3. Flag for admin to decide

**Choice:** Flag as BLOCKING, suggest removing Meera (option 3)

**Reason:** The note on the row says "oops Meera still in the group list"
— confirming it's a data error. We can't silently remove someone from
a financial record. Admin confirms, then we redistribute among
Aisha, Rohan, Priya.

---

## D10 — Zero Amount Expense

**Question:** Row 31 has amount = 0. Import or skip?

**Options:**
1. Import (a ₹0 expense has no financial effect)
2. Skip with INFO note

**Choice:** Skip with INFO note (option 2)

**Reason:** The note says "counted twice earlier - fixing later"
meaning this is a placeholder/correction marker, not a real expense.
A ₹0 expense adds noise to expense lists and the balance drill-down.
Skipping is cleaner and the note confirms intent.

---

## D11 — Ambiguous Date (04-05-2026)

**Question:** Is "04-05-2026" April 5 or May 4?

**Options:**
1. Default to DD-MM-YYYY (rest of CSV uses this) = April 5
2. Default to MM-DD-YYYY = May 4
3. Flag as BLOCKING, admin decides

**Choice:** Flag as BLOCKING with suggestion of April 5 (option 3)

**Reason:** The rest of the CSV uses DD-MM-YYYY format, which
would make this April 5. But the note on the row says "is this
April 5 or May 4? format is a mess" — so even the person who
wrote it wasn't sure. We surface it rather than silently guess.

---

## D12 — Frontend and Backend Separation

**Question:** Next.js monorepo or separate React + Express?

**Options:**
1. Next.js — single repo, API routes, one deploy
2. Separate React (Vite) + Express — two repos/deploys

**Choice:** Separate React + Express

**Reason:** Cleaner architecture to explain in a live session.
"This is the frontend, this is the API, this is the DB" is
easier to trace than Next.js server/client boundaries.
The extra deploy complexity is small (Vercel + Render).

---

## D13 — Debt Simplification

**Question:** Show all pairwise balances or simplify to minimum transactions?

**Options:**
1. Show all pairwise (e.g. Rohan owes Aisha, Rohan owes Priya separately)
2. Simplify to minimum transactions (greedy algorithm)

**Choice:** Show both — pairwise for detail, simplified for "settle up" view

**Reason:** Aisha wants "one number per person" — simplified transactions.
Rohan wants to see "which expenses make that up" — pairwise with drill-down.
We do both: dashboard shows net balance, group page shows suggested
settlement transactions (simplified), drawer shows expense detail.

---

## D14 — "Priya S" Unknown Payer

**Question:** Row 11 payer is "Priya S" — not in users list. Who is this?

**Options:**
1. Reject the row
2. Auto-map to closest name ("Priya")
3. Flag, suggest mapping to Priya, admin confirms

**Choice:** Flag, suggest Priya, admin confirms (option 3)

**Reason:** "Priya S" is almost certainly Priya (only one Priya in the group,
likely wrote her last initial by habit). But making this assumption silently
changes a financial record. Admin who knows the group confirms.

---

## D15 — Auth Strategy

**Question:** Google OAuth or email+password?

**Options:**
1. Google OAuth via Supabase
2. Email + password via Supabase Auth, pre-seeded users

**Choice:** Email + password, pre-seeded

**Reason:** The group is fixed and known. There's no self-signup flow needed.
Pre-seeding all users with documented credentials lets the evaluator log in
as any member instantly without needing Google accounts.
Simpler, more demonstrable, and directly serves the evaluation use case.
```

---

## File 4 — AI_USAGE.md

### Purpose
Shows you used AI as a tool, not a crutch. The evaluator wants to see that you directed AI, caught its mistakes, and remained the engineer of record.

### How Detailed
List every major thing AI helped with. Then give at least 3 specific cases where AI was wrong and what you did. Be specific — vague answers are unconvincing.

### Structure

```markdown
# AI_USAGE.md — Splito

## Tools Used
- Claude (claude.ai) — primary development collaborator throughout the project

## How I Used AI

### Planning
- Used Claude to brainstorm the anomaly detection strategy
- Validated my initial anomaly list against the CSV (Claude caught 3 I missed)
- Reviewed DB schema design decisions

### Development
- Generated boilerplate for Express routes and middleware
- Drafted the split calculation functions (equal, unequal, percentage, share)
- Generated the debt simplification algorithm (reviewed and corrected)
- Drafted SQL schema (reviewed every line)
- Generated Tailwind component classes for consistent styling

### Documentation
- Helped draft initial structure for SCOPE.md and DECISIONS.md
- Reviewed README for completeness

---

## Key Prompts Used

1. "Here is a CSV with expense data. List every data anomaly you can find, categorize them by severity, and suggest a handling policy for each."

2. "Design a PostgreSQL schema for a shared expense tracker where group membership is time-bound. Members can join and leave. Expenses must track who paid and each person's share. Include an import audit trail."

3. "Write a TypeScript function that takes an array of {userId, netBalance} objects and returns the minimum number of transactions to settle all debts. Use a greedy algorithm."

4. "Write an Express middleware that validates a Supabase JWT and attaches the decoded user to req.user."

---

## Cases Where AI Was Wrong

### Case 1 — Balance Calculation Logic
**What AI produced:** The initial balance calculation summed
expense_splits amounts and subtracted settlements, but didn't
filter by membership dates. Sam would have appeared to owe
money for March expenses.

**How I caught it:** Manually traced Rohan's balance and
noticed expenses before his join date were included.

**What I changed:** Added WHERE clause filtering:
  expense_date >= group_members.joined_at
  AND (group_members.left_at IS NULL OR expense_date <= group_members.left_at)
And moved this logic into a dedicated balanceService.ts function
so it's applied consistently everywhere.

---

### Case 2 — Percentage Split Rounding
**What AI produced:** The calculatePercentageSplit function
distributed percentages and rounded each to nearest paise.
On a ₹1,440 pizza split (30/30/30/20), the total of rounded
shares was ₹1,439 — one paise short.

**How I caught it:** Wrote a test that summed all splits
and checked they equaled the expense total.

**What I changed:** Added remainder allocation — after computing
all shares, sum them and assign the difference to the payer's share.
Standard approach used in Splitwise and similar apps.

---

### Case 3 — Anomaly Detection False Positive
**What AI produced:** The fuzzy duplicate detection flagged
"Dinner at Thalassa" (Row 24) and "Dinner order Swiggy" (Row 31)
as potential duplicates because both descriptions started with
"Dinner" and were on dates within 30 days.

**How I caught it:** During manual review of the anomaly list,
I noticed these two rows had different amounts, different payers,
and different split_with groups.

**What I changed:** Tightened duplicate detection criteria:
- Same date (not within N days — exact match)
- Same paid_by (after normalization)
- Amount within 1% tolerance
- split_with lists must overlap >80%
Only after all 4 criteria match do we flag as duplicate.
This eliminated the false positive while still catching the
real duplicates (Rows 5/6 and Rows 24/25).

---

## My Assessment

AI was most useful for boilerplate and first drafts. It saved
significant time on Express route setup, Tailwind class selection,
and SQL schema generation.

AI was least reliable on:
- Business logic with edge cases (balance calculation, split rounding)
- Anomaly detection thresholds (too aggressive by default)
- Understanding the specific context of this CSV's quirks

Every piece of AI-generated code was reviewed, tested manually,
and in several cases substantially rewritten. The architecture,
data model, and anomaly handling policies are entirely my own decisions.
```

---

## Summary Checklist

Before submitting, verify each file is complete:

```
README.md
  □ Live app URL
  □ All credentials listed
  □ Tech stack
  □ Local setup steps (clone → install → seed → run)
  □ Import instructions
  □ Project structure

SCOPE.md
  □ All 18 anomalies listed
  □ Each has: detection, policy, action taken
  □ DB schema summary
  □ Reference to schema.sql

DECISIONS.md
  □ At least 12-15 decisions logged
  □ Each has: question, options, choice, reason
  □ Covers: money storage, USD rate, every major anomaly, auth, architecture

AI_USAGE.md
  □ Tools listed
  □ Major use cases described
  □ At least 3 specific cases of AI being wrong
  □ Each case: what AI produced, how you caught it, what you changed
```

---

*End of MD_FILES_GUIDE.md*
