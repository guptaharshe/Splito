# PROJECT BLUEPRINT — Splito
> Master technical reference document. Written before a single line of code. Every decision in the app traces back to this file.

---

## 1. Project Overview

**App Name:** Splito  
**Tagline:** Shared expenses, settled fairly.  
**Assignment:** Spreetail SDE Intern — Build a Shared Expenses App  
**Deadline:** 15th June, 10 AM  
**Built by:** Vansh (acting as both Product Manager and Developer)

### What Splito Does
Splito is a shared expense tracker for groups — specifically built for a group of flatmates (Aisha, Rohan, Priya, Meera, Sam, Dev) who tracked expenses in a messy spreadsheet. The app:
- Lets users log in as themselves and see their personal balance
- Lets an admin manage groups, members, and expenses
- Imports the provided `Expenses_Export.csv` through the UI with full anomaly detection and review
- Calculates who owes whom, with full drill-down into which expenses make up each balance
- Handles currency conversion (USD → INR), membership-aware splits, and multiple split types

### Every Flatmate's Requirement — Mapped to a Feature

| Person | Their Request | Feature That Addresses It |
|--------|--------------|--------------------------|
| Aisha | "One number per person. Who pays whom, how much, done." | Dashboard balance summary card — net balance in one line |
| Rohan | "If the app says I owe ₹2,300, I want to see which expenses make that up." | Expense breakdown drill-down on balance click |
| Priya | "Half the trip was in dollars. The sheet pretends a dollar is a rupee." | USD→INR conversion at fixed documented rate during import |
| Sam | "I moved in mid-April. Why would March electricity affect my balance?" | Membership date-aware expense splits — Sam excluded from pre-join expenses |
| Meera | "Clean up duplicates — but I want to approve anything the app deletes." | Import review queue — no anomaly auto-resolved without admin approval |

---

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React (Vite) | Fast setup, component-based, familiar |
| Styling | Tailwind CSS | Utility-first, no custom CSS files needed |
| Backend | Node.js + Express | Lightweight REST API, familiar ecosystem |
| Database | PostgreSQL via Supabase | Relational (required by assignment), managed hosting |
| Auth | Supabase Auth (email+password) | Built-in, no OAuth complexity, easy to pre-seed |
| Deployment | Vercel (frontend) + Render (backend) + Supabase (DB) | Free tier, easy CI/CD |
| Language | TypeScript throughout | Type safety, better for live code review session |

### Why Not Next.js?
Keeping frontend and backend separate makes the architecture clearer to explain in the live session. The evaluator can see "this is the React app, this is the Express API, this is Supabase" as three distinct layers — easier to defend and trace.

### Why Relational DB (not Firebase/MongoDB)?
Assignment explicitly requires relational DB. PostgreSQL is the right choice — expense splits, group memberships, and balance calculations are inherently relational data.

---

## 3. User Credentials

All users are pre-seeded via a seed script (`/backend/src/seed.ts`) run once before submission.

| Name | Email | Password | Role | Status |
|------|-------|----------|------|--------|
| Admin | admin@splito.com | Admin@123 | admin | Active |
| Aisha | aisha@splito.com | Flat@123 | member | Active |
| Rohan | rohan@splito.com | Flat@123 | member | Active |
| Priya | priya@splito.com | Flat@123 | member | Active |
| Meera | meera@splito.com | Flat@123 | member | Moved out (March 31) |
| Sam | sam@splito.com | Flat@123 | member | Active (joined April 15) |
| Dev | dev@splito.com | Flat@123 | member | Guest (trip only) |

### Role Definitions
- **admin** — can see all groups, view import report, approve/reject anomalies, manage all users
- **member** — can see their own group, their own balance, add expenses, record settlements

---

## 4. Database Schema

### Design Principles
- Every table has `id` (UUID), `created_at`, `updated_at`
- Soft deletes via `deleted_at` — nothing is hard deleted
- All monetary amounts stored in **paise (INR × 100)** as integers — no floating point money
- USD amounts stored as USD cents, with a `currency` column and `inr_equivalent` column computed at import time
- Membership is time-bound — `joined_at` and `left_at` columns on group_members

---

### Table: `users`
Mirrors Supabase Auth users. Created automatically on signup/seed.

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table: `groups`
A group is a collection of members sharing expenses over time.

```sql
CREATE TABLE groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

**Seed data:** One group — "Flat 4B" — created by admin.

---

### Table: `group_members`
Tracks who is in a group and when they joined/left. This is how Sam is excluded from March expenses and Meera from April ones.

```sql
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
```

**Seed data (Flat 4B memberships):**

| Member | joined_at | left_at |
|--------|-----------|---------|
| Aisha | 2026-02-01 | NULL (still active) |
| Rohan | 2026-02-01 | NULL |
| Priya | 2026-02-01 | NULL |
| Meera | 2026-02-01 | 2026-03-31 |
| Sam | 2026-04-15 | NULL |
| Dev | NULL (guest, not a permanent member) | NULL |

---

### Table: `expenses`
Core table. One row per expense.

```sql
CREATE TABLE expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID REFERENCES groups(id) NOT NULL,
  description       TEXT NOT NULL,
  amount_paise      BIGINT NOT NULL,          -- always in INR paise
  original_amount   NUMERIC(12,4),            -- original value from CSV (for USD rows)
  original_currency TEXT DEFAULT 'INR',
  exchange_rate     NUMERIC(10,4),            -- rate used if USD (e.g. 84.0000)
  paid_by           UUID REFERENCES users(id) NOT NULL,
  expense_date      DATE NOT NULL,
  split_type        TEXT NOT NULL CHECK (split_type IN ('equal', 'unequal', 'percentage', 'share')),
  notes             TEXT,
  is_settlement     BOOLEAN DEFAULT FALSE,    -- TRUE for payments/settlements
  import_row_number INT,                      -- which CSV row this came from
  import_batch_id   UUID,                     -- which import run created this
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ               -- soft delete
);
```

---

### Table: `expense_splits`
One row per person per expense. Stores exactly how much each person owes for that expense.

```sql
CREATE TABLE expense_splits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id    UUID REFERENCES expenses(id) NOT NULL,
  user_id       UUID REFERENCES users(id) NOT NULL,
  amount_paise  BIGINT NOT NULL,              -- this person's share in INR paise
  share_units   NUMERIC(8,2),                -- for 'share' split type (e.g. 2.0 = took 2 scooters)
  percentage    NUMERIC(5,2),                -- for 'percentage' split type
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table: `settlements`
Records when one person pays another directly to settle debt.

```sql
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
```

---

### Table: `import_batches`
Tracks each CSV import run. The import report shown in the admin dashboard comes from this.

```sql
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
```

---

### Table: `import_anomalies`
One row per anomaly detected during import. Admin reviews and approves/rejects each one.

```sql
CREATE TABLE import_anomalies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        UUID REFERENCES import_batches(id) NOT NULL,
  row_number      INT NOT NULL,
  raw_row         JSONB NOT NULL,              -- the original CSV row as JSON
  anomaly_type    TEXT NOT NULL,              -- e.g. 'duplicate', 'missing_payer', 'currency_missing'
  anomaly_detail  TEXT NOT NULL,              -- human readable description
  suggested_action TEXT NOT NULL,             -- what the importer recommends
  resolution      TEXT CHECK (resolution IN ('approved', 'rejected', 'pending')) DEFAULT 'pending',
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Entity Relationship Summary

```
users
  ├── group_members (user_id)
  ├── expenses (paid_by)
  ├── expense_splits (user_id)
  ├── settlements (paid_by, paid_to)
  └── import_batches (imported_by)

groups
  ├── group_members (group_id)
  ├── expenses (group_id)
  └── settlements (group_id)

expenses
  ├── expense_splits (expense_id)
  └── import_anomalies (via batch_id + row_number)

import_batches
  └── import_anomalies (batch_id)
```

---

## 5. All Features — Detailed

### 5.1 Authentication

**Flow:**
1. User visits `/login`
2. Enters email + password
3. Supabase Auth validates → returns JWT
4. JWT stored in localStorage
5. All API calls send JWT in `Authorization: Bearer <token>` header
6. Backend validates JWT via Supabase middleware on every protected route
7. Redirect to `/dashboard` on success

**No signup page** — all users are pre-seeded. If someone tries to sign up, show "Contact your group admin."

---

### 5.2 Dashboard (per user)

Each logged-in member sees:

**Top Section — Net Balance Card**
- Big number: "You owe ₹3,200" or "You are owed ₹1,800" or "You are settled up ✓"
- This is Aisha's requirement — one number, done

**Middle Section — Per Person Breakdown**
- "You owe Rohan ₹1,200" / "Aisha owes you ₹800"
- Clicking any row opens the Expense Breakdown Drawer
- This is Rohan's requirement — no magic numbers

**Expense Breakdown Drawer**
- Lists every expense contributing to that specific person-to-person balance
- Shows date, description, total amount, your share
- Fully traceable

**Bottom Section — Recent Expenses**
- Last 10 expenses in the group
- Date, description, paid by, your share

**Admin Dashboard (additional)**
- All groups overview
- Import report link
- User management

---

### 5.3 Groups

**Create Group**
- Name, description
- Add initial members with join dates

**Manage Members**
- Add member → set `joined_at` date
- Remove member → set `left_at` date (soft, not deleted)
- Member list shows active/inactive status

**Group Settings**
- Edit name/description
- View full membership history

---

### 5.4 Expenses

**Add Expense Form Fields:**
- Description (text)
- Amount (number)
- Currency (INR / USD) — if USD, show current rate and INR equivalent
- Date
- Paid by (dropdown of group members)
- Split type (equal / unequal / percentage / share)
- Split with (multi-select of members)
- Split details (conditional — shows based on split type)
- Notes

**Split Type Behaviours:**

**Equal** — amount divided evenly among all selected members
```
₹1200 ÷ 4 members = ₹300 each
Stored as: 4 expense_splits rows, each 30000 paise
```

**Unequal** — each member's amount specified explicitly
```
Rohan: ₹700, Priya: ₹400, Meera: ₹400
Total must equal expense amount → validated
Stored as: 3 expense_splits rows with exact amounts
```

**Percentage** — each member gets a percentage of total
```
Aisha 30%, Rohan 30%, Priya 30%, Meera 20% (note: must sum to 100%)
Stored as: 4 expense_splits rows with calculated amounts
Rounding: remainder (from paise) added to the payer's split
```

**Share** — members get weighted shares
```
Aisha 1 share, Rohan 2 shares, Priya 1 share, Dev 2 shares = 6 total shares
Rohan's amount = (2/6) × total
Stored as: expense_splits rows with share_units and calculated amount_paise
```

---

### 5.5 Balance Calculation

**Core Formula (per group, per member pair):**

```
balance(A→B) = 
  SUM of expense_splits where user=B and expense paid_by=A
  MINUS
  SUM of expense_splits where user=A and expense paid_by=B
  MINUS
  SUM of settlements where paid_by=B and paid_to=A
  PLUS
  SUM of settlements where paid_by=A and paid_to=B
```

**Membership-Aware Filtering:**
Before computing balance, filter expenses:
```
Only include expense if:
  expense_date >= member.joined_at
  AND (member.left_at IS NULL OR expense_date <= member.left_at)
  AND user is in expense's split_with list
```

This is what handles Sam (joined April 15 → excluded from all March and early April expenses) and Meera (left March 31 → excluded from April expenses).

**Debt Simplification (Aisha's requirement — "one number per person"):**
After computing all pairwise balances, run a greedy debt simplification:
1. Compute net balance for each person (total owed to them minus total they owe)
2. Sort into "creditors" (net positive) and "debtors" (net negative)  
3. Greedily match largest debtor to largest creditor
4. Result: minimum number of transactions to settle everyone

---

### 5.6 Settlements

**Record a Payment:**
- Who paid (dropdown)
- Who they paid (dropdown)
- Amount
- Date
- Notes

Settlements are stored in the `settlements` table (not as expenses). They directly reduce the balance between two people.

**The "Rohan paid Aisha back" Row in CSV:**
This row (CSV row 14) is a settlement, not an expense. It is flagged as an anomaly during import, and on admin approval, it is inserted into `settlements` table instead of `expenses`.

---

### 5.7 CSV Import Feature

This is the most critical feature. Full detail in Section 6.

---

## 6. CSV Import — Complete Specification

### Import Flow

```
1. Admin visits /import
2. Uploads Expenses_Export.csv
3. Backend parses CSV → runs anomaly detection → creates import_batch + import_anomalies rows
4. Frontend shows Import Review Screen
5. Admin sees two panels:
   - Clean rows (auto-approved, will be imported as-is)
   - Anomaly rows (each needs Approve or Reject decision)
6. Admin resolves all anomalies
7. Admin clicks "Finalize Import"
8. Backend processes:
   - All approved clean rows → inserted into expenses + expense_splits
   - Approved anomalies → inserted with corrected values
   - Rejected anomalies → marked rejected, not inserted
9. Import report generated and saved
10. Admin redirected to Import Report page
```

---

### All 18 Anomalies — Detection + Policy

#### ANOMALY 1 — Exact Duplicate (Rows 5 & 6)
**What:** "Dinner at Marina Bites" and "dinner - marina bites" — same date (08-02-2026), same payer (Dev), same amount (₹3200), same split_with.  
**Detection:** Compare normalized (lowercase, trimmed) description + date + paid_by + amount + split_with. Flag if all match.  
**Policy:** Flag both rows. Suggest keeping Row 5 (first occurrence) and rejecting Row 6. Admin must approve.  
**Import Action:** On approval → import Row 5 only, mark Row 6 as REJECTED_DUPLICATE.

---

#### ANOMALY 2 — Comma-Formatted Amount (Row 7)
**What:** Amount is `"1,200"` — quoted string with comma, not a number.  
**Detection:** After CSV parse, attempt `parseFloat(amount.replace(/,/g, ''))`. If original contains comma → flag.  
**Policy:** Auto-clean to 1200. Flag as INFO level (not blocking) — show in report but auto-approve.  
**Import Action:** Parse to 1200, note the cleanup in import report.

---

#### ANOMALY 3 — Unknown Payer Name (Row 11)
**What:** `paid_by` is "Priya S" — not a recognized user in the system.  
**Detection:** After name normalization (lowercase, trim), check against known users list. "priya s" ≠ "priya".  
**Policy:** Flag as anomaly. Suggested action: map to "Priya" (closest match). Admin must confirm the mapping.  
**Import Action:** On approval → use Priya's user ID as paid_by.

---

#### ANOMALY 4 — Missing Payer (Row 13)
**What:** `paid_by` is empty. "House cleaning supplies — can't remember who paid."  
**Detection:** `paid_by` field is empty or whitespace after trim.  
**Policy:** Flag. Cannot import without a payer. Suggested action: skip this row (reject). Admin can override and assign a payer manually before approving.  
**Import Action:** On rejection → row skipped. On approval with manual payer assigned → import with that payer.

---

#### ANOMALY 5 — Settlement Logged as Expense (Row 14)
**What:** "Rohan paid Aisha back ₹5000" — note says "this is a settlement not an expense??"  
**Detection:** Description pattern match: contains "paid back", "settled", "settlement", "returned". Also split_type is empty.  
**Policy:** Flag as SETTLEMENT. Suggested action: import as a settlement record (not an expense).  
**Import Action:** On approval → insert into `settlements` table (paid_by=Rohan, paid_to=Aisha, amount=5000).

---

#### ANOMALY 6 — Percentages Don't Sum to 100% (Row 15)
**What:** Pizza Friday: Aisha 30% + Rohan 30% + Priya 30% + Meera 20% = 110%. Note says "percentages might be off."  
**Detection:** Sum all percentages in split_details. If sum ≠ 100 → flag.  
**Policy:** Flag. Cannot auto-fix (don't know which percentage is wrong). Suggested action: skip row. Admin must manually correct percentages before approving.  
**Import Action:** Row held pending. Admin must edit percentages in the review UI to sum to 100% before approving.

---

#### ANOMALY 7 — USD Currency (Rows 20, 21, 23, 26)
**What:** Goa villa (540 USD), Beach lunch (84 USD), Parasailing (150 USD), Parasailing refund (-30 USD).  
**Detection:** `currency` column = "USD".  
**Policy:** Convert to INR at fixed rate of **₹84.00 per USD** (documented in DECISIONS.md). Rate is hardcoded and disclosed — not fetched live, to ensure reproducibility.  
**Import Action:** Store `original_amount` and `original_currency` as-is. Compute `amount_paise = original_amount × 84 × 100`. Store `exchange_rate = 84.0000`. Flag as INFO in report.

---

#### ANOMALY 8 — Non-Member in Split (Row 23)
**What:** Parasailing split_with includes "Dev's friend Kabir" who is not a user in the system.  
**Detection:** After parsing split_with, check each name against known users. "Dev's friend Kabir" not found.  
**Policy:** Flag. Suggested action: exclude Kabir from split (split only among known members). Amount redistributed equally among the 4 known members.  
**Import Action:** On approval → split among Aisha, Rohan, Priya, Dev only. Note Kabir's exclusion in import report.

---

#### ANOMALY 9 — Conflicting Duplicate — Different Amounts (Rows 24 & 25)
**What:** "Dinner at Thalassa" (Aisha, ₹2400) and "Thalassa dinner" (Rohan, ₹2450) — same date, same event, different amounts, different payers. Note on Row 25: "Aisha also logged this I think hers is wrong."  
**Detection:** Same date + similar description (fuzzy match, Levenshtein distance < 5) + same split_with → conflicting duplicate.  
**Policy:** Flag both rows. Unlike the exact duplicate, we cannot auto-pick. Suggested action: use Row 25 (₹2450, Rohan paid) based on the note's hint. Admin must decide.  
**Import Action:** Admin selects one row to keep. Other is marked REJECTED_CONFLICTING_DUPLICATE.

---

#### ANOMALY 10 — Negative Amount (Row 26)
**What:** Parasailing refund: amount = -30 USD.  
**Detection:** `amount < 0`.  
**Policy:** Treat as a refund, not an error. Negative expense reduces each member's share. This is a legitimate use case (one slot cancelled = group gets money back).  
**Import Action:** Import as normal expense with negative amount_paise. Each person's split will be negative (credit). Flag as INFO in report: "Treated as refund — each member credited their share."

---

#### ANOMALY 11 — Malformed Date (Row 27)
**What:** Date is "Mar-14" instead of a standard format like "14-03-2026".  
**Detection:** Attempt to parse date with multiple formats (DD-MM-YYYY, YYYY-MM-DD, Mon-DD). If non-standard format matched → flag.  
**Policy:** Parse as March 14, 2026. Flag as INFO — auto-corrected.  
**Import Action:** Store as 2026-03-14. Note in import report: "Date 'Mar-14' parsed as 2026-03-14."

---

#### ANOMALY 12 — Missing Currency (Row 28)
**What:** Groceries DMart (15-03-2026) — currency field is empty.  
**Detection:** `currency` is empty or whitespace.  
**Policy:** Default to INR (all other non-trip expenses are INR, and this is a domestic grocery). Flag as INFO.  
**Import Action:** Assume INR. Note in report: "Currency missing — defaulted to INR."

---

#### ANOMALY 13 — Zero Amount (Row 31)
**What:** "Dinner order Swiggy" — amount = 0. Note: "counted twice earlier - fixing later."  
**Detection:** `amount === 0`.  
**Policy:** Skip this row. A zero-amount expense has no financial effect and the note confirms it's a placeholder/correction marker.  
**Import Action:** Mark as SKIPPED_ZERO_AMOUNT. Note in report.

---

#### ANOMALY 14 — Ambiguous Date Format (Row 34)
**What:** "Deep cleaning service" date = "04-05-2026". Is this April 5 or May 4? Note confirms confusion.  
**Detection:** Date where DD and MM are both valid calendar values and the format used elsewhere is DD-MM-YYYY — but this row's note explicitly flags ambiguity.  
**Policy:** Flag. Since the rest of the CSV uses DD-MM-YYYY, interpret as April 5, 2026. But surface it to admin to confirm.  
**Import Action:** Admin confirms or corrects the date before approving.

---

#### ANOMALY 15 — Inactive Member in Split (Row 36)
**What:** April 2nd Groceries BigBasket — split_with includes "Meera" who moved out March 31. Note: "oops Meera still in the group list."  
**Detection:** For each name in split_with, check if that member's `left_at` < expense_date. If yes → flag.  
**Policy:** Remove Meera from split. Redistribute equally among remaining active members (Aisha, Rohan, Priya).  
**Import Action:** On approval → split among Aisha, Rohan, Priya only. Note Meera's removal in report.

---

#### ANOMALY 16 — Name Case Inconsistency (Row 9)
**What:** `paid_by` = "priya" (lowercase). All other rows use "Priya".  
**Detection:** After lowercasing + trimming, "priya" matches user Priya. But original is not title-cased.  
**Policy:** Auto-normalize. Not a blocking anomaly — just clean silently and note in report.  
**Import Action:** Map to Priya's user ID. Flag as INFO.

---

#### ANOMALY 17 — Trailing Space in Name (Row 27)
**What:** `paid_by` = "rohan " (trailing space).  
**Detection:** `name.trim() !== name` → flag.  
**Policy:** Auto-trim. Same as above — silent clean.  
**Import Action:** Map to Rohan's user ID. Flag as INFO.

---

#### ANOMALY 18 — Conflicting split_type vs split_details (Row 42)
**What:** Furniture for common room — `split_type` = "equal" but `split_details` has "Aisha 1; Rohan 1; Priya 1; Sam 1" (share-style details).  
**Detection:** split_type = "equal" but split_details is non-empty and contains share/percentage notations.  
**Policy:** Equal split wins. The split_details are redundant (1 share each = equal split anyway). Import as equal split, ignore split_details. Flag as INFO.  
**Import Action:** Import as equal split among 4 members. Note: "split_type=equal used; split_details were consistent and ignored."

---

### Anomaly Severity Levels

| Level | Meaning | Admin Action Required? |
|-------|---------|----------------------|
| BLOCKING | Cannot import row without decision | Yes — approve or reject |
| INFO | Auto-handled, noted for transparency | No — shown in report only |

| Anomaly | Severity |
|---------|----------|
| 1 — Exact duplicate | BLOCKING |
| 2 — Comma in amount | INFO |
| 3 — Unknown payer | BLOCKING |
| 4 — Missing payer | BLOCKING |
| 5 — Settlement as expense | BLOCKING |
| 6 — Percentages ≠ 100% | BLOCKING |
| 7 — USD currency | INFO |
| 8 — Non-member in split | BLOCKING |
| 9 — Conflicting duplicate | BLOCKING |
| 10 — Negative amount | INFO |
| 11 — Malformed date | INFO |
| 12 — Missing currency | INFO |
| 13 — Zero amount | INFO |
| 14 — Ambiguous date | BLOCKING |
| 15 — Inactive member in split | BLOCKING |
| 16 — Name case | INFO |
| 17 — Trailing space | INFO |
| 18 — Conflicting split_type | INFO |

---

## 7. Currency Conversion

**Rate Used:** 1 USD = ₹84.00 (fixed)  
**Why Fixed:** Live rates would make the balance non-reproducible. If the rate changes between the import and the live evaluation session, balances would differ. A fixed, documented rate is auditable.  
**Where Documented:** DECISIONS.md  
**USD Rows:** Goa villa (540 USD), Beach lunch (84 USD), Parasailing (150 USD), Parasailing refund (-30 USD)

**Conversion Table:**

| Row | Description | USD | INR (×84) |
|-----|-------------|-----|-----------|
| 20 | Goa villa booking | $540 | ₹45,360 |
| 21 | Beach shack lunch | $84 | ₹7,056 |
| 23 | Parasailing | $150 | ₹12,600 |
| 26 | Parasailing refund | -$30 | -₹2,520 |

---

## 8. Project Structure

```
splito/
├── frontend/                        # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Groups.tsx
│   │   │   ├── GroupDetail.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── ExpenseDetail.tsx
│   │   │   ├── Import.tsx
│   │   │   ├── ImportReview.tsx
│   │   │   ├── ImportReport.tsx
│   │   │   └── Settlements.tsx
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── ExpenseBreakdownDrawer.tsx
│   │   │   ├── AnomalyReviewTable.tsx
│   │   │   ├── SplitForm.tsx
│   │   │   ├── MemberBadge.tsx
│   │   │   └── Navbar.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── App.tsx
│   └── package.json
│
├── backend/                         # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── groups.ts
│   │   │   ├── expenses.ts
│   │   │   ├── balances.ts
│   │   │   ├── settlements.ts
│   │   │   └── import.ts
│   │   ├── services/
│   │   │   ├── balanceService.ts    # all balance calculation logic
│   │   │   ├── importService.ts     # CSV parsing + anomaly detection
│   │   │   ├── splitService.ts      # split calculation logic
│   │   │   └── debtSimplifier.ts   # greedy debt simplification
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT validation
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.ts
│   │   └── index.ts
│   └── package.json
│
├── PROJECT_BLUEPRINT.md
├── UI_DESIGN_PLAN.md
├── GIT_WORKFLOW.md
├── MD_FILES_GUIDE.md
├── Expenses_Export.csv
└── README.md
```

---

## 9. API Endpoints

### Auth
```
POST   /api/auth/login              → { token, user }
POST   /api/auth/logout
GET    /api/auth/me                 → { user }
```

### Groups
```
GET    /api/groups                  → list all groups for user
POST   /api/groups                  → create group
GET    /api/groups/:id              → group detail + members
PUT    /api/groups/:id              → update group
POST   /api/groups/:id/members      → add member (with joined_at)
PUT    /api/groups/:id/members/:uid → update member (set left_at)
```

### Expenses
```
GET    /api/groups/:id/expenses     → list expenses for group
POST   /api/groups/:id/expenses     → create expense
GET    /api/expenses/:id            → expense detail + splits
PUT    /api/expenses/:id            → update expense
DELETE /api/expenses/:id            → soft delete
```

### Balances
```
GET    /api/groups/:id/balances     → all member balances in group
GET    /api/groups/:id/balances/:uid → one member's balance breakdown
GET    /api/groups/:id/simplified   → simplified debt transactions
```

### Settlements
```
GET    /api/groups/:id/settlements  → list settlements
POST   /api/groups/:id/settlements  → record settlement
```

### Import
```
POST   /api/import                  → upload CSV → returns batch_id + anomalies
GET    /api/import/:batch_id        → get batch status + anomalies
PUT    /api/import/:batch_id/anomalies/:anomaly_id → approve/reject one anomaly
POST   /api/import/:batch_id/finalize → finalize import after all anomalies resolved
GET    /api/import/:batch_id/report → get full import report
```

---

## 10. Deployment Plan

### Step 1 — Supabase
- Create project at supabase.com
- Run `schema.sql` in SQL editor
- Run `seed.ts` to create users

### Step 2 — Backend (Render)
- Push backend to GitHub
- Connect to Render
- Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PORT`
- Deploy as Node.js web service

### Step 3 — Frontend (Vercel)
- Push frontend to GitHub
- Connect to Vercel
- Set env var: `VITE_API_URL` = backend Render URL
- Deploy

### Environment Variables

**Backend:**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
PORT=3000
USD_TO_INR_RATE=84.00
```

**Frontend:**
```
VITE_API_URL=https://splito-api.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 11. Key Engineering Decisions Summary

> Full reasoning in DECISIONS.md. This is a quick reference.

| Decision | Choice | Alternative Rejected |
|----------|--------|---------------------|
| Money storage | Integer paise (no floats) | NUMERIC — risk of floating point errors |
| USD rate | Fixed ₹84 | Live API — non-reproducible |
| Duplicate detection | Normalize + exact match first, fuzzy second | Fuzzy only — too many false positives |
| Negative amounts | Treat as refund | Treat as error — valid use case exists |
| Missing currency | Default INR | Reject row — too aggressive |
| Settlement row | Import to settlements table | Import as expense — semantically wrong |
| Soft deletes | deleted_at timestamp | Hard delete — import traceability lost |
| Membership awareness | joined_at / left_at on group_members | No tracking — Sam/Meera requirements unmet |
| Debt simplification | Greedy min-transactions | Show all pairwise — too many transactions |
| Auth | Supabase email+password | Google OAuth — unnecessary complexity |

---

*End of PROJECT_BLUEPRINT.md*
*Next: UI_DESIGN_PLAN.md*
